"use client";

import { Check, ChevronRight, Cookie, Settings2, ShieldCheck, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import {
  cookieCategoryIds,
  defaultCookieConsentConfig,
  getAllConsentCategories,
  getDefaultConsentCategories,
  getRejectedConsentCategories,
  type ConsentCategoryMap,
  type CookieCategory,
  type CookieCategoryId,
  type CookieConsentConfig,
  type CookieLanguage,
} from "@/data/cookieConsentDefaults";
import {
  applyConsentTransition,
  getSalesIqRuntimePrivacy,
  scheduleReloadAfterConsentUpdate,
  shouldBlockRevokedTrackingRequest,
  type RevokedConsentCategories,
  type SalesIqCookieCategory,
} from "@/lib/cookieConsentRuntime";

type StoredConsent = {
  version: number;
  categories: ConsentCategoryMap;
  language: CookieLanguage;
  updatedAt: string;
  expiresAt: string;
};

type ConsentAction = "accept_all" | "reject_non_essential" | "customize" | "save_preferences";

type QueuedTrackingFunction = ((...args: unknown[]) => void) & {
  callMethod?: (...args: unknown[]) => void;
  queue?: unknown[];
  loaded?: boolean;
  version?: string;
  q?: unknown[];
};

type SalesIqVisibilityState = "show" | "hide";
type SalesIqSystemMessage =
  | "waiting"
  | "offlinecomplete"
  | "busy"
  | "busycomplete"
  | "engaged"
  | "engagedcomplete";

type ZohoSalesIqApi = {
  ready?: () => void;
  afterReady?: (...args: unknown[]) => void;
  floatbutton?: {
    visible?: (state: SalesIqVisibilityState) => void;
    click?: () => void;
  };
  floatwindow?: {
    visible?: (state: SalesIqVisibilityState) => void;
  };
  chatwindow?: {
    visible?: (state: SalesIqVisibilityState) => void;
  };
  chat?: {
    systemmessages?: (messages: Partial<Record<SalesIqSystemMessage, string>>) => void;
  };
  visitor?: {
    info?: (details: Record<string, string>) => void;
    customaction?: (action: string) => void;
  };
  privacy?: {
    updateCookieConsent?: (categories: SalesIqCookieCategory[]) => void;
  };
  tracking?: {
    on?: () => void;
    off?: () => void;
  };
};

type EmitronixJyothikaApi = {
  open: () => boolean;
  hide: () => void;
  refreshPageContext: () => void;
  isReady: () => boolean;
};

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    EmitronixLoadGoogleTagManager?: () => void;
    fbq?: QueuedTrackingFunction;
    _fbq?: unknown;
    _linkedin_partner_id?: string;
    _linkedin_data_partner_ids?: string[];
    clarity?: QueuedTrackingFunction;
    hj?: QueuedTrackingFunction;
    _hjSettings?: { hjid: number; hjsv: number };
    $zoho?: {
      salesiq?: ZohoSalesIqApi;
    };
    EmitronixJyothika?: EmitronixJyothikaApi;
  }
}

const CONSENT_STORAGE_KEY = "emitronix_cookie_consent";
const LANGUAGE_STORAGE_KEY = "emitronix_language";
const SETTINGS_EVENT = "emitronix:open-cookie-settings";
const CHAT_REQUEST_EVENT = "emitronix:request-zoho-chat";
let restoreActiveTrackingGuard: (() => void) | null = null;
let consentReloadScheduled = false;

const integrationIds = {
  meta: process.env.NEXT_PUBLIC_META_PIXEL_ID,
  linkedin: process.env.NEXT_PUBLIC_LINKEDIN_PARTNER_ID,
  clarity: process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID,
  hotjar: process.env.NEXT_PUBLIC_HOTJAR_ID,
};

