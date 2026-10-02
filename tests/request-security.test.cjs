const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs/promises");
const path = require("node:path");
const test = require("node:test");
const ts = require("typescript");
const { NextRequest } = require("next/server");

const root = path.resolve(__dirname, "..");
const origin = "https://emitronix.ae";
const routePaths = {
  contact: "app/api/contact/route.ts",
  careers: "app/api/careers/route.ts",
  consent: "app/api/cookie-consent/consent/route.ts",
  admin: "app/api/admin/auth/login/route.ts",
  cookieAdmin: "app/api/admin/cookie-consent/login/route.ts",
};
const routeLimits = { contact: 5, careers: 5, consent: 25, admin: 8, cookieAdmin: 5 };
const initialStatus = { contact: 200, careers: 200, consent: 200, admin: 401, cookieAdmin: 401 };
const syntheticPassword = "synthetic-cookie-admin-test-password";

// Exercise actual route parsing, validation, request identity and limiter logic.
// Provider, private persistence and regular-admin credential boundaries are
// stubbed; cookie-admin signing is real and the separate auth suite stays native.
// Unexpected filesystem or network access from evaluated source is forbidden.
async function loadModules({ trust, nodeEnv = "production", clock = { now: 1_800_000_000_000 } } = {}) {
  const cache = new Map();
  const logs = [];
  const providerCalls = [];
  const careerWrites = [];
  const consentEvents = [];
  const activities = [];
  class ZohoConfigError extends Error {}
  class ZohoApiError extends Error {}
  class CareerStorageError extends Error {}
  class AdminUsersStoreError extends Error {}
  const boundaries = {
    "@/lib/zoho": {
      ZohoConfigError, ZohoApiError,
      leadFingerprint: lead => crypto.createHash("sha256").update(JSON.stringify(lead)).digest("hex"),
      createZohoLead: async lead => { providerCalls.push(lead); return { id: "synthetic-provider-receipt", duplicate: false }; },
    },
    "@/lib/careerApplicationStore": {
      CareerStorageError,
      storeCareerApplication: async record => {
        careerWrites.push(record);
        return { id: `synthetic-${careerWrites.length}`, cvFile: `synthetic-${careerWrites.length}${record.extension}`, created: true };
      },
    },
    "@/lib/cookieConsentStore": {
      recordCookieConsentEvent: async input => { consentEvents.push(input); return { totalEvents: consentEvents.length }; },
      cookieConsentErrorReason: () => "UNKNOWN_ERROR",
    },
    "@/lib/adminAuth": {
      AdminUsersStoreError, ADMIN_SESSION_COOKIE: "synthetic_admin_session",
      isAdminConfigured: () => true,
      loadAdminUsers: async () => [{ email: "synthetic@example.invalid", passwordHash: "synthetic-hash", role: "admin" }],
      verifyPassword: () => false,
      createSessionValue: () => "synthetic-session",
      verifySessionValue: () => null,
    },
    "@/lib/adminStore": { logActivity: async event => { activities.push(event); } },
  };
  const effectiveDate = class extends Date {
    constructor(...args) { super(...(args.length ? args : [clock.now])); }
    static now() { return clock.now; }
  };
  async function load(relative) {
    if (cache.has(relative)) return cache.get(relative);
    const source = await fs.readFile(path.join(root, relative), "utf8");
    const output = ts.transpileModule(source, {
      compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, esModuleInterop: true },
    }).outputText;
    const aliases = {};
    for (const match of output.matchAll(/require\(["'](@\/[^"']+)["']\)/g)) {
      aliases[match[1]] = boundaries[match[1]] || await load(match[1].slice(2) + ".ts");
    }
    const module = { exports: {} };
    new Function("require", "module", "exports", "process", "console", "fetch", "Date", output)(
      name => {
        if (/^(?:node:)?fs(?:\/promises)?$/.test(name)) throw new Error("Private filesystem access is forbidden in request-security tests");
        return aliases[name] || require(name);
      },
      module, module.exports,
      { env: { NODE_ENV: nodeEnv, EMITRONIX_TRUST_PROXY: trust, COOKIE_ADMIN_TOKEN: syntheticPassword }, cwd: () => root, pid: process.pid, platform: process.platform },
      Object.fromEntries(["error", "warn", "info", "log"].map(level => [level, (...args) => logs.push({ level, args })])),
      async () => { throw new Error("Network access is forbidden in request-security tests"); },
      effectiveDate,
    );
    cache.set(relative, module.exports);
    return module.exports;
  }
  const routes = {};
  for (const [name, source] of Object.entries(routePaths)) routes[name] = await load(source);
  return {
    security: await load("lib/requestSecurity.ts"),
    mime: await load("lib/cvUploadValidation.ts"),
    guard: await load("lib/adminGuard.ts"),
    routes, clock, logs, providerCalls, careerWrites, consentEvents, activities,
  };
}

