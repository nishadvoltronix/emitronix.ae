const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");
const ts = require("typescript");
const { NextRequest } = require("next/server");

const root = path.resolve(__dirname, "..");
const fixturePrefix = "emitronix-careers-integrity-test-";
const privateMarker = "SYNTHETIC_PRIVATE_CV_CONTENT_NEVER_LOG";
const cvBytes = Buffer.from(`%PDF-1.7\n${privateMarker}\n`);
const application = {
  fullName: "Synthetic Private Applicant",
  email: "synthetic-private@example.invalid",
  mobile: "+971 50 123 4567",
  position: "Synthetic engineer",
  experience: "Synthetic experience",
  location: "Synthetic location",
  expectedSalary: "Synthetic salary",
  noticePeriod: "Synthetic notice",
  message: "Synthetic private cover letter",
  language: "en",
  pageUrl: "https://fixture.invalid/careers",
  consent: true,
};
let requestIdentity = 0;

function contained(fixture, target) {
  const resolved = path.resolve(String(target));
  assert.ok(resolved === fixture || resolved.startsWith(fixture + path.sep), "every native storage path stays inside the owned TEMP fixture");
  return resolved;
}

async function ownedFixture(t) {
  const fixture = await fs.mkdtemp(path.join(os.tmpdir(), fixturePrefix));
  await fs.writeFile(path.join(fixture, "owned-test.json"), '{"syntheticOnly":true}', { flag: "wx" });
  t.after(async () => {
    const resolved = await fs.realpath(fixture);
    assert.equal(path.dirname(resolved).toLowerCase(), (await fs.realpath(os.tmpdir())).toLowerCase());
    assert.ok(path.basename(resolved).startsWith(fixturePrefix));
    assert.equal(JSON.parse(await fs.readFile(path.join(resolved, "owned-test.json"), "utf8")).syntheticOnly, true);
    await fs.rm(resolved, { recursive: true });
  });
  return fixture;
}

// Load the real TypeScript route/store/admin reader. Native filesystem calls,
// including FileHandle operations, are confined to an owned synthetic fixture.
// Failure injection wraps those calls; Zoho is the only integration stub.
async function loadModules(fixture, { before = async () => {}, after = async () => {}, providerFails = false, clock } = {}) {
  const careersDir = path.join(fixture, "careers");
  const calls = [];
  const logs = [];
  const providerCalls = [];
  const guardedFs = {};
  for (const method of ["mkdir", "chmod", "readFile", "writeFile", "open", "rename", "link", "unlink", "lstat", "stat", "readdir", "rm", "rmdir", "appendFile"]) {
    guardedFs[method] = async (...args) => {
      const target = contained(fixture, args[0]);
      if (method === "rename" || method === "link") contained(fixture, args[1]);
      const event = { method, target, args: args.slice(1) };
      calls.push({ method, target, destination: method === "rename" || method === "link" ? String(args[1]) : undefined });
      await before(event);
      let result = await fs[method](...args);
      if (method === "open") {
        const handle = result;
        result = new Proxy(handle, {
          get(value, key) {
            const item = value[key];
            if (typeof item !== "function") return item;
            return async (...handleArgs) => {
              const handleEvent = { method: `handle.${String(key)}`, target, args: handleArgs, handle };
              calls.push({ method: handleEvent.method, target });
              await before(handleEvent);
              const result = await item.apply(handle, handleArgs);
              await after({ ...handleEvent, result });
              return result;
            };
          },
        });
      }
      await after({ ...event, result });
      return result;
    };
  }
  const cache = new Map();
  const fakeZoho = {
    createZohoLead: async lead => {
      providerCalls.push(lead);
      if (providerFails) throw fault("ETIMEDOUT");
      return { id: "synthetic-provider-id" };
    },
  };
  const effectiveDate = clock ? class extends Date {
    constructor(...args) { super(...(args.length ? args : [clock.now])); }
    static now() { return clock.now; }
  } : Date;
  async function load(relative) {
    if (cache.has(relative)) return cache.get(relative);
    const source = await fs.readFile(path.join(root, relative), "utf8");
    const output = ts.transpileModule(source, {
      compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, esModuleInterop: true },
    }).outputText;
    const aliases = {};
    for (const match of source.matchAll(/from\s+["'](@\/[^"']+)["']/g)) {
      aliases[match[1]] = match[1] === "@/lib/zoho" ? fakeZoho : await load(match[1].slice(2) + ".ts");
    }
    const module = { exports: {} };
    new Function("require", "module", "exports", "process", "console", "fetch", "Date", output)(
      name => name === "fs/promises" || name === "node:fs/promises" ? guardedFs : name === "fs" || name === "node:fs" ? { promises: guardedFs } : aliases[name] || require(name),
      module,
      module.exports,
      { env: { NODE_ENV: "production", CAREERS_STORE_DIR: careersDir, EMITRONIX_TRUST_PROXY: "1" }, cwd: () => fixture, pid: process.pid, platform: process.platform },
      Object.fromEntries(["error", "warn", "info", "log"].map(level => [level, (...args) => logs.push({ level, args })])),
      async () => { throw new Error("Network access is forbidden in the careers fixture"); },
      effectiveDate,
    );
    cache.set(relative, module.exports);
    return module.exports;
  }
  return { route: await load("app/api/careers/route.ts"), store: await load("lib/careerApplicationStore.ts"), admin: await load("lib/adminStore.ts"), careersDir, calls, logs, providerCalls };
}

