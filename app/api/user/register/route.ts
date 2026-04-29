import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  hashPassword,
  createUserSessionToken,
  USER_SESSION_COOKIE,
} from "@/lib/auth";
import { getUserByEmail, createUser } from "@/lib/db";
import type { User } from "@/lib/types";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const data = body as Record<string, unknown>;

  if (
    !data.name ||
    typeof data.name !== "string" ||
    data.name.trim().length < 2
  ) {
    return NextResponse.json(
      { error: "Name must be at least 2 characters" },
      { status: 400 },
    );
  }

  if (!data.email || typeof data.email !== "string") {
    return NextResponse.json(
      { error: "Valid email is required" },
      { status: 400 },
    );
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(data.email)) {
    return NextResponse.json(
      { error: "Invalid email format" },
      { status: 400 },
    );
  }

  if (
    !data.password ||
    typeof data.password !== "string" ||
    data.password.length < 6
  ) {
    return NextResponse.json(
      { error: "Password must be at least 6 characters" },
      { status: 400 },
    );
  }

  const email = data.email.trim().toLowerCase();
  const existing = getUserByEmail(email);
  if (existing) {
    return NextResponse.json(
      { error: "Email already registered" },
      { status: 409 },
    );
  }

  const user: User = {
    id: crypto.randomUUID(),
    name: data.name.trim(),
    email,
    passwordHash: hashPassword(data.password),
    createdAt: new Date().toISOString(),
  };

  createUser(user);

  const token = createUserSessionToken(user.id);
  const cookieStore = await cookies();
  cookieStore.set(USER_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });

  const { passwordHash: _passwordHash, ...publicUser } = user;
  return NextResponse.json({ user: publicUser }, { status: 201 });
}
