import { promises as fs } from "fs";
import path from "path";
import { withConsentFileLock } from "@/lib/consentFileLock";
import {
  cookieCategoryIds,
  defaultCookieConsentConfig,
  normalizeCookieConsentConfig,
  type ConsentCategoryMap,
  type CookieCategoryId,
  type CookieConsentConfig,
} from "@/data/cookieConsentDefaults";

type ConsentAction = "accept_all" | "reject_non_essential" | "customize" | "save_preferences";

export type CookieConsentStats = {
  totalEvents: number;
  actions: Record<ConsentAction, number>;
  categories: Record<CookieCategoryId, number>;
  lastConsentAt: string | null;
  resetAt: string | null;
};

export type CookieConsentStoreData = {
  config: CookieConsentConfig;
  stats: CookieConsentStats;
};

type ConsentEventInput = {
  action?: unknown;
  categories?: Partial<Record<CookieCategoryId, unknown>>;
};

const defaultStats: CookieConsentStats = {
  totalEvents: 0,
  actions: {
    accept_all: 0,
    reject_non_essential: 0,
    customize: 0,
    save_preferences: 0,
  },
  categories: {
    necessary: 0,
    analytics: 0,
    marketing: 0,
    functional: 0,
    performance: 0,
  },
  lastConsentAt: null,
  resetAt: null,
};

function storePath() {
  return process.env.COOKIE_CONSENT_STORE_PATH || path.join(process.cwd(), "storage", "cookie-consent.json");
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function normalizeStats(stats: Partial<CookieConsentStats> | undefined): CookieConsentStats {
  return {
    totalEvents: Number(stats?.totalEvents || 0),
    actions: {
      accept_all: Number(stats?.actions?.accept_all || 0),
      reject_non_essential: Number(stats?.actions?.reject_non_essential || 0),
      customize: Number(stats?.actions?.customize || 0),
      save_preferences: Number(stats?.actions?.save_preferences || 0),
    },
    categories: {
      necessary: Number(stats?.categories?.necessary || 0),
      analytics: Number(stats?.categories?.analytics || 0),
      marketing: Number(stats?.categories?.marketing || 0),
      functional: Number(stats?.categories?.functional || 0),
      performance: Number(stats?.categories?.performance || 0),
    },
    lastConsentAt: typeof stats?.lastConsentAt === "string" ? stats.lastConsentAt : null,
    resetAt: typeof stats?.resetAt === "string" ? stats.resetAt : null,
  };
}

async function readStore(filePath = storePath(), strict = false): Promise<CookieConsentStoreData> {
  try {
    const file = await fs.readFile(filePath, "utf8");
    const data = JSON.parse(file) as Partial<CookieConsentStoreData>;
    return {
      config: normalizeCookieConsentConfig(data.config),
      stats: normalizeStats(data.stats),
    };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      console.error("Cookie consent store read failed", {
        code: "CONSENT_STORE_READ_FAILED",
        reason: cookieConsentErrorReason(error),
      });
      // A failed mutation read must not replace existing counters with defaults.
      if (strict) throw error;
    }
    return {
      config: clone(defaultCookieConsentConfig),
      stats: clone(defaultStats),
    };
  }
}

async function withCleanup<T>(operation: () => Promise<T>, cleanup: () => Promise<unknown>): Promise<T> {
  let result: T;
  try {
    result = await operation();
  } catch (error) {
    try {
      await cleanup();
    } catch (cleanupError) {
      throw new AggregateError([error, cleanupError], "Cookie consent operation and cleanup failed");
    }
    throw error;
  }
  await cleanup();
  return result;
}

