import { NextRequest, NextResponse } from "next/server";
import { COOKIE_ADMIN_SESSION_NAME, hasCookieAdminAccess, isCookieAdminConfigured } from "@/lib/cookieConsentAdmin";
import { resetCookieConsents, cookieConsentErrorReason } from "@/lib/cookieConsentStore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  if (!isCookieAdminConfigured() || !hasCookieAdminAccess(request.cookies.get(COOKIE_ADMIN_SESSION_NAME)?.value)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  try {
    const data = await resetCookieConsents();
    return NextResponse.json({ ok: true, ...data });
  } catch (error) {
    console.error("Cookie consent reset failed", { code: "CONSENT_RESET_FAILED", reason: cookieConsentErrorReason(error) });
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