function jsonRequest(url, payload, headers = {}) {
  return new NextRequest(url, {
    method: "POST", body: JSON.stringify(payload),
    headers: { "content-type": "application/json", "sec-fetch-site": "same-origin", origin, ...headers },
  });
}

async function careerRequest({ name = "synthetic.pdf", mime = "application/pdf", bytes = Buffer.from("%PDF-1.7\nSYNTHETIC_PRIVATE_CV_CONTENT"), headers = {}, honeypot = false } = {}) {
  const form = new FormData();
  for (const [key, value] of Object.entries({
    fullName: "Synthetic Applicant", email: "synthetic-applicant@example.invalid", mobile: "+971 50 123 4567",
    position: "Synthetic engineer", experience: "Synthetic experience", location: "Synthetic location",
    expectedSalary: "Synthetic salary", noticePeriod: "Synthetic notice", message: "Synthetic private cover letter",
    language: "en", pageUrl: `${origin}/careers`, consent: "on", ...(honeypot ? { website: "synthetic-honeypot" } : {}),
  })) form.set(key, value);
  form.set("resume", new File([bytes], name, { type: mime }));
  const encoded = new Request(`${origin}/api/careers`, { method: "POST", body: form });
  const body = new Uint8Array(await encoded.arrayBuffer());
  const requestHeaders = new Headers(encoded.headers);
  requestHeaders.set("content-length", String(body.length));
  requestHeaders.set("sec-fetch-site", "same-origin");
  for (const [key, value] of Object.entries(headers)) requestHeaders.set(key, value);
  return new NextRequest(encoded.url, { method: "POST", body, headers: requestHeaders });
}

async function requestFor(route, headers = {}) {
  if (route === "careers") return careerRequest({ headers, honeypot: true });
  const endpoints = {
    contact: ["/api/contact", { website: "synthetic-honeypot" }],
    consent: ["/api/cookie-consent/consent", { action: "reject_non_essential", categories: {} }],
    admin: ["/api/admin/auth/login", { email: "synthetic@example.invalid", password: "synthetic-wrong-password" }],
    cookieAdmin: ["/api/admin/cookie-consent/login", { password: "synthetic-wrong-password" }],
  };
  const [endpoint, payload] = endpoints[route];
  return jsonRequest(`${origin}${endpoint}`, payload, headers);
}

test("proxy trust is disabled unless explicitly enabled and all general forwarding headers are ignored", async () => {
  for (const trust of [undefined, "", "0", "true", "yes"]) {
    const { security, guard } = await loadModules({ trust });
    const request = new NextRequest(`${origin}/api/contact`, { headers: {
      "x-forwarded-for": "198.51.100.1", "x-real-ip": "198.51.100.2", "x-emitronix-client-ip": "198.51.100.3",
    } });
    assert.equal(security.clientIp(request), "unknown");
    assert.equal(guard.requestIp(request), "unknown");
  }
  const { security } = await loadModules({ trust: "1" });
  assert.equal(security.clientIp({ headers: new Headers({ "x-forwarded-for": "198.51.100.1", "x-real-ip": "198.51.100.2" }) }), "unknown");
});