function parseScriptUrls(value: string | undefined) {
  return (value || "")
    .split(",")
    .map((item) => item.trim())
    .filter((item) => /^https:\/\//i.test(item));
}

const extraScripts = {
  analytics: parseScriptUrls(process.env.NEXT_PUBLIC_COOKIE_ANALYTICS_SCRIPT_URLS),
  marketing: parseScriptUrls(process.env.NEXT_PUBLIC_COOKIE_MARKETING_SCRIPT_URLS),
  functional: parseScriptUrls(process.env.NEXT_PUBLIC_COOKIE_FUNCTIONAL_SCRIPT_URLS),
  performance: parseScriptUrls(process.env.NEXT_PUBLIC_COOKIE_PERFORMANCE_SCRIPT_URLS),
};

const SALESIQ_WIDGET_URL =
  "https://salesiq.zohopublic.com/widget?wc=siq1f4b2e5df11f8540e8c42cce8cfbf087ee91508d4eaaccfbcd68dc760569131fdba231f665cae37d10855c73a0668462";
const SALESIQ_SCRIPT_ID = "zsiqscript";
const SALESIQ_ALLOWED_HOSTS = ["emitronix.ae", "www.emitronix.ae"];
const SALESIQ_DEVELOPMENT_HOSTS = ["localhost", "127.0.0.1", "::1"];
const SALESIQ_EXCLUDED_PATHS = ["/admin", "/api", "/dashboard", "/preview", "/_next"];
const SALESIQ_PROACTIVE_ACTION = "emitronix_proactive";
const SALESIQ_PROACTIVE_DELAY_MS = 10000;
const SALESIQ_PROACTIVE_KEY = "emitronix_salesiq_proactive_v1";
const SALESIQ_SYSTEM_MESSAGES: Partial<Record<SalesIqSystemMessage, string>> = {
  waiting: "Please wait while I connect you with our team.",
  offlinecomplete:
    "Our team is currently offline. Please leave your name, mobile number and enquiry, and we will contact you shortly.",
  busy:
    "Our team could not accept the chat in time. Please leave your name, mobile number and enquiry, and we will contact you shortly.",
  busycomplete:
    "Thank you. Our team will review your enquiry and contact you shortly.",
  engaged:
    "Our team is currently assisting other visitors. Please leave your name, mobile number and enquiry, and we will contact you shortly.",
  engagedcomplete:
    "Thank you. Our team will review your enquiry and contact you shortly.",
};
let salesIqProactiveFiredInMemory = false;
let salesIqOpenRequested = false;
let salesIqReadyHandlerInstalled = false;
let salesIqConsentCategories: ConsentCategoryMap | null = null;
let salesIqReadyFired = false;
let salesIqAfterReadyFired = false;

function getLocalStorageValue(key: string) {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function setLocalStorageValue(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Consent Mode is already updated before persistence is attempted. The
    // first-party consent cookie remains available as a storage fallback.
  }
}

function getCookieValue(name: string) {
  if (typeof document === "undefined") return null;
  try {
    const match = document.cookie
      .split("; ")
      .find((row) => row.startsWith(`${name}=`));
    return match ? decodeURIComponent(match.split("=").slice(1).join("=")) : null;
  } catch {
    return null;
  }
}

function setConsentCookie(consent: StoredConsent, expiryDays: number) {
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  const maxAge = Math.max(1, expiryDays) * 24 * 60 * 60;
  try {
    document.cookie = `${CONSENT_STORAGE_KEY}=${encodeURIComponent(JSON.stringify(consent))}; Max-Age=${maxAge}; Path=/; SameSite=Lax${secure}`;
  } catch {
    // Some privacy modes block cookie writes. The in-memory consent state and
    // Consent Mode update still take effect for the current document.
  }
}

function detectLanguage(): CookieLanguage {
  const stored = getLocalStorageValue(LANGUAGE_STORAGE_KEY);
  if (stored === "ar" || stored === "en") return stored;
  if (window.location.pathname === "/ar" || window.location.pathname.startsWith("/ar/")) return "ar";
  const htmlLang = document.documentElement.lang.toLowerCase();
  if (htmlLang.startsWith("ar")) return "ar";
  return window.navigator.language.toLowerCase().startsWith("ar") ? "ar" : "en";
}

function getStoredConsent(config: CookieConsentConfig): StoredConsent | null {
  const parseStoredConsent = (raw: string | null): StoredConsent | null => {
    if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<StoredConsent>;
    if (!parsed.expiresAt || !parsed.categories || parsed.version !== config.version) return null;
    if (new Date(parsed.expiresAt).getTime() <= Date.now()) return null;
    return {
      version: parsed.version,
      categories: cookieCategoryIds.reduce((result, id) => {
        result[id] = id === "necessary" ? true : parsed.categories?.[id] === true;
        return result;
      }, {} as ConsentCategoryMap),
      language: parsed.language === "ar" ? "ar" : "en",
      updatedAt: parsed.updatedAt || new Date().toISOString(),
      expiresAt: parsed.expiresAt,
    };
  } catch {
    return null;
  }
  };

  return (
    parseStoredConsent(getLocalStorageValue(CONSENT_STORAGE_KEY)) ||
    parseStoredConsent(getCookieValue(CONSENT_STORAGE_KEY))
  );
}

function isCategoryEnabled(category: CookieCategory) {
  return category.required || category.enabled;
}

function buildConsentRecord(config: CookieConsentConfig, language: CookieLanguage, categories: ConsentCategoryMap): StoredConsent {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + config.consentExpiryDays * 24 * 60 * 60 * 1000);
  return {
    version: config.version,
    categories: cookieCategoryIds.reduce((result, id) => {
      const category = config.categories.find((item) => item.id === id);
      result[id] = id === "necessary" ? true : Boolean(category?.enabled && categories[id]);
      return result;
    }, {} as ConsentCategoryMap),
    language,
    updatedAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
  };
}

function updateGoogleConsent(categories: ConsentCategoryMap) {
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function gtag(...args: unknown[]) {
    window.dataLayer?.push(args);
  };

  window.gtag("consent", "update", {
    ad_storage: categories.marketing ? "granted" : "denied",
    analytics_storage: categories.analytics ? "granted" : "denied",
    ad_user_data: categories.marketing ? "granted" : "denied",
    ad_personalization: categories.marketing ? "granted" : "denied",
    functionality_storage: categories.functional ? "granted" : "denied",
    personalization_storage: categories.functional ? "granted" : "denied",
    security_storage: "granted",
  });
}

function injectScript(
  id: string,
  src: string,
  onLoad?: () => void,
  onError?: () => void,
) {
  if (document.getElementById(id)) {
    onLoad?.();
    return;
  }

  const script = document.createElement("script");
  script.id = id;
  script.async = true;
  script.src = src;
  if (onLoad) script.onload = onLoad;
  if (onError) script.onerror = onError;
  document.head.appendChild(script);
}

function loadExtraScripts(prefix: string, urls: string[]) {
  urls.forEach((url, index) => injectScript(`${prefix}-${index}`, url));
}

function cleanSalesIqPath(pathname: string) {
  const path = pathname.charAt(0) === "/" ? pathname : `/${pathname}`;
  return path.replace(/^\/(?:en|ar)(?=\/|$)/i, "") || "/";
}

function salesIqPathIsExcluded(pathname: string) {
  const path = cleanSalesIqPath(pathname).replace(/\/+$/, "") || "/";
  return SALESIQ_EXCLUDED_PATHS.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));
}

function salesIqLocationIsAllowed() {
  const hostname = window.location.hostname.toLowerCase();
  const isLocalDevelopment =
    process.env.NODE_ENV !== "production" && SALESIQ_DEVELOPMENT_HOSTS.includes(hostname);

  return (
    (SALESIQ_ALLOWED_HOSTS.includes(hostname) || isLocalDevelopment) &&
    !salesIqPathIsExcluded(window.location.pathname)
  );
}

function salesIqPublicPageUrl() {
  return `${window.location.origin}${window.location.pathname}`;
}

function getSafeReferrerOrigin() {
  if (!document.referrer) return "";
  try {
    return new URL(document.referrer).origin;
  } catch {
    return "";
  }
}

