"use client";
import React, { useState } from 'react';
import { supabaseClient } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [age, setAge] = useState('');
  const [guardianEmail, setGuardianEmail] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const [guardianToken, setGuardianToken] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setGuardianToken(null);
    const body = { email, display_name: displayName, age: Number(age), guardian_email: guardianEmail };
    try {
      // First, sign up with Supabase Auth so we have a user id to link
  const pw = password || `${Math.random().toString(36).slice(2, 10)}!`;
      const supRes = await supabaseClient.auth.signUp({ email: body.email, password: pw });
      if (supRes.error) {
        setMsg(supRes.error.message);
        return;
      }
      const user = (supRes.data as any)?.user;
      const userId = user?.id;
      // call server to create profile linked to user id
      const r = await fetch('/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...body, user_id: userId }) });
      const j = await r.json();
      if (!r.ok) {
        setMsg(j.error || 'Registration failed');
        return;
      }
      setMsg('Registered.');
      if (j.guardian_token) setGuardianToken(j.guardian_token);
  // redirect to home after signup
  router.push('/');
    } catch (err: any) {
      setMsg(err?.message || String(err));
    }
  }

  return (
    <main style={{ padding: 24 }}>
      <h1>Create account</h1>
      <form onSubmit={handleSubmit} style={{ maxWidth: 520 }}>
        <div style={{ marginBottom: 8 }}>
          <label>Email</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div style={{ marginBottom: 8 }}>
          <label>Display name</label>
          <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
        </div>
        <div style={{ marginBottom: 8 }}>
          <label>Age</label>
          <input value={age} onChange={(e) => setAge(e.target.value)} />
        </div>
        <div style={{ marginBottom: 8 }}>
          <label>Password (choose one)</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        {Number(age) < 13 && (
          <div style={{ marginBottom: 8 }}>
            <label>Guardian email</label>
            <input value={guardianEmail} onChange={(e) => setGuardianEmail(e.target.value)} />
          </div>
        )}
        <div style={{ marginTop: 12 }}>
          <button className="btn-primary" type="submit">Create account</button>
        </div>
      </form>

      {msg && <p>{msg}</p>}
      {guardianToken && (
        <div style={{ marginTop: 12 }}>
          <p>Dev guardian token (use to confirm):</p>
          <pre>{guardianToken}</pre>
        </div>
      )}
    </main>
  );
}