test("only a valid single dedicated proxy address is accepted, with canonical IPv6 and mapped IPv4 keys", async () => {
  const { security } = await loadModules({ trust: "1" });
  for (const [value, expected] of [
    ["198.51.100.10", "198.51.100.10"], [" 198.51.100.10 ", "198.51.100.10"],
    ["2001:0DB8:0:0:0:0:0:1", "2001:db8::1"], ["2001:db8::1", "2001:db8::1"],
    ["::ffff:198.51.100.10", "198.51.100.10"], ["::FFFF:c633:640a", "198.51.100.10"],
  ]) assert.equal(security.clientIp({ headers: new Headers({ "x-emitronix-client-ip": value }) }), expected, value);
  for (const value of ["", "unknown", "198.51.100.10, 198.51.100.11", "198.51.100.10:443", "[2001:db8::1]", "fe80::1%eth0", "198.51.100.999", "001.002.003.004", "private@example.invalid", "a".repeat(100)]) {
    assert.equal(security.clientIp({ headers: new Headers({ "x-emitronix-client-ip": value, "x-forwarded-for": "198.51.100.10" }) }), "unknown", value);
  }
  const duplicated = new Headers();
  duplicated.append("x-emitronix-client-ip", "198.51.100.10");
  duplicated.append("x-emitronix-client-ip", "198.51.100.11");
  assert.equal(security.clientIp({ headers: duplicated }), "unknown");
});

for (const route of Object.keys(routePaths)) {
  test(`${route} handler cannot bypass its default quota by rotating forwarding headers`, async () => {
    const modules = await loadModules();
    for (let i = 0; i < routeLimits[route] + 2; i++) {
      const response = await modules.routes[route].POST(await requestFor(route, {
        "x-forwarded-for": `198.51.100.${i + 1}`, "x-real-ip": `203.0.113.${i + 1}`, "x-emitronix-client-ip": `192.0.2.${i + 1}`,
      }));
      assert.equal(response.status, i < routeLimits[route] ? initialStatus[route] : 429);
    }
    assert.equal(modules.providerCalls.length, 0);
    assert.equal(modules.careerWrites.length, 0);
    assert.ok(modules.activities.every(activity => activity.ip === "unknown"));
  });

  test(`${route} handler isolates configured proxy identities and retains each exhausted quota`, async () => {
    const modules = await loadModules({ trust: "1" });
    const first = { "x-emitronix-client-ip": "198.51.100.10" };
    for (let i = 0; i < routeLimits[route]; i++) assert.equal((await modules.routes[route].POST(await requestFor(route, first))).status, initialStatus[route]);
    assert.equal((await modules.routes[route].POST(await requestFor(route, first))).status, 429);
    assert.equal((await modules.routes[route].POST(await requestFor(route, { "x-emitronix-client-ip": "198.51.100.11" }))).status, initialStatus[route]);
    assert.equal((await modules.routes[route].POST(await requestFor(route, { ...first, "x-forwarded-for": "203.0.113.90" }))).status, 429);
    modules.clock.now += 15 * 60 * 1000;
    assert.equal((await modules.routes[route].POST(await requestFor(route, first))).status, initialStatus[route]);
  });
}

test("bounded rate limiting denies new keys at capacity without evicting active or exhausted clients", async () => {
  const { security } = await loadModules();
  let now = 1000;
  const limited = security.createLocalRateLimiter({ limit: 2, windowMs: 100, maxKeys: 2, now: () => now });
  assert.equal(limited("a"), false);
  assert.equal(limited("a"), false);
  assert.equal(limited("a"), true);
  assert.equal(limited("b"), false);
  for (let i = 0; i < 100; i++) assert.equal(limited(`new-${i}`), true);
  assert.equal(limited("a"), true);
  assert.equal(limited("b"), false);
  assert.equal(limited("b"), true);
  now = 1100;
  assert.equal(limited("new-client"), false);
  assert.equal(limited("a"), false);
  assert.equal(limited("third-active-client"), true);
});

