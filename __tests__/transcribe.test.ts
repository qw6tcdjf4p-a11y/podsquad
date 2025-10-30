jest.mock('@/lib/supabase', () => ({
  getSupabaseClient: jest.fn(),
}));

import { POST } from '../app/api/transcribe/route';
import { getSupabaseClient } from '@/lib/supabase';

const realFetch = global.fetch;

beforeAll(() => {
  process.env.OPENAI_API_KEY = 'test-openai-key';
});

afterAll(() => {
  global.fetch = realFetch;
  delete process.env.OPENAI_API_KEY;
});

test('transcribe.POST downloads from supabase and returns transcription', async () => {
  // Mock Supabase client to return a downloadable file
  (getSupabaseClient as jest.Mock).mockImplementation(({ serviceRole } = {}) => {
    return {
      storage: {
        from: (bucket: string) => ({
          download: async (path: string) => ({
            data: { arrayBuffer: async () => new Uint8Array([1, 2, 3]).buffer },
            error: null,
          }),
        }),
      },
    } as any;
  });

  // Mock OpenAI Whisper response
  (global as any).fetch = jest.fn(async () => ({ ok: true, status: 200, json: async () => ({ text: 'hello transcribed' }) }));

  const req = { json: async () => ({ storagePath: 'uploads/test.webm' }) } as any;
  const res = await POST(req);
  expect(res).toBeDefined();
  const txt = await (res as any).text();
  expect(txt).toContain('hello transcribed');
});
