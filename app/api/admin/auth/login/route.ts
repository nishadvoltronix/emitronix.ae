import { NextRequest, NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, AdminUsersStoreError, type AdminUser, createSessionValue, isAdminConfigured, loadAdminUsers, verifyPassword } from "@/lib/adminAuth";
import { requestIp } from "@/lib/adminGuard";
import { logActivity } from "@/lib/adminStore";
import { readBoundedRequestBody } from "@/lib/requestBody";
import { createLocalRateLimiter } from "@/lib/requestSecurity";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 8;
const isRateLimited = createLocalRateLimiter({ limit: MAX_ATTEMPTS, windowMs: WINDOW_MS });
const MAX_BODY_BYTES = 2_048;

export async function POST(request: NextRequest) {
  if (!isAdminConfigured()) {
    return NextResponse.json(
      { ok: false, message: "Admin is not configured. Set ADMIN_SESSION_SECRET, ADMIN_EMAIL and ADMIN_PASSWORD." },
      { status: 503 },
    );
  }

  const ip = requestIp(request);
  if (isRateLimited(ip)) {
    return NextResponse.json({ ok: false, message: "Too many login attempts. Try again later." }, { status: 429 });
  }

  let payload: { email?: unknown; password?: unknown };
  try {
    if (request.headers.get("content-type")?.split(";", 1)[0]?.trim().toLowerCase() !== "application/json") {
      return NextResponse.json({ ok: false, message: "Invalid request." }, { status: 400 });
    }
    const { body, tooLarge } = await readBoundedRequestBody(request, MAX_BODY_BYTES);
    if (tooLarge) return NextResponse.json({ ok: false, message: "Request too large." }, { status: 413 });
    const parsed = JSON.parse(body.toString("utf8")) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return NextResponse.json({ ok: false, message: "Invalid request." }, { status: 400 });
    }
    payload = parsed as typeof payload;
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid request." }, { status: 400 });
  }

  const email = typeof payload.email === "string" ? payload.email.trim().toLowerCase() : "";
  const password = typeof payload.password === "string" ? payload.password : "";

  let users: AdminUser[];
  try {
    users = await loadAdminUsers();
  } catch (error) {
    if (!(error instanceof AdminUsersStoreError)) throw error;
    console.error("Admin user storage unavailable", { code: error.code });
    return NextResponse.json(
      { ok: false, message: "Admin sign-in is temporarily unavailable." },
      { status: 503 },
    );
  }
  const user = users.find((candidate) => candidate.email === email);

  if (!user || !password || !verifyPassword(password, user.passwordHash)) {
    await logActivity({ user: email || "unknown", action: "login-failed", ip });
    return NextResponse.json({ ok: false, message: "Invalid email or password." }, { status: 401 });
  }

  await logActivity({ user: user.email, action: "login", ip });

  const response = NextResponse.json({ ok: true, user: { email: user.email, name: user.name, role: user.role } });
  response.cookies.set(ADMIN_SESSION_COOKIE, createSessionValue(user), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 8 * 60 * 60,
  });
  return response;
}
