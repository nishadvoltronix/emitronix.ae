"use client";

import { Loader2, Send } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useEffect, useRef, useState, type RefObject } from "react";
import { prefillContactService } from "@/lib/contactFormIntent";

type FormStatus = "idle" | "submitting" | "success" | "error";

const inputClass =
  "focus-ring rounded-2xl border border-brand/[0.15] bg-white/[0.88] px-4 py-4 text-charcoal shadow-sm outline-none transition placeholder:text-steel/70 hover:border-brand/30 focus:border-brand";

const fallbackScopeOptions = [
  "Civil Contracting",
  "Main Contracting",
  "Warehouse Construction",
  "Villa Construction",
  "Interior Fit-Out",
  "MEP Coordination",
  "Authority Approvals",
  "Project Management",
];

const arabicScopeOptions = [
  "المقاولات المدنية",
  "المقاولات الرئيسية",
  "إنشاء المستودعات",
  "إنشاء الفلل",
  "التشطيبات الداخلية",
  "تنسيق MEP",
  "موافقات الجهات",
  "إدارة المشاريع",
];

function ContactIntentPrefill({
  serviceRef,
  serviceEdited,
  siteVisitLabel,
}: {
  serviceRef: RefObject<HTMLSelectElement | null>;
  serviceEdited: RefObject<boolean>;
  siteVisitLabel: string;
}) {
  const searchParams = useSearchParams();
  const query = searchParams.toString();

  useEffect(() => {
    prefillContactService(
      serviceRef.current,
      new URLSearchParams(query).getAll("intent"),
      siteVisitLabel,
      serviceEdited.current,
    );
  }, [query, siteVisitLabel, serviceRef, serviceEdited]);

  return null;
}

