import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createServiceClient } from "@/lib/supabase/server";
import { calcCost } from "@/lib/pricing";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// OpenAI-compatible error response
function errorResponse(type: string, message: string, code: number) {
  return NextResponse.json(
    { error: { type, message, code } },
    { status: code }
  );
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  // 1. Extract Bearer token
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return errorResponse(
      "invalid_request_error",
      "Missing Authorization header with Bearer token",
      401
    );
  }
  const token = authHeader.slice(7).trim();

  // 2. Validate format
  const keyRegex = /^cc_live_[A-Za-z0-9]{32}$/;
  if (!keyRegex.test(token)) {
    return errorResponse("invalid_api_key", "Invalid API key format", 401);
  }

  // 3. Hash and lookup
  const keyHash = crypto.createHash("sha256").update(token).digest("hex");
  const supabase = createServiceClient();

  const { data: keyData, error: keyError } = await supabase
    .from("api_keys")
    .select("id, user_id")
    .eq("key_hash", keyHash)
    .eq("revoked", false)
    .single();

  if (keyError || !keyData) {
    return errorResponse("invalid_api_key", "Invalid API key", 401);
  }

  const { id: apiKeyId, user_id: userId } = keyData;

  // 4. Check credits
  const { data: credits, error: creditsError } = await supabase
    .from("credits")
    .select("balance_usd")
    .eq("user_id", userId)
    .single();

  if (creditsError || !credits || Number(credits.balance_usd) <= 0) {
    return errorResponse(
      "insufficient_credit",
      "Insufficient credit balance. Top up at https://codecrack.dev/dashboard/billing",
      402
    );
  }

  // 5. Check profile status
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("status")
    .eq("id", userId)
    .single();

  if (profileError || !profile) {
    return errorResponse("invalid_api_key", "Account not found", 401);
  }

  if (profile.status === "waitlist") {
    return errorResponse(
      "waitlist",
      "Account is on the waitlist. Wait for approval.",
      403
    );
  }

  if (profile.status === "suspended") {
    return errorResponse(
      "account_suspended",
      "Account is suspended. Contact support.",
      403
    );
  }

  // 6. Parse request body
  let body: any;
  try {
    body = await request.json();
  } catch {
    return errorResponse(
      "invalid_request_error",
      "Invalid JSON in request body",
      400
    );
  }

  if (!body.messages || !Array.isArray(body.messages)) {
    return errorResponse(
      "invalid_request_error",
      "messages field is required and must be an array",
      400
    );
  }

  // 7. Force model
  body.model = "hermes-agent";

  const isStreaming = body.stream === true;

  // 8. Forward to Hermes
  const hermesUrl = process.env.HERMES_BASE_URL;
  const hermesKey = process.env.HERMES_API_KEY;

  if (!hermesUrl || !hermesKey) {
    return errorResponse(
      "invalid_request_error",
      "Gateway not configured",
      500
    );
  }

  let upstreamResponse: Response;
  try {
    upstreamResponse = await fetch(`${hermesUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${hermesKey}`,
      },
      body: JSON.stringify(body),
    });
  } catch (err: any) {
    return errorResponse(
      "invalid_request_error",
      "Upstream unavailable",
      502
    );
  }

  if (!upstreamResponse.ok && !isStreaming) {
    const errText = await upstreamResponse.text();
    return new NextResponse(errText, {
      status: upstreamResponse.status,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Update last_used_at (fire-and-forget)
  supabase
    .from("api_keys")
    .update({ last_used_at: new Date().toISOString() })
    .eq("id", apiKeyId)
    .then(() => {});

  // NON-STREAMING
  if (!isStreaming) {
    const responseText = await upstreamResponse.text();
    let parsed: any;
    try {
      parsed = JSON.parse(responseText);
    } catch {
      return new NextResponse(responseText, {
        status: upstreamResponse.status,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Extract usage and bill
    const usage = parsed.usage;
    if (usage) {
      const promptTokens = usage.prompt_tokens ?? 0;
      const completionTokens = usage.completion_tokens ?? 0;
      const totalTokens = usage.total_tokens ?? promptTokens + completionTokens;
      const cost = calcCost(promptTokens, completionTokens);
      const durationMs = Date.now() - startTime;

      // Fire-and-forget: deduct + log
      Promise.all([
        supabase.rpc("deduct_credits", {
          p_user_id: userId,
          p_amount: cost,
        }),
        supabase.from("usage_logs").insert({
          user_id: userId,
          api_key_id: apiKeyId,
          request_id: parsed.id ?? null,
          model: "hermes-agent",
          prompt_tokens: promptTokens,
          completion_tokens: completionTokens,
          total_tokens: totalTokens,
          cost_usd: cost,
          status_code: upstreamResponse.status,
          duration_ms: durationMs,
          streaming: false,
        }),
      ]).catch(() => {});
    }

    return new NextResponse(responseText, {
      status: upstreamResponse.status,
      headers: { "Content-Type": "application/json" },
    });
  }

  // STREAMING
  if (!upstreamResponse.body) {
    return errorResponse("invalid_request_error", "No response body from upstream", 502);
  }

  let lastRequestId = "";
  let totalPromptTokens = 0;
  let totalCompletionTokens = 0;

  const reader = upstreamResponse.body.getReader();
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          // Pass through verbatim
          controller.enqueue(value);

          // Parse for usage extraction
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (!line.startsWith("data: ") || line === "data: [DONE]") continue;
            const jsonStr = line.slice(6);
            try {
              const parsed = JSON.parse(jsonStr);
              if (parsed.id) lastRequestId = parsed.id;
              if (parsed.usage) {
                totalPromptTokens = parsed.usage.prompt_tokens ?? totalPromptTokens;
                totalCompletionTokens = parsed.usage.completion_tokens ?? totalCompletionTokens;
              }
            } catch {
              // Non-JSON line (like event lines), skip
            }
          }
        }
      } catch (err) {
        // Stream error — still close gracefully
      } finally {
        controller.close();

        // Finalize: deduct credits and log usage
        const totalTokens = totalPromptTokens + totalCompletionTokens;
        const cost = calcCost(totalPromptTokens, totalCompletionTokens);
        const durationMs = Date.now() - startTime;

        if (totalTokens > 0) {
          Promise.all([
            supabase.rpc("deduct_credits", {
              p_user_id: userId,
              p_amount: cost,
            }),
            supabase.from("usage_logs").insert({
              user_id: userId,
              api_key_id: apiKeyId,
              request_id: lastRequestId || null,
              model: "hermes-agent",
              prompt_tokens: totalPromptTokens,
              completion_tokens: totalCompletionTokens,
              total_tokens: totalTokens,
              cost_usd: cost,
              status_code: 200,
              duration_ms: durationMs,
              streaming: true,
            }),
          ]).catch(() => {});
        }
      }
    },
  });

  return new NextResponse(stream, {
    status: 200,
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
