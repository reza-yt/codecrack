const PRICE_INPUT_PER_M = parseFloat(process.env.PRICE_INPUT_PER_M || "3.00");
const PRICE_OUTPUT_PER_M = parseFloat(process.env.PRICE_OUTPUT_PER_M || "15.00");

export function calcCost(promptTokens: number, completionTokens: number): number {
  const inputCost = (promptTokens / 1_000_000) * PRICE_INPUT_PER_M;
  const outputCost = (completionTokens / 1_000_000) * PRICE_OUTPUT_PER_M;
  return inputCost + outputCost;
}

export function getPricing() {
  return {
    inputPerM: PRICE_INPUT_PER_M,
    outputPerM: PRICE_OUTPUT_PER_M,
    minTopUp: 10,
  };
}
