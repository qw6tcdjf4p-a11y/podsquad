import { POST } from '../app/api/episodes/route';
import * as supaMod from '../lib/supabase';

// Mock fetch for moderation and mock supabase service client
const realFetch = global.fetch;

beforeAll(() => {
  delete process.env.OPENAI_API_KEY;
});

afterAll(() => {
  (global as any).fetch = realFetch;
});

test('episodes.POST returns 400 when required fields missing', async () => {
  const req = { json: async () => ({ title: 'x' }) } as any;
  const res = await POST(req);
  const j = await (res as any).json();
  expect((res as any).status).toBe(400);
  expect(j.error).toMatch(/Missing required fields/);
});

test('episodes.POST saves when moderation passes', async () => {
  // stub getServiceSupabase
  const fakeClient = {
    from: (table: string) => ({
      insert: (obj: any) => ({ select: (_: string) => ({ single: async () => ({ data: { id: 'fake-id' } }) }) }),
      update: (_obj: any) => ({ eq: (_col: string, _val: any) => Promise.resolve({}) }),
      select: (_q: any) => ({ limit: (_n: number) => Promise.resolve({ data: [] }) }),
    }),
  } as any;
  jest.spyOn(supaMod, 'getServiceSupabase').mockImplementation(() => fakeClient);

  const body = { title: 'Test ep', storagePath: 'audio/1.webm', transcript: 'hello world', age_tier: 'zoie', visibility: 'private' };
  const req = { json: async () => body } as any;

  const res = await POST(req);
  expect((res as any).status).toBe(201);
  const j = await (res as any).json();
  expect(j.id).toBe('fake-id');
  expect(j.permalink).toBe('/episode/fake-id');

  // restore
  (supaMod.getServiceSupabase as any).mockRestore?.();
});
