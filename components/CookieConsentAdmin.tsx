"use client";

import { BarChart3, CheckCircle2, LockKeyhole, LogOut, RefreshCw, Save, ShieldAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useMemo, useState } from "react";
import {
  cookieLanguages,
  type CookieBannerContent,
  type CookieCategoryId,
  type CookieConsentConfig,
  type CookieLanguage,
  type CookiePolicyPageKey,
  type LocalizedPolicyPage,
  type PolicySection,
} from "@/data/cookieConsentDefaults";
import type { CookieConsentStats } from "@/lib/cookieConsentStore";

type AdminData = {
  config: CookieConsentConfig;
  stats: CookieConsentStats;
};

const pageKeys: CookiePolicyPageKey[] = ["cookiePolicy", "privacyPolicy", "terms"];

const pageLabels: Record<CookiePolicyPageKey, string> = {
  cookiePolicy: "Cookie Policy",
  privacyPolicy: "Privacy Policy",
  terms: "Terms & Conditions",
};

function createSectionDrafts(config: CookieConsentConfig) {
  return pageKeys.reduce((pages, key) => {
    pages[key] = cookieLanguages.reduce((languages, language) => {
      languages[language] = JSON.stringify(config.policyPages[key][language].sections, null, 2);
      return languages;
    }, {} as Record<CookieLanguage, string>);
    return pages;
  }, {} as Record<CookiePolicyPageKey, Record<CookieLanguage, string>>);
}

function inputClass() {
  return "w-full rounded-2xl border border-brand/[0.16] bg-white px-4 py-3 text-sm font-bold text-charcoal shadow-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/15";
}

function panelClass() {
  return "rounded-[1.75rem] border border-brand/[0.14] bg-white p-5 shadow-panel";
}

function formatStatDate(value: string | null) {
  return value ? new Intl.DateTimeFormat("en-AE", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)) : "No data";
}

