"use client";

import type { ReactNode } from "react";

/**
 * Resolve the App Router's potentially pending Flight child on a function
 * component, rather than on the host main element. Next 15's vendored React
 * can replay a suspended host without restoring its hydration cursor.
 * Server-rendered children stay server-rendered; no DOM or fallback is added.
 */
export function RouteContent({ children }: { children: ReactNode }) {
  return children;
}
