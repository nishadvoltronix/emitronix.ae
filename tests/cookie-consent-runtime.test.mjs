import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  applyConsentTransition,
  getSalesIqRuntimePrivacy,
  scheduleReloadAfterConsentUpdate,
  shouldBlockRevokedTrackingRequest,
} from "../lib/cookieConsentRuntime.ts";
import {
  defaultCookieConsentConfig,
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

test("standard GTM bootstrap and noscript exist once without a consent-loader duplicate", async () => {
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
  assert.equal(layout.match(/googletagmanager\.com\/ns\.html/g)?.length, 1);
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
