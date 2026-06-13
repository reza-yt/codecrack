import crypto from "crypto";

const KEY_PREFIX = "cc_live_";
const RANDOM_LENGTH = 32;
const KEY_REGEX = /^cc_live_[A-Za-z0-9]{32}$/;

export interface GeneratedKey {
  fullKey: string;
  prefix: string;
  hash: string;
}

export function generateApiKey(): GeneratedKey {
  const random = crypto
    .randomBytes(48)
    .toString("base64url")
    .replace(/[-_]/g, "")
    .slice(0, RANDOM_LENGTH);
  const fullKey = `${KEY_PREFIX}${random}`;
  const prefix = fullKey.slice(0, 12);
  const hash = hashApiKey(fullKey);
  return { fullKey, prefix, hash };
}

export function hashApiKey(key: string): string {
  return crypto.createHash("sha256").update(key).digest("hex");
}

export function validateApiKeyFormat(key: string): boolean {
  return KEY_REGEX.test(key);
}
