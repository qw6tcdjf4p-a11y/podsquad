import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('upload flow - error cases and retry', () => {
  test('shows error when upload fails and succeeds on retry', async ({ page }) => {
    // First, make upload return 500
    let first = true;
    await page.route('**/api/upload', async (route) => {
      if (first) {
        first = false;
        await route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ error: 'upload fail' }) });
        return;
      }
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ storagePath: 'uploads/retry.webm' }) });
    });

    // Stub other endpoints normally
    await page.route('**/api/transcribe', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ text: 'retry transcript' }) });
    });
    await page.route('**/api/reply', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ reply: 'retry reply' }) });
    });

    await page.goto('/upload');
    const filePath = path.join(__dirname, '..', 'fixtures', 'dummy.webm');
    await page.setInputFiles('input[type=file]', filePath);

    await page.click('button[type=submit]');

    // Expect error shown
    await expect(page.getByText(/Error:/)).toBeVisible();

    // Click Retry (the route will now return success)
    await page.click('button:has-text("Retry")');

    // Wait for transcript and reply after successful retry
    await expect(page.getByRole('heading', { name: 'Transcript' })).toBeVisible();
    await expect(page.getByText('retry transcript')).toBeVisible();
    await expect(page.getByText('retry reply')).toBeVisible();
  });

  test('shows error when transcribe fails and allows retry', async ({ page }) => {
    // Upload succeeds
    await page.route('**/api/upload', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ storagePath: 'uploads/transcribe-fail.webm' }) });
    });

    // Transcribe fails first, then succeeds after retry
    let first = true;
    await page.route('**/api/transcribe', async (route) => {
      if (first) {
        first = false;
        await route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ error: 'transcribe error' }) });
        return;
      }
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ text: 'transcript after retry' }) });
    });

    await page.route('**/api/reply', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ reply: 'reply after retry' }) });
    });

    await page.goto('/upload');
    const filePath = path.join(__dirname, '..', 'fixtures', 'dummy.webm');
    await page.setInputFiles('input[type=file]', filePath);
    await page.click('button[type=submit]');

    // Expect error shown
    await expect(page.getByText(/Error:/)).toBeVisible();

    // Retry
    await page.click('button:has-text("Retry")');

    // After retry, transcript and reply should appear
    await expect(page.getByText('transcript after retry')).toBeVisible();
    await expect(page.getByText('reply after retry')).toBeVisible();
  });

  test('shows error when reply fails and allows retry', async ({ page }) => {
    await page.route('**/api/upload', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ storagePath: 'uploads/reply-fail.webm' }) });
    });

    await page.route('**/api/transcribe', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ text: 'text for reply fail' }) });
    });

    let first = true;
    await page.route('**/api/reply', async (route) => {
      if (first) {
        first = false;
        await route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ error: 'reply error' }) });
        return;
      }
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ reply: 'reply after retry 2' }) });
    });

    await page.goto('/upload');
    const filePath = path.join(__dirname, '..', 'fixtures', 'dummy.webm');
    await page.setInputFiles('input[type=file]', filePath);
    await page.click('button[type=submit]');

    // Expect error shown
    await expect(page.getByText(/Error:/)).toBeVisible();

    // Retry
    await page.click('button:has-text("Retry")');

    await expect(page.getByText('reply after retry 2')).toBeVisible();
  });
});