export function ContactForm({
  scopeOptions,
  language = "en",
}: {
  scopeOptions?: string[];
  language?: "en" | "ar";
}) {
  const isArabic = language === "ar";
  const options = scopeOptions ?? (isArabic ? arabicScopeOptions : fallbackScopeOptions);
  const text = isArabic
    ? {
        name: "الاسم الكامل",
        company: "الشركة",
        mobile: "رقم الهاتف",
        email: "البريد الإلكتروني",
        projectLocation: "موقع المشروع",
        service: "الخدمة المطلوبة",
        message: "تفاصيل المشروع",
        consent: "أوافق على أن تستخدم Emitronix بيانات الطلب للتواصل معي وإنشاء متابعة للمشروع.",
        selectService: "اختر الخدمة",
        siteVisit: "طلب زيارة للموقع",
        other: "نطاق إنشاءات آخر",
        submit: "إرسال طلب المشروع",
        submitting: "جاري الإرسال",
        success: "شكرا لك. تم استلام طلبك وسيقوم فريق Emitronix بمراجعة تفاصيل المشروع.",
        error: "تعذر إرسال الطلب الآن.",
        placeholders: {
          name: "اكتب اسمك",
          company: "اسم الشركة",
          phone: "+971",
          email: "name@example.com",
          location: "دبي، جبل علي، دبي الجنوب، مجتمع فلل...",
          message: "شارك الرسومات المتاحة، حالة الموافقات، حالة الموقع، الجدول الزمني وأي تعليقات من الاستشاري أو المالك.",
        },
      }
    : {
        name: "Full name",
        company: "Company",
        mobile: "Mobile",
        email: "Email",
        projectLocation: "Project location",
        service: "Service required",
        message: "Project details",
        consent: "I agree that Emitronix may use my enquiry details to contact me and create a CRM lead for follow-up.",
        selectService: "Select service",
        siteVisit: "Request a Site Visit",
        other: "Other Construction Scope",
        submit: "Submit Project Enquiry",
        submitting: "Submitting Enquiry",
        success: "Thank you. Your enquiry has been received and the Emitronix team will review the project details.",
        error: "We could not submit the enquiry right now.",
        placeholders: {
          name: "Your name",
          company: "Company name",
          phone: "+971",
          email: "name@example.com",
          location: "Dubai, JAFZA, Dubai South, villa community...",
          message: "Share drawings available, authority status, site condition, timeline, budget stage and any consultant or landlord comments.",
        },
      };
  const [status, setStatus] = useState<FormStatus>("idle");
  const [message, setMessage] = useState("");
  const serviceRef = useRef<HTMLSelectElement>(null);
  const serviceEdited = useRef(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "submitting") return;

    const form = event.currentTarget;
    const formData = new FormData(form);

    setStatus("submitting");
    setMessage("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.get("name"),
          company: formData.get("company"),
          email: formData.get("email"),
          phone: formData.get("phone"),
          service: formData.get("service"),
          projectLocation: formData.get("projectLocation"),
          message: formData.get("message"),
          consent: formData.get("consent") === "on",
          website: formData.get("website"),
          pageUrl: window.location.href,
        }),
      });

      const result = (await response.json().catch(() => ({}))) as { ok?: boolean; message?: string };

      if (!response.ok || !result.ok) {
        throw new Error(result.message || text.error);
      }

      form.reset();
      setStatus("success");
      setMessage(text.success);
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : text.error);
    }
  }

  return (
    <form dir={isArabic ? "rtl" : "ltr"} onSubmit={handleSubmit} className="luxury-surface rounded-[2rem] p-5 sm:p-7">
      {/* Keep the form server-rendered; only the URL hint needs client query state. */}
      <Suspense fallback={null}>
        <ContactIntentPrefill serviceRef={serviceRef} serviceEdited={serviceEdited} siteVisitLabel={text.siteVisit} />
      </Suspense>
      <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="grid gap-2 text-sm font-black text-charcoal">
          {text.name}
          <input required name="name" autoComplete="name" className={inputClass} placeholder={text.placeholders.name} />
        </label>
        <label className="grid gap-2 text-sm font-black text-charcoal">
          {text.company}
          <input name="company" autoComplete="organization" className={inputClass} placeholder={text.placeholders.company} />
        </label>
        <label className="grid gap-2 text-sm font-black text-charcoal">
          {text.mobile}
          <input required type="tel" name="phone" autoComplete="tel" className={inputClass} placeholder={text.placeholders.phone} />
        </label>
        <label className="grid gap-2 text-sm font-black text-charcoal">
          {text.email}
          <input required type="email" name="email" autoComplete="email" className={inputClass} placeholder={text.placeholders.email} />
        </label>
        <label className="grid gap-2 text-sm font-black text-charcoal sm:col-span-2">
          {text.projectLocation}
          <input required name="projectLocation" autoComplete="street-address" className={inputClass} placeholder={text.placeholders.location} />
        </label>
        <label className="grid gap-2 text-sm font-black text-charcoal sm:col-span-2">
          {text.service}
          <select
            ref={serviceRef}
            name="service"
            className={inputClass}
            defaultValue=""
            onChange={() => { serviceEdited.current = true; }}
            required
          >
            <option value="" disabled>
              {text.selectService}
            </option>
            {options.map((scope) => (
              <option key={scope} value={scope}>
                {scope}
              </option>
            ))}
            <option value={text.siteVisit}>{text.siteVisit}</option>
            <option value={text.other}>{text.other}</option>
          </select>
        </label>
        <label className="grid gap-2 text-sm font-black text-charcoal sm:col-span-2">
          {text.message}
          <textarea
            required
            name="message"
            rows={6}
            className={`${inputClass} resize-none`}
            placeholder={text.placeholders.message}
          />
        </label>
        <label className="flex items-start gap-3 rounded-2xl border border-brand/[0.14] bg-brand-soft p-4 text-sm font-bold leading-6 text-charcoal sm:col-span-2">
          <input name="consent" type="checkbox" required className="mt-1 h-4 w-4 rounded border-brand/30 text-brand focus-ring" />
          <span>
            {text.consent}{" "}
            <Link href={isArabic ? "/ar/privacy-policy" : "/privacy-policy"} className="font-black text-brand underline underline-offset-2">
              {isArabic ? "سياسة الخصوصية" : "Privacy Policy"}
            </Link>
          </span>
        </label>
      </div>

      <button
        type="submit"
        disabled={status === "submitting"}
        className="premium-button mt-6 w-full disabled:cursor-wait disabled:opacity-70 sm:w-auto"
      >
        {status === "submitting" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send size={18} />}
        {status === "submitting" ? text.submitting : text.submit}
      </button>

      {message ? (
        <p
          role="status"
          aria-live="polite"
          className={`mt-5 rounded-2xl border px-4 py-3 text-sm font-bold leading-6 ${
            status === "error"
              ? "border-red-200 bg-red-50 text-red-700"
              : "border-brand/20 bg-brand-soft text-brand-deep"
          }`}
        >
          {message}
        </p>
      ) : null}
    </form>
  );
}
