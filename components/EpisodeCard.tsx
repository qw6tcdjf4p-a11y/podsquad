"use client";
import React from 'react';
import Link from 'next/link';

export default function EpisodeCard({ episode }: { episode: any }) {
  return (
    <div style={{ borderRadius: 12, padding: 12, border: '1px solid #eee', background: '#fff' }}>
      <h4 style={{ margin: 0 }}>{episode.title || 'Untitled'}</h4>
      <p style={{ margin: '6px 0', color: '#666' }}>{episode.age_tier} • {episode.created_at ? new Date(episode.created_at).toLocaleString() : ''}</p>
      <div style={{ display: 'flex', gap: 8 }}>
        <Link href={episode.permalink || `/episode/${episode.id}`}>
          <a className="btn-primary">Open</a>
        </Link>
        <a href={episode.audio_url} target="_blank" rel="noreferrer" style={{ alignSelf: 'center' }}>Download</a>
      </div>
    </div>
  );
}
