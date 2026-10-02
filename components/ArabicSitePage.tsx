import { SectionPhotoPlacement } from "@/components/SectionPhotoPlacement";
import { findInternalServiceImage, getSectionPhotographs, getUniquePhotoAttribution } from "@/data/pagePhotography";
import { InternalPageHero } from "@/components/InternalPageFrame";
import { ArrowLeft, CheckCircle2, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { BlogEnquiryPopup } from "@/components/BlogEnquiryPopup";
import { CareerApplicationForm } from "@/components/CareerApplicationForm";
import { ContactForm } from "@/components/ContactForm";
import { ResponsiveIllustrativeImage } from "@/components/ResponsiveIllustrativeImage";
import { arabicUi, type ArabicPageData } from "@/data/arabic";
import { blogPosts } from "@/data/blog";
import { findGeneratedImageBySrc } from "@/data/generatedImages";
import { site, whatsappUrl } from "@/data/site";
import { trustContentLastReviewedIso } from "@/data/trustCenter";

function formatArabicDate(date: string) {
  return new Intl.DateTimeFormat("ar-AE", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
}

export function ArabicSitePage({ page }: { page: ArabicPageData }) {
  const phoneHref = site.phoneHref;
  const primaryCta = page.primaryCta ?? { label: arabicUi.quote, href: "/ar/contact" };
  const secondaryCta = page.secondaryCta ?? { label: arabicUi.whatsapp, href: whatsappUrl };
  const heroImage = findGeneratedImageBySrc(page.image);
  const internalPhoto = page.path === "/" ? undefined : findInternalServiceImage(`/ar${page.path}`);
  const blogPost =
    page.kind === "blog-post"
      ? blogPosts.find((post) => `/blog/${post.slug}` === page.path)
      : undefined;
  const reviewedDate = blogPost?.modifiedDate ?? trustContentLastReviewedIso;
  const photoSectionCount = page.sections.length + 3 + (page.form ? 1 : 0);
  const existingImages = [internalPhoto?.src ?? page.image, ...page.sections.flatMap(section => section.cards?.flatMap(card => card.image ? [card.image] : []) ?? [])];
  const sectionPhotos = page.path === "/" ? [] : getSectionPhotographs(`/ar${page.path}`, Math.max(0, 5 - existingImages.length), existingImages);

  return (
    <article lang="ar-AE" dir="rtl" className="bg-white text-charcoal">
      {page.path === "/" ? (
        <section className="relative isolate overflow-hidden bg-brand-dark text-white">
        {heroImage ? (
          <ResponsiveIllustrativeImage
            asset={heroImage}
            alt={page.imageAlt}
            priority
            sizes="100vw"
            className="absolute inset-0 z-0 block h-full w-full"
            imageClassName="h-full w-full object-cover"
            imageStyle={{ height: "100%", objectFit: "cover" }}
          />
        ) : (
          <Image
            src={page.image}
            alt={page.imageAlt}
            fill
            priority
            sizes="100vw"
            className="absolute inset-0 z-0 object-cover"
          />
        )}
        <div className="absolute inset-0 z-10 bg-[linear-gradient(270deg,rgba(11,31,58,0.94)_0%,rgba(18,58,115,0.76)_52%,rgba(25,73,145,0.26)_100%)]" />
        <div className="absolute inset-0 z-10 bg-[linear-gradient(180deg,rgba(11,31,58,0.10)_0%,rgba(11,31,58,0.72)_100%)]" />
        <div className="container-pad relative z-30 flex min-h-[680px] items-end pb-14 pt-36">
          <div className="max-w-5xl">
            {page.path !== "/" ? (
              <nav className="mb-6 flex flex-wrap items-center gap-2 text-sm font-bold text-white/80" aria-label="مسار التنقل">
                <Link href="/ar" className="transition hover:text-white">
                  {arabicUi.breadcrumbHome}
                </Link>
                <span aria-hidden="true">/</span>
                <span aria-current="page" className="text-white">{page.title}</span>
              </nav>
            ) : null}
            <p className="text-xs font-black uppercase tracking-[0.24em] text-brand-sky">{page.eyebrow}</p>
            <h1 className="mt-6 text-balance text-5xl font-black leading-[1.08] tracking-tight text-white sm:text-7xl lg:text-8xl">
              {page.title}
            </h1>
            <p className="mt-7 max-w-3xl text-lg font-medium leading-9 text-white/[0.88] sm:text-xl sm:leading-10">
              {page.description}
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link href={primaryCta.href} className="premium-button">
                {primaryCta.label}
                <ArrowLeft className="h-4 w-4" />
              </Link>
              <a href={phoneHref} className="inline-flex items-center justify-center gap-2 rounded-full border border-white/35 bg-white/15 px-6 py-3.5 text-sm font-black uppercase tracking-wide text-white shadow-sm backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 hover:bg-white hover:text-brand focus-ring">
                {arabicUi.callNow}
                <Phone className="h-4 w-4" />
              </a>
              {secondaryCta.href.startsWith("http") ? (
                <a href={secondaryCta.href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 rounded-full border border-white/35 bg-white/15 px-6 py-3.5 text-sm font-black uppercase tracking-wide text-white shadow-sm backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 hover:bg-white hover:text-brand focus-ring">
                  {secondaryCta.label}
                  <MessageCircle className="h-4 w-4" />
                </a>
              ) : (
                <Link href={secondaryCta.href} className="inline-flex items-center justify-center gap-2 rounded-full border border-white/35 bg-white/15 px-6 py-3.5 text-sm font-black uppercase tracking-wide text-white shadow-sm backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 hover:bg-white hover:text-brand focus-ring">
                  {secondaryCta.label}
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>
      ) : (
        <InternalPageHero
          eyebrow={page.eyebrow}
          title={page.title}
          description={page.description}
          imageAsset={internalPhoto ? undefined : heroImage}
          image={internalPhoto?.src ?? (heroImage ? undefined : page.image)}
          imageAlt={internalPhoto?.altAr ?? page.imageAlt}
          imageCaption={internalPhoto?.captionAr}
          imageAttribution={getUniquePhotoAttribution(internalPhoto, "ar")}
          imagePosition={internalPhoto?.objectPosition}
          breadcrumbs={[{ label: arabicUi.breadcrumbHome, href: "/ar" }, { label: page.title }]}
          breadcrumbLabel="مسار التنقل"
          showPlanningSummary={false}
        >
          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link href={primaryCta.href} className="premium-button">
                {primaryCta.label}
                <ArrowLeft className="h-4 w-4" />
              </Link>
              <a href={phoneHref} className="inline-flex items-center justify-center gap-2 rounded-md border border-white/35 bg-white/15 px-6 py-3.5 text-sm font-semibold uppercase tracking-wide text-white shadow-sm backdrop-blur-xl transition duration-300 hover:bg-white hover:text-brand focus-ring">
                {arabicUi.callNow}
                <Phone className="h-4 w-4" />
              </a>
              {secondaryCta.href.startsWith("http") ? (
                <a href={secondaryCta.href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 rounded-md border border-white/35 bg-white/15 px-6 py-3.5 text-sm font-semibold uppercase tracking-wide text-white shadow-sm backdrop-blur-xl transition duration-300 hover:bg-white hover:text-brand focus-ring">
                  {secondaryCta.label}
                  <MessageCircle className="h-4 w-4" />
                </a>
              ) : (
                <Link href={secondaryCta.href} className="inline-flex items-center justify-center gap-2 rounded-md border border-white/35 bg-white/15 px-6 py-3.5 text-sm font-semibold uppercase tracking-wide text-white shadow-sm backdrop-blur-xl transition duration-300 hover:bg-white hover:text-brand focus-ring">
                  {secondaryCta.label}
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              )}
            </div>
        </InternalPageHero>
      )}

      <section className="section-pad bg-white">
        <div className="container-pad grid gap-6 md:grid-cols-3">
          {[
            { label: "الهاتف", value: site.phone, href: phoneHref, icon: Phone },
            { label: "البريد الإلكتروني", value: site.email, href: `mailto:${site.email}`, icon: Mail },
            { label: "الموقع", value: site.location, href: "/ar/contact", icon: MapPin },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <a key={item.label} href={item.href} className={page.path === "/" ? "luxury-card flex gap-4 rounded-[1.5rem] p-5" : "luxury-card flex gap-4 rounded-lg p-5"}>
                <Icon className="mt-1 h-5 w-5 shrink-0 text-brand" />
                <span>
                  <span className={page.path === "/" ? "block text-xs font-black uppercase tracking-wide text-brand" : "block text-xs font-semibold uppercase tracking-wide text-brand"}>{item.label}</span>
                  <span
                    dir={item.href.startsWith("tel:") ? "ltr" : undefined}
                    className="mt-2 block text-sm font-bold leading-6 text-charcoal"
                  >
                    {item.value}
                  </span>
                </span>
              </a>
            );
          })}
        {page.path !== "/" ? <div className="col-span-full"><SectionPhotoPlacement photos={sectionPhotos} index={0} sections={photoSectionCount} locale="ar" /></div> : null}
        </div>
      </section>

      <div data-blog-content={page.kind === "blog-post" ? true : undefined}>
        {page.sections.map((section, index) => (
          <section key={`${section.title}-${index}`} className={`section-pad ${index % 2 === 0 ? "soft-section" : "bg-white"}`}>
            <div className="container-pad">
              <div className="max-w-5xl">
                <p className="premium-kicker">{section.eyebrow}</p>
                <h2 className={page.path === "/" ? "mt-4 text-balance text-4xl font-black leading-[1.12] tracking-tight text-charcoal sm:text-5xl lg:text-6xl" : "mt-4 text-balance text-4xl font-semibold leading-[1.12] tracking-tight text-charcoal sm:text-5xl lg:text-6xl"}>
                  {section.title}
                </h2>
                <div className="mt-6 grid gap-4 text-lg leading-9 text-steel">
                  {section.body.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </div>

              {page.path !== "/" ? <SectionPhotoPlacement photos={sectionPhotos} index={index + 1} sections={photoSectionCount} locale="ar" /> : null}

              {section.links?.length ? (
                <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {section.links.map((link) => (
                    <Link key={link.href} href={link.href} className={page.path === "/" ? "group luxury-card flex min-h-28 items-center justify-between gap-4 rounded-[1.5rem] p-5 transition hover:-translate-y-1 hover:border-brand/30 hover:bg-brand-soft" : "group luxury-card flex min-h-28 items-center justify-between gap-4 rounded-lg p-5 transition hover:-translate-y-1 hover:border-brand/30 hover:bg-brand-soft"}>
                      <span className={page.path === "/" ? "text-lg font-black leading-7 text-charcoal" : "text-lg font-semibold leading-7 text-charcoal"}>{link.label}</span>
                      <ArrowLeft className="h-5 w-5 shrink-0 text-brand transition group-hover:-translate-x-1" />
                    </Link>
                  ))}
                </div>
              ) : null}

              {section.cards?.length ? (
                <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {section.cards.map((card) => {
                    const cardImage = card.image
                      ? findGeneratedImageBySrc(card.image)
                      : undefined;

                    return (
                      <article key={card.title} className={page.path === "/" ? "group overflow-hidden rounded-[1.5rem] border border-brand/10 bg-white shadow-panel transition hover:-translate-y-1 hover:shadow-luxe" : "group overflow-hidden rounded-lg border border-brand/10 bg-white shadow-none transition hover:-translate-y-1 hover:shadow-none"}>
                        {card.image ? (
                          <div className="relative h-56 overflow-hidden">
                            {cardImage ? (
                              <ResponsiveIllustrativeImage
                                asset={cardImage}
                                alt={card.imageAlt ?? card.title}
                                sizes="(min-width: 1280px) 31vw, (min-width: 768px) 48vw, 100vw"
                                className="absolute inset-0 block h-full w-full"
                                imageClassName="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                                imageStyle={{ height: "100%", objectFit: "cover" }}
                              />
                            ) : (
                              <Image
                                src={card.image}
                                alt={card.imageAlt ?? card.title}
                                fill
                                loading="lazy"
                                sizes="(min-width: 1280px) 31vw, (min-width: 768px) 48vw, 100vw"
                                className="object-cover transition duration-700 group-hover:scale-105"
                              />
                            )}
                          </div>
                        ) : null}
                        <div className="p-6">
                          <CheckCircle2 className="h-7 w-7 text-brand" />
                          <h3 className={page.path === "/" ? "mt-5 text-2xl font-black leading-tight tracking-tight text-charcoal" : "mt-5 text-2xl font-semibold leading-tight tracking-tight text-charcoal"}>{card.title}</h3>
                          <p className="mt-4 text-sm leading-7 text-steel">{card.body}</p>
                        </div>
                      </article>
                    );
                  })}
                </div>
              ) : null}
            </div>
          </section>
        ))}
      </div>

      <section className="section-pad bg-white" aria-labelledby="arabic-content-review-heading">
        <div className="container-pad">
          <div className={page.path === "/" ? "rounded-[1.75rem] border border-brand/[0.14] bg-brand-soft p-6 shadow-panel lg:p-8" : "rounded-lg border border-brand/[0.14] bg-brand-soft p-6 shadow-none lg:p-8"}>
            <p className="premium-kicker">سجل المحتوى</p>
            <h2 id="arabic-content-review-heading" className={page.path === "/" ? "mt-3 text-3xl font-black tracking-tight text-charcoal" : "mt-3 text-3xl font-semibold tracking-tight text-charcoal"}>
              ملكية المحتوى والمراجعة
            </h2>
            <dl className="mt-6 grid gap-4 md:grid-cols-2">
              <div className={page.path === "/" ? "rounded-2xl border border-brand/[0.12] bg-white p-5" : "rounded-lg border border-brand/[0.12] bg-white p-5"}>
                <dt className={page.path === "/" ? "text-xs font-black uppercase tracking-[0.16em] text-brand" : "text-xs font-semibold uppercase tracking-[0.16em] text-brand"}>المالك التحريري</dt>
                <dd className="mt-3 text-sm font-bold leading-7 text-charcoal">{site.legalName}</dd>
              </div>
              <div className={page.path === "/" ? "rounded-2xl border border-brand/[0.12] bg-white p-5" : "rounded-lg border border-brand/[0.12] bg-white p-5"}>
                <dt className={page.path === "/" ? "text-xs font-black uppercase tracking-[0.16em] text-brand" : "text-xs font-semibold uppercase tracking-[0.16em] text-brand"}>آخر مراجعة</dt>
                <dd className="mt-3 text-sm font-bold leading-7 text-charcoal">
                  <time dateTime={reviewedDate}>{formatArabicDate(reviewedDate)}</time>
                </dd>
              </div>
              <div className={page.path === "/" ? "rounded-2xl border border-brand/[0.12] bg-white p-5 md:col-span-2" : "rounded-lg border border-brand/[0.12] bg-white p-5 md:col-span-2"}>
                <dt className={page.path === "/" ? "text-xs font-black uppercase tracking-[0.16em] text-brand" : "text-xs font-semibold uppercase tracking-[0.16em] text-brand"}>نطاق المراجعة</dt>
                <dd className="mt-3 text-sm leading-7 text-charcoal">
                  {blogPost
                    ? "محتوى إرشادي عام تمت مراجعته من حيث وضوح النطاق والحدود التحريرية واتساق الموقع. لا يعد تصميما أو حسابا أو موافقة أو توجيها خاصا بمشروع."
                    : "مراجعة تحريرية عامة لوضوح النطاق والحدود الواقعية واتساق معلومات الموقع. لا تعد مراجعة هندسية أو موافقة أو توجيها خاصا بمشروع."}
                  <p className="mt-3 text-sm font-bold leading-7 text-amber-800">
                    مطلوب إجراء — لا ينشر اسم مراجع فني أو مؤهلاته أو نطاق مراجعته إلا بعد تحقق الإدارة من الأدلة.
                  </p>
                </dd>
              </div>
            </dl>

            <nav className={page.path === "/" ? "mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm font-black" : "mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold"} aria-label="سياسات حوكمة المحتوى">
              <Link href="/editorial-policy" className="text-brand underline underline-offset-4">
                سياسة التحرير (بالإنجليزية)
              </Link>
              <Link href="/technical-review-policy" className="text-brand underline underline-offset-4">
                سياسة المراجعة الفنية (بالإنجليزية)
              </Link>
              <Link href="/corrections-policy" className="text-brand underline underline-offset-4">
                سياسة التصحيحات (بالإنجليزية)
              </Link>
              <Link href="/disclaimer" className="text-brand underline underline-offset-4">
                إخلاء المسؤولية (بالإنجليزية)
              </Link>
            </nav>

            {blogPost?.references?.length ? (
              <div className="mt-8 border-t border-brand/[0.14] pt-6">
                <h3 className={page.path === "/" ? "text-xl font-black text-charcoal" : "text-xl font-semibold text-charcoal"}>مراجع رسمية للبدء</h3>
                <p className="mt-3 text-sm leading-7 text-steel">
                  تم التحقق من روابط المراجع في{" "}
                  <time dateTime={blogPost.referenceCheckedDate ?? blogPost.modifiedDate}>
                    {formatArabicDate(blogPost.referenceCheckedDate ?? blogPost.modifiedDate)}
                  </time>
                  . يجب تأكيد المتطلبات الحالية والمسؤوليات الخاصة بالمشروع مع الجهة المختصة والمهنيين المعينين.
                </p>
                <ul className="mt-5 grid gap-3 md:grid-cols-2">
                  {blogPost.references.map((reference) => (
                    <li key={reference.href}>
                      <a
                        href={reference.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={page.path === "/" ? "block rounded-2xl border border-brand/[0.12] bg-white px-4 py-3 text-sm font-black text-brand underline-offset-4 hover:underline focus-ring" : "block rounded-lg border border-brand/[0.12] bg-white px-4 py-3 text-sm font-semibold text-brand underline-offset-4 hover:underline focus-ring"}
                      >
                        <span lang="en" dir="ltr">{reference.title}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        {page.path !== "/" ? <div className="col-span-full"><SectionPhotoPlacement photos={sectionPhotos} index={page.sections.length + 1} sections={photoSectionCount} locale="ar" /></div> : null}
        </div>
      </section>

      {page.form ? (
        <section className="section-pad bg-white">
          <div className="container-pad grid gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
            <div>
              <p className="premium-kicker">{page.form === "career" ? "نموذج الوظائف" : "نموذج التواصل"}</p>
              <h2 className={page.path === "/" ? "mt-4 text-4xl font-black leading-tight tracking-tight text-charcoal sm:text-5xl" : "mt-4 text-4xl font-semibold leading-tight tracking-tight text-charcoal sm:text-5xl"}>
                {page.form === "career" ? "أرسل طلبك إلى Emitronix." : "أرسل تفاصيل مشروعك."}
              </h2>
              <p className="mt-5 text-base leading-8 text-steel">
                {page.form === "career"
                  ? "يرجى إرفاق السيرة الذاتية وكتابة الخبرة والموقع الحالي والوظيفة المطلوبة."
                  : "أرسل الموقع، الرسومات المتاحة، حالة الموافقات، نطاق العمل والجدول الزمني المطلوب."}
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <a href={phoneHref} className="premium-button-light">
                  {arabicUi.callNow}
                  <Phone className="h-4 w-4" />
                </a>
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="premium-button-light">
                  {arabicUi.whatsapp}
                  <MessageCircle className="h-4 w-4" />
                </a>
              </div>
            </div>
            {page.form === "career" ? (
              <CareerApplicationForm email={site.email} language="ar" />
            ) : (
              <ContactForm language="ar" />
            )}
          {page.path !== "/" ? <div className="col-span-full"><SectionPhotoPlacement photos={sectionPhotos} index={page.sections.length + 2} sections={photoSectionCount} locale="ar" /></div> : null}
        </div>
        </section>
      ) : null}

      <section className="blue-grid section-pad text-charcoal">
        <div className="container-pad grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="premium-kicker">الخطوة التالية</p>
            <h2 className={page.path === "/" ? "mt-4 text-4xl font-black leading-tight tracking-tight text-charcoal sm:text-5xl" : "mt-4 text-4xl font-semibold leading-tight tracking-tight text-charcoal sm:text-5xl"}>
              تحدث مع فريق Emitronix حول مشروعك في دبي.
            </h2>
            <p className="mt-5 max-w-3xl text-base leading-8 text-steel">
              شارك الموقع، نوع الأصل، الرسومات، حالة الموافقات والجدول الزمني حتى يتم تحديد مسار العمل المناسب.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link href="/ar/contact" className="premium-button">
              {arabicUi.contactTeam}
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <a href={phoneHref} className="premium-button-light">
              {arabicUi.callNow}
              <Phone className="h-4 w-4" />
            </a>
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="premium-button-light">
              {arabicUi.whatsapp}
              <MessageCircle className="h-4 w-4" />
            </a>
          </div>
        {page.path !== "/" ? <div className="col-span-full"><SectionPhotoPlacement photos={sectionPhotos} index={page.sections.length + 2 + (page.form ? 1 : 0)} sections={photoSectionCount} locale="ar" /></div> : null}
        </div>
      </section>

      {page.kind === "blog-post" ? (
        <BlogEnquiryPopup
          articleTitle={page.title}
          language="ar"
          serviceOptions={["المقاولات المدنية", "إنشاء المستودعات", "إنشاء الفلل", "التشطيبات الداخلية", "تنسيق MEP", "موافقات الجهات", "إدارة المشاريع"]}
        />
      ) : null}
    </article>
  );
}