function fault(code = "EIO") {
  return Object.assign(new Error(`${privateMarker} ${application.email} ${application.message} C:\\synthetic-private\\cv.pdf`), { code });
}

async function request({ values = {}, bytes = cvBytes, name = "synthetic-private-cv.pdf", headers = {} } = {}) {
  const form = new FormData();
  for (const [key, value] of Object.entries({ ...application, ...values })) form.set(key, key === "consent" ? value ? "on" : "" : value);
  form.set("resume", new File([bytes], name, { type: "application/octet-stream" }));
  const raw = new Request("https://fixture.invalid/api/careers", { method: "POST", body: form });
  const body = new Uint8Array(await raw.arrayBuffer());
  const requestHeaders = new Headers(raw.headers);
  requestHeaders.set("content-length", String(body.length));
  requestHeaders.set("sec-fetch-site", "same-origin");
  requestHeaders.set("x-forwarded-for", `198.51.100.${++requestIdentity}`);
  requestHeaders.set("x-emitronix-client-ip", `198.51.100.${requestIdentity}`);
  requestHeaders.set("user-agent", "Synthetic private browser marker");
  for (const [key, value] of Object.entries(headers)) requestHeaders.set(key, value);
  return new NextRequest(raw.url, { method: "POST", body, headers: requestHeaders });
}

function storeInput({ bytes = cvBytes, extension = ".pdf", record = {}, values = {} } = {}) {
  const fields = { ...application, ...values };
  return {
    fingerprint: crypto.createHash("sha256").update(JSON.stringify(fields)).update(bytes).digest("hex"),
    extension,
    cvBuffer: bytes,
    record: { ...fields, cvOriginalName: `synthetic-private-cv${extension}`, submittedAt: new Date().toISOString(), ip: "198.51.100.100", userAgent: "Synthetic private browser marker", ...record },
  };
}

async function snapshot(directory, prefix = "") {
  let names;
  try { names = await fs.readdir(directory, { withFileTypes: true }); }
  catch (error) { if (error.code === "ENOENT") return {}; throw error; }
  const output = {};
  for (const entry of names) {
    const relative = path.posix.join(prefix, entry.name);
    if (entry.isDirectory()) Object.assign(output, await snapshot(path.join(directory, entry.name), relative));
    else output[relative] = (await fs.readFile(path.join(directory, entry.name))).toString("base64");
  }
  return output;
}

async function flatFiles(directory) {
  return Object.keys(await snapshot(directory)).filter(name => !name.includes("/")).sort();
}

async function assertPair(modules, expectedBytes = cvBytes) {
  const files = await flatFiles(modules.careersDir);
  const cvs = files.filter(name => /\.(pdf|doc|docx)$/.test(name));
  const metadata = files.filter(name => name.endsWith(".json"));
  assert.equal(cvs.length, 1);
  assert.equal(metadata.length, 1);
  assert.deepEqual(await fs.readFile(path.join(modules.careersDir, cvs[0])), expectedBytes);
  const record = JSON.parse(await fs.readFile(path.join(modules.careersDir, metadata[0]), "utf8"));
  assert.equal(record.cvFile, cvs[0]);
  assert.equal(record.email, application.email);
  assert.equal(metadata[0].slice(0, -5), cvs[0].replace(/\.(pdf|doc|docx)$/, ""));
  return { files, record, cvFile: cvs[0], metadata: metadata[0] };
}

