/* eslint-disable @next/next/no-head-element -- This shared component is rendered only by App Router root layouts. */
import { Inter } from "next/font/google";
import Link from "next/link";
import { CookieConsentManager } from "@/components/CookieConsentManager";
import { FloatingActions } from "@/components/FloatingActions";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { RouteContent } from "@/components/RouteContent";
import {
  absoluteUrl,
  brandAssets,
  brandLogoImageObject,
  services,
  site,
  socialLinks,
  whatsappUrl,
} from "@/data/site";
import { googleTagManagerId } from "@/lib/googleTagManager";
// Prepare the small, scoped styles shared by the main navigation destinations.
// Otherwise the first internal-page click suspends on CSS despite prefetched data.
import "@/components/InternalPage.module.css";
import "@/components/SectionPhotograph.module.css";

const cityServiceAreas = new Set(["Dubai", "Abu Dhabi", "Sharjah"]);

const inter = Inter({
  subsets: ["latin"],
  display: "optional",
  variable: "--font-inter",
});

const googleTagManagerBootstrap = `
(function(w,d,s,l,i){
var started=false;
w.EmitronixLoadGoogleTagManager=function(){
if(started)return;
started=true;
// Cloudflare's Google tag gateway already bootstraps registered containers.
if(Array.isArray(w.google_tags_first_party)&&w.google_tags_first_party.includes(i))return;
w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
};
})(window,document,'script','dataLayer',${JSON.stringify(googleTagManagerId)});
`;

export function SiteRootLayout({
  children,
  locale,
}: Readonly<{
  children: React.ReactNode;
  locale: "en" | "ar";
}>) {
  const isArabic = locale === "ar";
  const organizationId = absoluteUrl("/#organization");
  const officeContactId = absoluteUrl("/#office-contact");
  const mobileContactId = absoluteUrl("/#mobile-contact");
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["Organization", "LocalBusiness", "GeneralContractor"],
        "@id": organizationId,
        name: site.legalName,
        alternateName: site.name,
        url: site.url,
        logo: brandLogoImageObject,
        image: absoluteUrl(brandAssets.socialCard),
        description: site.description,
        email: site.email,
        telephone: site.phoneE164,
        sameAs: socialLinks.map((item) => item.href),
        founder: {
          "@id": absoluteUrl("/founder#person"),
        },
        publishingPrinciples: absoluteUrl("/editorial-policy"),
        ethicsPolicy: absoluteUrl("/editorial-policy"),
        correctionsPolicy: absoluteUrl("/corrections-policy"),
        address: {
          "@type": "PostalAddress",
          streetAddress: "Dubai Investment Park 02",
          addressLocality: "Dubai",
          addressCountry: "AE",
        },
        areaServed: site.serviceArea.map((name) => ({
          "@type": cityServiceAreas.has(name) ? "City" : "Country",
          name,
        })),
        openingHoursSpecification: [
          {
            "@type": "OpeningHoursSpecification",
            dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
            opens: "08:00",
            closes: "18:00",
          },
        ],
        contactPoint: [
          { "@id": officeContactId },
          { "@id": mobileContactId },
        ],
        hasOfferCatalog: {
          "@type": "OfferCatalog",
          name: "Dubai contracting and approval services",
          itemListElement: services.map((service) => ({
            "@type": "Offer",
            url: absoluteUrl(service.href),
            itemOffered: {
              "@type": "Service",
              name: service.title,
              description: service.description,
              areaServed: "Dubai, United Arab Emirates",
              provider: {
                "@id": organizationId,
              },
            },
          })),
        },
      },
      {
        "@type": "ContactPoint",
        "@id": officeContactId,
        name: "Emitronix primary office contact",
        telephone: site.phoneE164,
        email: site.email,
        contactType: "customer service",
        areaServed: {
          "@type": "Country",
          name: "United Arab Emirates",
        },
        availableLanguage: ["English", "Arabic"],
        url: absoluteUrl("/contact"),
      },
      {
        "@type": "ContactPoint",
        "@id": mobileContactId,
        name: "Emitronix secondary mobile and WhatsApp contact",
        telephone: site.mobileE164,
        contactType: "customer service",
        areaServed: {
          "@type": "Country",
          name: "United Arab Emirates",
        },
        availableLanguage: ["English", "Arabic"],
        url: whatsappUrl,
      },
      {
        "@type": "WebSite",
        "@id": absoluteUrl("/#website"),
        name: site.name,
        url: site.url,
        description: site.description,
        publisher: {
          "@id": organizationId,
        },
        inLanguage: ["en-AE", "ar-AE"],
      },
    ],
  };

  return (
    <html
      lang={isArabic ? "ar-AE" : "en-AE"}
      dir={isArabic ? "rtl" : "ltr"}
      data-scroll-behavior="smooth"
      className={inter.variable}
    >
      <head>
        <script
          id="emitronix-organization-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
          }}
        />
        <script
          id="emitronix-google-consent-default"
          dangerouslySetInnerHTML={{
            __html: `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('consent', 'default', {
  ad_storage: 'denied',
  analytics_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
  functionality_storage: 'denied',
  personalization_storage: 'denied',
  security_storage: 'granted',
  wait_for_update: 500
});
`,
          }}
        />
        <script
          id="emitronix-google-tag-manager"
          dangerouslySetInnerHTML={{
            __html: googleTagManagerBootstrap,
          }}
        />
      </head>
      <body className="min-h-screen antialiased">
        <Link href="#main-content" className="skip-link" prefetch={false}>
          <span className="skip-link-label-en" lang="en-AE">Skip to main content</span>
          <span className="skip-link-label-ar" lang="ar-AE" dir="rtl">تخطي إلى المحتوى الرئيسي</span>
        </Link>
        <Header />
        <main id="main-content" className="min-h-screen" tabIndex={-1}><RouteContent>{children}</RouteContent></main>
        <Footer locale={locale} />
        <CookieConsentManager />
        <FloatingActions whatsappUrl={whatsappUrl} />
      </body>
    </html>
  );
}
