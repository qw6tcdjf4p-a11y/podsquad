import { test, expect } from '@playwright/test';
import path from 'path';

test('upload -> transcribe -> reply flow (stubbed APIs)', async ({ page }) => {
  // Intercept API calls and return deterministic, stubbed responses so E2E
  // can run without Supabase/OpenAI credentials.
  await page.route('**/api/upload', async (route) => {
    // emulate a successful upload returning a storagePath
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ storagePath: 'uploads/stubbed.webm' }),
    });
  });

  await page.route('**/api/transcribe', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ text: 'stubbed transcript' }),
    });
  });

  await page.route('**/api/reply', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ reply: 'stubbed reply' }),
    });
  });

  await page.route('**/api/voice', async (route) => {
    // return a tiny fake mp3 blob; Playwright needs a Buffer
    const buf = Buffer.from([0, 1, 2, 3]);
    await route.fulfill({ status: 200, body: buf, contentType: 'audio/mpeg' });
  });

  await page.goto('/upload');

  // Upload a small local fixture file
  const filePath = path.join(__dirname, '..', 'fixtures', 'dummy.webm');
  await page.setInputFiles('input[type=file]', filePath);

  // Submit the form
  await page.click('button[type=submit]');

  // Wait for the transcript and reply to appear
  await expect(page.getByRole('heading', { name: 'Transcript' })).toBeVisible();
  await expect(page.getByText('stubbed transcript')).toBeVisible();
  await expect(page.getByText('stubbed reply')).toBeVisible();

  // Click Play TTS and ensure no errors (we cannot easily assert audio playback)
  await page.click('button:has-text("Play TTS")');
});
