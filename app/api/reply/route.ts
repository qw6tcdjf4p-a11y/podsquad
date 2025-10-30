import { NextRequest } from "next/server";

export const runtime = "edge";

const JSON_HEADERS = { "Content-Type": "application/json" };

function extractOpenAIReply(js: any): string | null {
  // Support both chat completion and older completion shapes
  const chat = js?.choices?.[0]?.message?.content;
  if (chat && typeof chat === "string") return chat;
  const text = js?.choices?.[0]?.text;
  if (text && typeof text === "string") return text;
  // Some API variants return a top-level 'output' or 'message'
  if (typeof js?.output === "string") return js.output;
  if (typeof js?.message === "string") return js.message;
  return null;
}

export async function POST(req: NextRequest) {
  try {
    // Expect JSON body
    let body: any;
    try {
      body = await req.json();
    } catch (err) {
      return new Response(JSON.stringify({ error: "invalid JSON body" }), { status: 400, headers: JSON_HEADERS });
    }

    const transcriptRaw = body?.transcript ?? body?.text ?? null;
    if (!transcriptRaw || typeof transcriptRaw !== "string" || !transcriptRaw.trim()) {
      return new Response(JSON.stringify({ error: "missing transcript" }), { status: 400, headers: JSON_HEADERS });
    }

    // Trim and limit transcript length to protect token usage
    const transcript = transcriptRaw.trim().slice(0, 1000);

    // If OPENAI_API_KEY is not set, return a safe dev stub (so local dev works)
    const key = process.env.OPENAI_API_KEY;
    if (!key) {
      const reply = `You said: ${transcript}`;
      return new Response(JSON.stringify({ reply, note: "OPENAI_API_KEY not set; returned dev-stub" }), {
        status: 200,
        headers: JSON_HEADERS,
      });
    }

    // Prepare messages for a short, age-appropriate reply
    const messages = [
      {
        role: "system",
        content:
          "You are a friendly assistant for kids. Keep responses positive, concise (2-4 sentences), and ask one fun follow-up question.",
      },
      { role: "user", content: `Here is a transcript from a child: ${transcript}. Reply briefly and kindly.` },
    ];

    // Timeout the request to OpenAI to avoid hanging the edge function
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({ model: "gpt-4o-mini", messages, max_tokens: 250 }),
      signal: controller.signal as any,
    }).finally(() => clearTimeout(timeout));

    if (!r.ok) {
      const txt = await r.text().catch(() => "");
      // Avoid leaking sensitive details in production; return a generic error plus status
      return new Response(JSON.stringify({ error: "OpenAI request failed", status: r.status, detail: txt }), {
        status: 502,
        headers: JSON_HEADERS,
      });
    }

    const js = await r.json().catch(() => null);
    const content = extractOpenAIReply(js);
    if (!content) {
      return new Response(JSON.stringify({ error: "no reply from OpenAI", raw: js }), { status: 502, headers: JSON_HEADERS });
    }

    return new Response(JSON.stringify({ reply: String(content).trim() }), {
      status: 200,
      headers: JSON_HEADERS,
    });
  } catch (e: any) {
    const isAbort = e && e.name === "AbortError";
    return new Response(JSON.stringify({ error: isAbort ? "OpenAI request timed out" : "invalid request", detail: e?.message || String(e) }), {
      status: isAbort ? 504 : 400,
      headers: JSON_HEADERS,
    });
  }
}