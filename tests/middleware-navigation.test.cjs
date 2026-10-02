const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const path = require("node:path");
const test = require("node:test");
const ts = require("typescript");
const { NextRequest } = require("next/server");

const root = path.resolve(__dirname, "..");
const origin = "https://emitronix.ae";
const redirect = (from, to, permanent = true) => ({ from, to, permanent });
const response = redirects => ({ ok: true, json: async () => ({ redirects }) });
const flush = () => new Promise(resolve => setImmediate(resolve));

function deferred() {
  let resolve;
  const promise = new Promise(done => { resolve = done; });
  return { promise, resolve };
}

// Exercise the real middleware, locale helpers, closed-set policy and Next
// responses. Only network and time are controlled; no server or store is used.
async function loadMiddleware(fetchImpl, internalOrigin) {
  const modules = new Map();
  const requests = [];
  const background = [];
  const timers = new Map();
  const clock = { now: 1_800_000_000_000 };
  let timerId = 0;
  class TestDate extends Date {
    static now() { return clock.now; }
  }

  async function load(relative) {
    if (modules.has(relative)) return modules.get(relative);
    const source = await fs.readFile(path.join(root, relative), "utf8");
    const output = ts.transpileModule(source, {
      compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, esModuleInterop: true },
    }).outputText;
    const aliases = {};
    for (const match of output.matchAll(/require\(["'](@\/[^"']+)["']\)/g)) {
      aliases[match[1]] = await load(match[1].slice(2) + ".ts");
    }
    const module = { exports: {} };
    new Function("require", "module", "exports", "fetch", "process", "Date", "setTimeout", "clearTimeout", output)(
      name => aliases[name] || require(name), module, module.exports,
      (url, init) => {
        requests.push({ url, init });
        return fetchImpl(url, init, requests.length);
      },
      { env: { INTERNAL_ORIGIN: internalOrigin } }, TestDate,
      (callback, delay) => {
        const id = ++timerId;
        timers.set(id, { callback, at: clock.now + delay });
        return id;
      },
      id => timers.delete(id),
    );
    modules.set(relative, module.exports);
    return module.exports;
  }

  const { middleware } = await load("middleware.ts");
  return {
    requests, background, timers,
    navigate: (pathname, headers) => middleware(new NextRequest(origin + pathname, { headers }), {
      waitUntil: promise => background.push(promise),
    }),
    advance: async milliseconds => {
      clock.now += milliseconds;
      for (const [id, timer] of [...timers]) {
        if (timer.at <= clock.now) {
          timers.delete(id);
          timer.callback();
        }
      }
      await flush();
    },
    drain: () => Promise.all(background.splice(0)),
  };
}

async function withoutWaiting(promise) {
  let finished = false;
  promise.then(() => { finished = true; });
  await flush();
  assert.equal(finished, true, "navigation must finish without waiting for the redirect refresh");
  return promise;
}

test("cold concurrent navigation shares a lookup and preserves redirect status", async () => {
  const lookup = deferred();
  const h = await loadMiddleware(() => lookup.promise, "http://127.0.0.1:8081");
  const navigation = Promise.all([
    h.navigate("/legacy-about"), h.navigate("/temporary-contact"), h.navigate("/about"),
  ]);
  assert.equal(h.requests.length, 1);
  assert.equal(h.requests[0].url, "http://127.0.0.1:8081/api/redirects/export");
  assert.equal(h.requests[0].init.cache, "no-store");
  lookup.resolve(response([
    redirect("/legacy-about", "/about"), redirect("/temporary-contact", "/contact", false),
  ]));
  const [permanent, temporary, ordinary] = await navigation;
  assert.equal(permanent.status, 301);
  assert.equal(permanent.headers.get("location"), origin + "/about");
  assert.equal(temporary.status, 302);
  assert.equal(temporary.headers.get("location"), origin + "/contact");
  assert.equal(ordinary.status, 200);
  assert.equal(ordinary.headers.get("content-language"), "en-AE");
  assert.equal(h.timers.size, 0);
  await h.advance(29_999);
  await h.navigate("/legacy-about");
  assert.equal(h.requests.length, 1, "fresh map does not issue another lookup");
});

test("expired redirects remain immediate while concurrent requests share a background refresh", async () => {
  const refresh = deferred();
  const h = await loadMiddleware((url, init, count) => count === 1
    ? response([redirect("/legacy-about", "/about")]) : refresh.promise);
  await h.navigate("/about");
  await h.advance(30_000);
  const [first, second] = await withoutWaiting(Promise.all([
    h.navigate("/legacy-about"), h.navigate("/legacy-about"),
  ]));
  assert.equal(first.headers.get("location"), origin + "/about");
  assert.equal(second.status, 301);
  assert.equal(h.requests.length, 2);
  assert.equal(h.background.length, 2);
  assert.equal(h.background[0], h.background[1], "waitUntil retains the shared refresh");
  refresh.resolve(response([redirect("/legacy-about", "/contact", false)]));
  await h.drain();
  const updated = await h.navigate("/legacy-about");
  assert.equal(updated.status, 302);
  assert.equal(updated.headers.get("location"), origin + "/contact");
  assert.equal(h.timers.size, 0);
});

test("a successful empty refresh removes previously configured redirects", async () => {
  const h = await loadMiddleware((url, init, count) => response(count === 1
    ? [redirect("/legacy-about", "/about")] : []));
  await h.navigate("/about");
  await h.advance(30_000);
  await h.navigate("/legacy-about");
  await h.drain();
  const cleared = await h.navigate("/legacy-about");
  assert.equal(cleared.status, 200);
  assert.equal(cleared.headers.get("location"), null);
});

