import { NextRequest, NextResponse, after } from "next/server";
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
    .select("id, user_id, token_quota, tokens_used")
    .eq("key_hash", keyHash)
    .eq("revoked", false)
    .single();

  if (keyError || !keyData) {
    return errorResponse("invalid_api_key", "Invalid API key", 401);
  }

  const { id: apiKeyId, user_id: userId } = keyData;
  const tokenQuota: number | null = keyData.token_quota
    ? Number(keyData.token_quota)
    : null;
  const tokensUsed: number = Number(keyData.tokens_used ?? 0);
  const isQuotaKey = tokenQuota !== null;

  // 4. Authorization: token-quota keys vs USD-credit keys take different
  //    paths. Quota keys (admin-issued resale) skip credit/profile checks
  //    entirely — the key itself is the authorization.
  if (isQuotaKey) {
    if (tokensUsed >= tokenQuota) {
      return errorResponse(
        "quota_exhausted",
        `Token quota exhausted (${tokensUsed.toLocaleString()} / ${tokenQuota.toLocaleString()}). Contact your reseller for a new key.`,
        402
      );
    }
  } else {
    // Legacy USD-credit path — keys minted from the user dashboard.
    if (!userId) {
      return errorResponse(
        "invalid_api_key",
        "Key has no associated account",
        401
      );
    }

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

  // 7. Force model name. Upstream Hermes profile is also called "codecrack",
  //    so this matches the upstream's expected model id.
  body.model = "codecrack";

  const isStreaming = body.stream === true;

  // For streaming, force include_usage so the upstream emits a final
  // usage chunk. Without this, OpenAI-compat servers omit usage from
  // streaming responses and we'd never bill.
  if (isStreaming) {
    body.stream_options = { ...(body.stream_options ?? {}), include_usage: true };
  }

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

  // Update last_used_at via after() so it's guaranteed to run after the
  // response is sent (otherwise Vercel kills the function and the write
  // is dropped).
  after(async () => {
    await supabase
      .from("api_keys")
      .update({ last_used_at: new Date().toISOString() })
      .eq("id", apiKeyId);
  });

  // ============================================================
  // NON-STREAMING
  // ============================================================
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

    const usage = parsed.usage;
    if (usage) {
      const promptTokens = usage.prompt_tokens ?? 0;
      const completionTokens = usage.completion_tokens ?? 0;
      const totalTokens = usage.total_tokens ?? promptTokens + completionTokens;
      const cost = calcCost(promptTokens, completionTokens);
      const durationMs = Date.now() - startTime;

      // after() ensures the work completes even after we return the response.
      after(async () => {
        try {
          // Billing path differs by key type.
          const billingOp = isQuotaKey
            ? supabase.rpc("consume_tokens", {
                p_api_key_id: apiKeyId,
                p_tokens: totalTokens,
              })
            : supabase.rpc("deduct_credits", {
                p_user_id: userId,
                p_amount: cost,
              });

          await Promise.all([
            billingOp,
            supabase.from("usage_logs").insert({
              user_id: userId,
              api_key_id: apiKeyId,
              request_id: parsed.id ?? null,
              model: "codecrack",
              prompt_tokens: promptTokens,
              completion_tokens: completionTokens,
              total_tokens: totalTokens,
              cost_usd: cost,
              status_code: upstreamResponse.status,
              duration_ms: durationMs,
              streaming: false,
            }),
          ]);
        } catch (err) {
          console.error("billing failed (non-streaming):", err);
        }
      });
    }

    return new NextResponse(responseText, {
      status: upstreamResponse.status,
      headers: { "Content-Type": "application/json" },
    });
  }

  // ============================================================
  // STREAMING
  // ============================================================
  if (!upstreamResponse.body) {
    return errorResponse("invalid_request_error", "No response body from upstream", 502);
  }

  let lastRequestId = "";
  let totalPromptTokens = 0;
  let totalCompletionTokens = 0;
  // Buffer for SSE line splitting — chunks can split a single `data: {...}`
  // line across two reads. Naive split('\n') drops the half that contained
  // the usage object.
  let sseBuffer = "";

  const reader = upstreamResponse.body.getReader();
  const decoder = new TextDecoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          // Pass through verbatim
          controller.enqueue(value);

          // Append to buffer, then process complete lines only.
          sseBuffer += decoder.decode(value, { stream: true });
          let nlIdx;
          while ((nlIdx = sseBuffer.indexOf("\n")) !== -1) {
            const line = sseBuffer.slice(0, nlIdx).trimEnd();
            sseBuffer = sseBuffer.slice(nlIdx + 1);

            if (!line.startsWith("data: ")) continue;
            const payload = line.slice(6);
            if (payload === "[DONE]") continue;

            try {
              const parsed = JSON.parse(payload);
              if (parsed.id) lastRequestId = parsed.id;
              if (parsed.usage) {
                totalPromptTokens =
                  parsed.usage.prompt_tokens ?? totalPromptTokens;
                totalCompletionTokens =
                  parsed.usage.completion_tokens ?? totalCompletionTokens;
              }
            } catch {
              // Incomplete or non-JSON line, skip.
            }
          }
        }
      } catch (err) {
        // Stream error — still close gracefully so client sees end.
      } finally {
        controller.close();
      }
    },
  });

  // Capture billing closure into after() so it's guaranteed to commit
  // after the response stream finishes — Vercel won't kill the function
  // until after() completes.
  after(async () => {
    // Wait briefly for any final TCP chunk that may not have been parsed
    // before the controller closed. The reader is already drained at this
    // point, but the buffer might still hold a tail line.
    if (sseBuffer.length > 0) {
      const line = sseBuffer.trim();
      if (line.startsWith("data: ")) {
        try {
          const parsed = JSON.parse(line.slice(6));
          if (parsed.id) lastRequestId = parsed.id;
          if (parsed.usage) {
            totalPromptTokens =
              parsed.usage.prompt_tokens ?? totalPromptTokens;
            totalCompletionTokens =
              parsed.usage.completion_tokens ?? totalCompletionTokens;
          }
        } catch {
          // ignore
        }
      }
    }

    const totalTokens = totalPromptTokens + totalCompletionTokens;
    const cost = calcCost(totalPromptTokens, totalCompletionTokens);
    const durationMs = Date.now() - startTime;

    if (totalTokens === 0) {
      // No usage captured. Log a zero-cost row anyway so the request is
      // visible in /dashboard/usage and we don't silently lose it.
      try {
        await supabase.from("usage_logs").insert({
          user_id: userId,
          api_key_id: apiKeyId,
          request_id: lastRequestId || null,
          model: "codecrack",
          prompt_tokens: 0,
          completion_tokens: 0,
          total_tokens: 0,
          cost_usd: 0,
          status_code: upstreamResponse.status,
          duration_ms: durationMs,
          streaming: true,
        });
      } catch (err) {
        console.error("zero-usage log failed:", err);
      }
      return;
    }

    try {
      const billingOp = isQuotaKey
        ? supabase.rpc("consume_tokens", {
            p_api_key_id: apiKeyId,
            p_tokens: totalTokens,
          })
        : supabase.rpc("deduct_credits", {
            p_user_id: userId,
            p_amount: cost,
          });

      await Promise.all([
        billingOp,
        supabase.from("usage_logs").insert({
          user_id: userId,
          api_key_id: apiKeyId,
          request_id: lastRequestId || null,
          model: "codecrack",
          prompt_tokens: totalPromptTokens,
          completion_tokens: totalCompletionTokens,
          total_tokens: totalTokens,
          cost_usd: cost,
          status_code: 200,
          duration_ms: durationMs,
          streaming: true,
        }),
      ]);
    } catch (err) {
      console.error("billing failed (streaming):", err);
    }
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
