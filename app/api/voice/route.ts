import { NextRequest } from "next/server";
import { AgeTier } from "@/lib/voices";

export const runtime = "edge";

// Simple OpenAI TTS fallback (mp3). Swap for ElevenLabs if preferred.
export async function POST(req: NextRequest) {
  const { text, tier } = await req.json();
  const age: AgeTier = tier || "young";
  const voice = age === "young" ? "alloy" : age === "middle" ? "verse" : "aria"; // pick any supported voices in your TTS provider

  const r = await fetch("https://api.openai.com/v1/audio/speech", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
    body: JSON.stringify({
      model: "gpt-4o-mini-tts",
      voice,
      input: text,
      format: "mp3"
    })
  });
  if (!r.ok) return new Response(await r.text(), { status: r.status });
  const buf = await r.arrayBuffer();
  return new Response(buf, { status: 200, headers: { "Content-Type": "audio/mpeg" } });
}
