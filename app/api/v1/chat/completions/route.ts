import { NextResponse, type NextRequest } from "next/server";
import { createServiceSupabase } from "@/lib/supabase/server";
import { isValidKeyFormat, sha256Hex } from "@/lib/api-keys";
import { calcCost } from "@/lib/pricing";
import { gatewayError } from "@/lib/gateway-errors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300; // 5 minutes — Hermes can run long tool calls.

interface AuthContext {
  userId: string;
  apiKeyId: string;
}

interface UsageBlock {
  prompt_tokens?: number;
  completion_tokens?: number;
  total_tokens?: number;
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Authorization, Content-Type",
      "Access-Control-Max-Age": "86400",
    },
  });
}

export async function POST(req: NextRequest) {
  const startedAt = Date.now();

  // -------------------------------------------------------------------------
  // 1-5. Auth + entitlement.
  // -------------------------------------------------------------------------
  const auth = await authenticateAndAuthorize(req);
  if (!auth.ok) return auth.response;
  const { userId, apiKeyId } = auth.context;

  // -------------------------------------------------------------------------
  // 6. Parse body, force model, decide streaming.
  // -------------------------------------------------------------------------
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return gatewayError(
      "invalid_request_error",
      "Request body must be valid JSON.",
      400,
    );
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return gatewayError(
      "invalid_request_error",
      "Request body must be a JSON object.",
      400,
    );
  }
  if (!Array.isArray(body.messages) || body.messages.length === 0) {
    return gatewayError(
      "invalid_request_error",
      "'messages' must be a non-empty array.",
      400,
    );
  }
  // Spec section 11.7: force the model server-side.
  body.model = "hermes-agent";
  const isStreaming = body.stream === true;

  // -------------------------------------------------------------------------
  // 7-8. Forward to Hermes.
  // -------------------------------------------------------------------------
  const upstreamBase = process.env.HERMES_BASE_URL;
  const upstreamKey = process.env.HERMES_API_KEY;
  if (!upstreamBase || !upstreamKey) {
    console.error("HERMES_BASE_URL or HERMES_API_KEY not configured");
    return gatewayError(
      "internal_error",
      "Gateway is not configured. Please retry shortly.",
      500,
    );
  }
  const upstreamUrl = `${upstreamBase.replace(/\/$/, "")}/chat/completions`;

  let upstreamResp: Response;
  try {
    upstreamResp = await fetch(upstreamUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${upstreamKey}`,
        "Content-Type": "application/json",
        Accept: isStreaming ? "text/event-stream" : "application/json",
      },
      body: JSON.stringify(body),
      // Prevent Next from caching anything.
      cache: "no-store",
    });
  } catch (err) {
    console.error("upstream fetch failed:", err);
    await logFailure({
      userId,
      apiKeyId,
      statusCode: 502,
      durationMs: Date.now() - startedAt,
      streaming: isStreaming,
    });
    return gatewayError(
      "upstream_error",
      "Couldn't reach the Hermes upstream. Try again.",
      502,
    );
  }

  // -------------------------------------------------------------------------
  // 9. Bubble up upstream errors verbatim (best-effort) — but always log.
  // -------------------------------------------------------------------------
  if (!upstreamResp.ok && !isStreaming) {
    const text = await upstreamResp.text().catch(() => "");
    await logFailure({
      userId,
      apiKeyId,
      statusCode: upstreamResp.status,
      durationMs: Date.now() - startedAt,
      streaming: false,
    });
    // Try to keep original error shape for the client.
    let parsed: unknown = null;
    try {
      parsed = JSON.parse(text);
    } catch {
      /* ignore */
    }
    if (parsed && typeof parsed === "object") {
      return new NextResponse(JSON.stringify(parsed), {
        status: upstreamResp.status,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store, no-transform",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }
    return gatewayError(
      "upstream_error",
      `Upstream returned ${upstreamResp.status}.`,
      upstreamResp.status >= 500 ? 502 : upstreamResp.status,
    );
  }

  // -------------------------------------------------------------------------
  // 10a. Non-streaming path.
  // -------------------------------------------------------------------------
  if (!isStreaming) {
    const raw = await upstreamResp.text();
    let parsed: { id?: string; usage?: UsageBlock } | null = null;
    try {
      parsed = JSON.parse(raw);
    } catch {
      /* response wasn't JSON — return as-is and bill nothing */
    }

    const usage = parsed?.usage ?? {};
    const promptTokens = Number(usage.prompt_tokens ?? 0);
    const completionTokens = Number(usage.completion_tokens ?? 0);
    const totalTokens = Number(
      usage.total_tokens ?? promptTokens + completionTokens,
    );
    const cost = calcCost(promptTokens, completionTokens);

    // Fire-and-forget settlement — don't block the response.
    void settle({
      userId,
      apiKeyId,
      requestId: parsed?.id ?? null,
      promptTokens,
      completionTokens,
      totalTokens,
      cost,
      statusCode: upstreamResp.status,
      durationMs: Date.now() - startedAt,
      streaming: false,
    });

    return new NextResponse(raw, {
      status: upstreamResp.status,
      headers: {
        "Content-Type":
          upstreamResp.headers.get("content-type") ?? "application/json",
        "Cache-Control": "no-store, no-transform",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }

  // -------------------------------------------------------------------------
  // 10b. Streaming path: pass-through SSE while parsing usage in parallel.
  // -------------------------------------------------------------------------
  if (!upstreamResp.body) {
    await logFailure({
      userId,
      apiKeyId,
      statusCode: 502,
      durationMs: Date.now() - startedAt,
      streaming: true,
    });
    return gatewayError(
      "upstream_error",
      "Upstream returned no body for streaming request.",
      502,
    );
  }

  const upstreamReader = upstreamResp.body.getReader();
  const decoder = new TextDecoder("utf-8");
  let buffer = "";
  let lastRequestId: string | null = null;
  let totalPromptTokens = 0;
  let totalCompletionTokens = 0;
  let totalTotalTokens = 0;

  const upstreamStatus = upstreamResp.status;

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        // Loop: read upstream, enqueue raw bytes, parse a copy for usage.
        // eslint-disable-next-line no-constant-condition
        while (true) {
          const { value, done } = await upstreamReader.read();
          if (done) break;
          if (!value) continue;

          // 1. Pass-through verbatim — the bytes the client sees are exactly
          //    what Hermes sent.
          controller.enqueue(value);

          // 2. Parse-side: accumulate text and split SSE events on the
          //    blank-line boundary.
          buffer += decoder.decode(value, { stream: true });
          let sepIdx = findEventBoundary(buffer);
          while (sepIdx !== -1) {
            const eventBlock = buffer.slice(0, sepIdx);
            buffer = buffer.slice(sepIdx + 2); // skip the "\n\n"
            handleSseEvent(eventBlock);
            sepIdx = findEventBoundary(buffer);
          }
        }
        // Flush whatever's left in the buffer (rare — should end with \n\n).
        if (buffer.length > 0) {
          buffer += decoder.decode();
          handleSseEvent(buffer);
          buffer = "";
        }
        controller.close();
      } catch (err) {
        console.error("stream error:", err);
        try {
          controller.error(err);
        } catch {
          /* ignore */
        }
      } finally {
        // Settle billing + logging asynchronously.
        const cost = calcCost(totalPromptTokens, totalCompletionTokens);
        void settle({
          userId,
          apiKeyId,
          requestId: lastRequestId,
          promptTokens: totalPromptTokens,
          completionTokens: totalCompletionTokens,
          totalTokens:
            totalTotalTokens || totalPromptTokens + totalCompletionTokens,
          cost,
          statusCode: upstreamStatus,
          durationMs: Date.now() - startedAt,
          streaming: true,
        });
      }
    },
    async cancel(reason) {
      try {
        await upstreamReader.cancel(reason);
      } catch {
        /* ignore */
      }
    },
  });

  function handleSseEvent(block: string) {
    // SSE event blocks may contain `event:` + `data:` lines. We only care
    // about `data:` lines that are JSON with `id` or `usage`.
    const lines = block.split(/\r?\n/);
    for (const line of lines) {
      const trimmed = line.trimStart();
      if (!trimmed.startsWith("data:")) continue;
      const payload = trimmed.slice(5).trim();
      if (!payload || payload === "[DONE]") continue;
      try {
        const obj = JSON.parse(payload) as {
          id?: string;
          usage?: UsageBlock;
        };
        if (obj.id) lastRequestId = obj.id;
        if (obj.usage) {
          if (typeof obj.usage.prompt_tokens === "number") {
            totalPromptTokens = obj.usage.prompt_tokens;
          }
          if (typeof obj.usage.completion_tokens === "number") {
            totalCompletionTokens = obj.usage.completion_tokens;
          }
          if (typeof obj.usage.total_tokens === "number") {
            totalTotalTokens = obj.usage.total_tokens;
          }
        }
      } catch {
        // Non-JSON data lines (e.g. tool-progress payloads) are fine —
        // we just don't bill from them.
      }
    }
  }

  return new NextResponse(stream, {
    status: upstreamStatus,
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-store, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
      "Access-Control-Allow-Origin": "*",
    },
  });
}

// ===========================================================================
// Helpers
// ===========================================================================

/**
 * Find the index of the first SSE event terminator in `buffer`.
 * SSE separates events with a blank line (\n\n or \r\n\r\n).
 */
function findEventBoundary(buffer: string): number {
  const idxLfLf = buffer.indexOf("\n\n");
  const idxCrLfCrLf = buffer.indexOf("\r\n\r\n");
  if (idxLfLf === -1) return idxCrLfCrLf;
  if (idxCrLfCrLf === -1) return idxLfLf;
  return Math.min(idxLfLf, idxCrLfCrLf);
}

async function authenticateAndAuthorize(
  req: NextRequest,
): Promise<
  | { ok: true; context: AuthContext }
  | { ok: false; response: NextResponse }
> {
  // 1. Extract Bearer.
  const authHeader = req.headers.get("authorization") ?? "";
  const m = /^Bearer\s+(.+)$/i.exec(authHeader);
  if (!m) {
    return {
      ok: false,
      response: gatewayError(
        "invalid_request_error",
        "Missing Authorization header. Send 'Bearer <api-key>'.",
        401,
      ),
    };
  }
  const presented = m[1]!.trim();

  // 2. Validate format.
  if (!isValidKeyFormat(presented)) {
    return {
      ok: false,
      response: gatewayError("invalid_api_key", "Invalid API key.", 401),
    };
  }

  // 3. Hash + lookup.
  const hash = sha256Hex(presented);
  const supabase = createServiceSupabase();
  const { data: keyRow, error: keyErr } = await supabase
    .from("api_keys")
    .select("id, user_id, revoked")
    .eq("key_hash", hash)
    .maybeSingle();
  if (keyErr) {
    console.error("key lookup failed:", keyErr);
    return {
      ok: false,
      response: gatewayError(
        "internal_error",
        "Authentication backend unavailable.",
        500,
      ),
    };
  }
  if (!keyRow || keyRow.revoked) {
    return {
      ok: false,
      response: gatewayError("invalid_api_key", "Invalid API key.", 401),
    };
  }

  const userId = keyRow.user_id as string;

  // 4 + 5. Read credits + profile.status in parallel.
  const [creditsRes, profileRes] = await Promise.all([
    supabase
      .from("credits")
      .select("balance_usd")
      .eq("user_id", userId)
      .maybeSingle(),
    supabase
      .from("profiles")
      .select("status")
      .eq("id", userId)
      .maybeSingle(),
  ]);

  // 5. Status checks first — surfaces a clearer error than 402 to a
  //    waitlisted user with $0.
  const status = profileRes.data?.status ?? "waitlist";
  if (status === "suspended") {
    return {
      ok: false,
      response: gatewayError(
        "account_suspended",
        "This account has been suspended. Contact contact@codecrack.dev.",
        403,
      ),
    };
  }
  if (status === "waitlist") {
    return {
      ok: false,
      response: gatewayError(
        "waitlist",
        "This account is still on the waitlist. Hang tight.",
        403,
      ),
    };
  }

  // 4. Credit balance.
  const balance = Number(creditsRes.data?.balance_usd ?? 0);
  if (!isFinite(balance) || balance <= 0) {
    return {
      ok: false,
      response: gatewayError(
        "insufficient_credit",
        "Account balance is depleted. Top up at /dashboard/billing.",
        402,
      ),
    };
  }

  return { ok: true, context: { userId, apiKeyId: keyRow.id as string } };
}

interface SettleArgs {
  userId: string;
  apiKeyId: string;
  requestId: string | null;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  cost: number;
  statusCode: number;
  durationMs: number;
  streaming: boolean;
}

/**
 * Best-effort post-request settlement. Runs after we've returned to the
 * client. Failures are logged but never bubble up.
 */
async function settle(args: SettleArgs): Promise<void> {
  const supabase = createServiceSupabase();
  try {
    // Atomic deduction + last_used_at touch + log insert.
    // Supabase query builders are thenable, not Promise — use PromiseLike.
    const tasks: PromiseLike<unknown>[] = [];

    if (args.cost > 0) {
      tasks.push(
        supabase.rpc("deduct_credits", {
          p_user_id: args.userId,
          p_amount: args.cost,
        }),
      );
    }
    tasks.push(
      supabase
        .from("api_keys")
        .update({ last_used_at: new Date().toISOString() })
        .eq("id", args.apiKeyId),
    );
    tasks.push(
      supabase.from("usage_logs").insert({
        user_id: args.userId,
        api_key_id: args.apiKeyId,
        request_id: args.requestId,
        model: "hermes-agent",
        prompt_tokens: args.promptTokens,
        completion_tokens: args.completionTokens,
        total_tokens: args.totalTokens,
        cost_usd: args.cost,
        status_code: args.statusCode,
        duration_ms: args.durationMs,
        streaming: args.streaming,
      }),
    );

    const results = await Promise.allSettled(tasks);
    for (const r of results) {
      if (r.status === "rejected") {
        console.error("settle subtask failed:", r.reason);
      }
    }
  } catch (err) {
    console.error("settle failed:", err);
  }
}

interface FailureArgs {
  userId: string;
  apiKeyId: string;
  statusCode: number;
  durationMs: number;
  streaming: boolean;
}

/** Log a non-billable failed request so it shows in /dashboard/usage. */
async function logFailure(args: FailureArgs): Promise<void> {
  try {
    const supabase = createServiceSupabase();
    await supabase.from("usage_logs").insert({
      user_id: args.userId,
      api_key_id: args.apiKeyId,
      model: "hermes-agent",
      status_code: args.statusCode,
      duration_ms: args.durationMs,
      streaming: args.streaming,
      cost_usd: 0,
      prompt_tokens: 0,
      completion_tokens: 0,
      total_tokens: 0,
    });
  } catch (err) {
    console.error("failure log failed:", err);
  }
}
