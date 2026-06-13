import { NextResponse, type NextRequest } from "next/server";
import { createServiceSupabase } from "@/lib/supabase/server";
import { isValidKeyFormat, sha256Hex } from "@/lib/api-keys";
import { gatewayError } from "@/lib/gateway-errors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const HARDCODED_MODELS = [
  {
    id: "hermes-agent",
    object: "model",
    created: 1700000000,
    owned_by: "codecrack",
  },
];

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Authorization, Content-Type",
    },
  });
}

export async function GET(req: NextRequest) {
  // Auth is required (mirrors OpenAI behavior). We don't bill, but we do
  // confirm the key is valid + active so users can sanity-check setup.
  const authResult = await authenticate(req);
  if (!authResult.ok) return authResult.response;

  return NextResponse.json(
    { object: "list", data: HARDCODED_MODELS },
    {
      headers: {
        "Cache-Control": "no-store",
        "Access-Control-Allow-Origin": "*",
      },
    },
  );
}

async function authenticate(
  req: NextRequest,
): Promise<{ ok: true } | { ok: false; response: NextResponse }> {
  const auth = req.headers.get("authorization") ?? "";
  const match = /^Bearer\s+(.+)$/i.exec(auth);
  if (!match) {
    return {
      ok: false,
      response: gatewayError(
        "invalid_request_error",
        "Missing Authorization header. Send 'Bearer <api-key>'.",
        401,
      ),
    };
  }
  const key = match[1]!.trim();
  if (!isValidKeyFormat(key)) {
    return {
      ok: false,
      response: gatewayError("invalid_api_key", "Invalid API key format.", 401),
    };
  }
  const hash = sha256Hex(key);
  const supabase = createServiceSupabase();
  const { data, error } = await supabase
    .from("api_keys")
    .select("id, revoked")
    .eq("key_hash", hash)
    .maybeSingle();
  if (error || !data || data.revoked) {
    return {
      ok: false,
      response: gatewayError("invalid_api_key", "Invalid API key.", 401),
    };
  }
  return { ok: true };
}
