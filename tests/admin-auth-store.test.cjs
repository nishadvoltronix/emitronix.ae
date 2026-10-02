const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");
const ts = require("typescript");
const { NextRequest } = require("next/server");

const root = path.resolve(__dirname, "..");
const fixturePrefix = "emitronix-admin-integrity-test-";
const storageMessage = "Admin users storage is unavailable.";
const storageLogMessage = "Admin user storage unavailable";
const unavailableMessage = "Admin sign-in is temporarily unavailable.";
const syntheticPassword = "synthetic-admin-password-only";
const syntheticSecret = "synthetic-session-secret-for-isolated-tests-only";
const legacySalt = "legacy-test-salt";
const legacyHash = `${legacySalt}:${crypto.scryptSync(syntheticPassword, legacySalt, 64).toString("hex")}`;
const existingUser = {
  id: "existing-synthetic-id",
  email: "existing@example.invalid",
  name: "Synthetic Existing User",
  role: "seo",
  passwordHash: legacyHash,
  createdAt: "2026-01-02T03:04:05.000Z",
};
const seedEnv = {
  ADMIN_EMAIL: "  BOOTSTRAP@example.invalid  ",
  ADMIN_PASSWORD: "synthetic-bootstrap-password-only",
};

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

// Execute the real auth, guard and route source. Storage operations remain
// native except explicitly injected failures/races, and every path is confined
// to an owned TEMP fixture. Only unrelated activity-log persistence is stubbed.
async function loadModules(fixture, { env = {}, intercept = async () => {} } = {}) {
  const usersPath = path.join(fixture, "admin-users.json");
  const calls = [];
  const logs = [];
  const activities = [];
  const guardedFs = {};
  for (const method of ["mkdir", "chmod", "readFile", "writeFile"]) {
    guardedFs[method] = async (...args) => {
      const target = path.resolve(String(args[0]));
      assert.ok(target === fixture || target.startsWith(fixture + path.sep), "auth storage remains inside owned fixture");
      calls.push({ method, target, args: args.slice(1) });
      await intercept(method, ...args);
      return fs[method](...args);
    };
  }
  const cache = new Map();
  async function load(relative) {
    if (cache.has(relative)) return cache.get(relative);
    const source = await fs.readFile(path.join(root, relative), "utf8");
    const output = ts.transpileModule(source, {
      compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, esModuleInterop: true },
    }).outputText;
    const aliases = {};
    for (const match of source.matchAll(/from\s+["'](@\/[^"']+)["']/g)) {
      aliases[match[1]] = match[1] === "@/lib/adminStore"
        ? { logActivity: async entry => { activities.push(entry); } }
        : await load(match[1].slice(2) + ".ts");
    }
    const module = { exports: {} };
    new Function("require", "module", "exports", "process", "console", output)(
      name => name === "fs/promises" ? guardedFs : aliases[name] || require(name),
      module,
      module.exports,
      {
        env: { ADMIN_USERS_PATH: usersPath, ADMIN_SESSION_SECRET: syntheticSecret, NODE_ENV: "production", EMITRONIX_TRUST_PROXY: "1", ...env },
        cwd: () => fixture,
        pid: process.pid,
        platform: process.platform,
      },
      Object.fromEntries(["error", "warn", "info", "log"].map(level => [level, (...args) => { logs.push({ level, args }); }])),
    );
    cache.set(relative, module.exports);
    return module.exports;
  }
  return {
    auth: await load("lib/adminAuth.ts"),
    guard: await load("lib/adminGuard.ts"),
    login: await load("app/api/admin/auth/login/route.ts"),
    me: await load("app/api/admin/auth/me/route.ts"),
    logout: await load("app/api/admin/auth/logout/route.ts"),
    usersPath,
    calls,
    logs,
    activities,
  };
}

function mutations(modules) {
  return modules.calls.filter(call => call.method !== "readFile");
}

async function assertStoreError(operation, modules, code) {
  await assert.rejects(operation, error => {
    assert.ok(error instanceof modules.auth.AdminUsersStoreError);
    assert.equal(error.code, code);
    assert.equal(error.message, storageMessage);
    assert.equal(error.cause, undefined, "raw storage/parse errors must not escape as a cause");
    return true;
  });
}

