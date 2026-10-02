import { createHash } from "crypto";
import path from "path";
import { NextRequest, NextResponse } from "next/server";
import { createZohoLead, type WebsiteLead } from "@/lib/zoho";
import { isValidPhone } from "@/lib/phoneValidation";
import { readBoundedRequestBody } from "@/lib/requestBody";
import { CareerStorageError, storeCareerApplication } from "@/lib/careerApplicationStore";
import { clientIp, createLocalRateLimiter } from "@/lib/requestSecurity";
import { isCvMimeCompatible } from "@/lib/cvUploadValidation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const RATE_LIMIT_MAX = 5;
const MAX_CV_BYTES = 8 * 1024 * 1024;
const MAX_REQUEST_BYTES = 9 * 1024 * 1024;
const ALLOWED_EXTENSIONS = [".pdf", ".doc", ".docx"];

const isRateLimited = createLocalRateLimiter({ limit: RATE_LIMIT_MAX, windowMs: RATE_LIMIT_WINDOW_MS });
const recentApplications = new Map<string, number>();
const pendingApplications = new Map<string, Promise<NextResponse>>();
const DUPLICATE_WINDOW_MS = 10 * 60 * 1000;

function text(value: FormDataEntryValue | null, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function badRequest(message: string) {
  return NextResponse.json({ ok: false, message }, { status: 400 });
}

function hasExpectedSignature(extension: string, bytes: Buffer) {
  if (extension === ".pdf") {
    return bytes.subarray(0, 5).toString("ascii") === "%PDF-";
  }

  if (extension === ".docx") {
    return bytes.length >= 4 && bytes[0] === 0x50 && bytes[1] === 0x4b && bytes[2] === 0x03 && bytes[3] === 0x04;
  }

  if (extension === ".doc") {
    const compoundFileHeader = [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1];
    return compoundFileHeader.every((byte, index) => bytes[index] === byte);
  }

  return false;
}

export async function POST(request: NextRequest) {
  const contentLengthHeader = request.headers.get("content-length");

  if (!contentLengthHeader || !/^[1-9]\d*$/.test(contentLengthHeader)) {
    return NextResponse.json(
      { ok: false, message: "A valid Content-Length header is required." },
      { status: 411 },
    );
  }

  const contentLength = Number(contentLengthHeader);

  if (!Number.isSafeInteger(contentLength)) {
    return NextResponse.json(
      { ok: false, message: "A valid Content-Length header is required." },
      { status: 411 },
    );
  }

  if (contentLength > MAX_REQUEST_BYTES) {
    return NextResponse.json(
      { ok: false, message: "The application is too large. Please upload a smaller CV." },
      { status: 413 },
    );
  }

  if (request.headers.get("sec-fetch-site") === "cross-site") {
    return NextResponse.json({ ok: false, message: "Cross-site submissions are not accepted." }, { status: 403 });
  }

  if (request.headers.get("content-type")?.split(";", 1)[0]?.trim().toLowerCase() !== "multipart/form-data") {
    return badRequest("Invalid application format.");
  }

  const ip = clientIp(request);

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { ok: false, message: "Too many applications. Please try again in a few minutes." },
      { status: 429 },
    );
  }

  let formData: FormData;

  try {
    const { body, tooLarge } = await readBoundedRequestBody(request, MAX_REQUEST_BYTES);
    if (tooLarge) {
      return NextResponse.json({ ok: false, message: "The application is too large. Please upload a smaller CV." }, { status: 413 });
    }
    formData = await new Request(request.url, { method: "POST", headers: request.headers, body: new Uint8Array(body) }).formData();
  } catch {
    return badRequest("Invalid application format.");
  }

  // Honeypot: silently accept bot submissions without processing.
  if (text(formData.get("website"), 120)) {
    return NextResponse.json({ ok: true });
  }

  const application = {
    fullName: text(formData.get("fullName"), 120),
    email: text(formData.get("email"), 180).toLowerCase(),
    mobile: text(formData.get("mobile"), 30),
    position: text(formData.get("position"), 120),
    experience: text(formData.get("experience"), 120),
    location: text(formData.get("location"), 180),
    expectedSalary: text(formData.get("expectedSalary"), 120),
    noticePeriod: text(formData.get("noticePeriod"), 120),
    message: text(formData.get("message"), 3000),
    language: text(formData.get("language"), 5) || "en",
    pageUrl: text(formData.get("pageUrl"), 300),
    consent: formData.get("consent") === "on",
  };

  if (!application.fullName) return badRequest("Please enter your full name.");
  if (!application.email || !isValidEmail(application.email)) return badRequest("Please enter a valid email address.");
  if (!application.mobile) return badRequest("Please enter your mobile number.");
  if (!isValidPhone(application.mobile)) return badRequest("Please enter a valid mobile number.");
  if (!application.position) return badRequest("Please select a position.");
  if (!application.experience) return badRequest("Please enter your experience.");
  if (!application.location) return badRequest("Please enter your current location.");
  if (!application.expectedSalary) return badRequest("Please enter your expected salary.");
  if (!application.noticePeriod) return badRequest("Please enter your notice period.");
  if (!application.message) return badRequest("Please add a short message or cover letter.");
  if (!application.consent) return badRequest("Please confirm consent before submitting your application.");

  const resume = formData.get("resume");

  if (!(resume instanceof File) || !resume.name) {
    return badRequest("Please upload your CV.");
  }

  const extension = path.extname(resume.name).toLowerCase();

  if (!ALLOWED_EXTENSIONS.includes(extension)) {
    return badRequest("Please upload your CV in PDF, DOC, or DOCX format.");
  }

  if (!isCvMimeCompatible(extension, resume.type)) {
    return badRequest("The CV file type does not match the selected PDF, DOC, or DOCX format.");
  }

  if (resume.size > MAX_CV_BYTES) {
    return badRequest("Please upload a CV smaller than 8 MB.");
  }

  const cvBuffer = Buffer.from(await resume.arrayBuffer());
  if (!hasExpectedSignature(extension, cvBuffer)) {
    return badRequest("The CV file content does not match the selected PDF, DOC, or DOCX format.");
  }

  for (const [key, expiresAt] of recentApplications) {
    if (expiresAt <= Date.now()) recentApplications.delete(key);
  }
  const fingerprint = createHash("sha256").update(JSON.stringify(application)).update(cvBuffer).digest("hex");
  if (recentApplications.has(fingerprint)) return NextResponse.json({ ok: true });
  const pending = pendingApplications.get(fingerprint);
  if (pending) return (await pending).clone();

  const submission = (async () => {

    let stored: Awaited<ReturnType<typeof storeCareerApplication>>;
    try {
      stored = await storeCareerApplication({
        fingerprint, extension, cvBuffer,
        record: {
          ...application,
          cvOriginalName: resume.name,
          ip,
          userAgent: request.headers.get("user-agent")?.slice(0, 300) || "",
        },
      });
    } catch (error) {
      console.error("Career application storage failed", error instanceof CareerStorageError
        ? { id: error.id, transactionRef: error.transactionRef, code: error.code, stage: error.stage, reason: error.reason, cleanup: error.cleanup, reconciliationRequired: error.reconciliationRequired }
        : { code: "CAREER_STORAGE_FAILED" });
      return NextResponse.json(
        { ok: false, message: "We could not submit the application right now. Please try again or email Emitronix directly." },
        { status: 500 },
      );
    }
    if (!stored.created) {
      recentApplications.set(fingerprint, Date.now() + DUPLICATE_WINDOW_MS);
      return NextResponse.json({ ok: true });
    }
    const { id, cvFile: cvFileName } = stored;

    // Push a CRM notification lead so the team is alerted through the existing
    // Zoho channel. Storage above is the source of truth; CRM failure is logged
    // but does not fail the request.
    const lead: WebsiteLead = {
      name: application.fullName,
      company: "",
      email: application.email,
      phone: application.mobile,
      service: `Career Application: ${application.position}`,
      projectLocation: application.location,
      message: [
        `Career application (${application.position})`,
        `Experience: ${application.experience}`,
        `Expected salary: ${application.expectedSalary}`,
        `Notice period: ${application.noticePeriod}`,
        `CV stored as: ${cvFileName}`,
        "",
        application.message,
      ].join("\n"),
      pageUrl: application.pageUrl,
      userAgent: request.headers.get("user-agent")?.slice(0, 300) || "",
      consent: true,
    };

    try {
      await createZohoLead(lead);
    } catch {
      console.error("Career application CRM sync failed", {
        id,
        code: "CRM_NOTIFICATION_FAILED",
      });
    }

    recentApplications.set(fingerprint, Date.now() + DUPLICATE_WINDOW_MS);
    return NextResponse.json({ ok: true });
  })();
  pendingApplications.set(fingerprint, submission);
  try {
    return await submission;
  } finally {
    if (pendingApplications.get(fingerprint) === submission) pendingApplications.delete(fingerprint);
  }
}
