import { NextRequest } from "next/server";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  try {
    const { transcript } = await req.json();
    if (!transcript) {
      return new Response(JSON.stringify({ error: "missing transcript" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // If OPENAI_API_KEY is not set, return a safe dev stub (so local dev works)
    const key = process.env.OPENAI_API_KEY;
    if (!key) {
      const reply = `You said: ${String(transcript)}`;
      return new Response(JSON.stringify({ reply, note: "OPENAI_API_KEY not set; returned dev-stub" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Prepare messages for a short, age-appropriate reply
    const messages = [
      { role: "system", content: "You are a friendly assistant for kids. Keep responses positive, concise (2-4 sentences), and ask one fun follow-up question." },
      { role: "user", content: `Here is a transcript from a child: ${transcript}. Reply briefly and kindly.` },
    ];

    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({ model: "gpt-4o-mini", messages, max_tokens: 250 }),
    });

    if (!r.ok) {
      const txt = await r.text().catch(() => "");
      return new Response(JSON.stringify({ error: "OpenAI request failed", status: r.status, detail: txt }), {
        status: 502,
        headers: { "Content-Type": "application/json" },
      });
    }

    const js = await r.json();
    const content = js?.choices?.[0]?.message?.content ?? js?.choices?.[0]?.text ?? null;
    if (!content) {
      return new Response(JSON.stringify({ error: "no reply from OpenAI", raw: js }), { status: 502, headers: { "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ reply: String(content).trim() }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: "invalid request", detail: e?.message || String(e) }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
}