function getSalesIqApi() {
  return window.$zoho?.salesiq;
}

function setSalesIqFloatButtonVisibility(state: SalesIqVisibilityState) {
  try {
    getSalesIqApi()?.floatbutton?.visible?.(state);
  } catch {
    // The custom Emitronix launcher remains visible even if the provider API is unavailable.
  }
}

function syncSalesIqPageContext() {
  const api = getSalesIqApi();
  if (!api) return;

  setSalesIqFloatButtonVisibility("hide");
  if (!salesIqLocationIsAllowed()) return;

  const privacy = salesIqConsentCategories
    ? getSalesIqRuntimePrivacy(salesIqConsentCategories)
    : null;
  if (!privacy?.visitorTracking && !salesIqOpenRequested) return;

  try {
    api.visitor?.info?.({
      "Page URL": salesIqPublicPageUrl(),
      "Page Path": window.location.pathname,
      "Page Title": document.title,
      Referrer: getSafeReferrerOrigin(),
    });
  } catch {
    // Page context is helpful for agents, but chat availability must not depend on it.
  }
}

function openSalesIqWindow() {
  const api = getSalesIqApi();
  if (!api || !salesIqLocationIsAllowed()) return false;

  syncSalesIqPageContext();
  let opened = false;
  try {
    if (api.floatwindow?.visible) {
      api.floatwindow.visible("show");
      opened = true;
    }
  } catch {
    // Try the alternate chat window API below.
  }
  try {
    if (api.chatwindow?.visible) {
      api.chatwindow.visible("show");
      opened = true;
    }
  } catch {
    // Some SalesIQ accounts expose only floatwindow.
  }
  try {
    if (api.floatbutton?.click) {
      api.floatbutton.click();
      opened = true;
    }
  } catch {
    // Keep using the visible window APIs when click is unavailable.
  }
  setSalesIqFloatButtonVisibility("hide");
  if (opened) salesIqOpenRequested = false;
  return opened;
}

function hideSalesIqWidget() {
  try {
    getSalesIqApi()?.floatwindow?.visible?.("hide");
  } catch {
    // Continue hiding any other exposed widget controls.
  }
  try {
    getSalesIqApi()?.chatwindow?.visible?.("hide");
  } catch {
    // Continue hiding the native floating button.
  }
  setSalesIqFloatButtonVisibility("hide");
}

function fireSalesIqProactiveActionOnce() {
  const api = getSalesIqApi();
  const categories = salesIqConsentCategories;
  if (
    !salesIqLocationIsAllowed() ||
    !categories ||
    !getSalesIqRuntimePrivacy(categories).visitorTracking ||
    !api?.visitor?.customaction
  ) {
    return;
  }

  try {
    if (window.sessionStorage.getItem(SALESIQ_PROACTIVE_KEY) === "1") return;
    window.sessionStorage.setItem(SALESIQ_PROACTIVE_KEY, "1");
  } catch {
    if (salesIqProactiveFiredInMemory) return;
    salesIqProactiveFiredInMemory = true;
  }

  try {
    api.visitor.customaction(SALESIQ_PROACTIVE_ACTION);
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: "emitronix_salesiq_proactive",
      event_source: "jyothika_embed",
    });
  } catch {
    // Ignore provider errors so the page stays usable.
  }
}

function syncSalesIqCookieConsent() {
  const api = getSalesIqApi();
  const categories = salesIqConsentCategories;
  if (!api || !categories) return;

  const { cookieConsent } = getSalesIqRuntimePrivacy(categories);

  try {
    api.privacy?.updateCookieConsent?.(cookieConsent);
  } catch {
    // Chat remains available even if SalesIQ rejects a cookie preference update.
  }
}

function syncSalesIqTracking() {
  const api = getSalesIqApi();
  const categories = salesIqConsentCategories;
  if (!api || !categories) return;

  try {
    // Live View records visitor activity, so it remains behind Analytics
    // consent. The live-chat transport is initialized independently below.
    if (getSalesIqRuntimePrivacy(categories).visitorTracking) {
      api.tracking?.on?.();
    } else {
      api.tracking?.off?.();
    }
  } catch {
    // Tracking consent must not affect the visitor's ability to use the website.
  }
}

function syncSalesIqPrivacyState() {
  // Zoho applies cookie preferences asynchronously. Always write the privacy
  // state before reconciling Live View so an approved session stays enabled.
  if (salesIqAfterReadyFired) syncSalesIqCookieConsent();
  if (salesIqReadyFired) syncSalesIqTracking();
}

function syncSalesIqSystemMessages() {
  try {
    getSalesIqApi()?.chat?.systemmessages?.(SALESIQ_SYSTEM_MESSAGES);
  } catch {
    // The published Zobot fallback remains authoritative if this optional API is unavailable.
  }
}

function handleSalesIqScriptError() {
  document.getElementById(SALESIQ_SCRIPT_ID)?.remove();
  salesIqReadyFired = false;
  salesIqAfterReadyFired = false;

  // Keep the public launcher available. A later click can retry the provider
  // script instead of being trapped behind a stale failed script element.
  salesIqOpenRequested = false;
}

