/**
 * Pricing helpers. Unit prices come from env so they can be tuned without
 * a code deploy.
 */

const DEFAULT_INPUT_PER_M = 3.0;
const DEFAULT_OUTPUT_PER_M = 15.0;

export function getInputPricePerM(): number {
  const v = parseFloat(process.env.PRICE_INPUT_PER_M ?? "");
  return isFinite(v) && v > 0 ? v : DEFAULT_INPUT_PER_M;
}

export function getOutputPricePerM(): number {
  const v = parseFloat(process.env.PRICE_OUTPUT_PER_M ?? "");
  return isFinite(v) && v > 0 ? v : DEFAULT_OUTPUT_PER_M;
}

export function calcCost(
  promptTokens: number,
  completionTokens: number,
): number {
  const input = (promptTokens / 1_000_000) * getInputPricePerM();
  const output = (completionTokens / 1_000_000) * getOutputPricePerM();
  return input + output;
}

export const MIN_TOPUP_USD = 10;
