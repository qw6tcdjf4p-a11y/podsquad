import { createClient, SupabaseClient } from "@supabase/supabase-js";

export function getSupabaseClient(options?: { serviceRole?: boolean }): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL environment variable");

  const key = options?.serviceRole ? process.env.SUPABASE_SERVICE_ROLE : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!key) {
    throw new Error(options?.serviceRole ? "Missing SUPABASE_SERVICE_ROLE environment variable" : "Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable");
  }

  return createClient(url, key);
}

export function isSupabaseConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

type ReqLike = { headers?: any } | undefined;

// Create a Supabase client for a specific incoming request. If the request
// contains an Authorization header (Bearer token) or a cookie with a
// Supabase access token, the returned client will include that token in
// global headers so Supabase treats requests as the authenticated user.
export function createSupabaseForRequest(req?: ReqLike, options?: { serviceRole?: boolean }): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL environment variable");

  const baseKey = options?.serviceRole ? process.env.SUPABASE_SERVICE_ROLE : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!baseKey) throw new Error(options?.serviceRole ? "Missing SUPABASE_SERVICE_ROLE environment variable" : "Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable");

  // Try to extract a bearer token from common locations
  let token: string | undefined;
  try {
    const h = req?.headers;
    if (h) {
      // Next's Request/NextRequest headers have .get
      if (typeof h.get === "function") {
        token = h.get("authorization") || h.get("Authorization");
      } else if (typeof h === "object") {
        token = h["authorization"] || h["Authorization"] || h["cookie"];
      }
      if (token && token.startsWith("Bearer ")) token = token.replace(/^Bearer\s+/i, "");
      // If we have a cookie string, try to parse common Supabase cookie
      if (token && token.includes("sb-access-token=")) {
        const m = token.match(/sb-access-token=([^;]+)/);
        if (m) token = decodeURIComponent(m[1]);
      }
    }
  } catch (err) {
    // ignore header parsing errors — we'll return an unauthenticated client
    token = undefined;
  }

  if (!token) {
    return createClient(url, baseKey);
  }

  return createClient(url, baseKey, { global: { headers: { Authorization: `Bearer ${token}` } } });
}
