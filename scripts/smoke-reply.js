#!/usr/bin/env node
// Simple smoke test: POST a stub transcript to /api/reply and print the response.
const url = process.env.SMOKE_URL || 'http://localhost:3001/api/reply';

async function run() {
  console.log(`POST ${url}`);
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transcript: 'Hello from smoke test' }),
    });
    const text = await res.text();
    console.log('Status:', res.status);
    console.log('Body:', text);
    process.exit(res.ok ? 0 : 2);
  } catch (err) {
    console.error('Error:', err && err.message ? err.message : err);
    process.exit(3);
  }
}

run();