function assertPrivateErrors(modules, responseText = "") {
  const output = JSON.stringify(modules.logs) + responseText;
  for (const marker of [privateMarker, application.fullName, application.email, application.mobile, application.message, "synthetic-private-cv", "Synthetic private browser marker", "198.51.100.", "synthetic-private\\cv.pdf"]) {
    assert.equal(output.includes(marker), false, `logs/errors exclude ${marker}`);
  }
  assert.equal(output.includes(modules.careersDir), false, "logs/errors exclude absolute storage path");
}

function isCv(target) { return /\.(pdf|doc|docx)$/.test(target); }
function isPublication(event) { return event.method === "link" && String(event.args[0]).endsWith(".json"); }

test("successful application preserves file and metadata, appears in admin listing, and calls the provider once", async t => {
  const modules = await loadModules(await ownedFixture(t));
  const response = await modules.route.POST(await request());
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { ok: true });
  const pair = await assertPair(modules);
  assert.equal(pair.record.cvOriginalName, "synthetic-private-cv.pdf");
  assert.equal(modules.providerCalls.length, 1);
  const listed = await modules.admin.listEnquiries();
  assert.equal(listed.length, 1);
  assert.equal(listed[0].kind, "career");
  assert.equal(listed[0].cvFile, pair.cvFile);
  assertPrivateErrors(modules);
});

test("metadata publication failure cleans the newly owned CV and does not notify the provider", async t => {
  let failures = 0;
  const modules = await loadModules(await ownedFixture(t), { before: async event => {
    if (isPublication(event)) { failures++; throw fault("ENOSPC"); }
  } });
  const response = await modules.route.POST(await request());
  assert.equal(response.status, 500);
  assert.equal(failures, 1);
  assert.deepEqual(await flatFiles(modules.careersDir), []);
  assert.equal(modules.providerCalls.length, 0);
  assertPrivateErrors(modules, await response.text());
});

test("retry after temporary metadata failure succeeds once and leaves only one accepted pair", async t => {
  let fail = true;
  const modules = await loadModules(await ownedFixture(t), { before: async event => {
    if (isPublication(event) && fail) { fail = false; throw fault("ENOSPC"); }
  } });
  assert.equal((await modules.route.POST(await request())).status, 500);
  assert.deepEqual(await flatFiles(modules.careersDir), []);
  assert.equal((await modules.route.POST(await request())).status, 200);
  await assertPair(modules);
  const committed = await snapshot(modules.careersDir);
  assert.equal((await modules.route.POST(await request())).status, 200);
  assert.deepEqual(await snapshot(modules.careersDir), committed);
  assert.equal(modules.providerCalls.length, 1);
  assertPrivateErrors(modules);
});

test("retry after failure remains safe after loading a new independent route instance", async t => {
  const fixture = await ownedFixture(t);
  const first = await loadModules(fixture, { before: async event => { if (isPublication(event)) throw fault("EIO"); } });
  assert.equal((await first.route.POST(await request())).status, 500);
  const second = await loadModules(fixture);
  assert.equal((await second.route.POST(await request())).status, 200);
  await assertPair(second);
  const committed = await snapshot(second.careersDir);
  const third = await loadModules(fixture);
  assert.equal((await third.route.POST(await request())).status, 200);
  assert.deepEqual(await snapshot(second.careersDir), committed);
  assert.equal(first.providerCalls.length + second.providerCalls.length + third.providerCalls.length, 1);
});

test("a partial CV write is cleaned before retry and never produces duplicate CVs", async t => {
  let failed = false;
  const modules = await loadModules(await ownedFixture(t), { before: async event => {
    if (event.method === "handle.writeFile" && isCv(event.target) && !failed) {
      failed = true;
      await event.handle.writeFile(Buffer.from(event.args[0]).subarray(0, 9));
      throw fault("ENOSPC");
    }
  } });
  assert.equal((await modules.route.POST(await request())).status, 500);
  assert.equal(failed, true);
  assert.deepEqual(await flatFiles(modules.careersDir), []);
  assert.equal((await modules.route.POST(await request())).status, 200);
  await assertPair(modules);
  assert.equal(modules.providerCalls.length, 1);
  assertPrivateErrors(modules);
});