function loginRequest(payload = { email: existingUser.email, password: syntheticPassword }, { raw, headers = {}, ip = "198.51.100.40" } = {}) {
  return new NextRequest("https://qa.invalid/api/admin/auth/login", {
    method: "POST",
    headers: { "content-type": "application/json", "x-forwarded-for": ip, "x-emitronix-client-ip": ip, ...headers },
    body: raw === undefined ? JSON.stringify(payload) : raw,
  });
}

function sessionRequest(auth, value) {
  return new NextRequest("https://qa.invalid/api/admin/auth/me", {
    headers: value ? { cookie: `${auth.ADMIN_SESSION_COOKIE}=${value}` } : {},
  });
}

test("missing users file bootstraps once with exclusive creation and retains existing credential semantics", async t => {
  const fixture = await ownedFixture(t);
  const modules = await loadModules(fixture, { env: seedEnv });
  const users = await modules.auth.loadAdminUsers();
  assert.equal(users.length, 1);
  assert.equal(users[0].email, "bootstrap@example.invalid");
  assert.equal(users[0].name, "Administrator");
  assert.equal(users[0].role, "admin");
  assert.match(users[0].id, /^[a-f\d]{8}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{12}$/i);
  assert.ok(Number.isFinite(Date.parse(users[0].createdAt)));
  assert.ok(modules.auth.verifyPassword(seedEnv.ADMIN_PASSWORD, users[0].passwordHash));
  const bytes = await fs.readFile(modules.usersPath, "utf8");
  assert.deepEqual(JSON.parse(bytes), users);
  const writes = modules.calls.filter(call => call.method === "writeFile");
  assert.equal(writes.length, 1);
  assert.equal(writes[0].args[1].flag, "wx");
  assert.equal(writes[0].args[1].mode, 0o600);
  const mutationCount = mutations(modules).length;
  assert.deepEqual(await modules.auth.loadAdminUsers(), users);
  assert.equal(await fs.readFile(modules.usersPath, "utf8"), bytes);
  assert.equal(mutations(modules).length, mutationCount);
});

test("missing users file without complete bootstrap credentials stays missing and returns no users", async t => {
  for (const env of [{}, { ADMIN_EMAIL: seedEnv.ADMIN_EMAIL }, { ADMIN_PASSWORD: seedEnv.ADMIN_PASSWORD }]) {
    const fixture = await ownedFixture(t);
    const modules = await loadModules(fixture, { env });
    assert.deepEqual(await modules.auth.loadAdminUsers(), []);
    await assert.rejects(fs.readFile(modules.usersPath), { code: "ENOENT" });
    assert.deepEqual(mutations(modules), []);
  }
});

test("valid existing users and exact persisted bytes are preserved even when bootstrap credentials are configured", async t => {
  const fixture = await ownedFixture(t);
  const users = [existingUser, { ...existingUser, id: "synthetic-second-id", email: "second@example.invalid", role: "admin", retainedExtraField: "unchanged" }];
  const bytes = JSON.stringify(users, null, 4) + "\n";
  await fs.writeFile(path.join(fixture, "admin-users.json"), bytes);
  const modules = await loadModules(fixture, { env: seedEnv });
  assert.deepEqual(await modules.auth.loadAdminUsers(), users);
  assert.deepEqual(await modules.auth.loadAdminUsers(), users);
  assert.equal(await fs.readFile(modules.usersPath, "utf8"), bytes);
  assert.deepEqual(mutations(modules), []);
});

