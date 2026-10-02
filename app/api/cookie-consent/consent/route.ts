import { NextRequest, NextResponse } from "next/server";
import { recordCookieConsentEvent, cookieConsentErrorReason } from "@/lib/cookieConsentStore";
import { readBoundedRequestBody } from "@/lib/requestBody";
import { clientIp, createLocalRateLimiter } from "@/lib/requestSecurity";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const RATE_LIMIT_MAX = 25;
const MAX_BODY_BYTES = 2_000;
const isRateLimited = createLocalRateLimiter({ limit: RATE_LIMIT_MAX, windowMs: RATE_LIMIT_WINDOW_MS });

export async function POST(request: NextRequest) {
  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > MAX_BODY_BYTES) {
    return NextResponse.json({ ok: false }, { status: 413 });
  }

  if (request.headers.get("sec-fetch-site") === "cross-site") {
    return NextResponse.json({ ok: false }, { status: 403 });
  }

  if (isRateLimited(clientIp(request))) {
    return NextResponse.json({ ok: false }, { status: 429 });
  }

  try {
    if (request.headers.get("content-type")?.split(";", 1)[0]?.trim().toLowerCase() !== "application/json") {
      return NextResponse.json({ ok: false }, { status: 400 });
    }
    const { body, tooLarge } = await readBoundedRequestBody(request, MAX_BODY_BYTES);
    if (tooLarge) return NextResponse.json({ ok: false }, { status: 413 });
    let parsed: unknown;
    try {
      parsed = JSON.parse(body.toString("utf8"));
    } catch {
      return NextResponse.json({ ok: false }, { status: 400 });
    }
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }
    const payload = parsed as Record<string, unknown>;
    if (!["accept_all", "reject_non_essential", "customize", "save_preferences"].includes(String(payload.action))) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }
    if (payload.categories !== undefined && (!payload.categories || typeof payload.categories !== "object" || Array.isArray(payload.categories))) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }
    await recordCookieConsentEvent({
      action: payload.action,
      categories: payload.categories as never,
    });

    return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Cookie consent event failed", {
      code: "CONSENT_EVENT_FAILED",
      reason: cookieConsentErrorReason(error),
    });
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
