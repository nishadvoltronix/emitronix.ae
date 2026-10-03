import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { runInNewContext } from "node:vm";
import ts from "typescript";
import {
  applyConsentTransition,
  getSalesIqRuntimePrivacy,
  scheduleReloadAfterConsentUpdate,
  shouldBlockRevokedTrackingRequest,
} from "../lib/cookieConsentRuntime.ts";
import {
  defaultCookieConsentConfig,
  cookieCategoryIds,
  normalizeCookieConsentConfig,
} from "../data/cookieConsentDefaults.ts";

const accepted = {
  necessary: true,
  analytics: true,
  marketing: true,
  functional: true,
  performance: true,
};

const rejected = {
  necessary: true,
  analytics: false,
  marketing: false,
  functional: false,
  performance: false,
};

function runTransition(previousCategories, nextCategories, clearAllOptionalState = false) {
  const calls = [];
  const result = applyConsentTransition({
    previousCategories,
    nextCategories,
    clearAllOptionalState,
    prepareRevocation: (revoked, categories) =>
      calls.push(["prepare", revoked, categories]),
    updateConsent: (categories) => calls.push(["update", categories]),
    persistConsent: () => calls.push(["persist"]),
    clearRevokedState: (revoked, categories) => calls.push(["clear", revoked, categories]),
    loadGrantedScripts: (categories) => calls.push(["load", categories]),
    scheduleReload: () => calls.push(["schedule-reload"]),
  });
  return { calls, result };
}

test("accept updates consent before activating granted integrations", () => {
  const { calls, result } = runTransition(null, accepted);

  assert.equal(result.reloadScheduled, false);
  assert.deepEqual(calls.map(([name]) => name), ["update", "persist", "load"]);
  assert.deepEqual(calls[0][1], accepted);
});

test("initial reject applies denied consent and does not reload", () => {
  const { calls, result } = runTransition(null, rejected, true);

  assert.equal(result.reloadScheduled, false);
  assert.deepEqual(calls.map(([name]) => name), ["update", "persist", "clear", "load"]);
  assert.deepEqual(calls[0][1], rejected);
  assert.deepEqual(calls[2][2], rejected);
});

test("reject after acceptance updates and persists denied consent before reload", () => {
  const { calls, result } = runTransition(accepted, rejected);

  assert.equal(result.reloadScheduled, true);
  assert.deepEqual(calls.map(([name]) => name), [
    "prepare",
    "update",
    "persist",
    "clear",
    "schedule-reload",
  ]);
  assert.equal(result.revoked.analytics, true);
  assert.equal(result.revoked.marketing, true);
  assert.equal(result.revoked.functional, true);
  assert.equal(result.revoked.performance, true);
});

test("guard or cleanup failures cannot prevent denial persistence and reload", () => {
  const calls = [];
  const result = applyConsentTransition({
    previousCategories: accepted,
    nextCategories: rejected,
    prepareRevocation: () => {
      calls.push("prepare");
      throw new Error("guard unavailable");
    },
    updateConsent: () => calls.push("update"),
    persistConsent: () => calls.push("persist"),
    clearRevokedState: () => {
      calls.push("clear");
      throw new Error("provider cleanup unavailable");
    },
    loadGrantedScripts: () => calls.push("load"),
    scheduleReload: () => calls.push("schedule-reload"),
  });

  assert.deepEqual(calls, [
    "prepare",
    "update",
    "persist",
    "clear",
    "schedule-reload",
  ]);
  assert.equal(result.reloadScheduled, true);
  assert.equal(result.consentUpdated, true);
  assert.equal(result.errors.length, 2);
});

test("reload is scheduled after the synchronous consent transition and runs once", () => {
  const scheduled = [];
  let reloads = 0;

  scheduleReloadAfterConsentUpdate({
    schedule: (callback, delayMs) => scheduled.push({ callback, delayMs }),
    reload: () => {
      reloads += 1;
    },
  });

  assert.equal(scheduled.length, 1);
  assert.equal(scheduled[0].delayMs, 0);
  assert.equal(reloads, 0);

  scheduled[0].callback();
  scheduled[0].callback();
  assert.equal(reloads, 1);
});

test("consent update, persistence, and cleanup precede reload scheduling", () => {
  const calls = [];

  applyConsentTransition({
    previousCategories: accepted,
    nextCategories: rejected,
    prepareRevocation: () => calls.push("prepare"),
    updateConsent: () => calls.push("consent"),
    persistConsent: () => calls.push("persist"),
    clearRevokedState: () => calls.push("clear"),
    loadGrantedScripts: () => calls.push("load"),
    scheduleReload: () => calls.push("schedule-reload"),
  });

  assert.deepEqual(calls, [
    "prepare",
    "consent",
    "persist",
    "clear",
    "schedule-reload",
  ]);
});