const invalidDataCases = [
  ["zero-byte file", ""],
  ["whitespace-only file", " \r\n\t "],
  ["malformed JSON", '{"synthetic-sensitive-marker":'],
  ["empty users array", "[]"],
  ["null root", "null"],
  ["object root", JSON.stringify({ users: [existingUser] })],
  ["primitive root", '"synthetic-invalid-value"'],
  ["null user", JSON.stringify([null])],
  ["array user", JSON.stringify([[]])],
  ["empty user object", "[{}]"],
  ["invalid role", JSON.stringify([{ ...existingUser, role: "owner" }])],
  ["non-string role", JSON.stringify([{ ...existingUser, role: 1 }])],
  ["empty salt", JSON.stringify([{ ...existingUser, passwordHash: `:${"a".repeat(128)}` }])],
  ["short password digest", JSON.stringify([{ ...existingUser, passwordHash: "salt:abc" }])],
  ["non-hex password digest", JSON.stringify([{ ...existingUser, passwordHash: `salt:${"z".repeat(128)}` }])],
  ["extra password-hash delimiter", JSON.stringify([{ ...existingUser, passwordHash: `salt:extra:${"a".repeat(128)}` }])],
  ["mixed valid and invalid users", JSON.stringify([existingUser, {}])],
  ...["id", "email", "name", "createdAt", "passwordHash"].map(field => [`missing ${field}`, JSON.stringify([{ ...existingUser, [field]: undefined }])]),
  ...["id", "email", "name", "createdAt", "passwordHash"].map(field => [`blank ${field}`, JSON.stringify([{ ...existingUser, [field]: "  " }])]),
  ...["id", "email", "name", "createdAt", "passwordHash"].map(field => [`non-string ${field}`, JSON.stringify([{ ...existingUser, [field]: 42 }])]),
];

for (const [label, bytes] of invalidDataCases) {
  test(`${label} fails closed and remains byte-for-byte intact with and without bootstrap credentials`, async t => {
    for (const env of [{}, seedEnv]) {
      const fixture = await ownedFixture(t);
      await fs.writeFile(path.join(fixture, "admin-users.json"), bytes);
      const modules = await loadModules(fixture, { env });
      for (let attempt = 0; attempt < 2; attempt++) {
        await assertStoreError(modules.auth.loadAdminUsers(), modules, "ADMIN_USERS_INVALID_DATA");
        assert.equal(await fs.readFile(modules.usersPath, "utf8"), bytes);
      }
      assert.deepEqual(mutations(modules), []);
    }
  });
}

for (const code of ["EACCES", "EPERM", "EIO"]) {
  test(`${code} reading an existing file does not bootstrap or expose the underlying error`, async t => {
    const fixture = await ownedFixture(t);
    const bytes = JSON.stringify([existingUser]) + "\n";
    await fs.writeFile(path.join(fixture, "admin-users.json"), bytes);
    const modules = await loadModules(fixture, {
      env: seedEnv,
      intercept: async method => {
        if (method === "readFile") throw Object.assign(new Error(`synthetic-sensitive-marker ${existingUser.email} ${legacyHash} ${syntheticSecret}`), { code });
      },
    });
    await assertStoreError(modules.auth.loadAdminUsers(), modules, "ADMIN_USERS_READ_FAILED");
    assert.equal(await fs.readFile(modules.usersPath, "utf8"), bytes);
    assert.deepEqual(mutations(modules), []);
    assert.deepEqual(modules.logs, []);
  });
}

test("an existing directory at the users path is rejected without changing it", async t => {
  const fixture = await ownedFixture(t);
  const usersPath = path.join(fixture, "admin-users.json");
  await fs.mkdir(usersPath);
  await fs.writeFile(path.join(usersPath, "preserved.txt"), "synthetic-directory-marker");
  const modules = await loadModules(fixture, { env: seedEnv });
  await assertStoreError(modules.auth.loadAdminUsers(), modules, "ADMIN_USERS_READ_FAILED");
  assert.equal(await fs.readFile(path.join(usersPath, "preserved.txt"), "utf8"), "synthetic-directory-marker");
  assert.deepEqual(mutations(modules), []);
});

test("exclusive bootstrap loses a creation race safely and returns the valid winning users unchanged", async t => {
  const fixture = await ownedFixture(t);
  const winner = JSON.stringify([{ ...existingUser, id: "race-winner-id" }], null, 3) + "\n";
  let injections = 0;
  const modules = await loadModules(fixture, {
    env: seedEnv,
    intercept: async (method, target) => {
      if (method === "writeFile") {
        injections++;
        await fs.writeFile(target, winner, { flag: "wx" });
      }
    },
  });
  assert.deepEqual(await modules.auth.loadAdminUsers(), JSON.parse(winner));
  assert.equal(await fs.readFile(modules.usersPath, "utf8"), winner);
  assert.equal(injections, 1);
  assert.equal(modules.calls.filter(call => call.method === "readFile").length, 2);
  assert.equal(modules.calls.filter(call => call.method === "writeFile").length, 1);
});

