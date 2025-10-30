"use client";
import React, { useState } from 'react';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [age, setAge] = useState('');
  const [guardianEmail, setGuardianEmail] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const [guardianToken, setGuardianToken] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setGuardianToken(null);
    const body = { email, display_name: displayName, age: Number(age), guardian_email: guardianEmail };
    try {
      const r = await fetch('/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const j = await r.json();
      if (!r.ok) {
        setMsg(j.error || 'Registration failed');
        return;
      }
      setMsg('Registered.');
      if (j.guardian_token) setGuardianToken(j.guardian_token);
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
