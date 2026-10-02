import { createHmac, randomBytes, randomUUID, scryptSync, timingSafeEqual } from "crypto";
import { chmod, mkdir, readFile, writeFile } from "fs/promises";
import path from "path";

export type AdminRole = "admin" | "seo";

export type AdminUser = {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
  passwordHash: string;
  createdAt: string;
};

export class AdminUsersStoreError extends Error {
  constructor(
    public readonly code:
      | "ADMIN_USERS_READ_FAILED"
      | "ADMIN_USERS_INVALID_DATA"
      | "ADMIN_USERS_INITIALIZATION_FAILED",
  ) {
    super("Admin users storage is unavailable.");
    this.name = "AdminUsersStoreError";
  }
}

export type AdminSession = {
  uid: string;
  email: string;
  role: AdminRole;
  exp: number;
};

export const ADMIN_SESSION_COOKIE = "emitronix_admin_session";
const SESSION_TTL_MS = 8 * 60 * 60 * 1000;
const USERS_PATH = process.env.ADMIN_USERS_PATH || path.join(process.cwd(), "storage", "admin-users.json");

function sessionSecret() {
  return process.env.ADMIN_SESSION_SECRET || "";
}

export function isAdminConfigured() {
  return Boolean(sessionSecret());
}

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string) {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const candidate = scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, "hex");
  return candidate.length === expected.length && timingSafeEqual(candidate, expected);
}

async function writeUsers(users: AdminUser[], exclusive = false) {
  const directory = path.dirname(USERS_PATH);
  await mkdir(directory, { recursive: true, mode: 0o700 });
  await chmod(directory, 0o700);
  await writeFile(USERS_PATH, JSON.stringify(users, null, 2), {
    encoding: "utf8",
    mode: 0o600,
    flag: exclusive ? "wx" : "w",
  });
  await chmod(USERS_PATH, 0o600);
}

function hasErrorCode(error: unknown, code: string) {
  return Boolean(error && typeof error === "object" && "code" in error && error.code === code);
}

function isAdminUsers(value: unknown): value is AdminUser[] {
  return Array.isArray(value) && value.length > 0 && value.every((user: unknown) => {
    if (!user || typeof user !== "object" || Array.isArray(user)) return false;
    const record = user as Record<string, unknown>;
    return ["id", "email", "name", "createdAt", "passwordHash"].every((field) => {
      const entry = record[field];
      return typeof entry === "string" && entry.trim().length > 0;
    }) && (record.role === "admin" || record.role === "seo")
      && typeof record.passwordHash === "string"
      && /^[^:]+:[a-fA-F0-9]{128}$/.test(record.passwordHash);
  });
}

function parseUsers(raw: string): AdminUser[] {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new AdminUsersStoreError("ADMIN_USERS_INVALID_DATA");
  }
  if (!isAdminUsers(parsed)) throw new AdminUsersStoreError("ADMIN_USERS_INVALID_DATA");
  return parsed;
}

/**
 * Loads existing users without repairing or replacing invalid data.
 * Only a missing file permits first-use bootstrap from ADMIN_EMAIL / ADMIN_PASSWORD.
 */
export async function loadAdminUsers(): Promise<AdminUser[]> {
  let raw: string | undefined;
  try {
    raw = await readFile(USERS_PATH, "utf8");
  } catch (error) {
    if (!hasErrorCode(error, "ENOENT")) throw new AdminUsersStoreError("ADMIN_USERS_READ_FAILED");
  }
  if (raw !== undefined) return parseUsers(raw);

  const seedEmail = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
  const seedPassword = process.env.ADMIN_PASSWORD || "";

  if (!seedEmail || !seedPassword) return [];

  const seeded: AdminUser[] = [
    {
      id: randomUUID(),
      email: seedEmail,
      name: "Administrator",
      role: "admin",
      passwordHash: hashPassword(seedPassword),
      createdAt: new Date().toISOString(),
    },
  ];
  try {
    // A file created after the missing-file read must never be truncated.
    await writeUsers(seeded, true);
  } catch (error) {
    if (!hasErrorCode(error, "EEXIST")) throw new AdminUsersStoreError("ADMIN_USERS_INITIALIZATION_FAILED");
    try {
      raw = await readFile(USERS_PATH, "utf8");
    } catch {
      throw new AdminUsersStoreError("ADMIN_USERS_READ_FAILED");
    }
    return parseUsers(raw);
  }
  return seeded;
}

export async function saveAdminUsers(users: AdminUser[]) {
  await writeUsers(users);
}

function sign(payload: string) {
  return createHmac("sha256", sessionSecret()).update(payload).digest("base64url");
}

export function createSessionValue(user: Pick<AdminUser, "id" | "email" | "role">) {
  const session: AdminSession = {
    uid: user.id,
    email: user.email,
    role: user.role,
    exp: Date.now() + SESSION_TTL_MS,
  };
  const payload = Buffer.from(JSON.stringify(session)).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function verifySessionValue(value: string | undefined | null): AdminSession | null {
  if (!value || !sessionSecret()) return null;
  const [payload, signature] = value.split(".");
  if (!payload || !signature) return null;

  const expected = sign(payload);
  const sigBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (sigBuffer.length !== expectedBuffer.length || !timingSafeEqual(sigBuffer, expectedBuffer)) return null;

  try {
    const session = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as AdminSession;
    if (!session.uid || !session.role || session.exp < Date.now()) return null;
    return session;
  } catch {
    return null;
  }
}

/** Reads and verifies the admin session from a request-like cookie store. */
export function sessionFromCookies(cookies: { get: (name: string) => { value: string } | undefined }) {
  return verifySessionValue(cookies.get(ADMIN_SESSION_COOKIE)?.value);
}

export function hasRole(session: AdminSession | null, roles: AdminRole[] = ["admin", "seo"]) {
  return Boolean(session && roles.includes(session.role));
}