test("a partial metadata staging write is cleaned and remains invisible to admin listing", async t => {
  let failed = false;
  const modules = await loadModules(await ownedFixture(t), { before: async event => {
    if (event.method === "handle.writeFile" && String(event.args[0]).includes('"cvFile"') && !failed) {
      failed = true;
      await event.handle.writeFile(String(event.args[0]).slice(0, 12));
      throw fault("ENOSPC");
    }
  } });
  assert.equal((await modules.route.POST(await request())).status, 500);
  assert.equal(failed, true);
  assert.deepEqual(await flatFiles(modules.careersDir), []);
  assert.deepEqual(await modules.admin.listEnquiries(), []);
  assert.equal((await modules.route.POST(await request())).status, 200);
  await assertPair(modules);
  assertPrivateErrors(modules);
});

test("a partial intent write is cleaned before any CV creation and a later retry succeeds", async t => {
  let failed = false;
  const modules = await loadModules(await ownedFixture(t), { before: async event => {
    if (event.method === "handle.writeFile" && event.target.endsWith(".intent.tmp") && !failed) {
      failed = true;
      await event.handle.writeFile(String(event.args[0]).slice(0, 7));
      throw fault("ENOSPC");
    }
  } });
  assert.equal((await modules.route.POST(await request())).status, 500);
  assert.equal(failed, true);
  assert.deepEqual(await snapshot(modules.careersDir), {});
  assert.equal(modules.calls.some(call => call.method === "open" && isCv(call.target)), false);
  assert.equal((await modules.route.POST(await request())).status, 200);
  await assertPair(modules);
  assertPrivateErrors(modules);
});

test("a CV close failure reports failure and cleans only the newly owned upload", async t => {
  let failed = false;
  const modules = await loadModules(await ownedFixture(t), { after: async event => {
    if (event.method === "handle.close" && isCv(event.target) && !failed) {
      failed = true;
      throw fault("EIO");
    }
  } });
  assert.equal((await modules.route.POST(await request())).status, 500);
  assert.equal(failed, true);
  assert.deepEqual(await flatFiles(modules.careersDir), []);
  assert.equal((await modules.route.POST(await request())).status, 200);
  await assertPair(modules);
  assertPrivateErrors(modules);
});

test("cleanup denial retains explicit transaction evidence and repeated retries fail closed without another CV", async t => {
  const fixture = await ownedFixture(t);
  const modules = await loadModules(fixture, { before: async event => {
    if (isPublication(event)) throw fault("ENOSPC");
    if (event.method === "unlink" && isCv(event.target)) throw fault("EACCES");
  } });
  const response = await modules.route.POST(await request());
  assert.equal(response.status, 500);
  assert.equal(modules.providerCalls.length, 0);
  const retained = await snapshot(modules.careersDir);
  assert.equal(Object.keys(retained).filter(isCv).length, 1);
  const manifests = Object.keys(retained).filter(name => name.startsWith(".transactions/") && name.endsWith(".json"));
  assert.equal(manifests.length, 1, "cleanup failure retains a durable opaque transaction manifest");
  const manifestText = Buffer.from(retained[manifests[0]], "base64").toString("utf8");
  assert.equal(manifestText.includes(application.email), false);
  assert.equal(manifestText.includes(privateMarker), false);
  assert.ok(modules.logs.length > 0);
  const retry = await modules.route.POST(await request());
  assert.equal(retry.status, 500);
  assert.deepEqual(await snapshot(modules.careersDir), retained);
  const fresh = await loadModules(fixture);
  assert.equal((await fresh.route.POST(await request())).status, 500);
  assert.deepEqual(await snapshot(modules.careersDir), retained);
  assert.equal(fresh.providerCalls.length, 0);
  assertPrivateErrors(modules, await response.text());
  assertPrivateErrors(fresh);
});

test("cleanup failure preserves the original metadata failure and only exposes bounded reconciliation details", async t => {
  const modules = await loadModules(await ownedFixture(t), { before: async event => {
    if (isPublication(event)) throw fault("ENOSPC");
    if (event.method === "unlink" && isCv(event.target)) throw fault("EACCES");
  } });
  await assert.rejects(modules.store.storeCareerApplication(storeInput()), error => {
    assert.ok(error instanceof modules.store.CareerStorageError);
    assert.equal(error.code, "CAREER_STORAGE_FAILED");
    assert.equal(error.stage, "publish");
    assert.equal(error.reason, "ENOSPC");
    assert.deepEqual(error.cleanup, [{ stage: "cleanup-cv", reason: "EACCES" }]);
    assert.equal(error.reconciliationRequired, true);
    assert.equal(error.message, "Career application storage is unavailable.");
    assert.equal(error.cause, undefined);
    assert.equal(JSON.stringify(error).includes(privateMarker), false);
    return true;
  });
  assertPrivateErrors(modules);
});

