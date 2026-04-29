import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  verifyPassword,
  createUserSessionToken,
  getLoggedInUserId,
  USER_SESSION_COOKIE,
} from "@/lib/auth";
import { getUserByEmail, getUserById } from "@/lib/db";

// GET /api/user/auth — return current logged-in user
export async function GET() {
  const userId = await getLoggedInUserId();
  if (!userId) {
    return NextResponse.json({ user: null });
  }
  const user = getUserById(userId);
  if (!user) {
    return NextResponse.json({ user: null });
  }
  const { passwordHash: _passwordHash, ...publicUser } = user;
  return NextResponse.json({ user: publicUser });
}

// POST /api/user/auth — login
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const data = body as Record<string, unknown>;

  if (
    !data.email ||
    typeof data.email !== "string" ||
    !data.password ||
    typeof data.password !== "string"
  ) {
    return NextResponse.json(
      { error: "Email and password are required" },
      { status: 400 },
    );
  }

  const user = getUserByEmail(data.email.trim().toLowerCase());
  if (!user || !verifyPassword(data.password, user.passwordHash)) {
    return NextResponse.json(
      { error: "Invalid email or password" },
      { status: 401 },
    );
  }

  const token = createUserSessionToken(user.id);
  const cookieStore = await cookies();
  cookieStore.set(USER_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });

  const { passwordHash: _passwordHash, ...publicUser } = user;
  return NextResponse.json({ user: publicUser });
}

// DELETE /api/user/auth — logout
export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete(USER_SESSION_COOKIE);
  return NextResponse.json({ success: true });
}