test("expiry frees only expired entries and a still-active client's counter remains intact", async () => {
  const { security } = await loadModules();
  let now = 0;
  const limited = security.createLocalRateLimiter({ limit: 1, windowMs: 100, maxKeys: 2, now: () => now });
  assert.equal(limited("old"), false);
  now = 50;
  assert.equal(limited("newer"), false);
  now = 100;
  assert.equal(limited("replacement"), false);
  assert.equal(limited("newer"), true);
  assert.equal(limited("third"), true);
});

test("two local limiter instances have independent quotas and do not imply distributed enforcement", async () => {
  const { security } = await loadModules();
  const first = security.createLocalRateLimiter({ limit: 1, windowMs: 1000 });
  const second = security.createLocalRateLimiter({ limit: 1, windowMs: 1000 });
  assert.equal(first("same-client"), false);
  assert.equal(first("same-client"), true);
  assert.equal(second("same-client"), false);
  assert.equal(second("same-client"), true);
});

test("cookie admin production origin ignores forged Host and forwarding headers even with proxy identity enabled", async () => {
  for (const trust of [undefined, "1"]) {
    const modules = await loadModules({ trust });
    const forged = jsonRequest(`${origin}/api/admin/cookie-consent/login`, { password: syntheticPassword }, {
      origin: "https://attacker.invalid", host: "attacker.invalid", "x-forwarded-host": "attacker.invalid", "x-forwarded-proto": "https",
    });
    assert.equal((await modules.routes.cookieAdmin.POST(forged)).status, 403);
    const correct = jsonRequest(`${origin}/api/admin/cookie-consent/login`, { password: syntheticPassword }, {
      host: "attacker.invalid", "x-forwarded-host": "attacker.invalid", "x-forwarded-proto": "http",
    });
    const response = await modules.routes.cookieAdmin.POST(correct);
    assert.equal(response.status, 200);
    assert.match(response.headers.get("set-cookie"), /HttpOnly/i);
    assert.match(response.headers.get("set-cookie"), /Secure/i);
  }
});

test("origin validation rejects missing, malformed, opaque and decorated origins and cross-site requests", async () => {
  const { security } = await loadModules();
  for (const supplied of [null, "null", "not-an-origin", "https://attacker.invalid", `${origin}/unexpected-path`, `${origin}?q=x`, `${origin}#fragment`, "https://user:password@emitronix.ae", `${origin}, ${origin}`]) {
    const headers = new Headers(supplied === null ? {} : { origin: supplied });
    assert.equal(security.isSameOriginRequest({ url: `${origin}/api`, headers }, origin), false, String(supplied));
  }
  assert.equal(security.isSameOriginRequest({ url: "http://127.0.0.1:8081/api", headers: new Headers({ origin }) }, origin), true);
  assert.equal(security.isSameOriginRequest({ url: `${origin}/api`, headers: new Headers({ origin, "sec-fetch-site": "cross-site" }) }, origin), false);
});

test("development origin uses the direct URL and never arbitrary forwarded or Host alternatives", async () => {
  const { security } = await loadModules({ nodeEnv: "development", trust: "1" });
  const url = "http://127.0.0.1:3000/api/admin/cookie-consent/login";
  assert.equal(security.isSameOriginRequest({ url, headers: new Headers({ origin: "http://127.0.0.1:3000" }) }, origin), true);
  assert.equal(security.isSameOriginRequest({ url, headers: new Headers({ origin, host: "emitronix.ae", "x-forwarded-host": "emitronix.ae", "x-forwarded-proto": "https" }) }, origin), false);
});

