import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !key) {
  // In dev/test, pages that don't need Supabase can still import this file; avoid throwing at import time.
  // Consumers should handle missing client if necessary.
  // eslint-disable-next-line no-console
  console.warn('NEXT_PUBLIC_SUPABASE_* not configured — supabase client will be unusable in the browser.');
}

export const supabaseClient = createClient(url ?? '', key ?? '');
