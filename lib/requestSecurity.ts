import { isIP } from "net";

/**
 * NextRequest does not authenticate the network peer. Enable this only after a
 * verified private backend and trusted ingress strip/overwrite this one header.
 * X-Forwarded-For, X-Real-IP and other client-provided chains are never consulted.
 */
export function clientIp(request: { headers: Headers }): string {
  if (process.env.EMITRONIX_TRUST_PROXY !== "1") return "unknown";
  const value = request.headers.get("x-emitronix-client-ip")?.trim();
  if (!value || value.length > 45 || value.includes("%")) return "unknown";
  const family = isIP(value);
  if (family === 4) return value;
  if (family !== 6) return "unknown";
  const normalized = new URL(`http://[${value}]/`).hostname.slice(1, -1).toLowerCase();
  // Equivalent IPv4 and IPv4-mapped IPv6 spellings share the same bucket.
  const mapped = /^::ffff:([a-f0-9]{1,4}):([a-f0-9]{1,4})$/.exec(normalized);
  if (mapped) {
    const high = Number.parseInt(mapped[1], 16);
    const low = Number.parseInt(mapped[2], 16);
    return [high >> 8, high & 255, low >> 8, low & 255].join(".");
  }
  return normalized;
}

function normalizedOrigin(value: string | null) {
  if (!value) return null;
  try {
    const url = new URL(value);
    if (!["http:", "https:"].includes(url.protocol) || url.username || url.password ||
        url.pathname !== "/" || url.search || url.hash) return null;
    return url.origin;
  } catch {
    return null;
  }
}

export function isSameOriginRequest(request: { headers: Headers; url: string }, productionOrigin: string) {
  if (request.headers.get("sec-fetch-site") === "cross-site") return false;
  const supplied = normalizedOrigin(request.headers.get("origin"));
  if (!supplied) return false;
  try {
    // A production request URL/Host can itself originate from proxy input.
    // Compare against the configured, verified public site rather than trusting
    // a forwarded/raw Host alternative. Local development uses its direct URL.
    const expected = process.env.NODE_ENV === "production"
      ? normalizedOrigin(productionOrigin)
      : new URL(request.url).origin;
    return supplied === expected;
  } catch {
    return false;
  }
}

type LimiterOptions = { limit: number; windowMs: number; maxKeys?: number; now?: () => number };

/** Per-process protection only; independent workers and restarts do not share it. */
export function createLocalRateLimiter({ limit, windowMs, maxKeys = 10_000, now = Date.now }: LimiterOptions) {
  if (!Number.isSafeInteger(limit) || limit <= 0 || !Number.isSafeInteger(windowMs) || windowMs <= 0 ||
      !Number.isSafeInteger(maxKeys) || maxKeys <= 0) throw new RangeError("Invalid local rate limiter configuration");
  const entries = new Map<string, { count: number; resetAt: number }>();
  let nextExpiry = Infinity;
  return (key: string): boolean => {
    const currentTime = now();
    if (currentTime >= nextExpiry) {
      nextExpiry = Infinity;
      for (const [candidate, entry] of entries) {
        if (entry.resetAt <= currentTime) entries.delete(candidate);
        else nextExpiry = Math.min(nextExpiry, entry.resetAt);
      }
    }
    const current = entries.get(key);
    if (current) {
      if (current.count >= limit) return true;
      current.count += 1;
      return false;
    }
    // Never evict an active key: eviction would reset its allowance and make
    // rotation through distinct identities an easy limit bypass.
    if (entries.size >= maxKeys) return true;
    const resetAt = currentTime + windowMs;
    entries.set(key, { count: 1, resetAt });
    nextExpiry = Math.min(nextExpiry, resetAt);
    return false;
  };
}
