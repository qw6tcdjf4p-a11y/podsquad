import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const email = (body.email || '').toString().trim();
  const display_name = (body.display_name || '').toString().trim();
  const age = Number(body.age || 0);
  const guardian_email = (body.guardian_email || '')?.toString().trim() || null;

  if (!email) return NextResponse.json({ error: 'email required' }, { status: 400 });
  if (!display_name) return NextResponse.json({ error: 'display_name required' }, { status: 400 });

  try {
    const supa = getServiceSupabase();
    // create profile
    const insert = { email, display_name, guardian_email, guardian_confirmed: false } as any;
    const r = await supa.from('profiles').insert(insert).select('id').single();
    if (r.error) return NextResponse.json({ error: r.error.message }, { status: 500 });
    const profileId = r.data?.id;

    // If under 13, create guardian token and return token (dev-mode: token printed so dev can simulate email)
    if (age < 13 && guardian_email) {
      const token = crypto.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      await supa.from('guardian_tokens').insert({ token, profile_id: profileId, expires_at: expiresAt });
      // In production we'd send email; for MVP return token in response (dev-mode)
      return NextResponse.json({ profileId, guardian_token: token }, { status: 201 });
    }

    return NextResponse.json({ profileId }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 });
  }
}

export const runtime = 'edge';