test("Google collection is blocked for every Google-mapped consent downgrade", () => {
  const collector = "https://www.google-analytics.com/g/collect?v=2";
  const pageUrl = "https://www.emitronix.ae/";

  for (const category of ["analytics", "marketing", "functional"]) {
    const revoked = {
      analytics: false,
      marketing: false,
      functional: false,
      performance: false,
      any: true,
      [category]: true,
    };
    assert.equal(
      shouldBlockRevokedTrackingRequest({ input: collector, pageUrl, revoked }),
      true,
      `${category} downgrade must block the old document's Google collector`,
    );
  }

  assert.equal(
    shouldBlockRevokedTrackingRequest({
      input: "/api/cookie-consent/consent",
      pageUrl,
      revoked: {
        analytics: true,
        marketing: true,
        functional: true,
        performance: true,
        any: true,
      },
    }),
    false,
  );
});

test("SalesIQ privacy mapping keeps chat essential and gates Live View on analytics", () => {
  assert.deepEqual(getSalesIqRuntimePrivacy(rejected), {
    essentialChat: true,
    visitorTracking: false,
    cookieConsent: [],
  });
  assert.deepEqual(getSalesIqRuntimePrivacy(accepted), {
    essentialChat: true,
    visitorTracking: true,
    cookieConsent: ["analytics", "performance"],
  });
  assert.deepEqual(
    getSalesIqRuntimePrivacy({
      ...rejected,
      functional: true,
      performance: true,
    }),
    {
      essentialChat: true,
      visitorTracking: false,
      cookieConsent: ["performance"],
    },
  );
  assert.deepEqual(
    getSalesIqRuntimePrivacy({
      ...rejected,
      analytics: true,
    }),
    {
      essentialChat: true,
      visitorTracking: true,
      cookieConsent: ["analytics"],
    },
  );
});

test("essential SalesIQ requests are not blocked when optional functional consent is revoked", () => {
  const pageUrl = "https://www.emitronix.ae/";
  const revoked = {
    analytics: false,
    marketing: false,
    functional: true,
    performance: false,
    any: true,
  };

  assert.equal(
    shouldBlockRevokedTrackingRequest({
      input: "https://salesiq.zohopublic.com/widget?wc=siq-example",
      pageUrl,
      revoked,
    }),
    false,
  );
  assert.equal(
    shouldBlockRevokedTrackingRequest({
      input: "https://emitronix.ae/images/logo.png",
      pageUrl,
      revoked,
    }),
    false,
  );
});

test("GTM consent bootstrap exists once without a no-JavaScript tracking bypass", async () => {
  const [layout, englishRoot, arabicRoot, consentManager] = await Promise.all([
    readFile(new URL("../components/SiteRootLayout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/(en)/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/ar/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../components/CookieConsentManager.tsx", import.meta.url), "utf8"),
  ]);

  assert.match(englishRoot, /<SiteRootLayout locale="en">/);
  assert.match(arabicRoot, /<SiteRootLayout locale="ar">/);
  assert.equal(layout.match(/id="emitronix-google-tag-manager"/g)?.length, 1);
  assert.equal(layout.match(/id="emitronix-google-consent-default"/g)?.length, 1);
  assert.equal(layout.match(/googletagmanager\.com\/gtm\.js/g)?.length, 1);
  assert.doesNotMatch(layout, /googletagmanager\.com\/ns\.html/);
  assert.equal(consentManager.match(/googletagmanager\.com\/gtm\.js/g)?.length || 0, 0);
  assert.equal(consentManager.match(/googletagmanager\.com\/gtag\/js/g)?.length || 0, 0);
  assert.equal(layout.match(/salesiq\.zohopublic\.com\/widget/g)?.length || 0, 0);
  assert.equal(consentManager.match(/siq1f4b2e5df11f8540e8c42cce8cfbf087ee91508d4eaaccfbcd68dc760569131fdba231f665cae37d10855c73a0668462/g)?.length || 0, 1);
  assert.match(consentManager, /function loadSalesIqWidget\(categories: ConsentCategoryMap\)/);
  assert.equal(consentManager.match(/\n  loadSalesIqWidget\(categories\);/g)?.length, 1);
  assert.match(
    consentManager,
    /const initialCategories = getDefaultConsentCategories\(\);[\s\S]*?loadSalesIqWidget\(initialCategories\);/,
  );
  for (const field of [
    "ad_storage",
    "analytics_storage",
    "ad_user_data",
    "ad_personalization",
    "functionality_storage",
    "personalization_storage",
  ]) {
    assert.match(layout, new RegExp(`${field}: 'denied'`));
  }
  assert.ok(
    layout.indexOf('id="emitronix-google-consent-default"') <
      layout.indexOf('id="emitronix-google-tag-manager"'),
  );
});

