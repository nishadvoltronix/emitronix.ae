import type { ReactNode } from "react";
import { SectionPhotograph } from "@/components/SectionPhotograph";
import { getSectionPhotographs } from "@/data/sectionPhotography";
import { InternalPageFrame } from "@/components/InternalPageFrame";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { CookieConsentAdmin, CookieConsentAdminLogin } from "@/components/CookieConsentAdmin";
import { hasCookieAdminCookie, isCookieAdminConfigured } from "@/lib/cookieConsentAdmin";
import { getCookieConsentData } from "@/lib/cookieConsentStore";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: {
    absolute: "Cookie Consent Admin | Emitronix",
  },
  description: "Private Emitronix cookie-consent administration utility.",
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: null,
    languages: {},
  },
  openGraph: null,
  twitter: null,
};

function AdminPageIllustrations({ children }: { children: ReactNode }) {
  const photos = getSectionPhotographs("/admin/cookie-consent", 5);
  return (
    <InternalPageFrame>
      <div className="container-pad grid gap-8 py-10 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,0.6fr)] lg:items-start">
        <div className="min-w-0">{children}</div>
        <aside className="grid gap-6 sm:grid-cols-2 lg:grid-cols-1" aria-label="Representative office and records imagery">
          {photos.slice(0, 2).map(photo => <SectionPhotograph key={photo.sourceId} photo={photo} compact />)}
        </aside>
      </div>
      <div className="container-pad grid gap-6 pb-12 sm:grid-cols-3">
        {photos.slice(2).map(photo => <SectionPhotograph key={photo.sourceId} photo={photo} compact />)}
      </div>
    </InternalPageFrame>
  );
}

export default async function CookieConsentAdminPage() {
  const configured = isCookieAdminConfigured();
  const cookieStore = await cookies();

  if (!configured || !hasCookieAdminCookie(cookieStore)) {
    return (
      <AdminPageIllustrations>
        <CookieConsentAdminLogin configured={configured} />
      </AdminPageIllustrations>
    );
  }

  const data = await getCookieConsentData();
  return (
    <AdminPageIllustrations>
      <CookieConsentAdmin initialData={data} />
    </AdminPageIllustrations>
  );
}