test("post-commit metadata-stage cleanup failure retains accepted data and duplicate reuse stays idempotent", async t => {
  const fixture = await ownedFixture(t);
  const modules = await loadModules(fixture, { before: async event => {
    if (event.method === "unlink" && event.target.endsWith(".metadata.tmp")) throw fault("EACCES");
  } });
  assert.equal((await modules.route.POST(await request())).status, 200);
  await assertPair(modules);
  assert.equal(modules.providerCalls.length, 1);
  const committed = await snapshot(modules.careersDir);
  assert.equal(Object.keys(committed).filter(name => name.endsWith(".metadata.tmp")).length, 1);
  assert.ok(modules.logs.some(log => log.args[0] === "Career application cleanup requires reconciliation"));
  const fresh = await loadModules(fixture);
  assert.equal((await fresh.route.POST(await request())).status, 200);
  assert.deepEqual(await snapshot(modules.careersDir), committed);
  assert.equal(fresh.providerCalls.length, 0);
  assertPrivateErrors(modules);
});

test("failed lock release never changes accepted records and leaves retry blocked without duplication", async t => {
  const fixture = await ownedFixture(t);
  const modules = await loadModules(fixture, { before: async event => {
    if (event.method === "unlink" && event.target.endsWith(".lock")) throw fault("EACCES");
  } });
  assert.equal((await modules.route.POST(await request())).status, 200);
  await assertPair(modules);
  const committed = await snapshot(modules.careersDir);
  assert.equal(Object.keys(committed).filter(name => name.endsWith(".lock")).length, 1);
  const fresh = await loadModules(fixture);
  assert.equal((await fresh.route.POST(await request())).status, 500);
  assert.deepEqual(await snapshot(modules.careersDir), committed);
  assert.equal(modules.providerCalls.length + fresh.providerCalls.length, 1);
  assertPrivateErrors(modules);
});

test("duplicate success with failed lock release logs the accepted ID and an opaque transaction reference", async t => {
  const fixture = await ownedFixture(t);
  const first = await loadModules(fixture);
  const accepted = await first.store.storeCareerApplication(storeInput());
  const committed = await snapshot(first.careersDir);
  const duplicate = await loadModules(fixture, { before: async event => {
    if (event.method === "unlink" && event.target.endsWith(".lock")) throw fault("EACCES");
  } });
  const result = await duplicate.store.storeCareerApplication(storeInput());
  assert.deepEqual(result, { ...accepted, created: false });
  const cleanupLog = duplicate.logs.find(log => log.args[0] === "Career application cleanup requires reconciliation");
  assert.ok(cleanupLog);
  assert.equal(cleanupLog.args[1].id, accepted.id);
  assert.equal(cleanupLog.args[1].committed, true);
  assert.match(cleanupLog.args[1].transactionRef, /^[a-f0-9]{24}$/);
  assert.equal(JSON.stringify(duplicate.logs).includes(storeInput().fingerprint), false);
  assert.deepEqual(cleanupLog.args[1].failures, [{ stage: "release", reason: "EACCES" }]);
  const final = await snapshot(first.careersDir);
  for (const [name, bytes] of Object.entries(committed)) assert.equal(final[name], bytes);
  assert.equal(duplicate.providerCalls.length, 0);
  assertPrivateErrors(duplicate);
});

test("uncertain metadata publication never rolls back a potentially accepted CV and retry reuses the pair", async t => {
  const fixture = await ownedFixture(t);
  const modules = await loadModules(fixture, { after: async event => { if (isPublication(event)) throw fault("EIO"); } });
  assert.equal((await modules.route.POST(await request())).status, 500);
  const pair = await assertPair(modules);
  const committed = await snapshot(modules.careersDir);
  assert.equal(modules.calls.some(call => call.method === "unlink" && call.target === path.join(modules.careersDir, pair.cvFile)), false);
  const fresh = await loadModules(fixture);
  assert.equal((await fresh.route.POST(await request())).status, 200);
  assert.deepEqual(await snapshot(modules.careersDir), committed);
  assertPrivateErrors(modules);
});

