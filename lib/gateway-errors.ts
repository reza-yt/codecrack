/**
 * Build OpenAI-compatible JSON error responses.
 * Spec section 11:
 *   {
 *     "error": {
 *       "type": "...",
 *       "message": "...",
 *       "code": <http>
 *     }
 *   }
 */
import { NextResponse } from "next/server";

export type ErrorType =
  | "invalid_request_error"
  | "invalid_api_key"
  | "insufficient_credit"
  | "waitlist"
  | "account_suspended"
  | "upstream_error"
  | "rate_limit_error"
  | "internal_error";

export function gatewayError(
  type: ErrorType,
  message: string,
  status: number,
): NextResponse {
  return NextResponse.json(
    { error: { type, message, code: status } },
    {
      status,
      headers: {
        "Cache-Control": "no-store, no-transform",
        "Access-Control-Allow-Origin": "*",
      },
    },
  );
}
