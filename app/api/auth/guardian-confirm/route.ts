import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const token = (body.token || '').toString();
  if (!token) return NextResponse.json({ error: 'token required' }, { status: 400 });

  try {
    const supa = getServiceSupabase();
    const lookup = await supa.from('guardian_tokens').select('*').eq('token', token).single();
    if (lookup.error || !lookup.data) return NextResponse.json({ error: 'invalid token' }, { status: 400 });
    const profileId = lookup.data.profile_id;
    // mark guardian_confirmed
    await supa.from('profiles').update({ guardian_confirmed: true }).eq('id', profileId);
    // delete token
    await supa.from('guardian_tokens').delete().eq('token', token);
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 });
  }
}

export const runtime = 'edge';