function loadSalesIqWidget(categories: ConsentCategoryMap) {
  salesIqConsentCategories = categories;
  const zohoContainer = (window.$zoho = window.$zoho || {});
  const salesiq = (zohoContainer.salesiq = zohoContainer.salesiq || {});

  window.EmitronixJyothika = {
    open: () => {
      salesIqOpenRequested = true;
      if (openSalesIqWindow()) return true;
      if (document.getElementById(SALESIQ_SCRIPT_ID)) return true;
      return false;
    },
    hide: hideSalesIqWidget,
    refreshPageContext: syncSalesIqPageContext,
    isReady: () => Boolean(getSalesIqApi()?.visitor || getSalesIqApi()?.floatwindow || getSalesIqApi()?.chatwindow),
  };

  if (!salesIqLocationIsAllowed()) {
    hideSalesIqWidget();
    return;
  }

  if (!salesIqReadyHandlerInstalled) {
    const previousReady = salesiq.ready;
    const previousAfterReady = salesiq.afterReady;
    salesiq.ready = () => {
      if (typeof previousReady === "function") previousReady();
      salesIqReadyFired = true;
      syncSalesIqSystemMessages();
      syncSalesIqTracking();
      syncSalesIqPageContext();
      if (salesIqOpenRequested) openSalesIqWindow();
      window.setTimeout(fireSalesIqProactiveActionOnce, SALESIQ_PROACTIVE_DELAY_MS);
    };
    salesiq.afterReady = (...args: unknown[]) => {
      if (typeof previousAfterReady === "function") previousAfterReady(...args);
      salesIqAfterReadyFired = true;
      syncSalesIqCookieConsent();
      // Zoho applies its privacy state during afterReady. Reconcile tracking
      // afterwards so an approved Live View session is not left disabled by
      // the provider's initialization order.
      syncSalesIqTracking();
      syncSalesIqPageContext();
    };
    salesIqReadyHandlerInstalled = true;
  }

  if (
    document.getElementById(SALESIQ_SCRIPT_ID) ||
    document.querySelector(`script[src^="${SALESIQ_WIDGET_URL.split("?")[0]}"]`)
  ) {
    syncSalesIqPrivacyState();
    syncSalesIqPageContext();
    return;
  }

  injectScript(
    SALESIQ_SCRIPT_ID,
    SALESIQ_WIDGET_URL,
    syncSalesIqPageContext,
    handleSalesIqScriptError,
  );
}

function loadGrantedIntegrationScripts(categories: ConsentCategoryMap) {
  // This is normally a no-op because a successful downgrade reloads the page.
  // If navigation was blocked, a later grant must restore the old document's
  // temporary transport wrappers before activating allowed integrations.
  restoreActiveTrackingGuard?.();
  consentReloadScheduled = false;

  // Consent Mode is updated before this function runs. Keep Google analytics
  // and ads off the network until one of their own categories is granted.
  if (categories.analytics || categories.marketing) {
    window.EmitronixLoadGoogleTagManager?.();
  }

  if (categories.marketing && integrationIds.meta) {
    if (!document.getElementById("emitronix-meta-pixel")) {
      if (!window.fbq) {
        const queuedFbq: QueuedTrackingFunction = (...args: unknown[]) => {
          if (queuedFbq.callMethod) {
            queuedFbq.callMethod(...args);
          } else {
            queuedFbq.queue?.push(args);
          }
        };
        queuedFbq.queue = [];
        queuedFbq.loaded = true;
        queuedFbq.version = "2.0";
        window.fbq = queuedFbq;
        window._fbq = queuedFbq;
      }
      window.fbq("init", integrationIds.meta);
      window.fbq("track", "PageView");
      injectScript("emitronix-meta-pixel", "https://connect.facebook.net/en_US/fbevents.js");
    }
  }

  if (categories.marketing && integrationIds.linkedin) {
    window._linkedin_partner_id = integrationIds.linkedin;
    window._linkedin_data_partner_ids = window._linkedin_data_partner_ids || [];
    if (!window._linkedin_data_partner_ids.includes(integrationIds.linkedin)) {
      window._linkedin_data_partner_ids.push(integrationIds.linkedin);
    }
    injectScript("emitronix-linkedin-insight", "https://snap.licdn.com/li.lms-analytics/insight.min.js");
  }

  if ((categories.analytics || categories.performance) && integrationIds.clarity) {
    window.clarity = window.clarity || function clarity(...args: unknown[]) {
      window.clarity = window.clarity || clarity;
      window.clarity.q = window.clarity.q || [];
      window.clarity.q.push(args);
    };
    try {
      window.clarity("consentv2", {
        ad_Storage: categories.marketing ? "granted" : "denied",
        analytics_Storage:
          categories.analytics || categories.performance ? "granted" : "denied",
      });
    } catch {
      // A provider error must not prevent the remaining consented integrations
      // from loading.
    }
    injectScript("emitronix-clarity", `https://www.clarity.ms/tag/${encodeURIComponent(integrationIds.clarity)}`);
  }

  if ((categories.analytics || categories.performance) && integrationIds.hotjar && Number.isFinite(Number(integrationIds.hotjar))) {
    const hotjarId = Number(integrationIds.hotjar);
    window._hjSettings = { hjid: hotjarId, hjsv: 6 };
    window.hj = window.hj || function hj(...args: unknown[]) {
      window.hj = window.hj || hj;
      window.hj.q = window.hj.q || [];
      window.hj.q.push(args);
    };
    injectScript("emitronix-hotjar", `https://static.hotjar.com/c/hotjar-${hotjarId}.js?sv=6`);
  }

  if (categories.analytics) loadExtraScripts("emitronix-extra-analytics", extraScripts.analytics);
  if (categories.marketing) loadExtraScripts("emitronix-extra-marketing", extraScripts.marketing);
  if (categories.functional) {
    loadExtraScripts("emitronix-extra-functional", extraScripts.functional);
  }
  // On-demand chat is a core contact channel. SalesIQ receives an empty
  // optional-cookie preference and tracking.off() until Analytics is granted.
  loadSalesIqWidget(categories);
  if (categories.performance) loadExtraScripts("emitronix-extra-performance", extraScripts.performance);
}

function getCookieNames() {
  try {
    return document.cookie
      .split(";")
      .map((item) => item.trim().split("=")[0])
      .filter(Boolean);
  } catch {
    return [];
  }
}

function getCookieDomains() {
  const hostname = window.location.hostname;
  if (!hostname || hostname === "localhost" || /^[\d.:]+$/.test(hostname)) return [null];

  const parts = hostname.split(".");
  const registrableDomain = parts.length > 1 ? parts.slice(-2).join(".") : hostname;
  return Array.from(new Set<null | string>([null, hostname, `.${registrableDomain}`]));
}

