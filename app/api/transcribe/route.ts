import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  const { storagePath } = await req.json();
  if (!storagePath) return new Response(JSON.stringify({ error: "missing storagePath" }), { status: 400 });

  // Get the file back from Supabase to send to Whisper
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
  const { data, error } = await supabase.storage.from("audio").download(storagePath);
  if (error || !data) return new Response(JSON.stringify({ error: error?.message || "download failed" }), { status: 500 });

  const bytes = await data.arrayBuffer();
  const file = new File([bytes], "audio.webm", { type: "audio/webm" });

  // OpenAI Whisper
  const form = new FormData();
  form.append("file", file);
  form.append("model", "whisper-1");

  const r = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
    body: form
  });
  if (!r.ok) return new Response(await r.text(), { status: r.status });

  const j = await r.json();
  return new Response(JSON.stringify({ text: j.text }), { status: 200, headers: { "Content-Type": "application/json" } });
}
