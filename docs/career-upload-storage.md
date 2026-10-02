# Career upload storage and reconciliation

The careers endpoint keeps its existing private flat layout: a generated CV filename and a matching JSON application record under `CAREERS_STORE_DIR` (default `storage/careers`). Existing records are not migrated. The JSON record plus its referenced CV remains the source of truth; CRM notification is best effort after storage commits.

New uploads use a private `.transactions` directory in that same storage root. A transaction is keyed by the existing fingerprint of normalized application fields and CV bytes. Its intent contains only a version, generated application ID and extension. It does not contain applicant details or CV contents.

## Publication and retry rules

1. Acquire the transaction's lock with exclusive file creation. A competing or abandoned lock fails closed; no age-based lock stealing occurs.
2. Inspect an existing intent. A matching complete JSON/CV pair is reused within the existing ten-minute duplicate window. Verification compares application fields and exact CV bytes; original filename, IP, user agent and admin status do not alter duplicate identity. An expired complete pair is preserved while a new application is created. Invalid, unreadable or incomplete transactions require reconciliation.
3. Publish a complete intent before creating any CV. Create the CV and staged metadata exclusively, recording ownership as soon as each file is opened.
4. Publish the complete staged JSON using a same-filesystem hardlink that refuses to replace an existing record. This is the storage commit point. The final JSON is never exposed partially written by this upload flow.
5. Remove the owned metadata staging link and release the owned lock. Keep the intent as the persistent receipt for retries. Cleanup failures after commit are logged and do not undo accepted data or turn it into an upload failure.

The underlying storage must support exclusive creation, atomic same-directory rename and hardlink creation across the transaction directory and storage root. Unsupported operations fail safely. Verify these semantics on the actual production mount and shared-worker arrangement before deployment. Local Windows tests do not establish production filesystem behavior, ACLs or power-loss durability.

## Failure behavior

| Failure | Behavior |
| --- | --- |
| CV or staged metadata write/close fails | Remove only files exclusively created by this attempt, then remove its intent if cleanup completed. Return the existing generic HTTP 500. Retry can create one clean pair. |
| Cleanup fails | Preserve the original storage failure and bounded cleanup error codes. Retain transaction evidence; retry refuses to allocate another CV from the unresolved transaction. |
| Metadata publication fails and the destination is confirmed absent | Roll back only owned files. |
| Metadata destination exists or its state cannot be read after publication failure | Preserve the CV, staged metadata, intent and existing destination. Do not assume rollback is safe. |
| Process stops before releasing its lock | Keep the reservation. A retry fails closed until an operator establishes safe recovery. |
| Existing valid application or unrelated file | Never overwrite or delete it. A duplicate may read and reuse a verified pair; an expired receipt does not remove the old pair. |
| CRM notification fails after commit | Keep the accepted application and return success, as before. Log only an opaque application ID and fixed notification-failure code. |

Failure logs contain fixed stages/codes, opaque application IDs and an opaque `transactionRef`. They omit raw filesystem/provider messages, paths, applicant fields, original filenames and CV contents. The reference is the first 24 hexadecimal characters of SHA-256 of `career-transaction:` followed by the transaction fingerprint. An authorized operator can correlate it with transaction filenames without opening CV contents. Public error responses contain no storage details.

## Operator reconciliation boundary

There is no periodic deletion job, retention policy, bulk CV scanner or automatic abandoned-lock removal. Existing files without a new transaction intent are outside this protocol and must be inventoried/reconciled through a separately authorized procedure.

Before repairing a retained transaction, establish all hosts/processes that share the storage mount, stop every relevant writer, and take a verified backup of application records, CVs and transaction files. Correlate the opaque reference and intent with the exact generated application ID. Confirm whether the final metadata and referenced CV form a complete accepted application before deciding any repair. Preserve complete pairs and uncertain files. Removal of a lock alone is not proof that the underlying transaction is safe to retry.

This repair does not authorize deleting private files or clearing locks on a running server. Any exact-path recovery, restore or disposal requires an operator decision based on the recorded transaction and approved data handling. A process crash after storage commit can still interrupt the best-effort CRM notification; production delivery and runtime checks remain required.
