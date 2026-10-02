"use client";

/* eslint-disable @next/next/no-html-link-for-pages -- Recovery links must perform a full navigation even when client routing has failed. */
import { ArrowRight, RefreshCw } from "lucide-react";
import { startTransition } from "react";
import { useRouter } from "next/navigation";
import { ErrorPageShell } from "@/components/ErrorPageShell";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  return (
    <ErrorPageShell
      code="500"
      eyebrow="Temporary problem"
      title="We could not load this page."
      description="The request reached Emitronix, but the page could not be completed. No technical details have been exposed. Try again or return to a stable page."
      actions={
        <>
          <button
            type="button"
            onClick={() => {
              startTransition(() => {
                router.refresh();
                reset();
              });
            }}
            className="premium-button"
          >
            Try Again <RefreshCw className="h-4 w-4" aria-hidden="true" />
          </button>
          <a href="/" className="premium-button-light">
            Back to Home <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </a>
          <a href="/contact" className="premium-button-light">
            Contact Emitronix <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </a>
        </>
      }
    />
  );
}
