import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { hostname } from "os";
import { execFile } from "child_process";
import { promisify } from "util";
import { setTimeout as delay } from "timers/promises";

const execFileAsync = promisify(execFile);
const UUID = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/;
const DIGITS = /^\d{1,24}$/;
const WAIT_MS = 30_000;
const WINDOWS_IDENTITY_SCRIPT = "$ErrorActionPreference = 'Stop'; $p = Get-Process -Id ([int]$env:EMITRONIX_LOCK_QUERY_PID) -ErrorAction Stop; $p.StartTime.ToUniversalTime().Ticks.ToString([System.Globalization.CultureInfo]::InvariantCulture)";

type LinuxIdentity = {
  kind: "linux";
  bootId: string;
  namespace: string;
  startTime: string;
  machineId: string | null;
};
type WindowsIdentity = { kind: "win32"; startTime: string };
type Identity = LinuxIdentity | WindowsIdentity;
type Owner = { version: 2; token: string; pid: number; host: string; platform: string; identity: Identity };
type LockCode = "CONSENT_LOCK_LEGACY" | "CONSENT_LOCK_INVALID" | "CONSENT_LOCK_FOREIGN_OWNER" |
  "CONSENT_LOCK_OWNER_UNVERIFIABLE" | "CONSENT_LOCK_TIMEOUT" | "CONSENT_LOCK_UNSUPPORTED_PLATFORM";

export class ConsentFileLockError extends Error {
  constructor(readonly code: LockCode) {
    super(code);
    this.name = "ConsentFileLockError";
  }
}

function errorCode(error: unknown) {
  return (error as NodeJS.ErrnoException | undefined)?.code;
}

async function optionalMachineId() {
  try {
    const value = (await fs.readFile("/etc/machine-id", "utf8")).trim();
    return /^[a-f0-9]{32}$/.test(value) ? value : null;
  } catch {
    return null;
  }
}

async function linuxProcess(pid: number) {
  const stat = await fs.readFile(`/proc/${pid}/stat`, "utf8");
  const close = stat.lastIndexOf(")");
  const fields = stat.slice(close + 2).trim().split(/\s+/);
  if (close < 0 || Number(stat.slice(0, stat.indexOf("("))) !== pid || !DIGITS.test(fields[19] || "")) {
    throw new ConsentFileLockError("CONSENT_LOCK_OWNER_UNVERIFIABLE");
  }
  // After the parenthesized command, state is field 3 and starttime is field 22.
  return { startTime: fields[19], dead: fields[0] === "Z" || fields[0] === "X" || fields[0] === "x" };
}

const windowsIdentityRequests = new Map<string, Promise<string>>();
async function windowsStartTime(pid: number, expectedStartTime = "current") {
  if (!Number.isSafeInteger(pid) || pid <= 0 || pid > 2_147_483_647) {
    throw new ConsentFileLockError("CONSENT_LOCK_OWNER_UNVERIFIABLE");
  }
  // Coalesce readers of the same process incarnation. Sharing across distinct
  // expected start times could return stale data after PID reuse.
  const key = `${pid}:${expectedStartTime}`;
  const existing = windowsIdentityRequests.get(key);
  if (existing) return existing;
  const query = (async () => {
    try {
      const systemRoot = process.env.SystemRoot || process.env.WINDIR || "C:\\Windows";
      if (!path.win32.isAbsolute(systemRoot)) throw new Error("Invalid system directory");
      const powershell = path.win32.join(systemRoot, "System32", "WindowsPowerShell", "v1.0", "powershell.exe");
      const { stdout } = await execFileAsync(powershell, ["-NoLogo", "-NoProfile", "-NonInteractive", "-Command", WINDOWS_IDENTITY_SCRIPT], {
        env: { ...process.env, EMITRONIX_LOCK_QUERY_PID: String(pid) },
        timeout: 5_000,
        maxBuffer: 1_024,
        windowsHide: true,
      });
      const value = stdout.trim();
      if (!DIGITS.test(value)) throw new Error("Invalid process identity");
      return value;
    } catch {
      throw new ConsentFileLockError("CONSENT_LOCK_OWNER_UNVERIFIABLE");
    }
  })();
  windowsIdentityRequests.set(key, query);
  try { return await query; } finally {
    windowsIdentityRequests.delete(key);
  }
}

