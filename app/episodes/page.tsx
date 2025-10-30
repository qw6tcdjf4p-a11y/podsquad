"use client";
import React, { useEffect, useState } from 'react';
import EpisodeCard from '@/components/EpisodeCard';

export default function EpisodesPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const r = await fetch('/api/episodes');
        const j = await r.json();
        if (mounted) setItems(j.items || []);
      } catch (err) {
        // ignore
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false };
  }, []);

  return (
    <main style={{ padding: 24 }}>
      <h1>My Episodes</h1>
      {loading && <p>Loading…</p>}
      {!loading && items.length === 0 && <p>No episodes yet — record one in the Studio.</p>}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 12 }}>
        {items.map((it) => (
          <EpisodeCard key={it.id} episode={it} />
        ))}
      </div>
    </main>
  );
}
