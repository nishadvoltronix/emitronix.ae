const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const path = require("node:path");
const os = require("node:os");
const { fork } = require("node:child_process");
const ts = require("typescript");
const { NextRequest } = require("next/server");

const root = path.resolve(__dirname, "..");
const actions = ["accept_all", "reject_non_essential", "customize", "save_preferences"];
const payloads = [
  { action: actions[0], categories: { analytics: true, marketing: true, functional: true, performance: true } },
  { action: actions[1], categories: {} },
  { action: actions[2], categories: { analytics: true, functional: true } },
  { action: actions[3], categories: { marketing: true, performance: true } },
];

// Execute the real TS store and API; only resolve project aliases and inject
// an isolated TEMP path. No store function or persistence operation is stubbed.
async function loadModules(fixture, intercept = async () => {}, platform = process.platform, options = {}) {
  const cache = new Map();
  const logs = [];
  const guardedFs = {};
  for (const method of ["mkdir", "chmod", "readFile", "writeFile", "open", "rename", "rm", "rmdir", "unlink", "lstat", "stat", "readdir", "readlink"]) {
    guardedFs[method] = async (...args) => {
      for (const target of method === "rename" ? args.slice(0, 2) : args.slice(0, 1)) {
        const resolved = path.resolve(String(target));
        const identityRead = ["readFile", "readlink"].includes(method)
          && (/^\/proc\/(?:sys\/kernel\/random\/boot_id|(?:\d+|self)\/(?:stat|ns\/pid))$/.test(String(target)) || String(target) === "/etc/machine-id");
        assert.ok(identityRead || resolved === fixture || resolved.startsWith(fixture + path.sep), "storage stays inside owned fixture; only fixed read-only OS identity paths are allowed");
      }
      await intercept(method, ...args);
      if (options.identityReads && Object.hasOwn(options.identityReads, `${method}:${args[0]}`)) return options.identityReads[`${method}:${args[0]}`];
      // Only the platform-specific permission branch uses this synthetic Linux
      // identity on a Windows test host; all persistence still uses native TEMP FS.
      if (options.linuxIdentity) {
        if (method === "readFile" && args[0] === "/proc/sys/kernel/random/boot_id") return "11111111-1111-4111-8111-111111111111";
        if (method === "readFile" && args[0] === "/etc/machine-id") return "1".repeat(32);
        if (method === "readlink" && args[0] === "/proc/self/ns/pid") return "pid:[1]";
        if (method === "readFile" && args[0] === `/proc/${process.pid}/stat`) return `${process.pid} (node) ${["S", ...Array(18).fill("0"), "123"].join(" ")}`;
      }
      return fs[method](...args);
    };
  }
  async function load(relative) {
    if (cache.has(relative)) return cache.get(relative);
    const source = await fs.readFile(path.join(root, relative), "utf8");
    const output = ts.transpileModule(source, {
      compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, esModuleInterop: true },
    }).outputText;
    const aliases = {};
    for (const match of source.matchAll(/from\s+["'](@\/[^"']+)["']/g)) {
      aliases[match[1]] = await load(match[1].slice(2) + ".ts");
    }
    const module = { exports: {} };
    new Function("require", "module", "exports", "process", "console", "performance", output)(
      name => ["fs", "node:fs"].includes(name) ? { promises: guardedFs }
        : ["fs/promises", "node:fs/promises"].includes(name) ? guardedFs
        : aliases[name] || require(name),
      module, module.exports,
      { env: { COOKIE_CONSENT_STORE_PATH: path.join(fixture, "consent.json"), COOKIE_ADMIN_TOKEN: "synthetic-consent-test-token", EMITRONIX_TRUST_PROXY: "1", SystemRoot: process.env.SystemRoot, WINDIR: process.env.WINDIR }, cwd: () => fixture, pid: process.pid, platform, kill: options.kill || process.kill.bind(process), uptime: process.uptime.bind(process) },
      { error: (...args) => logs.push(args) },
      options.performance || performance,
    );
    cache.set(relative, module.exports);
    return module.exports;
  }
  return {
    store: await load("lib/cookieConsentStore.ts"),
    api: await load("app/api/cookie-consent/consent/route.ts"),
    admin: await load("lib/cookieConsentAdmin.ts"),
    settingsApi: await load("app/api/admin/cookie-consent/settings/route.ts"),
    resetApi: await load("app/api/admin/cookie-consent/reset/route.ts"),
    lock: await load("lib/consentFileLock.ts"),
    logs,
  };
}

async function ownedFixture(t) {
  const fixture = await fs.mkdtemp(path.join(os.tmpdir(), "emitronix-consent-test-"));
  await fs.writeFile(path.join(fixture, "owned-test.json"), '{"syntheticOnly":true}');
  t.after(async () => {
    const resolved = await fs.realpath(fixture);
    assert.equal(path.dirname(resolved).toLowerCase(), (await fs.realpath(os.tmpdir())).toLowerCase());
    assert.ok(path.basename(resolved).startsWith("emitronix-consent-test-"));
    assert.equal(JSON.parse(await fs.readFile(path.join(resolved, "owned-test.json"), "utf8")).syntheticOnly, true);
    await fs.rm(resolved, { recursive: true });
  });
  return fixture;
}