let ownIdentity: Promise<Identity> | undefined;
function identity(): Promise<Identity> {
  ownIdentity ??= (async (): Promise<Identity> => {
    if (process.platform === "win32") return { kind: "win32", startTime: await windowsStartTime(process.pid) };
    if (process.platform !== "linux") throw new ConsentFileLockError("CONSENT_LOCK_UNSUPPORTED_PLATFORM");
    try {
      const [bootId, namespace, current, machineId] = await Promise.all([
        fs.readFile("/proc/sys/kernel/random/boot_id", "utf8"),
        fs.readlink("/proc/self/ns/pid"),
        linuxProcess(process.pid),
        optionalMachineId(),
      ]);
      if (!UUID.test(bootId.trim()) || !/^pid:\[\d+\]$/.test(namespace)) throw new Error("Invalid process identity");
      return { kind: "linux", bootId: bootId.trim(), namespace, startTime: current.startTime, machineId };
    } catch {
      throw new ConsentFileLockError("CONSENT_LOCK_OWNER_UNVERIFIABLE");
    }
  })().catch(error => {
    ownIdentity = undefined;
    throw error;
  });
  return ownIdentity;
}

function parseOwner(value: unknown, token: string): Owner {
  if (!value || typeof value !== "object") throw new ConsentFileLockError("CONSENT_LOCK_INVALID");
  const owner = value as Owner;
  const id = owner.identity;
  if (owner.version !== 2 || owner.token !== token || !UUID.test(token) || !Number.isSafeInteger(owner.pid) || owner.pid <= 0 ||
      typeof owner.host !== "string" || !owner.host || owner.host.length > 255 || !id || typeof id !== "object" ||
      typeof id.startTime !== "string" || !DIGITS.test(id.startTime) || owner.platform !== id.kind) {
    throw new ConsentFileLockError("CONSENT_LOCK_INVALID");
  }
  if (id.kind === "win32") return owner;
  if (id.kind !== "linux" || typeof id.bootId !== "string" || !UUID.test(id.bootId) ||
      typeof id.namespace !== "string" || !/^pid:\[\d+\]$/.test(id.namespace) ||
      !(id.machineId === null || (typeof id.machineId === "string" && /^[a-f0-9]{32}$/.test(id.machineId)))) {
    throw new ConsentFileLockError("CONSENT_LOCK_INVALID");
  }
  return owner;
}

// Cache only a positive live check for this unique owner. A PID-only cache could
// mistake a later owner with a reused PID for a dead process.
const liveOwners = new Map<string, number>();
const liveProcesses = new Map<number, { startTime: string; until: number }>();
async function ownerIsDead(owner: Owner, current: Identity) {
  if (owner.host !== hostname() || owner.platform !== process.platform || owner.identity.kind !== current.kind) {
    throw new ConsentFileLockError("CONSENT_LOCK_FOREIGN_OWNER");
  }
  if (owner.identity.kind === "linux" && current.kind === "linux") {
    if (owner.identity.bootId !== current.bootId) {
      if (current.machineId && owner.identity.machineId === current.machineId) return true;
      throw new ConsentFileLockError("CONSENT_LOCK_FOREIGN_OWNER");
    }
    if (owner.identity.namespace !== current.namespace ||
        (current.machineId && owner.identity.machineId && current.machineId !== owner.identity.machineId)) {
      throw new ConsentFileLockError("CONSENT_LOCK_FOREIGN_OWNER");
    }
  }
  if (owner.pid === process.pid) return owner.identity.startTime !== current.startTime;
  if ((liveOwners.get(owner.token) || 0) > performance.now()) return false;
  const cachedProcess = liveProcesses.get(owner.pid);
  // A matching cached identity may delay recovery briefly. A mismatch is never
  // proof of death: it could be stale after PID reuse and must be inspected anew.
  if (cachedProcess?.startTime === owner.identity.startTime && cachedProcess.until > performance.now()) return false;
  try {
    process.kill(owner.pid, 0);
  } catch (error) {
    if (errorCode(error) === "ESRCH") return true;
    throw new ConsentFileLockError("CONSENT_LOCK_OWNER_UNVERIFIABLE");
  }
  try {
    if (current.kind === "linux") {
      const observed = await linuxProcess(owner.pid);
      if (observed.dead || observed.startTime !== owner.identity.startTime) return true;
    } else if (await windowsStartTime(owner.pid, owner.identity.startTime) !== owner.identity.startTime) {
      return true;
    }
  } catch (error) {
    // The process may have exited between the existence check and inspection.
    try { process.kill(owner.pid, 0); } catch (probeError) {
      if (errorCode(probeError) === "ESRCH") return true;
    }
    throw error instanceof ConsentFileLockError ? error : new ConsentFileLockError("CONSENT_LOCK_OWNER_UNVERIFIABLE");
  }
  if (liveOwners.size >= 64) liveOwners.delete(liveOwners.keys().next().value!);
  liveOwners.set(owner.token, performance.now() + 250);
  if (liveProcesses.size >= 64) liveProcesses.delete(liveProcesses.keys().next().value!);
  liveProcesses.set(owner.pid, { startTime: owner.identity.startTime, until: performance.now() + 250 });
  return false;
}

