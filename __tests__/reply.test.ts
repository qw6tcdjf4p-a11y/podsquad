import { POST } from '../app/api/reply/route';

// Mock global.fetch for OpenAI
const realFetch = global.fetch;

beforeAll(() => {
  // Ensure handler uses the OpenAI path (not the local dev-stub)
  process.env.OPENAI_API_KEY = 'test-openai-key';
  (global as any).fetch = jest.fn(async (url: string, opts: any) => {
    // Return a fake OpenAI chat completion
    return {
      ok: true,
      status: 200,
      json: async () => ({ choices: [{ message: { content: 'Hello kid! Nice to meet you.' } }] }),
    } as any;
  });
});

afterAll(() => {
  (global as any).fetch = realFetch;
  delete process.env.OPENAI_API_KEY;
});

test('reply.POST returns a reply when transcript provided', async () => {
  const req = { json: async () => ({ transcript: 'hi there' }) } as any;
  const res = await POST(req);
  expect(res).toBeDefined();
  // Response is a web Response; read text
  const text = await (res as any).text();
  expect(text).toContain('Hello kid!');
});