test("CV MIME compatibility retains normal document aliases and generic browser types", async () => {
  const { mime } = await loadModules();
  const accepted = {
    ".pdf": ["application/pdf", "application/x-pdf"],
    ".doc": ["application/msword", "application/vnd.ms-word", "application/doc", "application/x-ole-storage", "application/cdfv2"],
    ".docx": ["application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/zip", "application/x-zip-compressed"],
  };
  for (const [extension, aliases] of Object.entries(accepted)) {
    for (const value of [...aliases, "", "application/octet-stream", "binary/octet-stream"]) assert.equal(mime.isCvMimeCompatible(extension, value), true, `${extension}/${value}`);
    for (const value of ["text/html", "application/javascript", "image/png", "application/x-executable"]) assert.equal(mime.isCvMimeCompatible(extension, value), false);
  }
  assert.equal(mime.isCvMimeCompatible(".pdf", " APPLICATION/PDF "), true);
  assert.equal(mime.isCvMimeCompatible(".pdf", "application/msword"), false);
  for (const extension of [".exe", "__proto__", "constructor", "toString", ""]) assert.equal(mime.isCvMimeCompatible(extension, "application/octet-stream"), false);
});

test("valid PDF, DOC and DOCX MIME/signature combinations reach storage without changing upload bytes", async () => {
  for (const [name, mime, bytes] of [
    ["synthetic.pdf", "application/pdf", Buffer.from("%PDF-1.7\nSYNTHETIC_PRIVATE_CV_CONTENT")],
    ["synthetic.pdf", "application/octet-stream", Buffer.from("%PDF-1.7\nSYNTHETIC_PRIVATE_CV_CONTENT")],
    ["synthetic.doc", "application/msword", Buffer.from([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1])],
    ["synthetic.docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", Buffer.from([0x50, 0x4b, 0x03, 0x04, 1])],
    ["synthetic.docx", "application/zip", Buffer.from([0x50, 0x4b, 0x03, 0x04, 1])],
  ]) {
    const modules = await loadModules();
    assert.equal((await modules.routes.careers.POST(await careerRequest({ name, mime, bytes }))).status, 200);
    assert.equal(modules.careerWrites.length, 1);
    assert.equal(modules.providerCalls.length, 1);
    assert.deepEqual(modules.careerWrites[0].cvBuffer, bytes);
    assert.equal(modules.careerWrites[0].extension, path.extname(name));
  }
});

test("incompatible CV MIME or signature is rejected before persistence and provider delivery", async () => {
  for (const options of [
    { mime: "text/html" }, { mime: "application/javascript" }, { mime: "application/msword" },
    { mime: "application/pdf", bytes: Buffer.from("MZ_SYNTHETIC_EXECUTABLE") },
    { name: "synthetic.exe", mime: "application/octet-stream" },
  ]) {
    const modules = await loadModules();
    const response = await modules.routes.careers.POST(await careerRequest(options));
    assert.equal(response.status, 400);
    assert.equal(modules.careerWrites.length, 0);
    assert.equal(modules.providerCalls.length, 0);
    const exposed = JSON.stringify({ response: await response.json(), logs: modules.logs });
    assert.doesNotMatch(exposed, /SYNTHETIC_PRIVATE_CV_CONTENT|synthetic-applicant@example.invalid|Synthetic private cover letter/);
  }
});

test("multipart media type requires an exact token and preserves size-limit rejection", async () => {
  for (const type of ["multipart/form-dataevil; boundary=synthetic", "multipart/form-data-extra", "application/json"]) {
    const modules = await loadModules();
    const response = await modules.routes.careers.POST(await careerRequest({ headers: { "content-type": type } }));
    assert.equal(response.status, 400);
    assert.equal(modules.careerWrites.length, 0);
    assert.equal(modules.providerCalls.length, 0);
  }
  const modules = await loadModules();
  const response = await modules.routes.careers.POST(await careerRequest({ headers: { "content-length": String(9 * 1024 * 1024 + 1) } }));
  assert.equal(response.status, 413);
  assert.equal(modules.careerWrites.length, 0);
});
