import { NextRequest, NextResponse, type NextFetchEvent } from "next/server";
import { isArabicPath } from "@/lib/i18n";
import { isUnknownClosedSetPath } from "@/lib/routeAccessPolicy";

type RedirectEntry = { from: string; to: string; permanent: boolean };

const CACHE_TTL_MS = 30 * 1000;
const REDIRECT_LOOKUP_TIMEOUT_MS = 500;
const REDIRECT_RETRY_MS = 5 * 1000;
const ARABIC_NOT_FOUND_ROUTE = "/ar/emitronix-route-not-found";
const INTERNAL_NOT_FOUND_HEADER = "x-emitronix-internal-not-found";
const PUBLIC_ORIGIN = "https://emitronix.ae";

let cache: Map<string, RedirectEntry> | null = null;
let refreshAfter = 0;
let pendingRefresh: Promise<Map<string, RedirectEntry>> | null = null;

function preferredPublicPath(pathname: string) {
  let preferred = pathname.replace(/\/{2,}/g, "/");

  if (preferred === "/en") preferred = "/";
  else if (preferred.startsWith("/en/")) preferred = preferred.slice(3) || "/";

  while (preferred === "/ar/ar" || preferred.startsWith("/ar/ar/")) {
    preferred = `/ar${preferred.slice(6)}`;
  }

  preferred = preferred.toLowerCase().replace(/\/+$/, "") || "/";
  return preferred;
}

function nextWithLocaleHeaders(request: NextRequest, status?: number) {
  const response = NextResponse.next(status ? { status } : undefined);
  response.headers.set(
    "Content-Language",
    isArabicPath(request.nextUrl.pathname) ? "ar-AE" : "en-AE",
  );
  return response;
}

function rewriteToBrandedNotFound(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(INTERNAL_NOT_FOUND_HEADER, "1");

  const destination = request.nextUrl.clone();
  destination.pathname = isArabicPath(request.nextUrl.pathname)
    ? ARABIC_NOT_FOUND_ROUTE
    : "/__emitronix-route-not-found";
  destination.search = "";

  const response = NextResponse.rewrite(destination, {
    status: 404,
    request: {
      headers: requestHeaders,
    },
  });
  response.headers.set(
    "Content-Language",
    isArabicPath(request.nextUrl.pathname) ? "ar-AE" : "en-AE",
  );
  return response;
}

function refreshRedirects(request: NextRequest): Promise<Map<string, RedirectEntry>> {
  if (pendingRefresh) return pendingRefresh;

  const controller = new AbortController();
  let timeout: ReturnType<typeof setTimeout>;
  const deadline = new Promise<never>((_, reject) => {
    timeout = setTimeout(() => {
      controller.abort();
      reject(new Error("Redirect lookup timed out"));
    }, REDIRECT_LOOKUP_TIMEOUT_MS);
  });
  const lookup = async () => {
    const origin = process.env.INTERNAL_ORIGIN || request.nextUrl.origin;
    const response = await fetch(`${origin}/api/redirects/export`, {
      cache: "no-store",
      signal: controller.signal,
    });
    if (!response.ok) throw new Error("Redirect lookup failed");
    const data = (await response.json()) as { redirects?: RedirectEntry[] } | null;
    if (!Array.isArray(data?.redirects)) throw new Error("Invalid redirect map");

    const map = new Map<string, RedirectEntry>();
    for (const entry of data.redirects) {
      if (typeof entry?.from === "string" && entry.from && typeof entry.to === "string" && entry.to) {
        map.set(entry.from, entry);
      }
    }
    return map;
  };

  // Bound the response body as well as the connection. Only the winning
  // lookup may update the cache, even if a timed-out fetch finishes later.
  pendingRefresh = Promise.race([lookup(), deadline])
    .then((map) => {
      cache = map;
      refreshAfter = Date.now() + CACHE_TTL_MS;
      return map;
    })
    .catch(() => {
      // Keep known redirects during an outage. A cold failure also initializes
      // the fallback so future retries can happen without blocking navigation.
      cache ??= new Map<string, RedirectEntry>();
      refreshAfter = Date.now() + REDIRECT_RETRY_MS;
      return cache;
    })
    .finally(() => {
      clearTimeout(timeout);
      pendingRefresh = null;
    });
  return pendingRefresh;
}

async function loadRedirects(request: NextRequest, event: NextFetchEvent): Promise<Map<string, RedirectEntry>> {
  if (cache && Date.now() < refreshAfter) return cache;

  const refresh = refreshRedirects(request);
  if (cache) {
    // A page request must not wait for an expired map. Keep the refresh alive
    // after returning the response, including on edge/serverless runtimes.
    event.waitUntil(refresh);
    return cache;
  }
  return refresh;
}

export async function middleware(request: NextRequest, event: NextFetchEvent) {
  const pathname = preferredPublicPath(request.nextUrl.pathname);

  if (pathname !== request.nextUrl.pathname) {
    // NextURL can reapply the incoming slash. Build against the canonical
    // origin so proxy host details cannot leak into public redirects.
    const destination = new URL(`${pathname}${request.nextUrl.search}`, PUBLIC_ORIGIN);
    return NextResponse.redirect(destination, 308);
  }

  // A same-origin rewrite passes through middleware again in production.
  // Render the private Arabic destination once while preserving the outer 404.
  if (
    pathname === ARABIC_NOT_FOUND_ROUTE &&
    request.headers.get(INTERNAL_NOT_FOUND_HEADER) === "1"
  ) {
    return nextWithLocaleHeaders(request, 404);
  }

  const redirects = await loadRedirects(request, event);
  const entry = redirects.get(pathname);
  if (entry) {
    try {
      const destination = entry.to.startsWith("http") ? entry.to : new URL(entry.to, request.url);
      return NextResponse.redirect(destination, entry.permanent ? 301 : 302);
    } catch {
      // Ignore malformed administrator data instead of surfacing a runtime error.
    }
  }

  if (isUnknownClosedSetPath(pathname)) {
    return rewriteToBrandedNotFound(request);
  }

  return nextWithLocaleHeaders(request);
}

export const config = {
  // Arabic misses must be localized even when the public URL has a file-like
  // suffix. The general matcher still skips real static assets, APIs and admin.
  matcher: [
    "/ar/:path*",
    "/((?!_next/|api/|admin|favicon|images/|.*\\.[a-zA-Z0-9]+$).*)",
  ],
};