function expireCookies(cookieNamePatterns: RegExp[]) {
  const secure = window.location.protocol === "https:" ? "; Secure" : "";

  getCookieNames()
    .filter((name) => cookieNamePatterns.some((pattern) => pattern.test(name)))
    .forEach((name) => {
      getCookieDomains().forEach((domain) => {
        const domainAttribute = domain ? `; Domain=${domain}` : "";
        try {
          document.cookie = `${name}=; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Path=/; SameSite=Lax${secure}${domainAttribute}`;
        } catch {
          // Continue clearing any other visible tracking identifiers.
        }
      });
    });
}

function clearRevokedTrackingState(
  revoked: RevokedConsentCategories,
  nextCategories: ConsentCategoryMap,
) {
  if (revoked.analytics) {
    expireCookies([/^_ga(?:_|$)/, /^_gid$/, /^_gat(?:_|$)/]);
  }

  if (revoked.marketing) {
    expireCookies([/^_gac_/, /^_gcl_/, /^_fbp$/, /^_fbc$/]);
    try {
      window.fbq?.("consent", "revoke");
    } catch {
      // Continue with queue and cookie cleanup if a provider stub fails.
    }
    if (window.fbq?.queue) window.fbq.queue.length = 0;
    if (window._linkedin_data_partner_ids) window._linkedin_data_partner_ids.length = 0;
  }

  if (revoked.analytics || revoked.performance) {
    // Apply the provider's privacy APIs in place. The essential chat channel
    // remains available, while Live View and optional cookies are disabled.
    salesIqConsentCategories = nextCategories;
    syncSalesIqPrivacyState();
  }

  if (revoked.analytics || revoked.performance) {
    if (window.clarity?.q) window.clarity.q.length = 0;
    if (window.hj?.q) window.hj.q.length = 0;

    if (!nextCategories.analytics && !nextCategories.performance) {
      expireCookies([/^_cl/, /^_hj/]);
    }
  }

  if (window.clarity) {
    try {
      window.clarity("consentv2", {
        ad_Storage: nextCategories.marketing ? "granted" : "denied",
        analytics_Storage:
          nextCategories.analytics || nextCategories.performance ? "granted" : "denied",
      });
    } catch {
      // Reload remains scheduled even if a provider API is unavailable.
    }
  }
}

function shouldBlockTrackingRequest(
  input: string | URL,
  revoked: RevokedConsentCategories,
) {
  const revokedExtraScriptUrls = [
    ...(revoked.analytics ? extraScripts.analytics : []),
    ...(revoked.marketing ? extraScripts.marketing : []),
    ...(revoked.functional ? extraScripts.functional : []),
    ...(revoked.performance ? extraScripts.performance : []),
  ];

  return shouldBlockRevokedTrackingRequest({
    input,
    pageUrl: window.location.href,
    revoked,
    revokedExtraScriptUrls,
  });
}

function installRevokedTrackingGuard(revoked: RevokedConsentCategories) {
  restoreActiveTrackingGuard?.();
  const restorers: Array<() => void> = [];

  try {
    const originalFetch = window.fetch;
    const guardedFetch = ((input: RequestInfo | URL, init?: RequestInit) => {
      const requestUrl =
        typeof input === "string" || input instanceof URL ? input : input.url;
      if (shouldBlockTrackingRequest(requestUrl, revoked)) {
        return Promise.resolve(new Response(null, { status: 204 }));
      }
      return originalFetch.call(window, input, init);
    }) as typeof window.fetch;
    window.fetch = guardedFetch;
    restorers.push(() => {
      if (window.fetch === guardedFetch) window.fetch = originalFetch;
    });
  } catch {
    // Continue installing the remaining guards, then apply denied consent.
  }

  if (typeof window.navigator.sendBeacon === "function") {
    const originalSendBeacon = window.navigator.sendBeacon.bind(window.navigator);
    try {
      const originalDescriptor = Object.getOwnPropertyDescriptor(
        window.navigator,
        "sendBeacon",
      );
      const guardedSendBeacon = (url: string | URL, data?: BodyInit | null) => {
        if (shouldBlockTrackingRequest(url, revoked)) return true;
        return originalSendBeacon(url, data);
      };
      Object.defineProperty(window.navigator, "sendBeacon", {
        configurable: true,
        value: guardedSendBeacon,
      });
      restorers.push(() => {
        if (window.navigator.sendBeacon !== guardedSendBeacon) return;
        if (originalDescriptor) {
          Object.defineProperty(window.navigator, "sendBeacon", originalDescriptor);
        } else {
          Reflect.deleteProperty(window.navigator, "sendBeacon");
        }
      });
    } catch {
      // Some browsers expose a non-configurable sendBeacon method. Consent
      // still updates before the bounded reload in those browsers.
    }
  }

  if (typeof window.XMLHttpRequest === "function") {
    const blockedRequests = new WeakSet<XMLHttpRequest>();
    const originalOpen = window.XMLHttpRequest.prototype.open;
    const originalSend = window.XMLHttpRequest.prototype.send;

    const guardedOpen = function guardedOpen(
      this: XMLHttpRequest,
      method: string,
      url: string | URL,
      async = true,
      username?: string | null,
      password?: string | null,
    ) {
      blockedRequests.delete(this);
      if (shouldBlockTrackingRequest(url, revoked)) blockedRequests.add(this);
      return Reflect.apply(originalOpen, this, [method, url, async, username, password]);
    } as typeof window.XMLHttpRequest.prototype.open;

    const guardedSend = function guardedSend(
      this: XMLHttpRequest,
      body?: Document | XMLHttpRequestBodyInit | null,
    ) {
      if (blockedRequests.has(this)) return;
      return originalSend.call(this, body);
    };

    try {
      window.XMLHttpRequest.prototype.open = guardedOpen;
      window.XMLHttpRequest.prototype.send = guardedSend;
      restorers.push(() => {
        if (window.XMLHttpRequest.prototype.open === guardedOpen) {
          window.XMLHttpRequest.prototype.open = originalOpen;
        }
        if (window.XMLHttpRequest.prototype.send === guardedSend) {
          window.XMLHttpRequest.prototype.send = originalSend;
        }
      });
    } catch {
      if (window.XMLHttpRequest.prototype.open === guardedOpen) {
        window.XMLHttpRequest.prototype.open = originalOpen;
      }
      if (window.XMLHttpRequest.prototype.send === guardedSend) {
        window.XMLHttpRequest.prototype.send = originalSend;
      }
    }
  }

  const imageSrc = Object.getOwnPropertyDescriptor(
    window.HTMLImageElement.prototype,
    "src",
  );
  if (imageSrc?.get && imageSrc.set) {
    try {
      const guardedImageSrc: PropertyDescriptor = {
        configurable: imageSrc.configurable,
        enumerable: imageSrc.enumerable,
        get: imageSrc.get,
        set(value: string) {
          imageSrc.set?.call(
            this,
            shouldBlockTrackingRequest(value, revoked)
              ? "data:image/gif;base64,R0lGODlhAQABAAD/ACw="
              : value,
          );
        },
      };
      Object.defineProperty(
        window.HTMLImageElement.prototype,
        "src",
        guardedImageSrc,
      );
      restorers.push(() => {
        const current = Object.getOwnPropertyDescriptor(
          window.HTMLImageElement.prototype,
          "src",
        );
        if (current?.set === guardedImageSrc.set) {
          Object.defineProperty(window.HTMLImageElement.prototype, "src", imageSrc);
        }
      });
    } catch {
      // Consent update and the other available guards still proceed.
    }
  }

  let restored = false;
  restoreActiveTrackingGuard = () => {
    if (restored) return;
    restored = true;
    restorers.reverse().forEach((restore) => {
      try {
        restore();
      } catch {
        // A third party may have replaced the property after the guard.
      }
    });
    restoreActiveTrackingGuard = null;
  };
}

