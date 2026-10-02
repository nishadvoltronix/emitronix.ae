import { NextRequest, NextResponse } from "next/server";
import { createZohoLead, leadFingerprint, ZohoApiError, ZohoConfigError, type WebsiteLead } from "@/lib/zoho";
import { isValidPhone } from "@/lib/phoneValidation";
import { readBoundedRequestBody } from "@/lib/requestBody";
import { clientIp, createLocalRateLimiter } from "@/lib/requestSecurity";

export const runtime = "nodejs";

const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const RATE_LIMIT_MAX = 5;
const DUPLICATE_WINDOW_MS = 10 * 60 * 1000;
const MAX_BODY_BYTES = 16_000;

const isRateLimited = createLocalRateLimiter({ limit: RATE_LIMIT_MAX, windowMs: RATE_LIMIT_WINDOW_MS });
const recentSubmissions = new Map<string, number>();
const pendingSubmissions = new Map<string, ReturnType<typeof createZohoLead>>();

type ContactPayload = {
  name?: unknown;
  company?: unknown;
  email?: unknown;
  phone?: unknown;
  service?: unknown;
  projectLocation?: unknown;
  message?: unknown;
  pageUrl?: unknown;
  consent?: unknown;
  website?: unknown;
};

function text(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function cleanupRecentSubmissions() {
  const now = Date.now();

  for (const [key, expiresAt] of recentSubmissions.entries()) {
    if (expiresAt <= now) {
      recentSubmissions.delete(key);
    }
  }
}

function badRequest(message: string) {
  return NextResponse.json({ ok: false, message }, { status: 400 });
}

export async function POST(request: NextRequest) {
  const contentLength = Number(request.headers.get("content-length") || 0);

  if (contentLength > MAX_BODY_BYTES) {
    return NextResponse.json({ ok: false, message: "The enquiry is too large. Please shorten the message and try again." }, { status: 413 });
  }

  if (request.headers.get("content-type")?.split(";", 1)[0]?.trim().toLowerCase() !== "application/json") {
    return badRequest("Invalid enquiry format.");
  }

  if (request.headers.get("sec-fetch-site") === "cross-site") {
    return NextResponse.json({ ok: false, message: "Cross-site submissions are not accepted." }, { status: 403 });
  }

  const ip = clientIp(request);

  if (isRateLimited(ip)) {
    return NextResponse.json({ ok: false, message: "Too many enquiries. Please try again in a few minutes." }, { status: 429 });
  }

  let payload: ContactPayload;

  try {
    const { body, tooLarge } = await readBoundedRequestBody(request, MAX_BODY_BYTES);
    if (tooLarge) {
      return NextResponse.json(
        { ok: false, message: "The enquiry is too large. Please shorten the message and try again." },
        { status: 413 },
      );
    }

    const parsed = JSON.parse(body.toString("utf8")) as unknown;

    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return badRequest("Invalid enquiry format.");
    }

    payload = parsed as ContactPayload;
  } catch {
    return badRequest("Invalid enquiry format.");
  }

  if (text(payload.website, 120)) {
    return NextResponse.json({ ok: true });
  }

  const lead: WebsiteLead = {
    name: text(payload.name, 120),
    company: text(payload.company, 180),
    email: text(payload.email, 180).toLowerCase(),
    phone: text(payload.phone, 30),
    service: text(payload.service, 120),
    projectLocation: text(payload.projectLocation, 180),
    message: text(payload.message, 3000),
    pageUrl: text(payload.pageUrl, 300),
    userAgent: text(request.headers.get("user-agent"), 300),
    consent: payload.consent === true,
  };

  if (!lead.name) {
    return badRequest("Please enter your full name.");
  }

  if (!lead.email || !isValidEmail(lead.email)) {
    return badRequest("Please enter a valid email address.");
  }

  if (!lead.phone) {
    return badRequest("Please enter a mobile number.");
  }
  if (!isValidPhone(lead.phone)) {
    return badRequest("Please enter a valid mobile number.");
  }

  if (!lead.service) {
    return badRequest("Please select the service required.");
  }

  if (!lead.projectLocation) {
    return badRequest("Please enter the project location.");
  }

  if (!lead.message) {
    return badRequest("Please add your project details.");
  }

  if (!lead.consent) {
    return badRequest("Please confirm consent before submitting the enquiry.");
  }

  cleanupRecentSubmissions();

  const fingerprint = leadFingerprint(lead);

  if (recentSubmissions.has(fingerprint)) {
    return NextResponse.json({ ok: true });
  }

  const submission = pendingSubmissions.get(fingerprint) ?? createZohoLead(lead);
  pendingSubmissions.set(fingerprint, submission);

  try {
    const result = await submission;
    recentSubmissions.set(fingerprint, Date.now() + DUPLICATE_WINDOW_MS);

    console.info("Website enquiry synced to Zoho CRM", {
      fingerprint: fingerprint.slice(0, 12),
      zohoLeadId: result.id || null,
      duplicate: result.duplicate,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof ZohoConfigError) {
      console.error("Zoho CRM configuration error", {
        fingerprint: fingerprint.slice(0, 12),
        message: error.message,
      });

      return NextResponse.json(
        { ok: false, message: "The enquiry form is temporarily unavailable. Please call or WhatsApp Emitronix." },
        { status: 503 },
      );
    }

    if (error instanceof ZohoApiError) {
      console.error("Zoho CRM sync failed", {
        fingerprint: fingerprint.slice(0, 12),
        message: error.message,
        status: error.status || null,
        code: error.code || null,
      });

      return NextResponse.json(
        { ok: false, message: "We could not submit the enquiry right now. Please try again or contact Emitronix directly." },
        { status: 502 },
      );
    }

    console.error("Unexpected contact form error", {
      fingerprint: fingerprint.slice(0, 12),
    });

    return NextResponse.json(
      { ok: false, message: "We could not submit the enquiry right now. Please try again or contact Emitronix directly." },
      { status: 500 },
    );
  } finally {
    if (pendingSubmissions.get(fingerprint) === submission) pendingSubmissions.delete(fingerprint);
  }
}
