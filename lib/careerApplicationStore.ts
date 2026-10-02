import { createHash, randomUUID } from "crypto";
import { chmod, link, lstat, mkdir, open, readFile, rename, unlink, type FileHandle } from "fs/promises";
import path from "path";

const STORAGE_DIR = process.env.CAREERS_STORE_DIR || path.join(process.cwd(), "storage", "careers");
const TRANSACTIONS_DIR = path.join(STORAGE_DIR, ".transactions");
const DUPLICATE_WINDOW_MS = 10 * 60 * 1000;
const ID_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}-\d{3}Z-[a-f0-9-]{36}$/;
const APPLICATION_FIELDS = ["fullName", "email", "mobile", "position", "experience", "location", "expectedSalary", "noticePeriod", "message", "language", "pageUrl", "consent"];
const SAFE_CODES = new Set(["EACCES", "EPERM", "ENOENT", "EEXIST", "EIO", "ENOSPC", "EROFS", "ENOTSUP", "EXDEV", "EMFILE", "ENFILE", "ENOTDIR", "EISDIR", "EBADF"]);
type Stage = "prepare" | "claim" | "inspect" | "intent" | "cv" | "metadata" | "publish" | "cleanup-cv" | "cleanup-metadata" | "cleanup-intent" | "release";
type CleanupFailure = { stage: Stage; reason: string };
type Intent = { version: 1; id: string; extension: string };
type Submission = { fingerprint: string; extension: string; cvBuffer: Buffer; record: Record<string, unknown> };

function errorCode(error: unknown): string {
  const code = error && typeof error === "object" && "code" in error ? error.code : undefined;
  return typeof code === "string" && SAFE_CODES.has(code) ? code : "UNKNOWN";
}

export class CareerStorageError extends Error {
  public transactionRef?: string;
  constructor(
    public readonly code: "CAREER_STORAGE_FAILED" | "CAREER_RECONCILIATION_REQUIRED" | "CAREER_STORAGE_BUSY",
    public readonly stage: Stage,
    public readonly reason: string,
    public readonly id?: string,
    public readonly cleanup: CleanupFailure[] = [],
    private readonly retained = false,
  ) {
    super("Career application storage is unavailable.");
    this.name = "CareerStorageError";
  }
  get reconciliationRequired() { return this.retained || this.cleanup.length > 0; }
}

async function readRegularFile(filename: string) {
  if (!(await lstat(filename)).isFile()) throw new Error("Invalid transaction file.");
  return readFile(filename);
}

async function existingReceipt(intentPath: string, submission: Submission): Promise<Intent | null> {
  let bytes: Buffer;
  try {
    bytes = await readRegularFile(intentPath);
  } catch (error) {
    if (errorCode(error) === "ENOENT") return null;
    throw new CareerStorageError("CAREER_RECONCILIATION_REQUIRED", "inspect", errorCode(error), undefined, [], true);
  }
  let intent: Intent;
  try {
    const parsed: unknown = JSON.parse(bytes.toString("utf8"));
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error();
    const value = parsed as Record<string, unknown>;
    if (value.version !== 1 || typeof value.id !== "string" || !ID_PATTERN.test(value.id)
      || value.extension !== submission.extension) throw new Error();
    intent = value as Intent;
  } catch {
    throw new CareerStorageError("CAREER_RECONCILIATION_REQUIRED", "inspect", "INVALID_INTENT", undefined, [], true);
  }
  try {
    const cvFile = `${intent.id}${intent.extension}`;
    const record: unknown = JSON.parse((await readRegularFile(path.join(STORAGE_DIR, `${intent.id}.json`))).toString("utf8"));
    if (!record || typeof record !== "object" || Array.isArray(record)) throw new Error();
    const saved = record as Record<string, unknown>;
    if (saved.cvFile !== cvFile || !APPLICATION_FIELDS.every(field => saved[field] === submission.record[field])
      || typeof saved.submittedAt !== "string" || !Number.isFinite(Date.parse(saved.submittedAt))) throw new Error();
    if (!(await readRegularFile(path.join(STORAGE_DIR, cvFile))).equals(submission.cvBuffer)) throw new Error();
    return Date.now() - Date.parse(saved.submittedAt) < DUPLICATE_WINDOW_MS ? intent : null;
  } catch (error) {
    throw new CareerStorageError("CAREER_RECONCILIATION_REQUIRED", "inspect", errorCode(error), intent.id, [], true);
  }
}

/**
 * A private intent precedes every CV. Only this attempt's exclusive creations
 * can be rolled back. Incomplete/locked transactions require reconciliation;
 * retries never guess ownership, steal locks, or allocate a second orphan.
 */
