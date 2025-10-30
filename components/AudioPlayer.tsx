"use client";
import React, { useRef } from 'react';

export default function AudioPlayer({ src }: { src?: string | null }) {
  const ref = useRef<HTMLAudioElement | null>(null);
  if (!src) return null;
  return (
    <div>
      <audio ref={ref} controls src={src} />
    </div>
  );
}