function request(payload, identity) {
  return new NextRequest("https://qa.invalid/api/cookie-consent/consent", {
    method: "POST",
    body: JSON.stringify(payload),
    headers: { "content-type": "application/json", "sec-fetch-site": "same-origin", "x-forwarded-for": `198.51.100.${identity}`, "x-emitronix-client-ip": `198.51.100.${identity}` },
  });
}

function deferred() {
  let resolve;
  const promise = new Promise(done => { resolve = done; });
  return { promise, resolve };
}

async function assertOwnedFixture(fixture) {
  assert.equal(path.dirname(fixture).toLowerCase(), (await fs.realpath(os.tmpdir())).toLowerCase());
  assert.ok(path.basename(fixture).startsWith("emitronix-consent-test-"));
  assert.equal(JSON.parse(await fs.readFile(path.join(fixture, "owned-test.json"), "utf8")).syntheticOnly, true);
}

function startPausedWorker(t, fixture, phase) {
  const child = fork(__filename, ["--crash-worker", fixture, phase], { execArgv: [], stdio: ["ignore", "ignore", "pipe", "ipc"] });
  let stderr = "";
  child.stderr.on("data", bytes => { stderr += bytes; });
  const exited = new Promise((resolve, reject) => {
    child.once("error", reject);
    child.once("exit", (code, signal) => resolve({ code, signal, stderr }));
  });
  const paused = new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`Fixture worker did not pause at ${phase}: ${stderr}`)), 20_000);
    child.once("message", message => { clearTimeout(timer); resolve(message); });
    child.once("error", error => { clearTimeout(timer); reject(error); });
    child.once("exit", () => { clearTimeout(timer); reject(new Error(`Fixture worker exited before ${phase}: ${stderr}`)); });
  });
  t.after(async () => {
    if (child.exitCode === null && child.signalCode === null) child.kill("SIGKILL");
    await exited;
  });
  return { child, paused, exited };
}

