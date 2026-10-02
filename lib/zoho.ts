import { createHash } from "crypto";
import { request as httpsRequest } from "https";

export type WebsiteLead = {
  name: string;
  company?: string;
  email: string;
  phone?: string;
  service?: string;
  projectLocation?: string;
  message: string;
  pageUrl?: string;
  userAgent?: string;
  consent: boolean;
};

type ZohoAccessToken = {
  token: string;
  apiDomain: string;
  expiresAt: number;
};

type ZohoTokenResponse = {
  access_token?: string;
  api_domain?: string;
  expires_in?: number;
  error?: string;
  error_description?: string;
};

type ZohoRecordResponse = {
  data?: Array<{
    code?: string;
    status?: string;
    message?: string;
    details?: {
      id?: string;
    };
  }>;
};

type HttpRequestInit = {
  method?: string;
  headers?: Record<string, string>;
  body?: string | URLSearchParams;
};

type HttpResponse = {
  status: number;
  ok: boolean;
  body: string;
};

export class ZohoConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ZohoConfigError";
  }
}

export class ZohoApiError extends Error {
  status?: number;
  code?: string;

  constructor(message: string, status?: number, code?: string) {
    super(message);
    this.name = "ZohoApiError";
    this.status = status;
    this.code = code;
  }
}

let cachedAccessToken: ZohoAccessToken | null = null;

const DEFAULT_ACCOUNTS_URL = "https://accounts.zoho.com";
const DEFAULT_API_DOMAIN = "https://www.zohoapis.com";
const DEFAULT_CRM_MODULE = "Leads";
const DEFAULT_LEAD_SOURCE = "Website Contact Form";

function requiredEnv(name: string) {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new ZohoConfigError(`Missing required environment variable: ${name}`);
  }

  return value;
}

function optionalEnv(name: string, fallback: string) {
  return process.env[name]?.trim() || fallback;
}

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, "");
}

function sanitizeText(value: string | undefined, maxLength: number) {
  return (value || "").trim().replace(/\s+/g, " ").slice(0, maxLength);
}

function splitName(fullName: string) {
  const parts = sanitizeText(fullName, 120).split(" ").filter(Boolean);
  const firstName = parts.length > 1 ? parts.slice(0, -1).join(" ") : "";
  const lastName = parts.at(-1) || "Website Enquiry";

  return { firstName, lastName };
}

function leadDescription(lead: WebsiteLead) {
  return [
    lead.service ? `Service required: ${sanitizeText(lead.service, 120)}` : "",
    lead.projectLocation ? `Project location: ${sanitizeText(lead.projectLocation, 180)}` : "",
    `Project details: ${lead.message.trim().slice(0, 3000)}`,
    lead.pageUrl ? `Submitted from: ${sanitizeText(lead.pageUrl, 300)}` : "",
    lead.userAgent ? `Browser: ${sanitizeText(lead.userAgent, 300)}` : "",
    lead.consent ? "Consent: Customer agreed to submit this enquiry to Emitronix." : "",
  ]
    .filter(Boolean)
    .join("\n\n");
}

function wait(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function httpsRequestOnce(url: string, init: HttpRequestInit) {
  const parsedUrl = new URL(url);
  const requestBody = init.body instanceof URLSearchParams ? init.body.toString() : init.body;

  return new Promise<HttpResponse>((resolve, reject) => {
    const headers = { ...(init.headers || {}) };

    if (requestBody) {
      headers["Content-Length"] = Buffer.byteLength(requestBody).toString();
    }

    const request = httpsRequest(
      parsedUrl,
      {
        method: init.method || "GET",
        headers,
      },
      (response) => {
        const chunks: Buffer[] = [];

        response.on("data", (chunk: Buffer) => {
          chunks.push(chunk);
        });

        response.on("end", () => {
          const status = response.statusCode || 0;

          resolve({
            status,
            ok: status >= 200 && status < 300,
            body: Buffer.concat(chunks).toString("utf8"),
          });
        });
      },
    );

    request.on("error", reject);
    request.setTimeout(12_000, () => {
      request.destroy(new Error("Zoho request timed out"));
    });

    if (requestBody) {
      request.write(requestBody);
    }

    request.end();
  });
}

async function requestWithRetry(url: string, init: HttpRequestInit, retries = 2) {
  let lastResponse: HttpResponse | null = null;
  let lastError: unknown = null;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      const response = await httpsRequestOnce(url, init);
      lastResponse = response;

      if (response.status !== 429 && response.status < 500) {
        return response;
      }
    } catch (error) {
      lastError = error;
    }

    if (attempt < retries) {
      await wait(400 * (attempt + 1));
    }
  }

  if (lastResponse) {
    return lastResponse;
  }

  throw new ZohoApiError(lastError instanceof Error ? lastError.message : "Zoho request failed before receiving a response");
}