test("exclusive bootstrap cannot overwrite malformed data created after the missing-file read", async t => {
  const fixture = await ownedFixture(t);
  const winner = '{"synthetic-race-sensitive-marker":';
  const modules = await loadModules(fixture, {
    env: seedEnv,
    intercept: async (method, target) => {
      if (method === "writeFile") await fs.writeFile(target, winner, { flag: "wx" });
    },
  });
  await assertStoreError(modules.auth.loadAdminUsers(), modules, "ADMIN_USERS_INVALID_DATA");
  assert.equal(await fs.readFile(modules.usersPath, "utf8"), winner);
  assert.equal(modules.calls.filter(call => call.method === "readFile").length, 2);
  assert.equal(modules.calls.filter(call => call.method === "writeFile").length, 1);
});

test("a disappeared race winner is reported without attempting a second bootstrap", async t => {
  const fixture = await ownedFixture(t);
  const modules = await loadModules(fixture, {
    env: seedEnv,
    intercept: async method => {
      if (method === "writeFile") throw Object.assign(new Error("synthetic race winner disappeared"), { code: "EEXIST" });
    },
  });
  await assertStoreError(modules.auth.loadAdminUsers(), modules, "ADMIN_USERS_READ_FAILED");
  assert.equal(modules.calls.filter(call => call.method === "readFile").length, 2);
  assert.equal(modules.calls.filter(call => call.method === "writeFile").length, 1);
  await assert.rejects(fs.readFile(modules.usersPath), { code: "ENOENT" });
});

for (const operation of ["mkdir", "chmod", "writeFile"]) {
  test(`${operation} bootstrap failure is explicit and sanitized without creating users`, async t => {
    const fixture = await ownedFixture(t);
    const modules = await loadModules(fixture, {
      env: seedEnv,
      intercept: async method => {
        if (method === operation) throw Object.assign(new Error(`synthetic-sensitive-marker ${seedEnv.ADMIN_PASSWORD}`), { code: "EACCES" });
      },
    });
    await assertStoreError(modules.auth.loadAdminUsers(), modules, "ADMIN_USERS_INITIALIZATION_FAILED");
    await assert.rejects(fs.readFile(modules.usersPath), { code: "ENOENT" });
    assert.deepEqual(modules.logs, []);
  });
}

test("post-creation permission failure is explicit and leaves the newly created file intact for a later read", async t => {
  const fixture = await ownedFixture(t);
  let failure = true;
  const modules = await loadModules(fixture, {
    env: seedEnv,
    intercept: async (method, target) => {
      if (method === "chmod" && String(target).endsWith("admin-users.json") && failure) {
        failure = false;
        throw Object.assign(new Error("synthetic-sensitive-marker chmod"), { code: "EPERM" });
      }
    },
  });
  await assertStoreError(modules.auth.loadAdminUsers(), modules, "ADMIN_USERS_INITIALIZATION_FAILED");
  const bytes = await fs.readFile(modules.usersPath, "utf8");
  assert.equal(JSON.parse(bytes)[0].email, "bootstrap@example.invalid");
  const count = mutations(modules).length;
  assert.deepEqual(await modules.auth.loadAdminUsers(), JSON.parse(bytes));
  assert.equal(await fs.readFile(modules.usersPath, "utf8"), bytes);
  assert.equal(mutations(modules).length, count);
});

test("legacy non-UUID IDs, non-normalized email/date values and arbitrary nonempty salts remain loadable", async t => {
  const fixture = await ownedFixture(t);
  const user = { ...existingUser, email: "Legacy-Email-Value", createdAt: "Legacy-Date-Value", passwordHash: legacyHash.toUpperCase().replace(legacySalt.toUpperCase(), legacySalt) };
  await fs.writeFile(path.join(fixture, "admin-users.json"), JSON.stringify([user]));
  const modules = await loadModules(fixture);
  assert.deepEqual(await modules.auth.loadAdminUsers(), [user]);
  assert.ok(modules.auth.verifyPassword(syntheticPassword, user.passwordHash));
  assert.deepEqual(mutations(modules), []);
});

