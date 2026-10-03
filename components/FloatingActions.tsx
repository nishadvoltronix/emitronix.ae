"use client";

import { MessageCircle } from "lucide-react";
import { usePathname } from "next/navigation";
import { isArabicPath } from "@/lib/i18n";
import { useHydrationSafePathname } from "@/components/useHydrationSafePathname";

type SalesIqLauncherWindow = Window & {
  EmitronixJyothika?: {
    open?: () => boolean | void;
  };
};

const CHAT_REQUEST_EVENT = "emitronix:request-zoho-chat";

const arabicLabels = {
  whatsapp: "\u062a\u062d\u062f\u062b \u0645\u0639 Emitronix \u0639\u0628\u0631 \u0648\u0627\u062a\u0633\u0627\u0628",
  needHelp: "\u062a\u062d\u062a\u0627\u062c \u0645\u0633\u0627\u0639\u062f\u0629\u061f",
  openChat: "\u0627\u0641\u062a\u062d \u062f\u0631\u062f\u0634\u0629 Emitronix",
  liveChat: "\u062f\u0631\u062f\u0634\u0629 \u0645\u0628\u0627\u0634\u0631\u0629",
};

function openZohoChat() {
  const opened = (window as SalesIqLauncherWindow).EmitronixJyothika?.open?.();
  if (!opened) window.dispatchEvent(new Event(CHAT_REQUEST_EVENT));
}

export function FloatingActions({ whatsappUrl }: { whatsappUrl: string }) {
  const pathname = useHydrationSafePathname(usePathname());
  const isArabic = isArabicPath(pathname);

  return (
    <aside aria-label={isArabic ? "\u062e\u064a\u0627\u0631\u0627\u062a \u0627\u0644\u062a\u0648\u0627\u0635\u0644" : "Contact options"}>
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={isArabic ? `${arabicLabels.needHelp} ${arabicLabels.whatsapp}` : "Need Help? Chat with Emitronix on WhatsApp"}
        className="fixed bottom-5 left-5 z-[99999] flex items-center gap-3 rounded-full"
      >
        <span className="grid h-14 w-14 place-items-center rounded-full bg-[#25D366] text-white shadow-xl shadow-brand/[0.15] ring-4 ring-white transition hover:scale-105 sm:h-16 sm:w-16">
          <svg viewBox="0 0 32 32" aria-hidden="true" className="h-10 w-10 fill-current">
            <path d="M16.04 3.2c-7.05 0-12.8 5.72-12.8 12.76 0 2.25.59 4.45 1.72 6.38L3.13 29l6.83-1.79a12.8 12.8 0 0 0 6.08 1.55h.01c7.05 0 12.8-5.72 12.8-12.76S23.1 3.2 16.04 3.2Zm0 23.39h-.01a10.6 10.6 0 0 1-5.39-1.47l-.39-.23-4.05 1.06 1.08-3.94-.26-.4a10.52 10.52 0 0 1-1.62-5.65c0-5.84 4.77-10.59 10.64-10.59 2.84 0 5.51 1.1 7.52 3.1a10.5 10.5 0 0 1 3.12 7.49c0 5.84-4.77 10.63-10.64 10.63Zm5.83-7.94c-.32-.16-1.9-.94-2.2-1.05-.29-.11-.51-.16-.72.16-.21.32-.83 1.05-1.01 1.26-.19.21-.37.24-.69.08-.32-.16-1.35-.5-2.57-1.58-.95-.85-1.59-1.89-1.78-2.21-.19-.32-.02-.49.14-.65.14-.14.32-.37.48-.56.16-.19.21-.32.32-.53.11-.21.05-.4-.03-.56-.08-.16-.72-1.74-.99-2.38-.26-.62-.53-.54-.72-.55h-.61c-.21 0-.56.08-.85.4-.29.32-1.12 1.1-1.12 2.67 0 1.58 1.15 3.1 1.31 3.31.16.21 2.27 3.46 5.5 4.85.77.33 1.37.53 1.84.68.77.24 1.48.21 2.04.13.62-.09 1.9-.78 2.17-1.53.27-.75.27-1.39.19-1.53-.08-.13-.29-.21-.61-.37Z" />
          </svg>
        </span>
        <span className="hidden rounded-full border border-brand/[0.15] bg-white/[0.92] px-4 py-3 text-sm font-black uppercase tracking-wide text-charcoal shadow-xl shadow-brand/[0.12] backdrop-blur-xl sm:block">
          {isArabic ? arabicLabels.needHelp : "Need Help?"}
        </span>
      </a>
      <button
        type="button"
        onClick={openZohoChat}
        aria-label={isArabic ? `${arabicLabels.liveChat}: ${arabicLabels.openChat}` : "Live Chat: Open Emitronix Zoho chatbot"}
        className="fixed bottom-5 right-5 z-[99999] flex items-center gap-3 rounded-full"
      >
        <span className="grid h-14 w-14 place-items-center rounded-full bg-brand text-white shadow-xl shadow-brand/[0.18] ring-4 ring-white transition hover:scale-105 sm:h-16 sm:w-16">
          <MessageCircle className="h-7 w-7" />
        </span>
        <span className="hidden rounded-full border border-brand/[0.15] bg-white/[0.92] px-4 py-3 text-sm font-black uppercase tracking-wide text-charcoal shadow-xl shadow-brand/[0.12] backdrop-blur-xl sm:block">
          {isArabic ? arabicLabels.liveChat : "Live Chat"}
        </span>
      </button>
    </aside>
  );
}
