import { cookies } from "next/headers";
import crypto from "crypto";

const ADMIN_USERNAME = process.env.ADMIN_USERNAME ?? "admin";
// bcrypt hash of "admin123"
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH ?? "admin123";
const SESSION_COOKIE = "admin_session";
const USER_SESSION_COOKIE = "user_session";
const SESSION_SECRET = process.env.SESSION_SECRET ?? "super-secret-session-key";

// ── Password hashing ─────────────────────────────────────────────────────────

export function hashPassword(password: string): string {
  return crypto
    .createHmac("sha256", SESSION_SECRET)
    .update(password)
    .digest("hex");
}

export function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}

// ── Admin auth ────────────────────────────────────────────────────────────────

export function verifyCredentials(username: string, password: string): boolean {
  // Simple comparison — in production use bcrypt
  return username === ADMIN_USERNAME && password === ADMIN_PASSWORD_HASH;
}

export function createSessionToken(): string {
  // Simple signed token: base64(timestamp + secret)
  const payload = `${Date.now()}:${SESSION_SECRET}`;
  return Buffer.from(payload).toString("base64");
}

export function validateSessionToken(token: string): boolean {
  try {
    const decoded = Buffer.from(token, "base64").toString("utf-8");
    const parts = decoded.split(":");
    if (parts.length < 2) return false;
    const secret = parts.slice(1).join(":");
    return secret === SESSION_SECRET;
  } catch {
    return false;
  }
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return false;
  return validateSessionToken(token);
}

// ── User auth ─────────────────────────────────────────────────────────────────

export function createUserSessionToken(userId: string): string {
  const payload = `${userId}:${Date.now()}:${SESSION_SECRET}`;
  return Buffer.from(payload).toString("base64");
}

export function validateUserSessionToken(token: string): string | null {
  try {
    const decoded = Buffer.from(token, "base64").toString("utf-8");
    const parts = decoded.split(":");
    // format: userId:timestamp:secret (secret may contain colons)
    if (parts.length < 3) return null;
    const userId = parts[0];
    const secret = parts.slice(2).join(":");
    if (secret !== SESSION_SECRET) return null;
    return userId;
  } catch {
    return null;
  }
}

export async function getLoggedInUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(USER_SESSION_COOKIE)?.value;
  if (!token) return null;
  return validateUserSessionToken(token);
}

export { SESSION_COOKIE, USER_SESSION_COOKIE };
