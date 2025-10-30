"use client";
import React, { useRef, useState } from "react";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [storagePath, setStoragePath] = useState<string | null>(null);
  const [permalink, setPermalink] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<string | null>(null);
  const [reply, setReply] = useState<string | null>(null);
  const [title, setTitle] = useState<string>('Untitled Episode');
  const [ageTier, setAgeTier] = useState<'zoie'|'ari'|'soni'>('zoie');
  const [visibility, setVisibility] = useState<'private'|'class'|'public'>('private');
  const [ttsPlaying, setTtsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const previewUrl = file ? URL.createObjectURL(file) : null;

  function uploadWithProgress(file: File): Promise<any> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", "/api/upload");
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100));
      };
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            resolve(JSON.parse(xhr.responseText));
          } catch (err) {
            resolve({});
          }
        } else {
          reject(new Error(`upload failed: ${xhr.status}`));
        }
      };
      xhr.onerror = () => reject(new Error("upload network error"));
      const fd = new FormData();
      fd.append("file", file);
      xhr.send(fd);
    });
  }

  async function handleSubmit(e?: React.FormEvent) {
    if (e && typeof e.preventDefault === "function") e.preventDefault();
    setError(null);
    setTranscript(null);
    setReply(null);
    setStoragePath(null);
    setProgress(null);
    if (!file) return setError("Please choose a file first.");

    setLoading(true);
    try {
      const upj = await uploadWithProgress(file);
      setStoragePath(upj.storagePath || null);

      // Transcribe
      const tr = await fetch("/api/transcribe", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ storagePath: upj.storagePath }) });
      if (!tr.ok) throw new Error(`transcribe failed: ${tr.status}`);
      const trj = await tr.json();
      setTranscript(trj.text || null);

      // Get reply
      const rp = await fetch("/api/reply", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ transcript: trj.text }) });
      if (!rp.ok) throw new Error(`reply failed: ${rp.status}`);
      const rpj = await rp.json();
      setReply(rpj.reply || JSON.stringify(rpj));
      // After reply/transcribe, persist episode metadata to server
      try {
        const epRes = await fetch('/api/episodes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title,
            storagePath: upj.storagePath,
            transcript: trj.text,
            age_tier: ageTier,
            visibility,
            // created_by will be set server-side when auth is integrated
          }),
        });
        if (epRes.ok) {
          const epj = await epRes.json();
          setPermalink(epj.permalink || null);
        } else {
          // non-blocking: show error but don't fail the flow
          const ej = await epRes.json().catch(() => ({}));
          setError(ej.error || `Failed to save episode (${epRes.status})`);
        }
      } catch (err: any) {
        // ignore save failures for now, but surface to user
        setError(err?.message || String(err));
      }
    } catch (err: any) {
      setError(err?.message || String(err));
    } finally {
      setLoading(false);
      setProgress(null);
    }
  }

  async function playTTS() {
    if (!reply) return;
    try {
      setTtsPlaying(true);
      const r = await fetch('/api/voice', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: reply, tier: 'young' }) });
      if (!r.ok) throw new Error(`tts failed: ${r.status}`);
      const buf = await r.arrayBuffer();
      const blob = new Blob([buf], { type: 'audio/mpeg' });
      const url = URL.createObjectURL(blob);
      if (audioRef.current) {
        audioRef.current.src = url;
        await audioRef.current.play();
      } else {
        const a = new Audio(url);
        audioRef.current = a;
        await a.play();
      }
      setTtsPlaying(false);
    } catch (err: any) {
      setError(err?.message || String(err));
      setTtsPlaying(false);
    }
  }

  return (
    <main style={{ padding: 24 }}>
      <h1>Upload audio</h1>
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
          <input type="file" accept="audio/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Episode title" />
          <select value={ageTier} onChange={(e) => setAgeTier(e.target.value as any)}>
            <option value="zoie">Zoie (5-8)</option>
            <option value="ari">Ari (9-12)</option>
            <option value="soni">Soni (13-17)</option>
          </select>
          <select value={visibility} onChange={(e) => setVisibility(e.target.value as any)}>
            <option value="private">Private</option>
            <option value="class">Class</option>
            <option value="public">Public</option>
          </select>
          <button type="submit" disabled={loading} style={{ marginLeft: 8 }}>Upload & Transcribe</button>
        </div>
      </form>

      {previewUrl && (
        <div style={{ marginTop: 12 }}>
          <h4>Preview</h4>
          <audio controls src={previewUrl} />
        </div>
      )}

      {progress != null && (
        <div style={{ marginTop: 8 }}>
          <label>Upload: {progress}%</label>
          <div style={{ height: 8, background: '#eee', width: 300 }}>
            <div style={{ height: 8, background: '#0b69ff', width: `${progress}%` }} />
          </div>
        </div>
      )}

      {loading && <p>Processing…</p>}
      {error && (
        <div style={{ color: "red", marginTop: 8 }}>
          <p>Error: {error}</p>
          <div>
            <button onClick={() => handleSubmit()} disabled={loading} style={{ marginRight: 8 }}>
              Retry
            </button>
            <button onClick={() => { setError(null); setReply(null); setTranscript(null); setStoragePath(null); }}>Reset</button>
          </div>
        </div>
      )}

      {storagePath && (
        <div>
          <h3>Storage Path</h3>
          <pre>{storagePath}</pre>
          {permalink && (
            <div>
              <strong>Saved:</strong> <a href={permalink}>{permalink}</a>
            </div>
          )}
        </div>
      )}

      {transcript && (
        <div>
          <h3>Transcript</h3>
          <p>{transcript}</p>
        </div>
      )}

      {reply && (
        <div>
          <h3>Reply</h3>
          <p>{reply}</p>
          <div>
            <button onClick={() => playTTS()} disabled={ttsPlaying} style={{ marginRight: 8 }}>
              {ttsPlaying ? 'Playing…' : 'Play TTS'}
            </button>
            <button onClick={() => { setReply(null); setTranscript(null); setStoragePath(null); }}>Reset</button>
          </div>
          <audio ref={audioRef} />
        </div>
      )}
    </main>
  );
}