if (process.argv[2] === "--crash-worker") {
  (async () => {
    const fixture = path.resolve(process.argv[3]);
    await assertOwnedFixture(fixture);
    const phase = process.argv[4];
    const consentPath = path.join(fixture, "consent.json");
    let paused = false;
    const { store } = await loadModules(fixture, async (method, ...args) => {
      const shouldPause = phase === "after-lock" && method === "readFile" && args[0] === consentPath
        || phase === "before-commit" && method === "rename" && args[1] === consentPath
        || phase === "after-commit" && method === "chmod" && args[0] === consentPath;
      if (shouldPause && !paused) {
        paused = true;
        process.send({ phase, pid: process.pid });
        await new Promise(resolve => process.once("message", resolve));
      }
    });
    await store.recordCookieConsentEvent(payloads[1]);
    process.disconnect();
  })().catch(error => { console.error(error); process.exitCode = 1; if (process.connected) process.disconnect(); });
} else if (process.argv[2] === "--worker") {
  (async () => {
    const fixture = path.resolve(process.argv[3]);
    await assertOwnedFixture(fixture);
    const { store } = await loadModules(fixture);
    process.send({ ready: true });
    await new Promise(resolve => process.once("message", resolve));
    for (let batch = 0; batch < 3; batch++) {
      await Promise.all(Array.from({ length: 24 }, () => store.recordCookieConsentEvent(payloads[Number(process.argv[4])])));
    }
    process.disconnect();
  })().catch(error => { console.error(error); process.exitCode = 1; if (process.connected) process.disconnect(); });
} else {
  const test = require("node:test");

  test("repeated concurrent mixed events preserve every action/category and persisted byte", async t => {
    const fixture = await ownedFixture(t);
    const { store } = await loadModules(fixture);
    for (let batch = 1; batch <= 10; batch++) {
      await Promise.all(Array.from({ length: 24 }, (_, i) => store.recordCookieConsentEvent(payloads[i % 4])));
      const { stats } = await store.getCookieConsentData();
      assert.equal(stats.totalEvents, batch * 24);
      assert.deepEqual(stats.actions, Object.fromEntries(actions.map(action => [action, batch * 6])));
      assert.deepEqual(stats.categories, { necessary: batch * 24, analytics: batch * 12, marketing: batch * 12, functional: batch * 12, performance: batch * 12 });
      const disk = JSON.parse(await fs.readFile(path.join(fixture, "consent.json"), "utf8"));
      assert.deepEqual(disk.stats, stats);
    }
    assert.deepEqual((await fs.readdir(fixture)).sort(), ["consent.json", "owned-test.json"]);
  });

  test("identical simultaneous payloads remain distinct consent events; single-request normalization is unchanged", async t => {
    const fixture = await ownedFixture(t);
    const { store } = await loadModules(fixture);
    const results = await Promise.all(Array.from({ length: 64 }, () => store.recordCookieConsentEvent(payloads[2])));
    assert.deepEqual(results.map(r => r.totalEvents).sort((a, b) => a - b), Array.from({ length: 64 }, (_, i) => i + 1));
    const final = await store.recordCookieConsentEvent({ action: "invalid", categories: { necessary: false, analytics: "true", marketing: true } });
    assert.equal(final.totalEvents, 65);
    assert.deepEqual(final.actions, { accept_all: 0, reject_non_essential: 0, customize: 64, save_preferences: 1 });
    assert.deepEqual(final.categories, { necessary: 65, analytics: 64, marketing: 1, functional: 64, performance: 0 });
    assert.ok(Number.isFinite(Date.parse(final.lastConsentAt)));
  });

  test("configuration mutations preserve concurrent events and increment every configuration version", async t => {
    const fixture = await ownedFixture(t);
    const { store } = await loadModules(fixture);
    const initial = await store.getCookieConsentData();
    const results = await Promise.all([
      ...Array.from({ length: 40 }, () => store.recordCookieConsentEvent(payloads[0])),
      ...Array.from({ length: 16 }, (_, i) => store.updateCookieConsentConfig({ ...initial.config, consentExpiryDays: i + 30 })),
    ]);
    const final = await store.getCookieConsentData();
    assert.equal(final.stats.totalEvents, 40);
    assert.equal(final.config.version, initial.config.version + 16);
    assert.ok(final.config.consentExpiryDays >= 30 && final.config.consentExpiryDays <= 45);
    assert.deepEqual(results.slice(40).map(r => r.config.version).sort((a, b) => a - b), Array.from({ length: 16 }, (_, i) => initial.config.version + i + 1));
  });

  test("reset is serialized with events and configuration; explicit reset semantics are retained", async t => {
    const fixture = await ownedFixture(t);
    const { store } = await loadModules(fixture);
    await store.recordCookieConsentEvent(payloads[0]);
    const before = await store.getCookieConsentData();
    const results = await Promise.all([
      store.resetCookieConsents(),
      ...Array.from({ length: 32 }, () => store.recordCookieConsentEvent(payloads[1])),
      store.updateCookieConsentConfig({ ...before.config, consentExpiryDays: 45 }),
    ]);
    const final = await store.getCookieConsentData();
    assert.equal(final.config.version, before.config.version + 2);
    assert.equal(final.config.consentExpiryDays, 45);
    // Reset deliberately removes preceding events. Every event after its
    // returned resetAt must survive; returned event snapshots identify that order.
    const afterReset = results.slice(1, 33).filter(r => r.resetAt === results[0].stats.resetAt);
    assert.equal(final.stats.totalEvents, afterReset.length);
    assert.equal(final.stats.actions.reject_non_essential, afterReset.length);
    assert.equal(final.stats.actions.accept_all, 0);
    assert.equal(final.stats.resetAt, results[0].stats.resetAt);
    const reset = await store.resetCookieConsents();
    assert.equal(reset.stats.totalEvents, 0);
    assert.equal(reset.config.consentExpiryDays, 45);
    assert.equal((await store.recordCookieConsentEvent(payloads[0])).totalEvents, 1);
  });

  test("four real processes sharing one local store lose no simultaneous events", async t => {
    const fixture = await ownedFixture(t);
    const children = Array.from({ length: 4 }, (_, i) => fork(__filename, ["--worker", fixture, String(i)], { execArgv: [], stdio: ["ignore", "ignore", "pipe", "ipc"] }));
    t.after(() => children.forEach(child => { if (child.exitCode === null) child.kill(); }));
    let stderr = "";
    const exits = children.map(child => new Promise((resolve, reject) => {
      child.stderr.on("data", bytes => { stderr += bytes; });
      child.once("error", reject);
      child.once("exit", (code, signal) => code === 0 ? resolve() : reject(new Error(`Worker failed: ${code}/${signal} ${stderr}`)));
    }));
    await Promise.all(children.map(child => new Promise((resolve, reject) => {
      child.once("message", resolve);
      child.once("error", reject);
      child.once("exit", code => { if (code !== 0) reject(new Error("Worker exited before ready")); });
    })));
    children.forEach(child => child.send({ start: true }));
    await Promise.all(exits);
    const { store } = await loadModules(fixture);
    const { stats } = await store.getCookieConsentData();
    assert.equal(stats.totalEvents, 288);
    assert.deepEqual(stats.actions, Object.fromEntries(actions.map(action => [action, 72])));
    assert.deepEqual(stats.categories, { necessary: 288, analytics: 144, marketing: 144, functional: 144, performance: 144 });
  });

  test("Windows deletion-pending EPERM retries within the deadline; genuine permission failures remain visible", async t => {
    for (const [platform, code, transient, attempts] of [
      ["win32", "EPERM", true, 2],
      ["win32", "EPERM", false, 1],
      ["win32", "EACCES", false, 1],
      ["linux", "EPERM", false, 1],
    ]) {
      const fixture = await ownedFixture(t);
      let calls = 0;
      const error = Object.assign(new Error("Synthetic lock permission error"), { code });
      let clock = 0;
      const { store } = await loadModules(fixture, async (method, _source, destination) => {
        if (method === "rename" && String(destination).endsWith(".lock-v2")) {
          calls++;
          if (!transient || calls === 1) throw error;
        }
      }, platform, {
        linuxIdentity: platform === "linux" && process.platform !== "linux",
        ...(code === "EPERM" && !transient && platform === "win32" ? { performance: { now: () => (clock += 31_000) } } : {}),
      });
      if (transient) assert.equal((await store.recordCookieConsentEvent(payloads[0])).totalEvents, 1);
      else await assert.rejects(store.recordCookieConsentEvent(payloads[0]), candidate => candidate === error);
      assert.equal(calls, attempts);
      assert.ok(!(await fs.readdir(fixture)).some(name => name.includes(".lock")));
    }
  });

  for (const operation of ["readFile", "open", "rename"]) {
    test(`${operation} failure preserves committed data, releases lock and permits retry`, async t => {
      const fixture = await ownedFixture(t);
      const healthy = await loadModules(fixture);
      await healthy.store.recordCookieConsentEvent(payloads[0]);
      const previous = await fs.readFile(path.join(fixture, "consent.json"), "utf8");
      let fail = true;
      const injected = new Error("Synthetic storage failure");
      injected.code = "EACCES";
      const { store } = await loadModules(fixture, async (method, ...args) => {
        const isMutationOperation = operation === "readFile" ? args[0] === path.join(fixture, "consent.json")
          : operation === "open" ? String(args[0]).endsWith(".tmp")
          : args[1] === path.join(fixture, "consent.json");
        if (method === operation && isMutationOperation && fail) { fail = false; throw injected; }
      });
      await assert.rejects(store.recordCookieConsentEvent(payloads[1]), error => error === injected);
      assert.equal(await fs.readFile(path.join(fixture, "consent.json"), "utf8"), previous);
      assert.deepEqual((await fs.readdir(fixture)).sort(), ["consent.json", "owned-test.json"]);
      assert.equal((await store.recordCookieConsentEvent(payloads[1])).totalEvents, 2);
    });
  }

  test("a corrupt mutation read fails visibly without replacing data and releases its lock", async t => {
    const fixture = await ownedFixture(t);
    const { store, logs } = await loadModules(fixture);
    await store.recordCookieConsentEvent(payloads[0]);
    const good = await fs.readFile(path.join(fixture, "consent.json"), "utf8");
    await fs.writeFile(path.join(fixture, "consent.json"), "{corrupt synthetic fixture");
    await assert.rejects(store.recordCookieConsentEvent(payloads[1]), SyntaxError);
    assert.equal(await fs.readFile(path.join(fixture, "consent.json"), "utf8"), "{corrupt synthetic fixture");
    assert.equal(logs.length, 1);
    assert.deepEqual((await fs.readdir(fixture)).sort(), ["consent.json", "owned-test.json"]);
    await fs.writeFile(path.join(fixture, "consent.json"), good);
    assert.equal((await store.recordCookieConsentEvent(payloads[1])).totalEvents, 2);
  });

  test("concurrent actual API handlers return 200 and persist all valid events without weakening validation", async t => {
    const fixture = await ownedFixture(t);
    const { api, store } = await loadModules(fixture);
    for (let batch = 0; batch < 5; batch++) {
      const responses = await Promise.all(Array.from({ length: 20 }, (_, i) => api.POST(request(payloads[i % 4], batch * 20 + i + 1))));
      assert.ok(responses.every(r => r.status === 200));
      assert.deepEqual(await Promise.all(responses.map(r => r.json())), Array.from({ length: 20 }, () => ({ ok: true })));
      assert.equal((await store.getCookieConsentData()).stats.totalEvents, (batch + 1) * 20);
    }
    assert.equal((await api.POST(request({ action: "invalid" }, 200))).status, 400);
    assert.equal((await api.POST(request({ action: "accept_all", categories: [] }, 201))).status, 400);
    const crossSite = request(payloads[0], 202);
    crossSite.headers.set("sec-fetch-site", "cross-site");
    assert.equal((await api.POST(crossSite)).status, 403);
    assert.equal((await store.getCookieConsentData()).stats.totalEvents, 100);
  });

  test("one concurrent API storage failure is visible; other events and retry remain correct", async t => {
    const fixture = await ownedFixture(t);
    let fail = true;
    const { api, store, logs } = await loadModules(fixture, async (method, _source, destination) => {
      if (method === "rename" && destination === path.join(fixture, "consent.json") && fail) { fail = false; throw new Error("Synthetic rename failure"); }
    });
    const responses = await Promise.all(Array.from({ length: 12 }, (_, i) => api.POST(request(payloads[i % 4], i + 1))));
    assert.equal(responses.filter(r => r.status === 500).length, 1);
    assert.equal(responses.filter(r => r.status === 200).length, 11);
    assert.deepEqual(await responses.find(r => r.status === 500).json(), { ok: false });
    assert.equal(logs.length, 1);
    assert.equal((await store.getCookieConsentData()).stats.totalEvents, 11);
    const retry = await api.POST(request(payloads[responses.findIndex(r => r.status === 500) % 4], 100));
    assert.equal(retry.status, 200);
    assert.equal((await store.getCookieConsentData()).stats.totalEvents, 12);
    assert.deepEqual((await fs.readdir(fixture)).sort(), ["consent.json", "owned-test.json"]);
  });

  test("a legacy ownerless lock fails closed; verified fixture release permits retry", async t => {
    const fixture = await ownedFixture(t);
    const { store } = await loadModules(fixture);
    await store.recordCookieConsentEvent(payloads[0]);
    const previous = await fs.readFile(path.join(fixture, "consent.json"), "utf8");
    await fs.mkdir(path.join(fixture, "consent.json.lock"));
    await assert.rejects(store.recordCookieConsentEvent(payloads[1]), /legacy|recovery|reconciliation/i);
    assert.equal(await fs.readFile(path.join(fixture, "consent.json"), "utf8"), previous);
    assert.equal((await fs.stat(path.join(fixture, "consent.json.lock"))).isDirectory(), true);
    await fs.rmdir(path.join(fixture, "consent.json.lock"));
    assert.equal((await store.recordCookieConsentEvent(payloads[1])).totalEvents, 2);
  });

  test("cleanup failure preserves the original mutation error and cannot silently report success", async t => {
    const fixture = await ownedFixture(t);
    const mutationError = new Error("Synthetic rename failure");
    const cleanupError = new Error("Synthetic cleanup failure");
    const { store } = await loadModules(fixture, async (method, source, destination) => {
      if (method === "rename" && destination === path.join(fixture, "consent.json")) throw mutationError;
      if (method === "rm" && String(source).endsWith(".tmp")) throw cleanupError;
    });
    await assert.rejects(store.recordCookieConsentEvent(payloads[0]), error => error instanceof AggregateError && error.errors[0] === mutationError && error.errors[1] === cleanupError);
    assert.ok(!(await fs.readdir(fixture)).some(name => name.includes(".lock")));
  });

  for (const phase of ["after-lock", "before-commit", "after-commit"]) {
    test(`native writer crash ${phase} recovers through a fresh module without losing committed state`, { timeout: 40_000 }, async t => {
      const fixture = await ownedFixture(t);
      const initial = await loadModules(fixture);
      await initial.store.recordCookieConsentEvent(payloads[0]);
      const previous = await fs.readFile(path.join(fixture, "consent.json"), "utf8");
      const worker = startPausedWorker(t, fixture, phase);
      assert.equal((await worker.paused).phase, phase);
      const lockPath = path.join(fixture, "consent.json.lock-v2");
      const children = await fs.readdir(lockPath);
      const marker = children.find(name => name.endsWith(".owner.json"));
      assert.ok(marker, "ownership is published before the data mutation");
      const owner = JSON.parse(await fs.readFile(path.join(lockPath, marker), "utf8"));
      assert.equal(owner.pid, worker.child.pid);
      assert.equal(owner.version, 2);
      assert.ok(owner.identity.startTime);
      assert.equal(children.some(name => name.endsWith(".tmp")), phase === "before-commit");
      worker.child.kill("SIGKILL");
      await worker.exited;
      if (phase !== "after-commit") assert.equal(await fs.readFile(path.join(fixture, "consent.json"), "utf8"), previous);
      const restarted = await loadModules(fixture);
      const stats = await restarted.store.recordCookieConsentEvent(payloads[2]);
      assert.equal(stats.totalEvents, phase === "after-commit" ? 3 : 2);
      assert.equal(stats.actions.accept_all, 1);
      assert.equal(stats.actions.reject_non_essential, phase === "after-commit" ? 1 : 0);
      assert.equal(stats.actions.customize, 1);
      assert.deepEqual((await restarted.store.getCookieConsentData()).stats, stats);
      assert.deepEqual((await fs.readdir(fixture)).sort(), ["consent.json", "owned-test.json"]);
    });
  }

  test("independent module instances race to reclaim a crashed writer and retain every successful event", { timeout: 40_000 }, async t => {
    const fixture = await ownedFixture(t);
    const initial = await loadModules(fixture);
    await initial.store.recordCookieConsentEvent(payloads[0]);
    const worker = startPausedWorker(t, fixture, "before-commit");
    await worker.paused;
    worker.child.kill("SIGKILL");
    await worker.exited;
    const writers = await Promise.all(Array.from({ length: 3 }, () => loadModules(fixture)));
    const results = await Promise.all(writers.flatMap(({ store }, i) => Array.from({ length: 12 }, () => store.recordCookieConsentEvent(payloads[i + 1]))));
    assert.deepEqual(results.map(stats => stats.totalEvents).sort((a, b) => a - b), Array.from({ length: 36 }, (_, i) => i + 2));
    const { stats } = await writers[0].store.getCookieConsentData();
    assert.deepEqual(stats.actions, { accept_all: 1, reject_non_essential: 12, customize: 12, save_preferences: 12 });
    assert.equal(stats.totalEvents, 37);
    assert.deepEqual((await fs.readdir(fixture)).sort(), ["consent.json", "owned-test.json"]);
  });

  test("an old but live owner is never expired; timeout is bounded and retry succeeds after its death", { timeout: 40_000 }, async t => {
    const fixture = await ownedFixture(t);
    const initial = await loadModules(fixture);
    await initial.store.recordCookieConsentEvent(payloads[0]);
    const previous = await fs.readFile(path.join(fixture, "consent.json"), "utf8");
    const worker = startPausedWorker(t, fixture, "before-commit");
    await worker.paused;
    const lockPath = path.join(fixture, "consent.json.lock-v2");
    await fs.utimes(lockPath, new Date(0), new Date(0));
    let clock = 0;
    const blocked = await loadModules(fixture, undefined, process.platform, { performance: { now: () => (clock += 31_000) } });
    await assert.rejects(blocked.store.recordCookieConsentEvent(payloads[2]), error => error.code === "CONSENT_LOCK_TIMEOUT");
    assert.equal(await fs.readFile(path.join(fixture, "consent.json"), "utf8"), previous);
    assert.equal((await fs.stat(lockPath)).isDirectory(), true);
    assert.equal(worker.child.exitCode, null);
    worker.child.kill("SIGKILL");
    await worker.exited;
    const retry = await loadModules(fixture);
    assert.equal((await retry.store.recordCookieConsentEvent(payloads[2])).totalEvents, 2);
    assert.deepEqual((await fs.readdir(fixture)).sort(), ["consent.json", "owned-test.json"]);
  });

  test("public and authorized admin failures redact raw filesystem paths, secrets and malformed content", async t => {
    const fixture = await ownedFixture(t);
    const sensitive = "private-applicant@example.invalid synthetic-password secret-token C:\\private\\consent.json";
    const injected = Object.assign(new Error(sensitive), { code: "EACCES" });
    const modules = await loadModules(fixture, async (method, target) => {
      if (method === "readFile" && target === path.join(fixture, "consent.json")) throw injected;
    });
    const session = modules.admin.createCookieAdminSessionValue();
    const adminRequest = (endpoint, method, body) => new NextRequest(`https://qa.invalid/api/admin/cookie-consent/${endpoint}`, {
      method, headers: { cookie: `${modules.admin.COOKIE_ADMIN_SESSION_NAME}=${session}`, "content-type": "application/json" },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    const responses = [
      await modules.api.POST(request(payloads[0], 220)),
      await modules.settingsApi.PUT(adminRequest("settings", "PUT", { config: (await modules.store.getCookieConsentData()).config })),
      await modules.resetApi.POST(adminRequest("reset", "POST")),
    ];
    for (const response of responses) {
      assert.equal(response.status, 500);
      assert.deepEqual(await response.json(), { ok: false });
    }
    const logged = JSON.stringify(modules.logs);
    assert.match(logged, /EACCES/);
    for (const secret of [sensitive, "private-applicant", "synthetic-password", "secret-token", fixture, session, "synthetic-consent-test-token"]) assert.ok(!logged.includes(secret));
    assert.equal((await modules.settingsApi.PUT(new NextRequest("https://qa.invalid/api/admin/cookie-consent/settings", { method: "PUT" }))).status, 401);
    assert.equal((await modules.resetApi.POST(new NextRequest("https://qa.invalid/api/admin/cookie-consent/reset", { method: "POST" }))).status, 401);
  });

  test("an empty v2 release remnant is recoverable without deleting committed data", async t => {
    const fixture = await ownedFixture(t);
    const { store } = await loadModules(fixture);
    await store.recordCookieConsentEvent(payloads[0]);
    await fs.mkdir(path.join(fixture, "consent.json.lock-v2"));
    assert.equal((await store.recordCookieConsentEvent(payloads[1])).totalEvents, 2);
    assert.deepEqual((await fs.readdir(fixture)).sort(), ["consent.json", "owned-test.json"]);
  });

  for (const invalid of ["malformed", "unreadable", "foreign-host", "extra-file"]) {
    test(`${invalid} ownership fails closed and preserves all fixture bytes`, { timeout: 40_000 }, async t => {
      const fixture = await ownedFixture(t);
      const initial = await loadModules(fixture);
      await initial.store.recordCookieConsentEvent(payloads[0]);
      const previous = await fs.readFile(path.join(fixture, "consent.json"), "utf8");
      const worker = startPausedWorker(t, fixture, "before-commit");
      await worker.paused;
      worker.child.kill("SIGKILL");
      await worker.exited;
      const lockPath = path.join(fixture, "consent.json.lock-v2");
      const marker = (await fs.readdir(lockPath)).find(name => name.endsWith(".owner.json"));
      const markerPath = path.join(lockPath, marker);
      if (invalid === "malformed") await fs.writeFile(markerPath, "{private-applicant@example.invalid malformed-marker");
      if (invalid === "foreign-host") {
        const owner = JSON.parse(await fs.readFile(markerPath, "utf8"));
        owner.host = "synthetic-other-host";
        await fs.writeFile(markerPath, JSON.stringify(owner));
      }
      if (invalid === "extra-file") await fs.writeFile(path.join(lockPath, "unmanaged-synthetic-file"), "do not delete");
      const names = (await fs.readdir(lockPath)).sort();
      const bytes = await Promise.all(names.map(name => fs.readFile(path.join(lockPath, name), "utf8")));
      const retry = await loadModules(fixture, async (method, target) => {
        if (invalid === "unreadable" && method === "readFile" && target === markerPath) throw Object.assign(new Error("private-applicant@example.invalid marker permission"), { code: "EACCES" });
      });
      const response = await retry.api.POST(request(payloads[1], 225));
      assert.equal(response.status, 500);
      assert.deepEqual(await response.json(), { ok: false });
      assert.equal(await fs.readFile(path.join(fixture, "consent.json"), "utf8"), previous);
      assert.deepEqual((await fs.readdir(lockPath)).sort(), names);
      assert.deepEqual(await Promise.all(names.map(name => fs.readFile(path.join(lockPath, name), "utf8"))), bytes);
      assert.doesNotMatch(JSON.stringify(retry.logs), /private-applicant|malformed-marker|synthetic-other-host/);
    });
  }

  test("an unverifiable owner is retained rather than mistaken for a dead process", { timeout: 40_000 }, async t => {
    const fixture = await ownedFixture(t);
    const initial = await loadModules(fixture);
    await initial.store.recordCookieConsentEvent(payloads[0]);
    const previous = await fs.readFile(path.join(fixture, "consent.json"), "utf8");
    const worker = startPausedWorker(t, fixture, "before-commit");
    await worker.paused;
    let probes = 0;
    const blocked = await loadModules(fixture, undefined, process.platform, { kill: (pid, signal) => {
      assert.equal(pid, worker.child.pid);
      assert.equal(signal, 0);
      probes++;
      throw Object.assign(new Error("synthetic restricted process identity"), { code: "EPERM" });
    } });
    await assert.rejects(blocked.store.recordCookieConsentEvent(payloads[2]), error => error.code === "CONSENT_LOCK_OWNER_UNVERIFIABLE");
    assert.ok(probes > 0);
    assert.equal(await fs.readFile(path.join(fixture, "consent.json"), "utf8"), previous);
    assert.ok((await fs.readdir(path.join(fixture, "consent.json.lock-v2"))).some(name => name.endsWith(".owner.json")));
    worker.child.kill("SIGKILL");
    await worker.exited;
    const retry = await loadModules(fixture);
    assert.equal((await retry.store.recordCookieConsentEvent(payloads[2])).totalEvents, 2);
  });

  test("native process start identity distinguishes a recycled PID from the original crashed writer", { timeout: 40_000 }, async t => {
    const fixture = await ownedFixture(t);
    const initial = await loadModules(fixture);
    await initial.store.recordCookieConsentEvent(payloads[0]);
    const worker = startPausedWorker(t, fixture, "before-commit");
    await worker.paused;
    worker.child.kill("SIGKILL");
    await worker.exited;
    const lockPath = path.join(fixture, "consent.json.lock-v2");
    const marker = (await fs.readdir(lockPath)).find(name => name.endsWith(".owner.json"));
    const markerPath = path.join(lockPath, marker);
    const owner = JSON.parse(await fs.readFile(markerPath, "utf8"));
    // Retain the dead child's real start identity but point to a demonstrably
    // live PID. The helper must compare authoritative OS incarnation data.
    owner.pid = process.pid;
    await fs.writeFile(markerPath, JSON.stringify(owner));
    const restarted = await loadModules(fixture);
    assert.equal((await restarted.store.recordCookieConsentEvent(payloads[2])).totalEvents, 2);
    assert.deepEqual((await fs.readdir(fixture)).sort(), ["consent.json", "owned-test.json"]);
  });

  test("persistent owner cleanup failure is visible and retains committed state for authorized recovery", async t => {
    const fixture = await ownedFixture(t);
    const failure = Object.assign(new Error("synthetic cleanup denied"), { code: "EACCES" });
    const modules = await loadModules(fixture, async (method, target) => {
      if (method === "unlink" && String(target).endsWith(".owner.json") && path.dirname(String(target)).endsWith(".lock-v2")) throw failure;
    });
    await assert.rejects(modules.store.recordCookieConsentEvent(payloads[0]), error => error === failure);
    const committed = await fs.readFile(path.join(fixture, "consent.json"), "utf8");
    assert.equal(JSON.parse(committed).stats.totalEvents, 1);
    const lockPath = path.join(fixture, "consent.json.lock-v2");
    assert.ok((await fs.readdir(lockPath)).some(name => name.endsWith(".owner.json")));
    let clock = 0;
    const retry = await loadModules(fixture, undefined, process.platform, { performance: { now: () => (clock += 31_000) } });
    await assert.rejects(retry.store.recordCookieConsentEvent(payloads[1]), error => error.code === "CONSENT_LOCK_TIMEOUT");
    assert.equal(await fs.readFile(path.join(fixture, "consent.json"), "utf8"), committed);
  });

  test("a delayed reaper cannot remove a replacement owner's lock or corrupt its mutation", { timeout: 40_000 }, async t => {
    const fixture = await ownedFixture(t);
    const initial = await loadModules(fixture);
    await initial.store.recordCookieConsentEvent(payloads[0]);
    const worker = startPausedWorker(t, fixture, "before-commit");
    await worker.paused;
    worker.child.kill("SIGKILL");
    await worker.exited;
    const lockPath = path.join(fixture, "consent.json.lock-v2");
    const oldMarker = (await fs.readdir(lockPath)).find(name => name.endsWith(".owner.json"));
    const pausedReaper = deferred();
    const resumeReaper = deferred();
    const attemptedRemoval = deferred();
    const replacementAcquired = deferred();
    const resumeReplacement = deferred();
    let intercepted = false;
    const stale = await loadModules(fixture, async (method, target) => {
      if (method === "unlink" && target === path.join(lockPath, oldMarker) && !intercepted) {
        intercepted = true;
        pausedReaper.resolve();
        await resumeReaper.promise;
      }
      if (method === "rmdir" && target === lockPath && intercepted) attemptedRemoval.resolve();
    });
    const replacing = await loadModules(fixture, async (method, target) => {
      if (method === "readFile" && target === path.join(fixture, "consent.json")) {
        replacementAcquired.resolve();
        await resumeReplacement.promise;
      }
    });
    t.after(() => { resumeReaper.resolve(); resumeReplacement.resolve(); });
    const staleRequest = stale.store.recordCookieConsentEvent(payloads[2]);
    await pausedReaper.promise;
    const replacementRequest = replacing.store.recordCookieConsentEvent(payloads[3]);
    await replacementAcquired.promise;
    const replacementMarker = (await fs.readdir(lockPath)).find(name => name.endsWith(".owner.json"));
    assert.notEqual(replacementMarker, oldMarker);
    resumeReaper.resolve();
    await attemptedRemoval.promise;
    await new Promise(resolve => setTimeout(resolve, 50));
    assert.equal((await fs.lstat(path.join(lockPath, replacementMarker))).isFile(), true);
    resumeReplacement.resolve();
    await Promise.all([staleRequest, replacementRequest]);
    const { stats } = await initial.store.getCookieConsentData();
    assert.equal(stats.totalEvents, 3);
    assert.deepEqual(stats.actions, { accept_all: 1, reject_non_essential: 0, customize: 1, save_preferences: 1 });
    assert.deepEqual((await fs.readdir(fixture)).sort(), ["consent.json", "owned-test.json"]);
  });

  const linuxIdentity = { kind: "linux", bootId: "11111111-1111-4111-8111-111111111111", namespace: "pid:[1]", startTime: "123", machineId: "1".repeat(32) };
  for (const scenario of [
    { name: "same live PID and start identity", change: {}, code: "CONSENT_LOCK_TIMEOUT" },
    { name: "reused live PID with a different authoritative start time", change: { startTime: "122" }, recovers: true },
    { name: "same-host reboot with matching machine identity", change: { bootId: "22222222-2222-4222-8222-222222222222" }, recovers: true },
    { name: "foreign PID namespace", change: { namespace: "pid:[2]" }, code: "CONSENT_LOCK_FOREIGN_OWNER" },
    { name: "foreign machine with the same boot token", change: { machineId: "2".repeat(32) }, code: "CONSENT_LOCK_FOREIGN_OWNER" },
    { name: "foreign machine after reboot", change: { bootId: "22222222-2222-4222-8222-222222222222", machineId: "2".repeat(32) }, code: "CONSENT_LOCK_FOREIGN_OWNER" },
    { name: "unprovable reboot without a current machine identity", change: { bootId: "22222222-2222-4222-8222-222222222222" }, unavailableMachine: true, code: "CONSENT_LOCK_FOREIGN_OWNER" },
  ]) {
    test(`Linux identity fixture: ${scenario.name}`, async t => {
      const fixture = await ownedFixture(t);
      const initial = await loadModules(fixture);
      await initial.store.recordCookieConsentEvent(payloads[0]);
      const previous = await fs.readFile(path.join(fixture, "consent.json"), "utf8");
      const lockPath = path.join(fixture, "consent.json.lock-v2");
      const token = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
      const marker = path.join(lockPath, `${token}.owner.json`);
      const temporary = path.join(lockPath, `${token}.tmp`);
      const owner = { version: 2, token, pid: process.pid, host: os.hostname(), platform: "linux", identity: { ...linuxIdentity, ...scenario.change } };
      await fs.mkdir(lockPath);
      await fs.writeFile(marker, JSON.stringify(owner));
      await fs.writeFile(temporary, "synthetic incomplete uncommitted data");
      let clock = 0;
      const candidate = await loadModules(fixture, undefined, "linux", {
        linuxIdentity: true,
        ...(scenario.unavailableMachine ? { identityReads: { "readFile:/etc/machine-id": "unavailable" } } : {}),
        ...(scenario.code === "CONSENT_LOCK_TIMEOUT" ? { performance: { now: () => (clock += 31_000) } } : {}),
      });
      if (scenario.recovers) {
        assert.equal((await candidate.store.recordCookieConsentEvent(payloads[2])).totalEvents, 2);
        assert.deepEqual((await fs.readdir(fixture)).sort(), ["consent.json", "owned-test.json"]);
      } else {
        await assert.rejects(candidate.store.recordCookieConsentEvent(payloads[2]), error => error.code === scenario.code);
        assert.equal(await fs.readFile(path.join(fixture, "consent.json"), "utf8"), previous);
        assert.equal(await fs.readFile(marker, "utf8"), JSON.stringify(owner));
        assert.equal(await fs.readFile(temporary, "utf8"), "synthetic incomplete uncommitted data");
      }
    });
  }
}
