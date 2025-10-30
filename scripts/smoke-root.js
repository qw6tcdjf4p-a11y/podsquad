#!/usr/bin/env node
// Simple smoke test: GET the root URL and print status and a short body preview.
const url = process.env.SMOKE_URL || 'http://localhost:3001/';

async function run() {
  console.log(`GET ${url}`);
  try {
    const res = await fetch(url, { method: 'GET' });
    const text = await res.text();
    console.log('Status:', res.status);
    console.log('Preview:', text.slice(0, 400));
    process.exit(res.ok ? 0 : 2);
  } catch (err) {
    console.error('Error:', err && err.message ? err.message : err);
    process.exit(3);
  }
}

run();