test("GTM bootstrap waits for activation and avoids duplicate gateway or repeated loads", async (t) => {
  const layout = await readFile(new URL("../components/SiteRootLayout.tsx", import.meta.url), "utf8");
  const containerId = "GTM-TEST123";
  const bootstrapTemplate = layout.match(/const googleTagManagerBootstrap = `([\s\S]*?)`;/)?.[1];
  const consentDefaults = layout.match(/id="emitronix-google-consent-default"[\s\S]*?__html: `([\s\S]*?)`/)?.[1];
  assert.ok(bootstrapTemplate, "the production bootstrap must be exercised");
  assert.ok(consentDefaults, "the production consent defaults must be exercised");
  const bootstrap = bootstrapTemplate.replace("${JSON.stringify(googleTagManagerId)}", JSON.stringify(containerId));

  for (const scenario of [
    { name: "matching gateway", gateway: [containerId], scripts: 0 },
    { name: "matching gateway among other containers", gateway: ["GTM-OTHER", containerId], scripts: 0 },
    { name: "absent gateway", scripts: 1 },
    { name: "different gateway container", gateway: ["GTM-OTHER"], scripts: 1 },
    { name: "empty gateway registration", gateway: [], scripts: 1 },
    { name: "malformed gateway registration", gateway: containerId, scripts: 1 },
  ]) {
    await t.test(scenario.name, () => {
      const inserted = [];
      const existingEvent = { event: "existing-application-event" };
      const dataLayer = [existingEvent];
      const firstScript = {
        parentNode: {
          insertBefore: (script, before) => {
            assert.equal(before, firstScript);
            inserted.push(script);
          },
        },
      };
      const context = {
        dataLayer,
        document: {
          getElementsByTagName: (tag) => {
            assert.equal(tag, "script");
            return [firstScript];
          },
          createElement: (tag) => {
            assert.equal(tag, "script");
            return {};
          },
        },
      };
      context.window = context;
      if ("gateway" in scenario) context.google_tags_first_party = scenario.gateway;

      runInNewContext(consentDefaults, context);
      const consent = dataLayer[1];
      runInNewContext(bootstrap, context);
      assert.equal(inserted.length, 0, "registering the loader must not download GTM");
      assert.equal(dataLayer.length, 2, "registering the loader must not initialize GTM");
      context.EmitronixLoadGoogleTagManager();
      context.EmitronixLoadGoogleTagManager();

      assert.equal(context.dataLayer, dataLayer, "existing queued events must survive");
      assert.equal(dataLayer[0], existingEvent);
      assert.equal(dataLayer[1], consent, "consent defaults must remain ahead of tag initialization");
      assert.equal(consent[0], "consent");
      assert.equal(consent[1], "default");
      assert.equal(consent[2].analytics_storage, "denied");
      assert.equal(consent[2].ad_storage, "denied");
      assert.equal(inserted.length, scenario.scripts);
      assert.equal(dataLayer.filter((entry) => entry.event === "gtm.js").length, scenario.scripts);
      if (scenario.scripts) {
        assert.equal(inserted[0].src, `https://www.googletagmanager.com/gtm.js?id=${containerId}`);
        assert.equal(inserted[0].async, true);
      }
    });
  }
});

