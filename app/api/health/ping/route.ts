import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(_req: NextRequest) {
  return new Response(JSON.stringify({ ok: true, status: "healthy" }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