export function CookieConsentAdminLogin({ configured }: { configured: boolean }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [message, setMessage] = useState("");

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "loading") return;
    setStatus("loading");
    setMessage("");
    try {
      const response = await fetch("/api/admin/cookie-consent/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });

      if (response.ok) {
        setStatus("idle");
        router.refresh();
        return;
      }

      setStatus("error");
      setMessage("Invalid password or expired session.");
    } catch {
      setStatus("error");
      setMessage("Sign in could not be completed. Check your connection and try again.");
    }
  }

  return (
    <section className="section-pad bg-white">
      <div className="container-pad">
        <div className="mx-auto max-w-xl rounded-[2rem] border border-brand/[0.14] bg-white p-6 shadow-luxe lg:p-8">
          <LockKeyhole className="h-10 w-10 text-brand" />
          <h1 className="mt-5 text-4xl font-black tracking-tight text-charcoal">Cookie Consent Admin</h1>
          {configured ? (
            <form onSubmit={login} className="mt-6 grid gap-4">
              <label className="grid gap-2 text-sm font-black text-charcoal">
                Admin password
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className={inputClass()}
                  autoComplete="current-password"
                  required
                />
              </label>
              {status === "error" ? (
                <p role="alert" className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{message}</p>
              ) : null}
              <button type="submit" className="premium-button" disabled={status === "loading"}>
                {status === "loading" ? "Checking..." : "Sign In"}
              </button>
            </form>
          ) : (
            <div className="mt-6 rounded-2xl bg-amber-50 p-5 text-sm font-bold leading-7 text-amber-800">
              Set `COOKIE_ADMIN_PASSWORD` or `COOKIE_ADMIN_TOKEN` in the server environment to enable this protected management page.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export function CookieConsentAdmin({ initialData }: { initialData: AdminData }) {
  const router = useRouter();
  const [config, setConfig] = useState<CookieConsentConfig>(initialData.config);
  const [stats, setStats] = useState<CookieConsentStats>(initialData.stats);
  const [sectionDrafts, setSectionDrafts] = useState(() => createSectionDrafts(initialData.config));
  const [activeLanguage, setActiveLanguage] = useState<CookieLanguage>("en");
  const [activePage, setActivePage] = useState<CookiePolicyPageKey>("cookiePolicy");
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [message, setMessage] = useState("");

  const statRows = useMemo(() => Object.entries(stats.categories), [stats.categories]);

  function updateConfig(updater: (current: CookieConsentConfig) => CookieConsentConfig) {
    setConfig((current) => updater({ ...current }));
    setStatus("idle");
  }

  function updateBanner(field: keyof CookieBannerContent, language: CookieLanguage, value: string) {
    updateConfig((current) => ({
      ...current,
      banner: {
        ...current.banner,
        [field]: {
          ...current.banner[field],
          [language]: value,
        },
      },
    }));
  }

  function updateCategory(id: CookieCategoryId, field: "enabled" | "title" | "description", languageOrValue: CookieLanguage | boolean, value?: string) {
    updateConfig((current) => ({
      ...current,
      categories: current.categories.map((category) => {
        if (category.id !== id) return category;
        if (field === "enabled") {
          return { ...category, enabled: category.required ? true : Boolean(languageOrValue) };
        }
        const language = languageOrValue as CookieLanguage;
        return {
          ...category,
          [field]: {
            ...category[field],
            [language]: value || "",
          },
        };
      }),
    }));
  }

  function updatePolicyField(pageKey: CookiePolicyPageKey, language: CookieLanguage, field: keyof Omit<LocalizedPolicyPage[CookieLanguage], "sections">, value: string) {
    updateConfig((current) => ({
      ...current,
      policyPages: {
        ...current.policyPages,
        [pageKey]: {
          ...current.policyPages[pageKey],
          [language]: {
            ...current.policyPages[pageKey][language],
            [field]: value,
          },
        },
      },
    }));
  }

  function parseSectionDrafts() {
    const nextPages = { ...config.policyPages };

    for (const pageKey of pageKeys) {
      nextPages[pageKey] = { ...nextPages[pageKey] };
      for (const language of cookieLanguages) {
        const parsed = JSON.parse(sectionDrafts[pageKey][language]) as PolicySection[];
        if (!Array.isArray(parsed)) throw new Error(`${pageLabels[pageKey]} ${language} sections must be an array.`);
        nextPages[pageKey][language] = {
          ...nextPages[pageKey][language],
          sections: parsed.map((section) => ({
            heading: String(section.heading || "").trim(),
            body: String(section.body || "").trim(),
          })).filter((section) => section.heading && section.body),
        };
      }
    }

    return nextPages;
  }

  async function saveSettings() {
    if (status === "saving") return;
    setStatus("saving");
    setMessage("");

    let nextConfig: CookieConsentConfig;
    try {
      nextConfig = {
        ...config,
        policyPages: parseSectionDrafts(),
      };
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Policy sections JSON is invalid.");
      return;
    }

    try {
      const response = await fetch("/api/admin/cookie-consent/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ config: nextConfig }),
      });

      const data = (await response.json().catch(() => null)) as AdminData | null;
      if (!response.ok || !data?.config) {
        setStatus("error");
        setMessage("Settings could not be saved.");
        return;
      }

      setConfig(data.config);
      setStats(data.stats);
      setSectionDrafts(createSectionDrafts(data.config));
      setStatus("saved");
      setMessage("Settings saved.");
    } catch {
      setStatus("error");
      setMessage("Settings could not be saved. Check your connection and try again.");
    }
  }

  async function resetConsents() {
    if (status === "saving") return;
    if (!window.confirm("Reset aggregate statistics and show the banner again to all visitors?")) return;
    setStatus("saving");
    setMessage("");
    try {
      const response = await fetch("/api/admin/cookie-consent/reset", { method: "POST" });
      const data = (await response.json().catch(() => null)) as AdminData | null;
      if (!response.ok || !data?.config) {
        setStatus("error");
        setMessage("Consent reset failed.");
        return;
      }

      setConfig(data.config);
      setStats(data.stats);
      setSectionDrafts(createSectionDrafts(data.config));
      setStatus("saved");
      setMessage("Consent version reset. Visitors will be prompted again.");
    } catch {
      setStatus("error");
      setMessage("Consent reset failed. Check your connection and try again.");
    }
  }

  async function logout() {
    if (status === "saving") return;
    setStatus("saving");
    setMessage("");
    try {
      const response = await fetch("/api/admin/cookie-consent/logout", { method: "POST" });
      if (!response.ok) {
        setStatus("error");
        setMessage("Sign out could not be completed. Please try again.");
        return;
      }
      setStatus("idle");
      router.refresh();
    } catch {
      setStatus("error");
      setMessage("Sign out could not be completed. Check your connection and try again.");
    }
  }

  return (
    <section className="section-pad bg-white">
      <div className="container-pad">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="premium-kicker">Consent CMS</p>
            <h1 className="mt-3 text-5xl font-black tracking-tight text-charcoal">Cookie Consent Management</h1>
            <p className="mt-4 max-w-3xl text-base leading-8 text-steel">
              Manage multilingual banner copy, categories, policy pages, expiry, consent versioning and aggregate consent statistics.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button type="button" className="premium-button" onClick={saveSettings} disabled={status === "saving"}>
              <Save className="h-4 w-4" />
              {status === "saving" ? "Saving..." : "Save Changes"}
            </button>
            <button type="button" className="premium-button-light" onClick={logout} disabled={status === "saving"}>
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>

        {message ? (
          <div role={status === "error" ? "alert" : "status"} className={`mt-6 flex items-center gap-3 rounded-2xl px-5 py-4 text-sm font-black ${status === "error" ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}>
            {status === "error" ? <ShieldAlert className="h-5 w-5" /> : <CheckCircle2 className="h-5 w-5" />}
            {message}
          </div>
        ) : null}

        <div className="mt-10 grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="grid gap-6">
            <section className={panelClass()}>
              <h2 className="text-2xl font-black tracking-tight text-charcoal">Banner Controls</h2>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <label className="flex items-center gap-3 rounded-2xl bg-brand-soft p-4 text-sm font-black text-charcoal">
                  <input
                    type="checkbox"
                    checked={config.enabled}
                    onChange={(event) => updateConfig((current) => ({ ...current, enabled: event.target.checked }))}
                    className="h-5 w-5 accent-brand"
                  />
                  Enable cookie banner
                </label>
                <label className="grid gap-2 text-sm font-black text-charcoal">
                  Consent expiry duration in days
                  <input
                    type="number"
                    min={1}
                    max={730}
                    value={config.consentExpiryDays}
                    onChange={(event) => updateConfig((current) => ({ ...current, consentExpiryDays: Number(event.target.value) }))}
                    className={inputClass()}
                  />
                </label>
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                {cookieLanguages.map((language) => (
                  <button
                    type="button"
                    key={language}
                    className={`rounded-full px-4 py-2 text-sm font-black ${activeLanguage === language ? "bg-brand text-white" : "bg-brand-soft text-brand"}`}
                    onClick={() => setActiveLanguage(language)}
                  >
                    {language === "ar" ? "Arabic" : "English"}
                  </button>
                ))}
              </div>
              <div className="mt-6 grid gap-4">
                <label className="grid gap-2 text-sm font-black text-charcoal">
                  Banner title
                  <input value={config.banner.title[activeLanguage]} onChange={(event) => updateBanner("title", activeLanguage, event.target.value)} className={inputClass()} dir={activeLanguage === "ar" ? "rtl" : "ltr"} />
                </label>
                <label className="grid gap-2 text-sm font-black text-charcoal">
                  Banner description
                  <textarea value={config.banner.description[activeLanguage]} onChange={(event) => updateBanner("description", activeLanguage, event.target.value)} className={`${inputClass()} min-h-28`} dir={activeLanguage === "ar" ? "rtl" : "ltr"} />
                </label>
                <div className="grid gap-4 sm:grid-cols-2">
                  {([
                    "acceptAllLabel",
                    "rejectLabel",
                    "customizeLabel",
                    "saveLabel",
                    "closeLabel",
                    "cookiePolicyLabel",
                    "privacyPolicyLabel",
                    "termsLabel",
                    "settingsLabel",
                    "categoryHeading",
                    "alwaysEnabledLabel",
                    "languageLabel",
                  ] as Array<keyof CookieBannerContent>).map((field) => (
                    <label key={field} className="grid gap-2 text-sm font-black text-charcoal">
                      {field}
                      <input value={config.banner[field][activeLanguage]} onChange={(event) => updateBanner(field, activeLanguage, event.target.value)} className={inputClass()} dir={activeLanguage === "ar" ? "rtl" : "ltr"} />
                    </label>
                  ))}
                </div>
              </div>
            </section>

            <section className={panelClass()}>
              <h2 className="text-2xl font-black tracking-tight text-charcoal">Cookie Categories</h2>
              <div className="mt-6 grid gap-4">
                {config.categories.map((category) => (
                  <div key={category.id} className="rounded-2xl border border-brand/[0.12] bg-brand-soft p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <span className="text-sm font-black uppercase tracking-wide text-brand">{category.id}</span>
                      <label className="flex items-center gap-2 text-sm font-black text-charcoal">
                        <input
                          type="checkbox"
                          checked={category.enabled}
                          disabled={category.required}
                          onChange={(event) => updateCategory(category.id, "enabled", event.target.checked)}
                          className="h-5 w-5 accent-brand"
                        />
                        {category.required ? "Always enabled" : "Visible/enabled"}
                      </label>
                    </div>
                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                      {cookieLanguages.map((language) => (
                        <div key={language} className="grid gap-3">
                          <input value={category.title[language]} onChange={(event) => updateCategory(category.id, "title", language, event.target.value)} className={inputClass()} dir={language === "ar" ? "rtl" : "ltr"} />
                          <textarea value={category.description[language]} onChange={(event) => updateCategory(category.id, "description", language, event.target.value)} className={`${inputClass()} min-h-24`} dir={language === "ar" ? "rtl" : "ltr"} />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="grid gap-6">
            <section className={panelClass()}>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-black tracking-tight text-charcoal">Consent Statistics</h2>
                  <p className="mt-2 text-sm font-bold text-steel">Aggregate events only. No visitor identifiers are stored.</p>
                </div>
                <BarChart3 className="h-8 w-8 text-brand" />
              </div>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-brand-soft p-4">
                  <p className="premium-kicker">Total</p>
                  <p className="mt-2 text-4xl font-black text-brand">{stats.totalEvents}</p>
                </div>
                <div className="rounded-2xl bg-brand-soft p-4">
                  <p className="premium-kicker">Version</p>
                  <p className="mt-2 text-4xl font-black text-brand">{config.version}</p>
                </div>
              </div>
              <div className="mt-5 grid gap-2 text-sm font-bold text-steel">
                <p>Last consent: {formatStatDate(stats.lastConsentAt)}</p>
                <p>Last reset: {formatStatDate(stats.resetAt)}</p>
              </div>
              <div className="mt-5 grid gap-3">
                {Object.entries(stats.actions).map(([action, count]) => (
                  <div key={action} className="flex items-center justify-between rounded-2xl border border-brand/[0.12] px-4 py-3 text-sm font-black">
                    <span>{action}</span>
                    <span className="text-brand">{count}</span>
                  </div>
                ))}
                {statRows.map(([category, count]) => (
                  <div key={category} className="flex items-center justify-between rounded-2xl border border-brand/[0.12] px-4 py-3 text-sm font-black">
                    <span>{category} accepted</span>
                    <span className="text-brand">{count}</span>
                  </div>
                ))}
              </div>
              <button type="button" className="premium-button-light mt-6 w-full" onClick={resetConsents} disabled={status === "saving"}>
                <RefreshCw className="h-4 w-4" />
                Reset All User Consents
              </button>
            </section>

            <section className={panelClass()}>
              <h2 className="text-2xl font-black tracking-tight text-charcoal">Policy Pages</h2>
              <div className="mt-5 flex flex-wrap gap-2">
                {pageKeys.map((key) => (
                  <button
                    type="button"
                    key={key}
                    className={`rounded-full px-4 py-2 text-sm font-black ${activePage === key ? "bg-brand text-white" : "bg-brand-soft text-brand"}`}
                    onClick={() => setActivePage(key)}
                  >
                    {pageLabels[key]}
                  </button>
                ))}
              </div>
              <div className="mt-5 grid gap-5">
                {cookieLanguages.map((language) => (
                  <div key={language} className="rounded-2xl border border-brand/[0.12] bg-brand-soft p-4">
                    <p className="premium-kicker">{language === "ar" ? "Arabic" : "English"}</p>
                    <div className="mt-4 grid gap-3">
                      <input
                        value={config.policyPages[activePage][language].title}
                        onChange={(event) => updatePolicyField(activePage, language, "title", event.target.value)}
                        className={inputClass()}
                        dir={language === "ar" ? "rtl" : "ltr"}
                      />
                      <textarea
                        value={config.policyPages[activePage][language].description}
                        onChange={(event) => updatePolicyField(activePage, language, "description", event.target.value)}
                        className={`${inputClass()} min-h-20`}
                        dir={language === "ar" ? "rtl" : "ltr"}
                      />
                      <textarea
                        value={sectionDrafts[activePage][language]}
                        onChange={(event) => setSectionDrafts((current) => ({
                          ...current,
                          [activePage]: {
                            ...current[activePage],
                            [language]: event.target.value,
                          },
                        }))}
                        className={`${inputClass()} min-h-64 font-mono text-xs`}
                        dir="ltr"
                        spellCheck={false}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </section>
  );
}