export async function storeCareerApplication(submission: Submission) {
  if (!/^[a-f0-9]{64}$/.test(submission.fingerprint) || ![".pdf", ".doc", ".docx"].includes(submission.extension)) {
    throw new CareerStorageError("CAREER_STORAGE_FAILED", "prepare", "INVALID_INPUT");
  }
  const intentPath = path.join(TRANSACTIONS_DIR, `${submission.fingerprint}.json`);
  const lockPath = path.join(TRANSACTIONS_DIR, `${submission.fingerprint}.lock`);
  // Correlate a retained transaction without logging its payload hash or paths.
  const transactionRef = createHash("sha256").update(`career-transaction:${submission.fingerprint}`).digest("hex").slice(0, 24);
  let lock: FileHandle | undefined;
  let stage: Stage = "prepare";
  let id: string | undefined;
  let cvPath: string | undefined;
  let metadataPath: string | undefined;
  let intentStagePath: string | undefined;
  let metadataStagePath: string | undefined;
  let cvHandle: FileHandle | undefined;
  let metadataHandle: FileHandle | undefined;
  let intentHandle: FileHandle | undefined;
  let ownsCv = false;
  let ownsMetadataStage = false;
  let ownsIntentStage = false;
  let ownsIntent = false;
  let committed = false;
  let uncertainPublication = false;
  const cleanup: CleanupFailure[] = [];
  const recordCleanup = (cleanupStage: Stage, error: unknown) => cleanup.push({ stage: cleanupStage, reason: errorCode(error) });
  async function removeOwned(filename: string, cleanupStage: Stage) {
    try { await unlink(filename); return true; }
    catch (error) {
      if (errorCode(error) === "ENOENT") return true;
      recordCleanup(cleanupStage, error);
      return false;
    }
  }
  async function closeOwned(handle: FileHandle | undefined, cleanupStage: Stage) {
    if (!handle) return true;
    try { await handle.close(); return true; }
    catch (error) { recordCleanup(cleanupStage, error); return false; }
  }
  try {
    await mkdir(STORAGE_DIR, { recursive: true, mode: 0o700 });
    await chmod(STORAGE_DIR, 0o700);
    await mkdir(TRANSACTIONS_DIR, { recursive: true, mode: 0o700 });
    if (!(await lstat(TRANSACTIONS_DIR)).isDirectory()) throw new Error("Invalid transaction directory.");
    await chmod(TRANSACTIONS_DIR, 0o700);
    stage = "claim";
    try { lock = await open(lockPath, "wx", 0o600); }
    catch (error) {
      if (errorCode(error) === "EEXIST") throw new CareerStorageError("CAREER_STORAGE_BUSY", stage, "EEXIST", undefined, [], true);
      throw error;
    }
    stage = "inspect";
    const receipt = await existingReceipt(intentPath, submission);
    if (receipt) {
      id = receipt.id;
      committed = true;
      return { id, cvFile: `${id}${receipt.extension}`, created: false };
    }

    id = `${new Date().toISOString().replace(/[:.]/g, "-")}-${randomUUID()}`;
    const cvFile = `${id}${submission.extension}`;
    cvPath = path.join(STORAGE_DIR, cvFile);
    metadataPath = path.join(STORAGE_DIR, `${id}.json`);
    intentStagePath = path.join(TRANSACTIONS_DIR, `${id}.intent.tmp`);
    metadataStagePath = path.join(TRANSACTIONS_DIR, `${id}.metadata.tmp`);
    stage = "intent";
    intentHandle = await open(intentStagePath, "wx", 0o600);
    ownsIntentStage = true;
    await intentHandle.writeFile(JSON.stringify({ version: 1, id, extension: submission.extension } satisfies Intent));
    await intentHandle.close();
    intentHandle = undefined;
    // Only this protocol's validated receipt is replaced, under its exclusive lock.
    await rename(intentStagePath, intentPath);
    ownsIntentStage = false;
    ownsIntent = true;

    stage = "cv";
    cvHandle = await open(cvPath, "wx", 0o600);
    ownsCv = true;
    await cvHandle.writeFile(submission.cvBuffer);
    await cvHandle.close();
    cvHandle = undefined;
    stage = "metadata";
    metadataHandle = await open(metadataStagePath, "wx", 0o600);
    ownsMetadataStage = true;
    await metadataHandle.writeFile(JSON.stringify({ ...submission.record, cvFile, submittedAt: new Date().toISOString() }, null, 2), "utf8");
    await metadataHandle.close();
    metadataHandle = undefined;
    stage = "publish";
    try {
      // Same-filesystem hardlink publishes complete JSON without replacing a record.
      await link(metadataStagePath, metadataPath);
      committed = true;
    } catch (error) {
      try { await lstat(metadataPath); uncertainPublication = true; }
      catch (inspectionError) { uncertainPublication = errorCode(inspectionError) !== "ENOENT"; }
      throw error;
    }
    await removeOwned(metadataStagePath, "cleanup-metadata");
    ownsMetadataStage = false;
    return { id, cvFile, created: true };
  } catch (error) {
    await closeOwned(intentHandle, "cleanup-intent");
    await closeOwned(metadataHandle, "cleanup-metadata");
    await closeOwned(cvHandle, "cleanup-cv");
    if (ownsIntentStage && intentStagePath) await removeOwned(intentStagePath, "cleanup-intent");
    if (!committed && !uncertainPublication) {
      if (ownsMetadataStage && metadataStagePath) await removeOwned(metadataStagePath, "cleanup-metadata");
      if (ownsCv && cvPath) await removeOwned(cvPath, "cleanup-cv");
      if (ownsIntent && cleanup.length === 0) await removeOwned(intentPath, "cleanup-intent");
    }
    const failure = error instanceof CareerStorageError ? error
      : new CareerStorageError("CAREER_STORAGE_FAILED", stage, errorCode(error), id, cleanup, uncertainPublication || cleanup.length > 0);
    failure.transactionRef = transactionRef;
    throw failure;
  } finally {
    if (lock) {
      if (await closeOwned(lock, "release")) await removeOwned(lockPath, "release");
    }
    // Do not turn accepted data into a failure or replace the original exception.
    if (cleanup.length) console.error("Career application cleanup requires reconciliation", { id, transactionRef, committed, failures: cleanup });
  }
}
