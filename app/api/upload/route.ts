import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();

    // Accept common field names: "file", "audio", "blob" — or first File found
    let file = (form.get("file") || form.get("audio") || form.get("blob")) as File | null;
    if (!file) {
      for (const [, v] of form.entries()) {
        if (v instanceof File) { file = v; break; }
      }
    }
    if (!file) {
      return new Response(JSON.stringify({ error: "No file found in form-data. Expected field: 'file' (or 'audio'/'blob')." }), { status: 400, headers: {"Content-Type":"application/json"} });
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !anon) {
      return new Response(JSON.stringify({ error: "Supabase env not set", hasUrl: Boolean(url), hasAnon: Boolean(anon) }), { status: 500, headers: {"Content-Type":"application/json"} });
    }

    const supabase = createClient(url, anon);

    // Ensure bucket exists
    const buckets = await supabase.storage.listBuckets();
    if ((buckets as any).error) {
      return new Response(JSON.stringify({ error: "Supabase listBuckets failed", detail: (buckets as any).error?.message || null }), { status: 500, headers: {"Content-Type":"application/json"} });
    }
    const hasAudio = Array.isArray(buckets.data) && buckets.data.some(b => b.name === "audio");
    if (!hasAudio) {
      return new Response(JSON.stringify({ error: "Missing 'audio' bucket in Supabase Storage" }), { status: 500, headers: {"Content-Type":"application/json"} });
    }

    const array = await file.arrayBuffer();
    const bytes = new Uint8Array(array);
    const filename = `uploads/${Date.now()}-${file.name || "input.webm"}`;

    const { data, error } = await supabase
      .storage
      .from("audio")
      .upload(filename, bytes, { contentType: file.type || "audio/webm", upsert: false });

    if (error) {
      return new Response(JSON.stringify({ error: "Supabase upload error", detail: error.message }), { status: 500, headers: {"Content-Type":"application/json"} });
    }

    return new Response(JSON.stringify({ storagePath: data.path }), { status: 200, headers: {"Content-Type":"application/json"} });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: "Unhandled error", detail: e?.message || String(e) }), { status: 500, headers: {"Content-Type":"application/json"} });
  }
}