test("publication failure with an unreadable final target preserves the CV and blocks unsafe retry", async t => {
  const fixture = await ownedFixture(t);
  let finalTarget;
  const modules = await loadModules(fixture, { before: async event => {
    if (isPublication(event)) { finalTarget = String(event.args[0]); throw fault("EIO"); }
    if (event.method === "lstat" && event.target === finalTarget) throw fault("EACCES");
  } });
  assert.equal((await modules.route.POST(await request())).status, 500);
  const retained = await snapshot(modules.careersDir);
  assert.equal(Object.keys(retained).filter(isCv).length, 1);
  assert.equal(Object.keys(retained).filter(name => name.endsWith(".metadata.tmp")).length, 1);
  const fresh = await loadModules(fixture);
  assert.equal((await fresh.route.POST(await request())).status, 500);
  assert.deepEqual(await snapshot(modules.careersDir), retained);
  assert.equal(modules.providerCalls.length + fresh.providerCalls.length, 0);
  assertPrivateErrors(modules);
});

test("same-worker simultaneous duplicate requests create one CV and one metadata record", async t => {
  const modules = await loadModules(await ownedFixture(t));
  const requests = await Promise.all([request(), request(), request()]);
  const responses = await Promise.all(requests.map(item => modules.route.POST(item)));
  assert.deepEqual(responses.map(item => item.status), [200, 200, 200]);
  await assertPair(modules);
  assert.equal(modules.providerCalls.length, 1);
});

test("independent workers cannot allocate duplicate files while the matching upload is pending", async t => {
  const fixture = await ownedFixture(t);
  let reach;
  let release;
  const reached = new Promise(resolve => { reach = resolve; });
  const released = new Promise(resolve => { release = resolve; });
  const first = await loadModules(fixture, { before: async event => {
    if (event.method === "handle.writeFile" && isCv(event.target)) { reach(); await released; }
  } });
  const second = await loadModules(fixture);
  const firstPromise = first.route.POST(await request());
  await reached;
  const secondResponse = await second.route.POST(await request());
  release();
  const firstResponse = await firstPromise;
  assert.equal(firstResponse.status, 200);
  assert.equal(secondResponse.status, 500, "an active durable reservation fails closed for a competing writer");
  await assertPair(first);
  assert.equal((await second.route.POST(await request())).status, 200);
  await assertPair(second);
  assert.equal(first.providerCalls.length + second.providerCalls.length, 1);
});

test("unrelated valid existing CV and metadata stay byte-for-byte intact during failed cleanup and retry", async t => {
  const fixture = await ownedFixture(t);
  const directory = path.join(fixture, "careers");
  await fs.mkdir(directory);
  const legacyCv = Buffer.from("%PDF-1.7\nSYNTHETIC_EXISTING_VALID_CV\n");
  const legacyJson = '{"cvFile":"legacy-existing.pdf","submittedAt":"2025-01-01T00:00:00Z","email":"legacy@example.invalid"}\n';
  await fs.writeFile(path.join(directory, "legacy-existing.pdf"), legacyCv);
  await fs.writeFile(path.join(directory, "legacy-existing.json"), legacyJson);
  let fail = true;
  const modules = await loadModules(fixture, { before: async event => {
    if (isPublication(event) && fail) { fail = false; throw fault("ENOSPC"); }
  } });
  assert.equal((await modules.route.POST(await request())).status, 500);
  assert.deepEqual(await fs.readFile(path.join(directory, "legacy-existing.pdf")), legacyCv);
  assert.equal(await fs.readFile(path.join(directory, "legacy-existing.json"), "utf8"), legacyJson);
  assert.equal((await modules.route.POST(await request())).status, 200);
  assert.deepEqual(await fs.readFile(path.join(directory, "legacy-existing.pdf")), legacyCv);
  assert.equal(await fs.readFile(path.join(directory, "legacy-existing.json"), "utf8"), legacyJson);
  assert.equal((await modules.admin.listEnquiries()).length, 2);
  assert.equal(modules.calls.some(call => call.method === "unlink" && path.basename(call.target).startsWith("legacy-existing")), false);
});

test("an existing file at the generated CV path is never overwritten or deleted", async t => {
  let collidedPath;
  const collisionBytes = Buffer.from("%PDF-1.7\nSYNTHETIC_COLLISION_OWNER\n");
  const modules = await loadModules(await ownedFixture(t), { before: async event => {
    if (event.method === "open" && isCv(event.target) && !collidedPath) {
      collidedPath = event.target;
      await fs.writeFile(collidedPath, collisionBytes, { flag: "wx" });
    }
  } });
  assert.equal((await modules.route.POST(await request())).status, 500);
  assert.ok(collidedPath);
  assert.deepEqual(await fs.readFile(collidedPath), collisionBytes);
  assert.equal(modules.calls.some(call => call.method === "unlink" && call.target === collidedPath), false);
  assert.equal(modules.providerCalls.length, 0);
});