for (const failure of ["invalid", "read", "initialize"]) {
  test(`login reports ${failure} storage failure as sanitized 503 without a cookie or activity`, async t => {
    const fixture = await ownedFixture(t);
    const bytes = failure === "invalid" ? '{"synthetic-sensitive-marker":' : JSON.stringify([existingUser]);
    if (failure !== "initialize") await fs.writeFile(path.join(fixture, "admin-users.json"), bytes);
    const code = failure === "invalid" ? "ADMIN_USERS_INVALID_DATA" : failure === "read" ? "ADMIN_USERS_READ_FAILED" : "ADMIN_USERS_INITIALIZATION_FAILED";
    const modules = await loadModules(fixture, {
      env: seedEnv,
      intercept: async method => {
        if ((failure === "read" && method === "readFile") || (failure === "initialize" && method === "writeFile")) {
          throw Object.assign(new Error(`synthetic-sensitive-marker ${existingUser.email} ${legacyHash} ${seedEnv.ADMIN_PASSWORD}`), { code: "EACCES" });
        }
      },
    });
    const response = await modules.login.POST(loginRequest());
    assert.equal(response.status, 503);
    assert.deepEqual(await response.json(), { ok: false, message: unavailableMessage });
    assert.equal(response.headers.get("set-cookie"), null);
    assert.deepEqual(modules.activities, []);
    assert.deepEqual(modules.logs, [{ level: "error", args: [storageLogMessage, { code }] }]);
    const publicOutput = JSON.stringify(modules.logs);
    for (const marker of ["synthetic-sensitive-marker", existingUser.email, legacyHash, seedEnv.ADMIN_PASSWORD, syntheticSecret, modules.usersPath]) {
      assert.ok(!publicOutput.includes(marker), "logs contain only the fixed message and error code");
    }
    if (failure !== "initialize") assert.equal(await fs.readFile(modules.usersPath, "utf8"), bytes);
    else await assert.rejects(fs.readFile(modules.usersPath), { code: "ENOENT" });
  });
}

test("correct and incorrect passwords retain login responses, activity, cookie attributes and existing file bytes", async t => {
  for (const role of ["admin", "seo"]) {
    const fixture = await ownedFixture(t);
    const user = { ...existingUser, role };
    const bytes = JSON.stringify([user], null, 2) + "\n";
    await fs.writeFile(path.join(fixture, "admin-users.json"), bytes);
    const modules = await loadModules(fixture, { env: seedEnv });
    const response = await modules.login.POST(loginRequest({ email: `  ${user.email.toUpperCase()} `, password: syntheticPassword }));
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { ok: true, user: { email: user.email, name: user.name, role } });
    const cookie = response.cookies.get(modules.auth.ADMIN_SESSION_COOKIE);
    assert.ok(cookie?.value);
    const header = response.headers.get("set-cookie");
    assert.match(header, /HttpOnly/i);
    assert.match(header, /Secure/i);
    assert.match(header, /SameSite=lax/i);
    assert.match(header, /Path=\//i);
    assert.match(header, /Max-Age=28800/i);
    assert.equal(modules.auth.verifySessionValue(cookie.value).role, role);
    const wrong = await modules.login.POST(loginRequest({ email: user.email, password: "synthetic-wrong-password" }));
    assert.equal(wrong.status, 401);
    assert.deepEqual(await wrong.json(), { ok: false, message: "Invalid email or password." });
    assert.equal(wrong.headers.get("set-cookie"), null);
    assert.deepEqual(modules.activities.map(entry => entry.action), ["login", "login-failed"]);
    assert.equal(await fs.readFile(modules.usersPath, "utf8"), bytes);
    assert.deepEqual(mutations(modules), []);
    assert.deepEqual(modules.logs, []);
  }
});

