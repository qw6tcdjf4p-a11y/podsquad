import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: 'playwright',
  timeout: 30_000,
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' },
    },
  ],
  use: {
    headless: true,
    baseURL: 'http://localhost:3001',
  },
});
