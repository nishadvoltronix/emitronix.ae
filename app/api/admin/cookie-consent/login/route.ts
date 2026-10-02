import { NextRequest, NextResponse } from "next/server";
import { site } from "@/data/site";
import { clientIp, createLocalRateLimiter, isSameOriginRequest } from "@/lib/requestSecurity";
import {
  COOKIE_ADMIN_SESSION_NAME,
  COOKIE_ADMIN_SESSION_TTL_SECONDS,
  createCookieAdminSessionValue,
  isCookieAdminConfigured,
  verifyCookieAdminPassword,
} from "@/lib/cookieConsentAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const RATE_LIMIT_MAX = 5;
const MAX_BODY_BYTES = 2_048;

const isRateLimited = createLocalRateLimiter({ limit: RATE_LIMIT_MAX, windowMs: RATE_LIMIT_WINDOW_MS });

async function readBoundedBody(request: NextRequest) {
  const declaredLength = request.headers.get("content-length");

  if (declaredLength && /^\d+$/.test(declaredLength) && Number(declaredLength) > MAX_BODY_BYTES) {
    return { body: null, tooLarge: true };
  }

  if (!request.body) return { body: "", tooLarge: false };

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    totalBytes += value.byteLength;

    if (totalBytes > MAX_BODY_BYTES) {
      await reader.cancel().catch(() => undefined);
      return { body: null, tooLarge: true };
    }

    chunks.push(value);
  }

  return { body: Buffer.concat(chunks, totalBytes).toString("utf8"), tooLarge: false };
}

export async function POST(request: NextRequest) {
  if (!isSameOriginRequest(request, site.url)) {
    return NextResponse.json({ ok: false, code: "CROSS_SITE_REQUEST" }, { status: 403 });
  }

  if (isRateLimited(clientIp(request))) {
    return NextResponse.json({ ok: false, code: "TOO_MANY_ATTEMPTS" }, { status: 429 });
  }

  if (!isCookieAdminConfigured()) {
    return NextResponse.json({ ok: false, code: "COOKIE_ADMIN_NOT_CONFIGURED" }, { status: 503 });
  }

  if (request.headers.get("content-type")?.split(";", 1)[0]?.trim().toLowerCase() !== "application/json") {
    return NextResponse.json({ ok: false, code: "INVALID_REQUEST" }, { status: 400 });
  }

  const { body, tooLarge } = await readBoundedBody(request);

  if (tooLarge) {
    return NextResponse.json({ ok: false, code: "REQUEST_TOO_LARGE" }, { status: 413 });
  }

  let payload: { password?: unknown };

  try {
    const parsed = JSON.parse(body || "") as unknown;
    payload = parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch {
    payload = {};
  }

  if (!verifyCookieAdminPassword(payload.password)) {
    return NextResponse.json({ ok: false, code: "INVALID_PASSWORD" }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(COOKIE_ADMIN_SESSION_NAME, createCookieAdminSessionValue(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: COOKIE_ADMIN_SESSION_TTL_SECONDS,
  });

  return response;
}