for (const [label, failure] of [
  ["HTTP failure", () => ({ ok: false })],
  ["network rejection", () => Promise.reject(new Error("Synthetic network failure"))],
  ["invalid JSON", () => ({ ok: true, json: async () => { throw new Error("Synthetic JSON failure"); } })],
  ["invalid map", () => ({ ok: true, json: async () => ({ redirects: null }) })],
]) {
  test(`${label} retains working redirects and throttles retries`, async () => {
    const h = await loadMiddleware((url, init, count) => count === 1
      ? response([redirect("/legacy-about", "/about")]) : count === 2
        ? failure() : response([redirect("/legacy-about", "/contact")]));
    await h.navigate("/about");
    await h.advance(30_000);
    const stale = await withoutWaiting(h.navigate("/legacy-about"));
    assert.equal(stale.headers.get("location"), origin + "/about");
    await h.drain();
    await h.advance(4_999);
    assert.equal((await h.navigate("/legacy-about")).status, 301);
    assert.equal(h.requests.length, 2, "failed refresh backs off instead of retrying every page");
    await h.advance(1);
    await h.navigate("/legacy-about");
    await h.drain();
    assert.equal(h.requests.length, 3);
    assert.equal((await h.navigate("/legacy-about")).headers.get("location"), origin + "/contact");
    assert.equal(h.timers.size, 0);
  });
}

for (const phase of ["connection", "JSON body"]) {
  test(`a stalled ${phase} has a bounded cold wait and cannot overwrite newer redirects`, async () => {
    const stalled = deferred();
    const retry = deferred();
    const h = await loadMiddleware((url, init, count) => {
      if (count > 1) return retry.promise;
      return phase === "connection" ? stalled.promise : { ok: true, json: () => stalled.promise };
    });
    let completed = false;
    const navigation = h.navigate("/legacy-about").then(result => { completed = true; return result; });
    await flush();
    await h.advance(499);
    assert.equal(completed, false);
    await h.advance(1);
    assert.equal((await withoutWaiting(navigation)).status, 200);
    assert.equal(h.requests[0].init.signal.aborted, true);
    assert.equal(h.timers.size, 0);
    await h.navigate("/about");
    assert.equal(h.requests.length, 1);

    await h.advance(5_000);
    assert.equal((await withoutWaiting(h.navigate("/legacy-about"))).status, 200);
    assert.equal(h.requests.length, 2, "retry after a cold failure runs in the background");
    retry.resolve(response([redirect("/legacy-about", "/contact")]));
    await h.drain();
    const obsolete = [redirect("/legacy-about", "/about")];
    stalled.resolve(phase === "connection" ? response(obsolete) : { redirects: obsolete });
    await flush();
    assert.equal((await h.navigate("/legacy-about")).headers.get("location"), origin + "/contact");
    assert.equal(h.timers.size, 0);
  });
}

test("a timed-out background refresh continues serving the last successful redirect map", async () => {
  const stalled = deferred();
  const h = await loadMiddleware((url, init, count) => count === 1
    ? response([redirect("/legacy-about", "/about")]) : stalled.promise);
  await h.navigate("/about");
  await h.advance(30_000);
  assert.equal((await withoutWaiting(h.navigate("/legacy-about"))).status, 301);
  await h.advance(500);
  await h.drain();
  assert.equal(h.requests[1].init.signal.aborted, true);
  assert.equal((await h.navigate("/legacy-about")).headers.get("location"), origin + "/about");
  assert.equal(h.requests.length, 2);
  stalled.resolve(response([]));
  await flush();
  assert.equal((await h.navigate("/legacy-about")).status, 301);
});

test("canonical URLs and the private Arabic 404 bypass redirect loading", async () => {
  const h = await loadMiddleware(() => { throw new Error("Unexpected redirect lookup"); });
  for (const [source, destination] of [
    ["/en/About/?campaign=test", "/about?campaign=test"],
    ["/ar/ar/about", "/ar/about"],
    ["/ABOUT", "/about"],
  ]) {
    const result = await h.navigate(source);
    assert.equal(result.status, 308);
    assert.equal(result.headers.get("location"), origin + destination);
  }
  const privateNotFound = await h.navigate("/ar/emitronix-route-not-found", {
    "x-emitronix-internal-not-found": "1",
  });
  assert.equal(privateNotFound.status, 404);
  assert.equal(privateNotFound.headers.get("content-language"), "ar-AE");
  assert.equal(h.requests.length, 0);
});

test("prefetch redirects and localized closed-set 404s preserve their existing behavior", async () => {
  const h = await loadMiddleware(() => response([
    redirect("/ar/retired-page", "/ar/about"),
    redirect("/blog/retired-page", "/about"),
    redirect("/invalid-destination", "http://["),
  ]));
  const redirected = await h.navigate("/ar/retired-page", { "next-router-prefetch": "1" });
  assert.equal(redirected.status, 301);
  assert.equal(redirected.headers.get("location"), origin + "/ar/about");
  assert.equal((await h.navigate("/blog/retired-page")).status, 301);
  for (const pathname of ["/ar/unknown-page", "/ar/unknown.xml", "/blog/unknown-page", "/services/unknown-page"]) {
    const result = await h.navigate(pathname + "?unused=value");
    const arabic = pathname.startsWith("/ar/");
    assert.equal(result.status, 404);
    assert.equal(result.headers.get("content-language"), arabic ? "ar-AE" : "en-AE");
    assert.equal(result.headers.get("x-middleware-rewrite"), origin + (arabic
      ? "/ar/emitronix-route-not-found" : "/__emitronix-route-not-found"));
  }
  assert.equal((await h.navigate("/invalid-destination")).status, 200);
  assert.equal((await h.navigate("/ar/about")).headers.get("content-language"), "ar-AE");
  assert.equal(h.requests.length, 1);
});