async function googleConsentHarness(storedRecord = null) {
  const [layout, manager] = await Promise.all([
    readFile(new URL("../components/SiteRootLayout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../components/CookieConsentManager.tsx", import.meta.url), "utf8"),
  ]);
  const bootstrap = layout.match(/const googleTagManagerBootstrap = `([\s\S]*?)`;/)?.[1]
    .replace("${JSON.stringify(googleTagManagerId)}", JSON.stringify("GTM-TEST123"));
  const defaults = layout.match(/id="emitronix-google-consent-default"[\s\S]*?__html: `([\s\S]*?)`/)?.[1];
  assert.ok(bootstrap);
  assert.ok(defaults);
  const functions = ["getLocalStorageValue", "getCookieValue", "getStoredConsent", "updateGoogleConsent", "loadGrantedIntegrationScripts"]
    .map((name) => {
      const source = manager.match(new RegExp(`function ${name}\\([\\s\\S]*?\\n\\}`))?.[0];
      assert.ok(source, `exercise the actual ${name} implementation`);
      return source;
    }).join("\n");
  const inserted = [];
  const chatCalls = [];
  const context = {
    dataLayer: [],
    cookieCategoryIds,
    CONSENT_STORAGE_KEY: "emitronix_cookie_consent",
    localStorage: { getItem: () => storedRecord === null ? null : JSON.stringify(storedRecord) },
    restoreActiveTrackingGuard: null,
    consentReloadScheduled: false,
    integrationIds: {},
    extraScripts: {},
    loadExtraScripts: () => {},
    loadSalesIqWidget: (categories) => chatCalls.push(categories),
    document: {
      cookie: "",
      getElementsByTagName: () => [{ parentNode: { insertBefore: (script) => inserted.push(script) } }],
      createElement: () => ({}),
    },
  };
  context.window = context;
  runInNewContext(defaults, context);
  runInNewContext(bootstrap, context);
  runInNewContext(ts.transpileModule(functions, { compilerOptions: { target: ts.ScriptTarget.ES2020 } }).outputText, context);
  return { context, inserted, chatCalls, manager };
}

test("Google scripts require analytics or marketing and preserve each Consent Mode category", async (t) => {
  for (const scenario of [
    { name: "all optional consent denied", categories: rejected, expected: 0 },
    { name: "functional consent alone", categories: { ...rejected, functional: true }, expected: 0 },
    { name: "performance consent alone", categories: { ...rejected, performance: true }, expected: 0 },
    { name: "analytics only", categories: { ...rejected, analytics: true }, expected: 1 },
    { name: "marketing only", categories: { ...rejected, marketing: true }, expected: 1 },
    { name: "all optional consent granted", categories: accepted, expected: 1 },
  ]) {
    await t.test(scenario.name, async () => {
      const { context, inserted, chatCalls } = await googleConsentHarness();
      assert.equal(inserted.length, 0);
      context.updateGoogleConsent(scenario.categories);
      context.loadGrantedIntegrationScripts(scenario.categories);
      context.loadGrantedIntegrationScripts(scenario.categories);
      assert.equal(inserted.length, scenario.expected);
      assert.equal(chatCalls.length, 2, "essential chat remains available for every choice");
      const update = context.dataLayer[1];
      assert.equal(update[0], "consent");
      assert.equal(update[1], "update");
      assert.equal(update[2].analytics_storage, scenario.categories.analytics ? "granted" : "denied");
      for (const key of ["ad_storage", "ad_user_data", "ad_personalization"]) {
        assert.equal(update[2][key], scenario.categories.marketing ? "granted" : "denied");
      }
      assert.equal(context.dataLayer.filter((entry) => entry.event === "gtm.js").length, scenario.expected);
      if (scenario.expected) assert.equal(context.dataLayer[2].event, "gtm.js", "update must precede initialization");
    });
  }
});

test("only a valid stored Google consent grant can activate the initial visit", async (t) => {
  const valid = {
    version: defaultCookieConsentConfig.version,
    categories: accepted,
    language: "en",
    expiresAt: new Date(Date.now() + 86400000).toISOString(),
  };
  for (const scenario of [
    { name: "no stored choice", record: null, expected: 0 },
    { name: "stored acceptance", record: valid, expected: 1 },
    { name: "stored rejection", record: { ...valid, categories: rejected }, expected: 0 },
    { name: "expired acceptance", record: { ...valid, expiresAt: "2000-01-01T00:00:00.000Z" }, expected: 0 },
    { name: "obsolete version acceptance", record: { ...valid, version: valid.version - 1 }, expected: 0 },
  ]) {
    await t.test(scenario.name, async () => {
      const { context, inserted, manager } = await googleConsentHarness(scenario.record);
      assert.equal(
        manager.match(/updateGoogleConsent\(stored\.categories\);\s+loadGrantedIntegrationScripts\(stored\.categories\);/g)?.length,
        2,
        "both config-success and config-fallback paths update before loading",
      );
      const stored = context.getStoredConsent(defaultCookieConsentConfig);
      if (stored) {
        context.updateGoogleConsent(stored.categories);
        context.loadGrantedIntegrationScripts(stored.categories);
      }
      assert.equal(inserted.length, scenario.expected);
    });
  }
});