test("an existing metadata target is preserved when atomic publication loses a race", async t => {
  let collision;
  const original = '{"syntheticExistingOwner":true}\n';
  const modules = await loadModules(await ownedFixture(t), { before: async event => {
    if (isPublication(event) && !collision) {
      collision = String(event.args[0]);
      await fs.writeFile(collision, original, { flag: "wx" });
    }
  } });
  assert.equal((await modules.route.POST(await request())).status, 500);
  assert.equal(await fs.readFile(collision, "utf8"), original);
  assert.equal(modules.calls.some(call => call.method === "unlink" && call.target === collision), false);
  assert.equal(modules.providerCalls.length, 0);
});

test("provider failure leaves the accepted pair intact and does not expose provider error content", async t => {
  const modules = await loadModules(await ownedFixture(t), { providerFails: true });
  const response = await modules.route.POST(await request());
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { ok: true });
  await assertPair(modules);
  assert.equal(modules.providerCalls.length, 1);
  assert.ok(modules.logs.length > 0);
  assertPrivateErrors(modules);
});

test("unchanged validation rejects invalid CVs and missing consent before any storage mutation", async t => {
  for (const overrides of [{ bytes: Buffer.from("not a PDF") }, { name: "fixture.exe" }, { values: { consent: false } }, { values: { email: "invalid" } }]) {
    const modules = await loadModules(await ownedFixture(t));
    assert.equal((await modules.route.POST(await request(overrides))).status, 400);
    assert.deepEqual(await snapshot(modules.careersDir), {});
    assert.equal(modules.calls.length, 0);
    assert.equal(modules.providerCalls.length, 0);
  }
});

test("DOC and DOCX files keep their validated extension and original bytes", async t => {
  for (const [name, bytes] of [["fixture.doc", Buffer.from([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1])], ["fixture.docx", Buffer.from([0x50, 0x4b, 0x03, 0x04, 0x01])]]) {
    const modules = await loadModules(await ownedFixture(t));
    assert.equal((await modules.route.POST(await request({ name, bytes }))).status, 200);
    const pair = await assertPair(modules, bytes);
    assert.equal(path.extname(pair.cvFile), path.extname(name));
  }
});

test("store returns the existing pair without changing its metadata or notifying again", async t => {
  const fixture = await ownedFixture(t);
  const modules = await loadModules(fixture);
  const first = await modules.store.storeCareerApplication(storeInput());
  assert.equal(first.created, true);
  const committed = await snapshot(modules.careersDir);
  const fresh = await loadModules(fixture);
  const retry = await fresh.store.storeCareerApplication(storeInput({ record: { ip: "198.51.100.200", userAgent: "different synthetic browser", submittedAt: "2026-10-02T01:00:00.000Z" } }));
  assert.deepEqual(retry, { ...first, created: false });
  assert.deepEqual(await snapshot(modules.careersDir), committed);
});

for (const [label, bytes] of [["malformed", '{"version":'], ["empty", ""], ["invalid shape", '{"version":1,"id":"../../private","extension":".pdf"}']]) {
  test(`${label} transaction intent is preserved and fails closed without allocating a CV`, async t => {
    const fixture = await ownedFixture(t);
    const modules = await loadModules(fixture);
    const directory = path.join(modules.careersDir, ".transactions");
    await fs.mkdir(directory, { recursive: true });
    const input = storeInput();
    await fs.writeFile(path.join(directory, `${input.fingerprint}.json`), bytes, { flag: "wx" });
    const original = await snapshot(modules.careersDir);
    let reference;
    for (let attempt = 0; attempt < 2; attempt++) {
      await assert.rejects(modules.store.storeCareerApplication(input), error => {
        assert.equal(error.code, "CAREER_RECONCILIATION_REQUIRED");
        assert.equal(error.id, undefined);
        assert.match(error.transactionRef, /^[a-f0-9]{24}$/);
        if (reference) assert.equal(error.transactionRef, reference);
        reference = error.transactionRef;
        assert.equal(JSON.stringify(error).includes(input.fingerprint), false);
        assert.equal(JSON.stringify(error).includes(privateMarker), false);
        return true;
      });
    }
    assert.deepEqual(await snapshot(modules.careersDir), original);
    assert.deepEqual(await flatFiles(modules.careersDir), []);
    assertPrivateErrors(modules);
  });
}

