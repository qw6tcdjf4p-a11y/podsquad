export const runtime = "edge";

export async function GET() {
  const keys = [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "SUPABASE_SERVICE_ROLE",
    "OPENAI_API_KEY",
  ] as const;

  const present = Object.fromEntries(keys.map((k) => [k, Boolean(process.env[k])]));
  const ok = Object.values(present).every(Boolean);

  return new Response(JSON.stringify({ ok, ...present }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
