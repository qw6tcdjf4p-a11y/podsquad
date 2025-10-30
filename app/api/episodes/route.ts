import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';

type EpisodeBody = {
  title?: string;
  storagePath?: string; // audio URL in storage
  transcript?: string;
  age_tier?: string; // 'zoie'|'ari'|'soni'
  visibility?: string; // 'private'|'class'|'public'
  created_by?: string;
};

async function moderateText(text: string) {
  // If OPENAI_API_KEY not present, assume safe in dev mode
  if (!process.env.OPENAI_API_KEY) return { safe: true, result: null };

  try {
    const res = await fetch('https://api.openai.com/v1/moderations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
      body: JSON.stringify({ input: text }),
    });
    if (!res.ok) return { safe: false, result: null };
    const j = await res.json();
    // OpenAI moderation response has results[0].category_scores or categories
    const flagged = j.results?.[0]?.flagged ?? false;
    return { safe: !flagged, result: j };
  } catch (err) {
    return { safe: false, result: null };
  }
}

export async function POST(req: NextRequest) {
  const body: EpisodeBody = await req.json().catch(() => ({}));

  if (!body.title || !body.storagePath || !body.transcript) {
    return NextResponse.json({ error: 'Missing required fields: title, storagePath, transcript' }, { status: 400 });
  }

  // validate age_tier and visibility
  const age = body.age_tier || 'zoie';
  if (!['zoie', 'ari', 'soni'].includes(age)) return NextResponse.json({ error: 'Invalid age_tier' }, { status: 400 });
  const vis = body.visibility || 'private';
  if (!['private', 'class', 'public'].includes(vis)) return NextResponse.json({ error: 'Invalid visibility' }, { status: 400 });

  // Moderation step
  const mod = await moderateText(body.transcript || '');
  if (!mod.safe) return NextResponse.json({ error: 'Content flagged by moderation' }, { status: 400 });

  // Persist using service role
  try {
    const supa = getServiceSupabase();
    const insert = {
      user_id: body.created_by || null,
      title: body.title,
      transcript: body.transcript,
      audio_url: body.storagePath,
      age_tier: age,
      visibility: vis,
    };
    const r = await supa.from('episodes').insert(insert).select('id').single();
    if (r.error) {
      return NextResponse.json({ error: r.error.message }, { status: 500 });
    }
    const id = r.data?.id;
    const permalink = `/episode/${id}`;
    // update permalink field
    await supa.from('episodes').update({ permalink }).eq('id', id);
    return NextResponse.json({ id, permalink }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  // Simple listing: if ?owner=me return empty unless Supabase configured
  try {
    const supa = getServiceSupabase();
    const r = await supa.from('episodes').select('*').limit(50);
    if (r.error) return NextResponse.json({ error: r.error.message }, { status: 500 });
    return NextResponse.json({ items: r.data || [] });
  } catch (err: any) {
    return NextResponse.json({ items: [] });
  }
}

export const runtime = 'edge';
