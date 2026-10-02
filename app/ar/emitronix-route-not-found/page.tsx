/* eslint-disable @next/next/no-html-link-for-pages -- Recovery links must perform a full navigation even when client routing has failed. */
import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import { ErrorPageShell } from "@/components/ErrorPageShell";

// Internal, noindex destination used by middleware for hard Arabic 404 responses.
export const metadata: Metadata = {
  title: {
    absolute: "الصفحة غير موجودة | Emitronix",
  },
  description: "تعذر العثور على صفحة Emitronix المطلوبة.",
  alternates: {
    canonical: null,
  },
  robots: {
    index: false,
    follow: true,
  },
};

export default function ArabicNotFoundRoute() {
  return (
    <div lang="ar-AE" dir="rtl">
      <ErrorPageShell
        locale="ar"
        code="404"
        eyebrow="الصفحة غير موجودة"
        title="مسار المشروع المطلوب غير متاح."
        description="قد يكون العنوان غير مكتمل أو قديماً أو لم يعد متاحاً. يمكنك متابعة خدمات Emitronix أو العودة إلى الصفحة الرئيسية."
        actions={
          <>
            <a href="/ar" className="premium-button">
              العودة إلى الرئيسية <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            </a>
            <a href="/ar/services" className="premium-button-light">
              عرض الخدمات <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            </a>
            <a href="/ar/contact" className="premium-button-light">
              تواصل مع Emitronix <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            </a>
          </>
        }
      />
    </div>
  );
}