test("Google consent withdrawal updates denial and schedules reload without reactivating tags", async () => {
  const { context, inserted } = await googleConsentHarness();
  context.updateGoogleConsent(accepted);
  context.loadGrantedIntegrationScripts(accepted);
  const calls = [];
  const transition = applyConsentTransition({
    previousCategories: accepted,
    nextCategories: rejected,
    prepareRevocation: () => calls.push("guard"),
    updateConsent: (categories) => {
      context.updateGoogleConsent(categories);
      calls.push("update");
    },
    persistConsent: () => calls.push("persist"),
    clearRevokedState: () => calls.push("cleanup"),
    loadGrantedScripts: () => calls.push("load"),
    scheduleReload: () => calls.push("reload"),
  });
  assert.equal(transition.reloadScheduled, true);
  assert.deepEqual(calls, ["guard", "update", "persist", "cleanup", "reload"]);
  assert.equal(inserted.length, 1);
  assert.equal(context.dataLayer.at(-1)[2].analytics_storage, "denied");
  assert.equal(context.dataLayer.at(-1)[2].ad_storage, "denied");
});

test("SalesIQ initializes essential chat while respecting live visitor tracking consent", async () => {
  const consentManager = await readFile(
    new URL("../components/CookieConsentManager.tsx", import.meta.url),
    "utf8",
  );

  assert.match(consentManager, /api\.privacy\?\.updateCookieConsent\?\.\(cookieConsent\)/);
  assert.match(consentManager, /getSalesIqRuntimePrivacy\(categories\)\.visitorTracking/);
  assert.match(consentManager, /api\.tracking\?\.on\?\.\(\)/);
  assert.match(consentManager, /api\.tracking\?\.off\?\.\(\)/);
  assert.match(
    consentManager,
    /salesiq\.ready = \(\) => \{[\s\S]*?syncSalesIqTracking\(\);/,
  );
  assert.match(
    consentManager,
    /salesiq\.afterReady = \(\.\.\.args: unknown\[\]\) => \{[\s\S]*?syncSalesIqCookieConsent\(\);[\s\S]*?syncSalesIqTracking\(\);[\s\S]*?syncSalesIqPageContext\(\);/,
  );
  assert.match(
    consentManager,
    /function syncSalesIqPrivacyState\(\) \{[\s\S]*?syncSalesIqCookieConsent\(\);[\s\S]*?syncSalesIqTracking\(\);[\s\S]*?\}/,
  );
  assert.match(
    consentManager,
    /if \(revoked\.analytics \|\| revoked\.performance\) \{[\s\S]*?syncSalesIqPrivacyState\(\);/,
  );
  assert.doesNotMatch(consentManager, /function clearSalesIqState\(\)/);
  assert.doesNotMatch(consentManager, /if \(revoked\.functional\) \{/);
  assert.match(
    consentManager,
    /if \(!privacy\?\.visitorTracking && !salesIqOpenRequested\) return;/,
  );
  assert.match(consentManager, /if \(opened\) salesIqOpenRequested = false;/);
  assert.match(
    consentManager,
    /if \(salesIqOpenRequested\) \{[\s\S]*?window\.EmitronixJyothika\?\.open\(\);/,
  );
});

test("SalesIQ configures operator waiting and unavailable fallback messages", async () => {
  const consentManager = await readFile(
    new URL("../components/CookieConsentManager.tsx", import.meta.url),
    "utf8",
  );

  assert.match(consentManager, /chat\?: \{[\s\S]*?systemmessages\?:/);
  assert.match(
    consentManager,
    /waiting: "Please wait while I connect you with our team\."/,
  );
  assert.match(
    consentManager,
    /offlinecomplete:[\s\S]*?Our team is currently offline\./,
  );
  assert.match(
    consentManager,
    /salesiq\.ready = \(\) => \{[\s\S]*?syncSalesIqSystemMessages\(\);/,
  );
});

test("SalesIQ loader removes a failed script so the launcher can retry", async () => {
  const consentManager = await readFile(
    new URL("../components/CookieConsentManager.tsx", import.meta.url),
    "utf8",
  );

  assert.match(consentManager, /script\.onerror = onError/);
  assert.match(
    consentManager,
    /function handleSalesIqScriptError\(\) \{[\s\S]*?document\.getElementById\(SALESIQ_SCRIPT_ID\)\?\.remove\(\);[\s\S]*?salesIqOpenRequested = false;/,
  );
  assert.match(
    consentManager,
    /injectScript\([\s\S]*?SALESIQ_SCRIPT_ID,[\s\S]*?SALESIQ_WIDGET_URL,[\s\S]*?syncSalesIqPageContext,[\s\S]*?handleSalesIqScriptError,[\s\S]*?\);/,
  );
});

test("CSP permits the SalesIQ tracking socket without allowing arbitrary WebSockets", async () => {
  const config = await readFile(new URL("../next.config.ts", import.meta.url), "utf8");
  const connectDirective = config.match(/`connect-src ([^`]+)`/)?.[1];

  assert.ok(connectDirective, "the enforced connect-src directive must exist");
  assert.equal(
    connectDirective,
    "'self' https: wss://vts.zohopublic.com${isDevelopment ? \" ws:\" : \"\"}",
  );
  assert.doesNotMatch(connectDirective, /(?:^|\s)wss:(?:\s|$)|wss:\/\/\*/);
  assert.match(config, /key: "Content-Security-Policy"/);
  assert.match(config, /"object-src 'none'"/);
  assert.match(config, /"frame-ancestors 'self'"/);
});

test("floating action opens Zoho chat instead of the call button", async () => {
  const [floatingActions, consentManager] = await Promise.all([
    readFile(new URL("../components/FloatingActions.tsx", import.meta.url), "utf8"),
    readFile(new URL("../components/CookieConsentManager.tsx", import.meta.url), "utf8"),
  ]);

  assert.match(floatingActions, /Open Emitronix Zoho chatbot/);
  assert.match(floatingActions, /Live Chat/);
  assert.match(floatingActions, /emitronix:request-zoho-chat/);
  assert.equal(/Call Now/.test(floatingActions), false);
  assert.equal(/href=\{`tel:/.test(floatingActions), false);
  assert.match(consentManager, /SALESIQ_DEVELOPMENT_HOSTS = \["localhost", "127\.0\.0\.1", "::1"\]/);
  assert.match(consentManager, /window\.addEventListener\(CHAT_REQUEST_EVENT, requestChat\)/);
  assert.match(
    consentManager,
    /const categories = appliedCategoriesRef\.current \|\| getDefaultConsentCategories\(\);[\s\S]*?loadSalesIqWidget\(categories\);[\s\S]*?window\.EmitronixJyothika\?\.open\(\);/,
  );
  assert.doesNotMatch(consentManager, /requestChat[\s\S]*?openSettings\(\);/);
});

test("cookie notice discloses essential chat and analytics-gated Live View", async () => {
  const defaults = await readFile(
    new URL("../data/cookieConsentDefaults.ts", import.meta.url),
    "utf8",
  );

  assert.match(defaults, /version: 3/);
  assert.match(defaults, /on-demand Zoho SalesIQ live-chat channel/);
  assert.match(defaults, /SalesIQ visitor analytics remain disabled unless Analytics is allowed/);
  assert.match(defaults, /Live View tracking, page context and proactive chat actions are enabled only when Analytics is allowed/);
});

test("stored version 2 configuration migrates the SalesIQ privacy disclosure", () => {
  const legacyConfig = structuredClone(defaultCookieConsentConfig);
  legacyConfig.version = 2;
  legacyConfig.banner.description.en = "Legacy custom banner";
  legacyConfig.categories.find((category) => category.id === "necessary").description.en =
    "Legacy necessary description";
  legacyConfig.categories.find((category) => category.id === "analytics").title.en =
    "Usage Insights";
  legacyConfig.policyPages.cookiePolicy.en.sections =
    legacyConfig.policyPages.cookiePolicy.en.sections.filter(
      (section) => section.heading !== "Live chat and visitor visibility",
    );

  const migrated = normalizeCookieConsentConfig(legacyConfig);

  assert.equal(migrated.version, 3);
  assert.equal(migrated.updatedAt, defaultCookieConsentConfig.updatedAt);
  assert.equal(
    migrated.banner.description.en,
    defaultCookieConsentConfig.banner.description.en,
  );
  assert.equal(
    migrated.categories.find((category) => category.id === "necessary").description.en,
    defaultCookieConsentConfig.categories.find((category) => category.id === "necessary").description.en,
  );
  assert.equal(
    migrated.categories.find((category) => category.id === "analytics").title.en,
    "Usage Insights",
  );
  assert.equal(
    migrated.policyPages.cookiePolicy.en.sections.filter(
      (section) => section.heading === "Live chat and visitor visibility",
    ).length,
    1,
  );
});