test("password hashing, session TTL/signatures, guard permissions, me and logout retain existing behavior", async t => {
  const fixture = await ownedFixture(t);
  const modules = await loadModules(fixture);
  const firstHash = modules.auth.hashPassword(syntheticPassword);
  const secondHash = modules.auth.hashPassword(syntheticPassword);
  assert.notEqual(firstHash, secondHash);
  assert.ok(modules.auth.verifyPassword(syntheticPassword, firstHash));
  assert.equal(modules.auth.verifyPassword("synthetic-wrong-password", firstHash), false);
  assert.equal(modules.auth.verifyPassword(syntheticPassword, "malformed"), false);
  const before = Date.now();
  const value = modules.auth.createSessionValue(existingUser);
  const after = Date.now();
  const session = modules.auth.verifySessionValue(value);
  assert.equal(session.uid, existingUser.id);
  assert.equal(session.email, existingUser.email);
  assert.equal(session.role, existingUser.role);
  assert.ok(session.exp >= before + 8 * 60 * 60 * 1000 && session.exp <= after + 8 * 60 * 60 * 1000);
  assert.equal(modules.auth.verifySessionValue(value + "tampered"), null);
  const [payload, signature] = value.split(".");
  assert.equal(modules.auth.verifySessionValue(`${payload}A.${signature}`), null);
  const expiredPayload = Buffer.from(JSON.stringify({ ...session, exp: Date.now() - 1 })).toString("base64url");
  const expiredSignature = crypto.createHmac("sha256", syntheticSecret).update(expiredPayload).digest("base64url");
  assert.equal(modules.auth.verifySessionValue(`${expiredPayload}.${expiredSignature}`), null);
  assert.equal(modules.auth.verifySessionValue(null), null);
  assert.equal(modules.guard.requireSession(sessionRequest(modules.auth)).error.status, 401);
  assert.equal(modules.guard.requireSession(sessionRequest(modules.auth, value), ["admin"]).error.status, 403);
  assert.deepEqual(modules.guard.requireSession(sessionRequest(modules.auth, value)).session, session);
  assert.ok(modules.auth.hasRole(session));
  assert.equal(modules.auth.hasRole(session, ["admin"]), false);
  assert.deepEqual(modules.auth.sessionFromCookies({ get: name => name === modules.auth.ADMIN_SESSION_COOKIE ? { value } : undefined }), session);
  const me = await modules.me.GET(sessionRequest(modules.auth, value));
  assert.equal(me.status, 200);
  assert.deepEqual(await me.json(), { ok: true, user: { email: session.email, role: session.role } });
  const logout = await modules.logout.POST(sessionRequest(modules.auth, value));
  assert.equal(logout.status, 200);
  assert.deepEqual(await logout.json(), { ok: true });
  assert.match(logout.headers.get("set-cookie"), /Max-Age=0/);
  assert.deepEqual(modules.activities.map(entry => entry.action), ["logout"]);
  assert.deepEqual(modules.calls, []);
});

test("configuration, JSON/body limits and rate limit still reject before unauthorized storage use", async t => {
  const fixture = await ownedFixture(t);
  const unconfigured = await loadModules(fixture, { env: { ADMIN_SESSION_SECRET: "" } });
  assert.equal((await unconfigured.login.POST(loginRequest())).status, 503);
  assert.deepEqual(unconfigured.calls, []);
  const bytes = JSON.stringify([existingUser]);
  await fs.writeFile(path.join(fixture, "admin-users.json"), bytes);
  const modules = await loadModules(fixture);
  const badRequests = [
    [loginRequest({}, { headers: { "content-type": "text/plain" } }), 400],
    [loginRequest({}, { raw: "{invalid request" }), 400],
    [loginRequest([]), 400],
    [loginRequest(null), 400],
    [loginRequest({}, { raw: "x".repeat(2049) }), 413],
  ];
  for (const [request, status] of badRequests) assert.equal((await modules.login.POST(request)).status, status);
  assert.deepEqual(modules.calls, []);
  assert.deepEqual(modules.activities, []);
  for (let attempt = 0; attempt < 8; attempt++) {
    assert.equal((await modules.login.POST(loginRequest({ email: existingUser.email, password: "wrong" }, { ip: "198.51.100.90" }))).status, 401);
  }
  const limited = await modules.login.POST(loginRequest(undefined, { ip: "198.51.100.90" }));
  assert.equal(limited.status, 429);
  assert.equal(modules.activities.length, 8);
  assert.equal(modules.calls.filter(call => call.method === "readFile").length, 8);
  assert.equal(await fs.readFile(modules.usersPath, "utf8"), bytes);
  assert.deepEqual(mutations(modules), []);
});
