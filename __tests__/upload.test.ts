jest.mock('@/lib/supabase', () => ({
  getSupabaseClient: jest.fn(),
}));

import { POST } from '../app/api/upload/route';
import { getSupabaseClient } from '@/lib/supabase';

test('upload.POST uploads file to supabase and returns storagePath', async () => {
  const mockFile = {
    name: 'input.webm',
    type: 'audio/webm',
    arrayBuffer: async () => new Uint8Array([1, 2, 3]).buffer,
  } as any;

  const form = {
    get: (key: string) => (key === 'file' ? mockFile : null),
    entries: function* () { yield ['file', mockFile]; },
  } as any;

  // Mock Supabase client behaviors
  (getSupabaseClient as jest.Mock).mockImplementation(() => ({
    storage: {
      listBuckets: async () => ({ data: [{ name: 'audio' }] }),
      from: (bucket: string) => ({
        upload: async (filename: string, bytes: Uint8Array, opts: any) => ({ data: { path: filename }, error: null }),
      }),
    },
  }));

  const req = { formData: async () => form } as any;
  const res = await POST(req);
  expect(res).toBeDefined();
  const txt = await (res as any).text();
  expect(txt).toContain('storagePath');
});
