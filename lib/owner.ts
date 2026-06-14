/**
 * Single-admin lock — only this email can sign in.
 * Centralized here so login form, auth callback, and any future check
 * stay in sync. Update one place if owner email changes.
 */
export const ADMIN_EMAIL = "mvgreza@gmail.com";

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return email.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase();
}
