import { NextRequest, NextResponse } from "next/server";
import { type AdminRole, type AdminSession, ADMIN_SESSION_COOKIE, verifySessionValue } from "@/lib/adminAuth";
import { clientIp } from "@/lib/requestSecurity";

export function requestIp(request: NextRequest) {
  return clientIp(request);
}

/**
 * Verifies the admin session cookie and role. Returns the session, or a
 * ready-to-return 401/403 response.
 */
export function requireSession(
  request: NextRequest,
  roles: AdminRole[] = ["admin", "seo"],
): { session: AdminSession; error?: undefined } | { session?: undefined; error: NextResponse } {
  const session = verifySessionValue(request.cookies.get(ADMIN_SESSION_COOKIE)?.value);

  if (!session) {
    return { error: NextResponse.json({ ok: false, message: "Not signed in." }, { status: 401 }) };
  }

  if (!roles.includes(session.role)) {
    return { error: NextResponse.json({ ok: false, message: "Insufficient permissions." }, { status: 403 }) };
  }

  return { session };
}
