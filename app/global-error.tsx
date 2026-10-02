"use client";

/* eslint-disable @next/next/no-html-link-for-pages -- Recovery links must perform a full navigation even when client routing has failed. */
import { ArrowRight, RefreshCw } from "lucide-react";
import { ErrorPageShell } from "@/components/ErrorPageShell";
import "./globals.css";

export default function GlobalError() {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body className="min-h-screen bg-brand-dark antialiased">
        <main id="main-content">
          <ErrorPageShell
            code="500"
            eyebrow="Service interruption"
            title="Emitronix is temporarily unavailable."
            description="A genuine server error prevented the website shell from loading. No stack trace or internal error detail is shown. Please retry or return to the home page."
            actions={
              <>
                <button type="button" onClick={() => window.location.reload()} className="premium-button">
                  Try Again <RefreshCw className="h-4 w-4" aria-hidden="true" />
                </button>
                <a href="/" className="premium-button-light">
                  Back to Home <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </a>
              </>
            }
          />
        </main>
      </body>
    </html>
  );
}
