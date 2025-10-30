import { POST as register } from '../app/api/auth/register/route';
import { POST as confirm } from '../app/api/auth/guardian-confirm/route';
import * as supaMod from '../lib/supabase';

// Mock service supabase with table-specific behaviors
const fakeClient = {
  from: (table: string) => {
    if (table === 'guardian_tokens') {
      return {
        select: (_: any) => ({ eq: (_col: any, _val: any) => ({ single: async () => ({ data: { profile_id: 'prof-1' } }) }) }),
        delete: () => ({ eq: (_: any, _v: any) => Promise.resolve({}) }),
        insert: (_obj: any) => Promise.resolve({ data: { token: 'tok-1' } }),
      } as any;
    }
    // default behavior: insert profile and perform updates
    return {
      insert: (obj: any) => ({ select: (_: any) => ({ single: async () => ({ data: { id: 'prof-1' } }) }) }),
      delete: () => ({ eq: (_: any, _v: any) => Promise.resolve({}) }),
      select: () => ({ single: async () => ({ data: null }) }),
      update: () => ({ eq: (_: any, _v: any) => Promise.resolve({}) }),
    } as any;
  },
} as any;

beforeAll(() => {
  jest.spyOn(supaMod, 'getServiceSupabase').mockImplementation(() => fakeClient);
});

afterAll(() => {
  (supaMod.getServiceSupabase as any).mockRestore?.();
});

test('register returns 201 and token for under-13', async () => {
  const req = { json: async () => ({ email: 'kid@example.com', display_name: 'Kid', age: 8, guardian_email: 'parent@example.com' }) } as any;
  const res = await register(req);
  expect((res as any).status).toBe(201);
  const j = await (res as any).json();
  expect(j.profileId).toBe('prof-1');
  expect(j.guardian_token).toBeDefined();
});

test('confirm returns ok for valid token', async () => {
  const req = { json: async () => ({ token: 'tok-1' }) } as any;
  const res = await confirm(req);
  expect((res as any).status).toBe(200);
  const j = await (res as any).json();
  expect(j.ok).toBe(true);
});