export function cookieConsentErrorReason(error: unknown): string {
  if (error instanceof SyntaxError) return "INVALID_JSON";
  if (error instanceof AggregateError) return "OPERATION_AND_CLEANUP_FAILED";
  const code = error && typeof error === "object" && "code" in error ? error.code : undefined;
  return typeof code === "string" && [
    "EACCES", "EPERM", "ENOENT", "EEXIST", "EIO", "ENOSPC", "EROFS", "ENOTEMPTY", "EXDEV",
    "CONSENT_LOCK_LEGACY", "CONSENT_LOCK_INVALID", "CONSENT_LOCK_FOREIGN_OWNER",
    "CONSENT_LOCK_OWNER_UNVERIFIABLE", "CONSENT_LOCK_TIMEOUT", "CONSENT_LOCK_UNSUPPORTED_PLATFORM",
  ].includes(code) ? code : "STORAGE_UNAVAILABLE";
}

async function mutateStore<T>(mutation: (data: CookieConsentStoreData, filePath: string, temporaryPath: string) => Promise<T>) {
  const filePath = path.resolve(storePath());
  const directory = path.dirname(filePath);
  await fs.mkdir(directory, { recursive: true, mode: 0o700 });
  await fs.chmod(directory, 0o700);
  return withConsentFileLock(filePath, async temporaryPath => mutation(await readStore(filePath, true), filePath, temporaryPath));
}

async function writeStore(data: CookieConsentStoreData, filePath: string, tmpPath: string) {
  const file = await fs.open(tmpPath, "wx", 0o600);
  return withCleanup(async () => {
    await withCleanup(
      () => file.writeFile(JSON.stringify(data, null, 2), "utf8"),
      () => file.close(),
    );
    await fs.rename(tmpPath, filePath);
    await fs.chmod(filePath, 0o600);
  }, () => fs.rm(tmpPath, { force: true }));
}

export async function getCookieConsentData() {
  return readStore();
}

export async function getCookieConsentConfig() {
  const data = await readStore();
  return data.config;
}

export async function updateCookieConsentConfig(config: CookieConsentConfig) {
  return mutateStore(async (data, filePath, temporaryPath) => {
    const nextConfig = normalizeCookieConsentConfig({
      ...config,
      version: Math.max(1, Number(data.config.version || 1) + 1),
      updatedAt: new Date().toISOString(),
    });
    const nextData = {
      ...data,
      config: nextConfig,
    };
    await writeStore(nextData, filePath, temporaryPath);
    return nextData;
  });
}

export async function resetCookieConsents() {
  return mutateStore(async (data, filePath, temporaryPath) => {
    const nextData: CookieConsentStoreData = {
      config: normalizeCookieConsentConfig({
        ...data.config,
        version: Math.max(1, Number(data.config.version || 1) + 1),
        updatedAt: new Date().toISOString(),
      }),
      stats: {
        ...clone(defaultStats),
        resetAt: new Date().toISOString(),
      },
    };
    await writeStore(nextData, filePath, temporaryPath);
    return nextData;
  });
}

function sanitizeAction(action: unknown): ConsentAction {
  if (action === "accept_all" || action === "reject_non_essential" || action === "customize" || action === "save_preferences") {
    return action;
  }
  return "save_preferences";
}

function sanitizeCategoryMap(categories: ConsentEventInput["categories"]): ConsentCategoryMap {
  return cookieCategoryIds.reduce((result, id) => {
    result[id] = id === "necessary" ? true : categories?.[id] === true;
    return result;
  }, {} as ConsentCategoryMap);
}

export async function recordCookieConsentEvent(input: ConsentEventInput) {
  return mutateStore(async (data, filePath, temporaryPath) => {
    const action = sanitizeAction(input.action);
    const categories = sanitizeCategoryMap(input.categories);
    const nextStats = normalizeStats(data.stats);

    nextStats.totalEvents += 1;
    nextStats.actions[action] += 1;
    nextStats.lastConsentAt = new Date().toISOString();

    for (const id of cookieCategoryIds) {
      if (categories[id]) {
        nextStats.categories[id] += 1;
      }
    }

    const nextData = {
      ...data,
      stats: nextStats,
    };
    await writeStore(nextData, filePath, temporaryPath);
    return nextStats;
  });
}
