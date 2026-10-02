import { NextRequest, NextResponse } from "next/server";
import { normalizeCookieConsentConfig, type CookieConsentConfig } from "@/data/cookieConsentDefaults";
import { COOKIE_ADMIN_SESSION_NAME, hasCookieAdminAccess, isCookieAdminConfigured } from "@/lib/cookieConsentAdmin";
import { getCookieConsentData, updateCookieConsentConfig, cookieConsentErrorReason } from "@/lib/cookieConsentStore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function authorize(request: NextRequest) {
  return isCookieAdminConfigured() && hasCookieAdminAccess(request.cookies.get(COOKIE_ADMIN_SESSION_NAME)?.value);
}

export async function GET(request: NextRequest) {
  if (!authorize(request)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const data = await getCookieConsentData();
  return NextResponse.json({ ok: true, ...data }, { headers: { "Cache-Control": "no-store" } });
}

export async function PUT(request: NextRequest) {
  if (!authorize(request)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  try {
    const payload = (await request.json().catch(() => null)) as { config?: CookieConsentConfig } | null;
    if (!payload?.config) {
      return NextResponse.json({ ok: false, code: "INVALID_CONFIG" }, { status: 400 });
    }

    const data = await updateCookieConsentConfig(normalizeCookieConsentConfig(payload.config));
    return NextResponse.json({ ok: true, ...data });
  } catch (error) {
    console.error("Cookie consent settings update failed", {
      code: "CONSENT_SETTINGS_FAILED",
      reason: cookieConsentErrorReason(error),
    });
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
