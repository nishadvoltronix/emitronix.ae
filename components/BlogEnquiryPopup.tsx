"use client";

import { Loader2, Send, X } from "lucide-react";
import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { isValidPhone } from "@/lib/phoneValidation";

const DISMISSED_KEY = "emitronix-blog-enquiry-dismissed";

const inputClass =
  "focus-ring min-w-0 w-full rounded-2xl border border-brand/[0.15] bg-white px-4 py-3 text-sm text-charcoal shadow-sm outline-none transition placeholder:text-steel/70 hover:border-brand/30 focus:border-brand";

const fallbackServices = [
  "Civil Contracting",
  "Main Contracting",
  "Warehouse Construction",
  "Villa Construction",
  "Interior Fit-Out",
  "MEP Coordination",
  "Authority Approvals",
  "Project Management",
];

export function BlogEnquiryPopup({
  articleTitle,
  serviceOptions = fallbackServices,
  language = "en",
}: {
  articleTitle: string;
  serviceOptions?: string[];
  language?: "en" | "ar";
}) {
  const isArabic = language === "ar";
  const text = isArabic
    ? {
        label: "استفسار مشروع",
        title: "ناقش مشروعك في دبي.",
        close: "إغلاق نموذج الاستفسار",
        available: "نموذج استفسار المشروع متاح الآن. اضغط Escape لإغلاقه.",
        name: "الاسم",
        mobile: "رقم الهاتف",
        email: "البريد الإلكتروني",
        service: "الخدمة المطلوبة",
        projectLocation: "موقع المشروع",
        consent: "أوافق على استخدام بيانات الاستفسار للتواصل معي وإنشاء متابعة للمشروع.",
        selectService: "اختر الخدمة",
        other: "نطاق إنشاءات آخر",
        message: "الرسالة",
        submit: "إرسال الاستفسار",
        submitting: "جاري الإرسال",
        success: "شكرا لك. تم إرسال الاستفسار.",
        error: "فشل الإرسال. يرجى المحاولة مرة أخرى أو التواصل معنا مباشرة.",
        placeholders: {
          name: "اسمك",
          mobile: "+971",
          email: "name@example.com",
          location: "دبي، الإمارات",
          message: "شارك الموقع والرسومات وحالة الموافقات ونطاق المشروع.",
        },
      }
    : {
        label: "Project enquiry",
        title: "Discuss your Dubai project.",
        close: "Close enquiry form",
        available: "The project enquiry form is now available. Press Escape to dismiss it.",
        name: "Name",
        mobile: "Mobile",
        email: "Email",
        service: "Service Required",
        projectLocation: "Project location",
        consent: "I agree that Emitronix may use my enquiry details to contact me and create a CRM lead for follow-up.",
        selectService: "Select service",
        other: "Other Construction Scope",
        message: "Message",
        submit: "Submit Enquiry",
        submitting: "Submitting",
        success: "Thank you. Your enquiry has been submitted.",
        error: "Submission failed. Please try again or contact us directly.",
        placeholders: {
          name: "Your name",
          mobile: "+971",
          email: "name@example.com",
          location: "Dubai, UAE",
          message: "Share your location, drawings, authority status and project scope.",
        },
      };
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error" | "invalid-phone">("idle");

  useEffect(() => {
    const alreadyDismissed = window.sessionStorage.getItem(DISMISSED_KEY) === "true";
    if (alreadyDismissed) {
      setDismissed(true);
      return;
    }

    const onScroll = () => {
      const content = document.querySelector<HTMLElement>("[data-blog-content]");
      if (!content) return;

      const contentTop = content.getBoundingClientRect().top + window.scrollY;
      const contentHeight = Math.max(content.scrollHeight, 1);
      const progress = (window.scrollY - contentTop) / contentHeight;

      if (progress >= 0.2) {
        setVisible(true);
        window.removeEventListener("scroll", onScroll);
      }
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!visible || dismissed) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        window.sessionStorage.setItem(DISMISSED_KEY, "true");
        setDismissed(true);
        setVisible(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [visible, dismissed]);

  function closePopup() {
    window.sessionStorage.setItem(DISMISSED_KEY, "true");
    setDismissed(true);
    setVisible(false);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (sending) return;

    const form = event.currentTarget;
    const formData = new FormData(form);
    const serviceRequired = String(formData.get("serviceRequired") || "");
    const message = String(formData.get("message") || "");
    if (!isValidPhone(formData.get("mobile"))) {
      setStatus("invalid-phone");
      return;
    }

    setStatus("idle");
    setSending(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.get("name") || "",
          phone: formData.get("mobile") || "",
          email: formData.get("email") || "",
          company: "",
          projectLocation: formData.get("projectLocation") || "",
          service: serviceRequired,
          message: [`Blog enquiry: ${articleTitle}`, `Service required: ${serviceRequired}`, "", message].join("\n"),
          consent: formData.get("consent") === "on",
          website: formData.get("website") || "",
          pageUrl: window.location.href,
        }),
      });

      const result = (await response.json().catch(() => null)) as { ok?: boolean } | null;
      if (!response.ok || !result?.ok) {
        throw new Error("SUBMISSION_FAILED");
      }

      setStatus("success");
      form.reset();
      window.sessionStorage.setItem(DISMISSED_KEY, "true");
      window.setTimeout(() => {
        setDismissed(true);
        setVisible(false);
      }, 1800);
    } catch {
      setStatus("error");
    } finally {
      setSending(false);
    }
  }

  if (dismissed || !visible) return null;

  return (
    <aside
      aria-labelledby="blog-enquiry-title"
      aria-describedby="blog-enquiry-announcement"
      dir={isArabic ? "rtl" : "ltr"}
      className="fixed bottom-24 left-4 right-4 z-[99998] max-h-[calc(100vh-7rem)] overflow-auto rounded-[1.5rem] border border-brand/[0.16] bg-white/[0.96] p-4 text-charcoal shadow-luxe backdrop-blur-2xl sm:left-auto sm:right-6 sm:w-[430px] sm:p-5"
    >
      <p id="blog-enquiry-announcement" className="sr-only" role="status" aria-live="polite">
        {text.available}
      </p>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="premium-kicker">{text.label}</p>
          <h2 id="blog-enquiry-title" className="mt-2 text-2xl font-black tracking-tight text-charcoal">{text.title}</h2>
        </div>
        <button
          type="button"
          onClick={closePopup}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-brand/15 bg-brand-soft text-brand transition hover:bg-brand hover:text-white focus-ring"
          aria-label={text.close}
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="mt-5 grid gap-3">
        <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
        <label className="grid gap-1.5 text-sm font-black text-charcoal">
          {text.name}
          <input required name="name" autoComplete="name" className={inputClass} placeholder={text.placeholders.name} />
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="grid gap-1.5 text-sm font-black text-charcoal">
            {text.mobile}
            <input required type="tel" name="mobile" autoComplete="tel" className={inputClass} placeholder={text.placeholders.mobile} />
          </label>
          <label className="grid gap-1.5 text-sm font-black text-charcoal">
            {text.email}
            <input required type="email" name="email" autoComplete="email" className={inputClass} placeholder={text.placeholders.email} />
          </label>
        </div>
        <label className="grid gap-1.5 text-sm font-black text-charcoal">
          {text.service}
          <select required name="serviceRequired" defaultValue="" className={inputClass}>
            <option value="" disabled>
              {text.selectService}
            </option>
            {serviceOptions.map((service) => (
              <option key={service} value={service}>
                {service}
              </option>
            ))}
            <option value={text.other}>{text.other}</option>
          </select>
        </label>
        <label className="grid gap-1.5 text-sm font-black text-charcoal">
          {text.projectLocation}
          <input required name="projectLocation" autoComplete="street-address" className={inputClass} placeholder={text.placeholders.location} />
        </label>
        <label className="grid gap-1.5 text-sm font-black text-charcoal">
          {text.message}
          <textarea
            required
            name="message"
            rows={4}
            className={`${inputClass} resize-none`}
            placeholder={text.placeholders.message}
          />
        </label>
        <label className="flex items-start gap-3 rounded-2xl border border-brand/[0.14] bg-brand-soft p-3 text-xs font-bold leading-5 text-charcoal">
          <input required name="consent" type="checkbox" className="mt-1 h-4 w-4 rounded border-brand/30 text-brand focus-ring" />
          <span>
            {text.consent}{" "}
            <Link href={isArabic ? "/ar/privacy-policy" : "/privacy-policy"} className="font-black text-brand underline underline-offset-2">
              {isArabic ? "سياسة الخصوصية" : "Privacy Policy"}
            </Link>
          </span>
        </label>

        <button type="submit" disabled={sending} className="premium-button w-full disabled:cursor-wait disabled:opacity-70">
          {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          {sending ? text.submitting : text.submit}
        </button>

        {status !== "idle" ? (
          <p
            role="status"
            aria-live="polite"
            className="rounded-2xl border border-brand/20 bg-brand-soft px-4 py-3 text-sm font-bold leading-6 text-brand-deep"
          >
            {status === "success" ? text.success : status === "invalid-phone" ? (isArabic ? "يرجى إدخال رقم هاتف صالح." : "Please enter a valid mobile number.") : text.error}
          </p>
        ) : null}
      </form>
    </aside>
  );
}