function scheduleConsentAwareReload() {
  if (consentReloadScheduled) return;
  consentReloadScheduled = true;
  scheduleReloadAfterConsentUpdate({
    schedule: (callback, delayMs) => {
      try {
        window.setTimeout(callback, delayMs);
      } catch {
        callback();
      }
    },
    reload: () => {
      try {
        window.location.reload();
      } catch {
        // Keep the narrow tracking guard active if navigation is unavailable.
      }
    },
  });
}

function sendConsentEvent(action: ConsentAction, categories: ConsentCategoryMap) {
  try {
    void fetch("/api/cookie-consent/consent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ action, categories }),
      keepalive: true,
    }).catch(() => undefined);
  } catch {
    // Consent is already persisted; reporting must never block the choice.
  }
}

function policyHref(key: "cookie" | "privacy" | "terms", language: CookieLanguage) {
  const prefix = language === "ar" ? "/ar" : "";
  if (key === "cookie") return `${prefix}/cookie-policy`;
  if (key === "privacy") return `${prefix}/privacy-policy`;
  return `${prefix}/terms-and-conditions`;
}

export function CookieConsentManager() {
  const pathname = usePathname();
  const bannerTitleId = useId();
  const bannerDescriptionId = useId();
  const preferencesTitleId = useId();
  const preferencesDescriptionId = useId();
  const categoryHeadingId = useId();
  const preferencesDialogRef = useRef<HTMLDivElement>(null);
  const preferencesCloseButtonRef = useRef<HTMLButtonElement>(null);
  const customizeButtonRef = useRef<HTMLButtonElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const appliedCategoriesRef = useRef<ConsentCategoryMap | null>(null);
  const [config, setConfig] = useState<CookieConsentConfig>(defaultCookieConsentConfig);
  const [loaded, setLoaded] = useState(false);
  const [language, setLanguage] = useState<CookieLanguage>("en");
  const [showBanner, setShowBanner] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [returnToBannerOnClose, setReturnToBannerOnClose] = useState(true);
  const [draftCategories, setDraftCategories] = useState<ConsentCategoryMap>(() => getDefaultConsentCategories());

  const activeCategories = useMemo(() => config.categories.filter(isCategoryEnabled), [config.categories]);
  const content = config.banner;
  const isRtl = language === "ar";

  useEffect(() => {
    const initialLanguage = detectLanguage();
    setLanguage(initialLanguage);

    // Initialize the contact channel immediately with every optional category
    // denied. A stored, valid choice may upgrade the provider after config is
    // loaded, but stale consent can never enable tracking during this window.
    const initialCategories = getDefaultConsentCategories();
    appliedCategoriesRef.current = initialCategories;
    loadSalesIqWidget(initialCategories);

    let cancelled = false;
    fetch("/api/cookie-consent/config", { cache: "no-store" })
      .then((response) => response.json())
      .then((data: { config?: CookieConsentConfig }) => {
        if (cancelled) return;
        const nextConfig = data.config || defaultCookieConsentConfig;
        setConfig(nextConfig);
        const stored = getStoredConsent(nextConfig);
        if (stored) {
          setLanguage(stored.language);
          setDraftCategories(stored.categories);
          appliedCategoriesRef.current = stored.categories;
          updateGoogleConsent(stored.categories);
          loadGrantedIntegrationScripts(stored.categories);
          setShowBanner(false);
        } else {
          const defaultCategories = getDefaultConsentCategories();
          setDraftCategories(defaultCategories);
          appliedCategoriesRef.current = defaultCategories;
          setShowBanner(nextConfig.enabled);
          updateGoogleConsent(defaultCategories);
        }
        setLoaded(true);
      })
      .catch(() => {
        if (cancelled) return;
        const stored = getStoredConsent(defaultCookieConsentConfig);
        if (stored) {
          setLanguage(stored.language);
          setDraftCategories(stored.categories);
          appliedCategoriesRef.current = stored.categories;
          updateGoogleConsent(stored.categories);
          loadGrantedIntegrationScripts(stored.categories);
          setShowBanner(false);
        } else {
          const defaultCategories = getDefaultConsentCategories();
          setDraftCategories(defaultCategories);
          appliedCategoriesRef.current = defaultCategories;
          setShowBanner(defaultCookieConsentConfig.enabled);
          updateGoogleConsent(defaultCategories);
        }
        setLoaded(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const syncTimer = window.setTimeout(syncSalesIqPageContext, 0);
    return () => window.clearTimeout(syncTimer);
  }, [pathname]);

  useEffect(() => {
    const openSettings = () => {
      returnFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      setReturnToBannerOnClose(false);
      setShowPreferences(true);
      setShowBanner(false);
    };

    const requestChat = () => {
      salesIqOpenRequested = true;
      const categories = appliedCategoriesRef.current || getDefaultConsentCategories();
      loadSalesIqWidget(categories);
      window.EmitronixJyothika?.open();
    };

    window.addEventListener(SETTINGS_EVENT, openSettings);
    window.addEventListener(CHAT_REQUEST_EVENT, requestChat);
    return () => {
      window.removeEventListener(SETTINGS_EVENT, openSettings);
      window.removeEventListener(CHAT_REQUEST_EVENT, requestChat);
    };
  }, []);

  useEffect(() => {
    if (!showPreferences) return;

    const dialog = preferencesDialogRef.current;
    const focusCloseButton = window.requestAnimationFrame(() => preferencesCloseButtonRef.current?.focus());

    function handleDialogKeyDown(event: KeyboardEvent) {
      if (!dialog) return;

      if (event.key === "Escape") {
        event.preventDefault();
        setShowPreferences(false);
        setShowBanner(returnToBannerOnClose);
        window.requestAnimationFrame(() => {
          const target = returnToBannerOnClose ? customizeButtonRef.current : returnFocusRef.current;
          if (target?.isConnected) target.focus();
        });
        return;
      }

      if (event.key !== "Tab") return;

      const focusableElements = Array.from(
        dialog.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((element) => !element.hasAttribute("hidden"));

      if (focusableElements.length === 0) {
        event.preventDefault();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey && (document.activeElement === firstElement || !dialog.contains(document.activeElement))) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }

    dialog?.addEventListener("keydown", handleDialogKeyDown);
    return () => {
      window.cancelAnimationFrame(focusCloseButton);
      dialog?.removeEventListener("keydown", handleDialogKeyDown);
    };
  }, [returnToBannerOnClose, showPreferences]);

  function persistConsent(action: ConsentAction, categories: ConsentCategoryMap) {
    const focusTarget = showPreferences ? returnFocusRef.current : null;
    const previousConsent = getStoredConsent(config);
    const consent = buildConsentRecord(config, language, categories);
    const transition = applyConsentTransition({
      previousCategories: previousConsent?.categories || appliedCategoriesRef.current,
      nextCategories: consent.categories,
      clearAllOptionalState: cookieCategoryIds
        .filter((id) => id !== "necessary")
        .every((id) => !consent.categories[id]),
      prepareRevocation: installRevokedTrackingGuard,
      updateConsent: updateGoogleConsent,
      persistConsent: () => {
        setLocalStorageValue(CONSENT_STORAGE_KEY, JSON.stringify(consent));
        setLocalStorageValue(LANGUAGE_STORAGE_KEY, language);
        setConsentCookie(consent, config.consentExpiryDays);
        appliedCategoriesRef.current = consent.categories;
        setDraftCategories(consent.categories);
        sendConsentEvent(action, consent.categories);
        setShowBanner(false);
        setShowPreferences(false);
      },
      clearRevokedState: clearRevokedTrackingState,
      loadGrantedScripts: loadGrantedIntegrationScripts,
      scheduleReload: scheduleConsentAwareReload,
    });

    if (salesIqOpenRequested) {
      window.EmitronixJyothika?.open();
    }

    if (transition.reloadScheduled) return;

    window.requestAnimationFrame(() => {
      if (focusTarget?.isConnected) focusTarget.focus();
    });
  }

  function acceptAll() {
    persistConsent("accept_all", getAllConsentCategories());
  }

  function rejectNonEssential() {
    persistConsent("reject_non_essential", getRejectedConsentCategories());
  }

  function savePreferences() {
    persistConsent("save_preferences", draftCategories);
  }

  function toggleCategory(id: CookieCategoryId) {
    const category = config.categories.find((item) => item.id === id);
    if (!category || category.required) return;
    setDraftCategories((current) => ({
      ...current,
      [id]: !current[id],
    }));
  }

  function changeLanguage(nextLanguage: CookieLanguage) {
    setLanguage(nextLanguage);
    setLocalStorageValue(LANGUAGE_STORAGE_KEY, nextLanguage);
  }

  function closePreferences() {
    setShowPreferences(false);
    setShowBanner(returnToBannerOnClose);
    window.requestAnimationFrame(() => {
      const target = returnToBannerOnClose ? customizeButtonRef.current : returnFocusRef.current;
      if (target?.isConnected) target.focus();
    });
  }

  if (!loaded || (!showBanner && !showPreferences)) return null;

  return (
    <div dir={isRtl ? "rtl" : "ltr"} className="fixed inset-x-0 bottom-0 z-[100000] px-3 pb-3 sm:px-5 sm:pb-5">
      <div
        ref={showPreferences ? preferencesDialogRef : undefined}
        role={showPreferences ? "dialog" : "region"}
        aria-modal={showPreferences ? "true" : undefined}
        aria-labelledby={showPreferences ? preferencesTitleId : bannerTitleId}
        aria-describedby={showPreferences ? preferencesDescriptionId : bannerDescriptionId}
        className="mx-auto max-h-[calc(100dvh-1.5rem)] max-w-6xl overflow-y-auto rounded-[1.75rem] border border-brand/[0.16] bg-white/[0.96] p-4 text-charcoal shadow-luxe backdrop-blur-2xl sm:max-h-[calc(100dvh-2.5rem)] sm:p-5"
      >
        {showPreferences ? (
          <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="rounded-[1.25rem] bg-brand-soft p-5">
              <div className="flex items-start justify-between gap-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-brand text-white shadow-blue">
                  <Settings2 className="h-5 w-5" />
                </span>
                <button
                  ref={preferencesCloseButtonRef}
                  type="button"
                  aria-label={content.closeLabel[language]}
                  className="grid h-10 w-10 place-items-center rounded-full border border-brand/[0.14] bg-white text-brand transition hover:bg-brand hover:text-white focus-ring"
                  onClick={closePreferences}
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>
              <p id={categoryHeadingId} className="premium-kicker mt-5">{content.categoryHeading[language]}</p>
              <h2 id={preferencesTitleId} className="mt-3 text-3xl font-black tracking-tight text-charcoal">{content.title[language]}</h2>
              <p id={preferencesDescriptionId} className="mt-4 text-sm leading-7 text-[#5f6f86]">{content.description[language]}</p>
              <div className="mt-5 flex flex-wrap gap-2 text-sm font-black" role="group" aria-label={content.languageLabel[language]}>
                <button
                  type="button"
                  className="rounded-full bg-white px-4 py-2 text-brand shadow-sm"
                  onClick={() => changeLanguage("en")}
                  aria-pressed={language === "en"}
                >
                  English
                </button>
                <button
                  type="button"
                  className="rounded-full bg-white px-4 py-2 text-brand shadow-sm"
                  onClick={() => changeLanguage("ar")}
                  aria-pressed={language === "ar"}
                >
                  العربية
                </button>
              </div>
            </div>

            <div>
              <div className="grid max-h-[54vh] gap-3 overflow-auto pr-1" role="group" aria-labelledby={categoryHeadingId}>
                {activeCategories.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    className="flex items-start justify-between gap-4 rounded-[1.25rem] border border-brand/[0.12] bg-white p-4 text-start shadow-sm transition hover:border-brand/25 hover:bg-brand-soft"
                    onClick={() => toggleCategory(category.id)}
                    disabled={category.required}
                    aria-pressed={category.required || draftCategories[category.id]}
                    aria-describedby={`${preferencesDescriptionId}-${category.id}`}
                  >
                    <span>
                      <span className="block text-base font-black tracking-tight text-charcoal">{category.title[language]}</span>
                      <span id={`${preferencesDescriptionId}-${category.id}`} className="mt-2 block text-sm leading-6 text-steel">{category.description[language]}</span>
                    </span>
                    <span
                      className={`mt-1 inline-flex min-w-24 items-center justify-center rounded-full px-3 py-2 text-xs font-black uppercase tracking-wide ${
                        category.required || draftCategories[category.id]
                          ? "bg-brand text-white"
                          : "bg-brand-soft text-brand"
                      }`}
                    >
                      {category.required ? content.alwaysEnabledLabel[language] : draftCategories[category.id] ? (language === "ar" ? "مفعل" : "On") : (language === "ar" ? "متوقف" : "Off")}
                    </span>
                  </button>
                ))}
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <button type="button" className="premium-button" onClick={savePreferences}>
                  <Check className="h-4 w-4" />
                  {content.saveLabel[language]}
                </button>
                <button type="button" className="premium-button-light" onClick={acceptAll}>
                  {content.acceptAllLabel[language]}
                </button>
                <button type="button" className="premium-button-light" onClick={rejectNonEssential}>
                  {content.rejectLabel[language]}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid gap-5 lg:grid-cols-[auto_1fr] lg:items-start">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand text-white shadow-blue">
              <Cookie className="h-6 w-6" />
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <p className="premium-kicker">{content.languageLabel[language]}</p>
                <button
                  type="button"
                  className="text-xs font-black uppercase tracking-wide text-brand"
                  onClick={() => changeLanguage("en")}
                  aria-pressed={language === "en"}
                >
                  English
                </button>
                <button
                  type="button"
                  className="text-xs font-black uppercase tracking-wide text-brand"
                  onClick={() => changeLanguage("ar")}
                  aria-pressed={language === "ar"}
                >
                  العربية
                </button>
              </div>
              <h2 id={bannerTitleId} className="mt-2 text-2xl font-black tracking-tight text-charcoal sm:text-3xl">{content.title[language]}</h2>
              <p id={bannerDescriptionId} className="mt-2 max-w-4xl text-sm leading-7 text-steel">{content.description[language]}</p>
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs font-black uppercase tracking-wide text-brand">
                <Link href={policyHref("cookie", language)}>{content.cookiePolicyLabel[language]}</Link>
                <Link href={policyHref("privacy", language)}>{content.privacyPolicyLabel[language]}</Link>
                <Link href={policyHref("terms", language)}>{content.termsLabel[language]}</Link>
              </div>
            </div>
            <div className="grid gap-2 sm:grid-cols-3 lg:col-span-2">
              <button type="button" className="premium-button" onClick={acceptAll}>
                <ShieldCheck className="h-4 w-4" />
                {content.acceptAllLabel[language]}
              </button>
              <button type="button" className="premium-button-light" onClick={rejectNonEssential}>
                {content.rejectLabel[language]}
              </button>
              <button
                ref={customizeButtonRef}
                type="button"
                className="premium-button-light"
                onClick={(event) => {
                  returnFocusRef.current = event.currentTarget;
                  setReturnToBannerOnClose(true);
                  setShowPreferences(true);
                  setShowBanner(false);
                  sendConsentEvent("customize", draftCategories);
                }}
              >
                {content.customizeLabel[language]}
                <ChevronRight className={`h-4 w-4 ${isRtl ? "rotate-180" : ""}`} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function CookieSettingsFooterButton({ label = "Cookie Settings" }: { label?: string }) {
  return (
    <button
      type="button"
      className="text-start transition hover:text-brand"
      onClick={() => window.dispatchEvent(new Event(SETTINGS_EVENT))}
    >
      {label}
    </button>
  );
}