async function unlinkOwned(target: string) {
  const deadline = performance.now() + 500;
  for (;;) {
    try { await fs.unlink(target); return; } catch (error) {
      if (errorCode(error) === "ENOENT") return;
      if (process.platform !== "win32" || errorCode(error) !== "EPERM") throw error;
      // Another reader/reaper can briefly retain a deletion-pending handle. The
      // exact token path is safe to retry and can never name a replacement owner.
      try { await fs.lstat(target); } catch (inspectionError) {
        if (errorCode(inspectionError) === "ENOENT") return;
        if (errorCode(inspectionError) !== "EPERM") throw error;
      }
      if (performance.now() >= deadline) throw error;
      await delay(10);
    }
  }
}

async function removeEmptyDirectory(directory: string) {
  const deadline = performance.now() + 500;
  for (;;) {
    try { await fs.rmdir(directory); return; } catch (error) {
      if (["ENOENT", "ENOTEMPTY", "EEXIST"].includes(errorCode(error) || "")) return;
      if (process.platform !== "win32" || errorCode(error) !== "EPERM") throw error;
      // Windows can keep a removed directory deletion-pending while another
      // process still holds a handle. A replacement owner must stay untouched.
      try {
        if (!(await fs.lstat(directory)).isDirectory()) throw error;
        if ((await fs.readdir(directory)).length > 0) return;
      } catch (inspectionError) {
        if (errorCode(inspectionError) === "ENOENT") return;
        if (errorCode(inspectionError) !== "EPERM") throw error;
      }
      if (performance.now() >= deadline) throw error;
      await delay(10);
    }
  }
}

async function removeOwner(directory: string, token: string) {
  // A delayed reaper can only address this exact token. Once its marker is
  // removed, a replacement owner is always nonempty and rmdir cannot remove it.
  await unlinkOwned(path.join(directory, `${token}.tmp`));
  await unlinkOwned(path.join(directory, `${token}.owner.json`));
  await removeEmptyDirectory(directory);
  liveOwners.delete(token);
}

async function inspectLockOnce(directory: string): Promise<Owner | "empty" | "missing"> {
  try {
    if (!(await fs.lstat(directory)).isDirectory()) throw new ConsentFileLockError("CONSENT_LOCK_INVALID");
    const names = await fs.readdir(directory);
    if (names.length === 0) return "empty";
    const marker = names.find(name => name.endsWith(".owner.json"));
    const token = marker?.slice(0, -".owner.json".length);
    if (!marker || !token || !UUID.test(token) || names.some(name => name !== marker && name !== `${token}.tmp`)) {
      throw new ConsentFileLockError("CONSENT_LOCK_INVALID");
    }
    const markerPath = path.join(directory, marker);
    const stat = await fs.lstat(markerPath);
    if (!stat.isFile() || stat.size > 4_096) throw new ConsentFileLockError("CONSENT_LOCK_INVALID");
    let value: unknown;
    try { value = JSON.parse(await fs.readFile(markerPath, "utf8")); } catch (error) {
      if (errorCode(error) === "ENOENT") return "missing";
      if (error instanceof SyntaxError) throw new ConsentFileLockError("CONSENT_LOCK_INVALID");
      throw error;
    }
    return parseOwner(value, token);
  } catch (error) {
    if (errorCode(error) === "ENOENT") return "missing";
    throw error;
  }
}

