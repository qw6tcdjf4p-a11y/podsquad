"use client";
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import AudioPlayer from '@/components/AudioPlayer';

export default function EpisodeDetail() {
  const params = useParams();
  const id = params?.id;
  const [episode, setEpisode] = useState<any | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const r = await fetch('/api/episodes');
        const j = await r.json();
        const found = (j.items || []).find((it: any) => String(it.id) === String(id));
        if (mounted) setEpisode(found || null);
      } catch (err) {
        // ignore
      }
    })();
    return () => { mounted = false };
  }, [id]);

  if (!episode) return <main style={{ padding: 24 }}><p>Episode not found.</p></main>;

  return (
    <main style={{ padding: 24 }}>
      <h1>{episode.title}</h1>
      <AudioPlayer src={episode.audio_url} />
      <h3>Transcript</h3>
      <pre style={{ background: '#fafafa', padding: 12 }}>{episode.transcript}</pre>
    </main>
  );
}