test("an unreadable transaction intent fails closed without replacing or removing it", async t => {
  const fixture = await ownedFixture(t);
  const input = storeInput();
  const modules = await loadModules(fixture, { before: async event => {
    if (event.method === "readFile" && event.target === path.join(fixture, "careers", ".transactions", `${input.fingerprint}.json`)) throw fault("EACCES");
  } });
  const directory = path.join(modules.careersDir, ".transactions");
  await fs.mkdir(directory, { recursive: true });
  const intent = '{"version":1,"id":"preserve-unreadable-fixture","extension":".pdf"}';
  await fs.writeFile(path.join(directory, `${input.fingerprint}.json`), intent, { flag: "wx" });
  const original = await snapshot(modules.careersDir);
  await assert.rejects(modules.store.storeCareerApplication(input));
  assert.deepEqual(await snapshot(modules.careersDir), original);
  assertPrivateErrors(modules);
});

test("an abandoned transaction lock is never stolen and cannot create another CV", async t => {
  const modules = await loadModules(await ownedFixture(t));
  const input = storeInput();
  const directory = path.join(modules.careersDir, ".transactions");
  await fs.mkdir(directory, { recursive: true });
  await fs.writeFile(path.join(directory, `${input.fingerprint}.lock`), "synthetic-crash-owner", { flag: "wx" });
  const original = await snapshot(modules.careersDir);
  await assert.rejects(modules.store.storeCareerApplication(input));
  assert.deepEqual(await snapshot(modules.careersDir), original);
  assertPrivateErrors(modules);
});

test("a completed receipt outside the existing duplicate window permits a new pair while preserving the earlier one", async t => {
  const fixture = await ownedFixture(t);
  const clock = { now: Date.now() };
  const first = await loadModules(fixture, { clock });
  const accepted = await first.store.storeCareerApplication(storeInput());
  const original = await snapshot(first.careersDir);
  clock.now += 11 * 60 * 1000;
  const second = await loadModules(fixture, { clock });
  const next = await second.store.storeCareerApplication(storeInput());
  assert.equal(next.created, true);
  assert.notEqual(next.id, accepted.id);
  const final = await snapshot(first.careersDir);
  for (const name of Object.keys(original).filter(name => !name.includes("/"))) assert.equal(final[name], original[name]);
  const files = await flatFiles(first.careersDir);
  assert.equal(files.filter(isCv).length, 2);
  assert.equal(files.filter(name => name.endsWith(".json")).length, 2);
});

test("receipt verification rejects changed application fields without touching the accepted pair", async t => {
  const modules = await loadModules(await ownedFixture(t));
  const input = storeInput();
  await modules.store.storeCareerApplication(input);
  const committed = await snapshot(modules.careersDir);
  await assert.rejects(modules.store.storeCareerApplication({ ...input, record: { ...input.record, email: "different@example.invalid" } }), error => error.code === "CAREER_RECONCILIATION_REQUIRED");
  assert.deepEqual(await snapshot(modules.careersDir), committed);
});

test("receipt verification rejects changed CV bytes without replacing or deleting existing data", async t => {
  const modules = await loadModules(await ownedFixture(t));
  const input = storeInput();
  const accepted = await modules.store.storeCareerApplication(input);
  const changed = Buffer.from("%PDF-1.7\nSYNTHETIC_CHANGED_EXTERNAL_BYTES\n");
  await fs.writeFile(path.join(modules.careersDir, accepted.cvFile), changed);
  const original = await snapshot(modules.careersDir);
  await assert.rejects(modules.store.storeCareerApplication(input), error => error.code === "CAREER_RECONCILIATION_REQUIRED");
  assert.deepEqual(await snapshot(modules.careersDir), original);
});

test("invalid fingerprint or extension is rejected before any filesystem access", async t => {
  const modules = await loadModules(await ownedFixture(t));
  for (const input of [{ ...storeInput(), fingerprint: "../synthetic-private" }, { ...storeInput(), extension: ".exe" }]) {
    await assert.rejects(modules.store.storeCareerApplication(input), error => error.code === "CAREER_STORAGE_FAILED" && error.reason === "INVALID_INPUT");
  }
  assert.deepEqual(modules.calls, []);
});
