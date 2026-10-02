export function PageLoading({ locale = "en" }: { locale?: "en" | "ar" }) {
  return (
    <section
      role="status"
      aria-live="polite"
      className="container-pad min-h-[70vh] py-16 sm:py-24"
      dir={locale === "ar" ? "rtl" : "ltr"}
    >
      <p className="text-sm font-bold text-brand">
        {locale === "ar" ? "جارٍ فتح الصفحة…" : "Opening page…"}
      </p>
      <div aria-hidden="true" className="mt-8 max-w-3xl space-y-5 motion-safe:animate-pulse">
        <div className="h-12 w-3/4 rounded-xl bg-brand/10" />
        <div className="h-5 w-full rounded bg-brand/10" />
        <div className="h-5 w-5/6 rounded bg-brand/10" />
        <div className="h-40 rounded-2xl bg-brand/5" />
      </div>
    </section>
  );
}