async function inspectLock(directory: string, deadline: number): Promise<Owner | "empty" | "missing"> {
  for (;;) {
    try { return await inspectLockOnce(directory); } catch (error) {
      // Inspection does not authorize cleanup until a complete valid owner has
      // been read. Deletion-pending reads may retry; permanent denial surfaces.
      if (process.platform !== "win32" || errorCode(error) !== "EPERM" || performance.now() >= deadline) throw error;
      await delay(10);
    }
  }
}

async function rejectLegacy(filePath: string) {
  try { await fs.lstat(`${filePath}.lock`); } catch (error) {
    if (errorCode(error) === "ENOENT") return;
    throw error;
  }
  throw new ConsentFileLockError("CONSENT_LOCK_LEGACY");
}

async function withCleanup<T>(operation: () => Promise<T>, cleanup: () => Promise<void>): Promise<T> {
  let result: T;
  try { result = await operation(); } catch (error) {
    try { await cleanup(); } catch (cleanupError) {
      throw new AggregateError([error, cleanupError], "Cookie consent operation and lock cleanup failed");
    }
    throw error;
  }
  await cleanup();
  return result;
}

/** Local filesystem, one uniquely identified host/PID namespace, v2 writers only.
 * Old writers must be stopped before rollout; an existing legacy lock is never
 * stolen. Neither elapsed time nor mtime authorizes deleting a live owner's lock.
 */
export async function withConsentFileLock<T>(filePath: string, operation: (temporaryPath: string) => Promise<T>): Promise<T> {
  await rejectLegacy(filePath);
  const current = await identity();
  const token = randomUUID();
  const lockPath = `${filePath}.lock-v2`;
  const prepared = `${lockPath}.prepare-${token}`;
  const owner: Owner = { version: 2, token, pid: process.pid, host: hostname(), platform: process.platform, identity: current };
  await fs.mkdir(prepared, { mode: 0o700 });
  let acquired = false;
  return withCleanup(async () => {
    await fs.writeFile(path.join(prepared, `${token}.owner.json`), JSON.stringify(owner), { flag: "wx", mode: 0o600 });
    const deadline = performance.now() + WAIT_MS;
    for (;;) {
      await rejectLegacy(filePath);
      try {
        await fs.rename(prepared, lockPath);
        acquired = true;
        break;
      } catch (error) {
        const existing = await inspectLock(lockPath, deadline);
        if (typeof existing === "object" && existing.token === token) {
          // A filesystem can report an error after publication; verified exact
          // ownership permits continuation without allocating a second lock.
          acquired = true;
          break;
        }
        if (existing === "missing") {
          const code = errorCode(error);
          if (process.platform === "win32" && code === "EPERM") {
            // Repeated workers can each encounter deletion-pending directories.
            // Retry only a verified missing target, within the original budget.
            if (performance.now() >= deadline) throw error;
            await delay(25);
          } else if (!["EEXIST", "ENOTEMPTY", "ENOENT"].includes(code || "")) {
            throw error;
          }
        } else if (existing === "empty") {
          await removeEmptyDirectory(lockPath);
        } else if (await ownerIsDead(existing, current)) {
          await removeOwner(lockPath, existing.token);
        }
        if (performance.now() >= deadline) throw new ConsentFileLockError("CONSENT_LOCK_TIMEOUT");
        await delay(10);
      }
    }
    return operation(path.join(lockPath, `${token}.tmp`));
  }, () => removeOwner(acquired ? lockPath : prepared, token));
}