async function readJson<T>(response: HttpResponse) {
  try {
    return JSON.parse(response.body || "{}") as T;
  } catch {
    return {} as T;
  }
}

async function getZohoAccessToken() {
  const now = Date.now();

  if (cachedAccessToken && cachedAccessToken.expiresAt > now + 120_000) {
    return cachedAccessToken;
  }

  const body = new URLSearchParams({
    grant_type: "refresh_token",
    client_id: requiredEnv("ZOHO_CLIENT_ID"),
    client_secret: requiredEnv("ZOHO_CLIENT_SECRET"),
    refresh_token: requiredEnv("ZOHO_REFRESH_TOKEN"),
  });

  const accountsUrl = trimTrailingSlash(optionalEnv("ZOHO_ACCOUNTS_URL", DEFAULT_ACCOUNTS_URL));
  const response = await requestWithRetry(`${accountsUrl}/oauth/v2/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  if (!response) {
    throw new ZohoApiError("Zoho token request did not return a response");
  }

  const json = await readJson<ZohoTokenResponse>(response);

  if (!response.ok || !json.access_token) {
    throw new ZohoApiError(
      json.error_description || json.error || "Unable to refresh Zoho access token",
      response.status,
      json.error,
    );
  }

  const expiresIn = typeof json.expires_in === "number" ? json.expires_in : 3600;

  cachedAccessToken = {
    token: json.access_token,
    apiDomain: trimTrailingSlash(json.api_domain || optionalEnv("ZOHO_API_DOMAIN", DEFAULT_API_DOMAIN)),
    expiresAt: now + Math.max(expiresIn - 120, 300) * 1000,
  };

  return cachedAccessToken;
}

export function leadFingerprint(lead: Pick<WebsiteLead, "email" | "phone" | "message" | "service" | "projectLocation">) {
  return createHash("sha256")
    .update(JSON.stringify([lead.email.toLowerCase(), lead.phone || "", lead.message.slice(0, 3000), lead.service || "", lead.projectLocation || ""]))
    .digest("hex");
}

export async function createZohoLead(lead: WebsiteLead) {
  const accessToken = await getZohoAccessToken();
  const crmModule = optionalEnv("ZOHO_CRM_MODULE", DEFAULT_CRM_MODULE);
  const leadSource = optionalEnv("ZOHO_LEAD_SOURCE", DEFAULT_LEAD_SOURCE);
  const { firstName, lastName } = splitName(lead.name);
  const phone = sanitizeText(lead.phone, 30);

  const record: Record<string, string> = {
    Last_Name: lastName,
    Company: sanitizeText(lead.company, 180) || "Website Enquiry - Emitronix",
    Email: sanitizeText(lead.email, 180),
    Lead_Source: leadSource,
    Description: leadDescription(lead),
  };

  if (firstName) {
    record.First_Name = firstName;
  }

  if (phone) {
    record.Phone = phone;
    record.Mobile = phone;
  }

  const response = await requestWithRetry(`${accessToken.apiDomain}/crm/v8/${crmModule}`, {
    method: "POST",
    headers: {
      Authorization: `Zoho-oauthtoken ${accessToken.token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      data: [record],
    }),
  });

  if (!response) {
    throw new ZohoApiError("Zoho lead request did not return a response");
  }

  const json = await readJson<ZohoRecordResponse>(response);
  const result = json.data?.[0];

  if (result?.status === "success") {
    return {
      id: result.details?.id,
      duplicate: false,
    };
  }

  if (result?.code === "DUPLICATE_DATA") {
    return {
      id: result.details?.id,
      duplicate: true,
    };
  }

  throw new ZohoApiError(result?.message || "Zoho CRM rejected the lead", response.status, result?.code);
}
