"use client";
import React, { useState } from 'react';
import { supabaseClient } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    try {
      const res = await supabaseClient.auth.signInWithPassword({ email, password });
      if (res.error) {
        setMsg(res.error.message);
        return;
      }
      setMsg('Logged in');
      router.push('/');
    } catch (err: any) {
      setMsg(err?.message || String(err));
    }
  }

  return (
    <main style={{ padding: 24 }}>
      <h1>Sign in</h1>
      <form onSubmit={handleLogin} style={{ maxWidth: 420 }}>
        <div style={{ marginBottom: 8 }}>
          <label>Email</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div style={{ marginBottom: 8 }}>
          <label>Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <div style={{ marginTop: 12 }}>
          <button className="btn-primary" type="submit">Sign in</button>
        </div>
      </form>
      {msg && <p>{msg}</p>}
    </main>
  );
}
