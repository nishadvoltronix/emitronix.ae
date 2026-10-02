# Storage permissions and verification

This is the required permission model and an operator checklist, not a record of applied permissions. No ACL, owner, environment variable, production configuration or existing stored data was changed during this review.

## Current evidence and decision

The 2 October 2026 read-only workstation snapshot shows inherited `Authenticated Users: Modify` and `BUILTIN\Users: ReadAndExecute` on the repository, `storage`, the existing consent file, `public` and the sampled build-cache directory. The local private-storage isolation gate remains **FAILED / MANUAL ACTION REQUIRED**. Default careers, enquiries and admin-users paths were absent; their absence does not establish the effective production paths or permissions. The restricted ACL snapshot is retained with the local verification evidence; it is not intended for publication with this guide.

The application requests POSIX directory mode `0700` and file mode `0600` for private persistence. Those calls do not remove Windows inherited access rules. Node documents that Windows file-mode operations cannot implement the Unix owner/group/other distinction. [Node file modes](https://nodejs.org/docs/latest-v24.x/api/fs.html#file-modes)

No automatic ACL change is safe without the approved runtime, deployer and backup identities and resolved storage paths. Restricting the wrong parent can lock out the operator, break backups, or interrupt runtime writes. The safe local change for this issue is this explicit model and checklist; permission remediation remains an authorized workstation/server operation.

## Storage and access map

`cwd` means the effective working directory of the Node/PM2 process, not necessarily the repository or release directory assumed by an operator. Override values were not read. Operators must record resolved absolute paths privately.

| Path or configuration | Contents and sensitivity | Required application access |
| --- | --- | --- |
| `CAREERS_STORE_DIR`, default `cwd/storage/careers` | Private CVs and application metadata, including contact details, original filename and request metadata | Create exclusively, read for verified retries, create hardlinks, rename and delete only owned failed-attempt files; list/read capabilities exist in admin helpers |
| Careers `.transactions` beneath that same root | Private intents, receipts, lock files and staged metadata; staged metadata can contain applicant details | Create/read/write, exclusive lock creation, atomic rename, hardlink metadata into the parent, remove exact owned staging paths |
| `COOKIE_CONSENT_STORE_PATH`, default `cwd/storage/cookie-consent.json`, and its dedicated parent | Consent configuration, policy content and aggregate statistics; integrity-sensitive even though event records are aggregated | Read for pages/config; create, replace and restrict mode during event/settings/reset writes |
| `<consent-file>.lock-v2` and `.lock-v2.prepare-<UUID>` siblings | Process ownership marker and possibly a complete staged consent file | Create directories/files, read ownership, rename a complete directory, remove exact owned files and empty directories |
| `ADMIN_USERS_PATH`, default `cwd/storage/admin-users.json`, and its dedicated parent | Administrator identities, roles and password hashes | Read for login; exclusive initial creation only when absent and bootstrap is configured. A save helper exists; no current caller was found. Existing malformed/unreadable data must remain untouched |
| `cwd/storage/admin-activity.jsonl` | Private login/logout audit records, administrator identifiers and IP fields | Append/create on active admin-auth routes; restrict file mode. A read helper exists |
| `cwd/storage/seo-overrides.json`, `redirects.json`, `site-files.json` | Runtime SEO, redirect and site-file configuration; integrity-sensitive | Current application callers read these. Mutation helpers exist, but no current callers were found. Public routes may intentionally return selected configuration; that does not authorize filesystem exposure |
| `cwd/storage/enquiries` | Potential private enquiry JSON | A writer/list/status/delete helper exists, but no current call site was found. `/api/contact` currently submits to CRM; do not infer a local contact backup from this directory |
| `.env*`, secret injection and PM2 environment/state | Credentials and potentially environment snapshots | Only the identities that must provision or consume them; keep contents out of ACL evidence, logs, reports and source control |
| `public`, deployed source, dependencies and compiled server code | Intended public assets and executable application code | Runtime reads; deployment/build identity performs reviewed updates. Unrelated users must not be able to modify code or public assets |
| Configured `.next` / `.next-*` runtime cache paths | Image, fetch and regenerated route artifacts | Runtime needs narrowly scoped cache writes. Installed Next 15.5.27 uses `<dist>/cache/images`, `<dist>/cache/fetch-cache` and scoped `<dist>/server/route-cache`; fallback code also supports `<dist>/server/app` and `pages`. Verify actual paths before applying a read-only build policy |
| Process logs, reports, backups and restore locations | Logs may contain identifiers; snapshots may contain every private store and secrets | Separate approved logging/backup/operator access. Runtime should not be able to destroy historical backups |

All private roots must stay outside `public` and every proxy/CDN/static-file alias. `.gitignore` excludes default `storage`, `.env*` except `.env.example`, dependencies and build output; ignore rules provide no runtime access protection. Overrides outside those defaults need their own reviewed ignore/exclusion policy.

The consent and admin-user writers apply `chmod` to the immediate parent directory. Assign their overrides to dedicated application-private directories; do not place their files directly in an unrelated shared parent and rely on the application to design that parent's permissions. Other admin storage still depends on `cwd/storage`; changing only the three overrides does not relocate all mutable state.

## Identity model

| Identity | Intended privileges |
| --- | --- |
| Dedicated runtime service identity | Read deployed code/assets; necessary create/read/write/rename/link/delete within the listed mutable roots and runtime caches; read required injected secrets. No general administrator/root role or permission-management authority over unrelated paths; current code sets modes on its own private paths |
| Deployer/build identity | Write a separate build/release workspace and approved release artifacts; install dependencies and framework patches. No routine read/write of real CVs, user hashes or live consent data merely to build |
| Reverse proxy identity | Network access to the application and read access to specifically served static assets, if required. No private-store, backup, environment or source-control access |
| Backup identity | Approved snapshot/read access to the full private dataset and a restricted backup destination; separate restore privilege. Prefer OS backup/snapshot facilities over making private files generally readable |
| Authorized administrator/operator | Recovery and permission-management rights through the approved administrative mechanism, with an exported ACL/owner baseline and rollback plan |
| Other interactive users, service accounts and network principals | No private-store access and no modification of code, public assets, caches, logs or backup history |

On a development workstation, the authorized developer account can combine build and runtime duties. That convenience does not justify broad access for every authenticated/local user. Record which other tooling identities genuinely need access before changing inheritance.

## Linux target model

- Use a dedicated non-root service user. Private mutable directories should be owned by that user with mode `0700`; private files should use `0600`, matching current code. Review effective POSIX ACLs and parent traversal permissions as well as mode bits.
- Every supported writer must operate under a permission model that can access the same files. Current `0700/0600` enforcement does not support separate writer users through a shared group alone; do not loosen modes ad hoc to hide that mismatch.
- Keep deploy-owned source, dependencies and compiled code read-only to the runtime where supported, with explicitly verified writable cache paths. Both language root layouts use 300-second revalidation. A blanket read-only Next build without a compatible cache arrangement can break regeneration. [Next self-hosting guidance](https://nextjs.org/docs/app/guides/self-hosting)
- Keep private persistent roots outside release cleanup. If an approved bind mount or symlink is part of deployment, verify its resolved target, mount identity, owner and every parent; never infer persistence from its pathname alone.
- Check service umask, ACL defaults, quotas/free space, mount behavior, process logs and secret-source permissions. The audit documentation names `/var/www/emitronix_ae`, PM2 `emitronix-next` and port `8081`; these are documented targets, not verified live facts.

## Windows target model

- Use a dedicated NTFS private directory whose DACL gives the named runtime/developer identity the required data operations and preserves the approved administrator/SYSTEM recovery entries. Verify effective access, not just the existence of an explicit Allow entry.
- Broad inherited Modify or Read access for `Authenticated Users`, `Users`, `Everyone` or unrelated service/tool accounts must be reviewed and removed from private data under an approved change. Protect inheritance only after explicitly preserving the required identities and checking child propagation.
- Scope runtime access to data operations. The service does not need permission to take ownership or edit the DACL; directory rename and owned-file cleanup do need create/delete rights. Uploaded documents are data and must never be executed by the application or exposed as a web execution directory.
- Do not add a blanket Deny ACE for a broad group: the intended service/operator may belong to it. Have the operator review group membership, explicit versus inherited rules, parent delete permissions and the existing recovery path.
- Inspect SMB share permissions if any sharing exists. The consent protocol currently supports private local storage; a restrictive NTFS DACL does not certify a network share as safe for locking.
- Windows consent recovery requires the service to query process identity using the fixed hidden PowerShell command and to inspect other consent writers. Do not bypass endpoint controls or loosen the storage DACL if identity inspection is blocked; resolve the supported service policy explicitly.

Windows DACL export/restore and inheritance controls are documented by Microsoft. Use an approved, exact-path change plan after recording the current ACL; this document intentionally supplies no blanket recursive permission-changing command. [Microsoft `icacls` reference](https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/icacls)

## Storage protocol constraints

Consent requires one uniquely identified host, one OS PID namespace, a private local filesystem and the new lock protocol across all writers. Stop every old writer before migration. A legacy ownerless `.lock` requires verified operator recovery; it is never removed merely because it is old. See [consent recovery](consent-storage-recovery.md).

CV storage requires exclusive creation, atomic rename and same-filesystem hardlinks between `.transactions` and the career root. Do not split those directories across mounts or replace hardlinks with a copy workaround. A retained CV transaction or historical orphan needs its own approved reconciliation; permission repair does not authorize deleting it. See [career storage](career-upload-storage.md).

Backups must include complete CV/metadata pairs, retained transaction evidence, consent JSON and associated ownership/staging state, administrator users, runtime SEO/site configuration and activity logs according to an approved scope. Use a consistent snapshot or coordinated writer pause. An isolated restore must preserve permissions and run with all restored production writers/providers disabled; retained lock files require protocol-aware review. No retention period, backup job or successful restore was verified from the repository.

## Authorized verification checklist

- [ ] Record actual service, deployer, proxy and backup identities, group memberships, worker count, effective `cwd` and build directory. Keep environment/secret values out of the evidence.
- [ ] Record the resolved private paths and all parent/symlink/mount boundaries; confirm no public/static mapping includes them. Do not inventory or open real CV contents merely to check ACLs.
- [ ] Export existing owners, mode bits/DACLs, inherited/default ACLs and relevant share/mount permissions to a restricted evidence location. Prepare the exact permission delta and rollback procedure for approval.
- [ ] Verify unrelated principals cannot read private data or modify application code. Use approved effective-access tooling or synthetic sentinel files; do not expose an actual CV/user file as a test.
- [ ] Under the actual runtime identity, use a uniquely owned synthetic fixture on the intended mount to verify exclusive create, read, rename, hardlink and owned cleanup, then check inherited child permissions. This requires authorized server access; local TEMP tests do not prove it.
- [ ] Apply only the approved identity/path-specific ACL change, preserve the operator recovery entries, and repeat effective-access and synthetic operation checks. Record a separate workstation result and production result.
- [ ] Confirm all consent writers share the supported host/PID namespace and protocol; complete any separately approved legacy-lock migration with every old writer stopped.
- [ ] Verify supported CV hardlinks and consent atomic publication/replacement on the real mount. Test process restart/crash recovery only with isolated synthetic storage and controlled test processes.
- [ ] Verify image and incremental-regeneration caches work without granting unrelated users or the runtime unnecessary code-write privileges; inspect cache/service logs without publishing private values.
- [ ] Confirm release/build/rollback commands retain private stores and never treat them as generated artifacts. No deployment or production restart is authorized by this checklist.
- [ ] Obtain recent successful backup evidence, destination access/encryption policy and an isolated restore result including restored ACLs and complete CV/metadata/transaction state.
- [ ] Record responsible owner, date, evidence path and PASS/FAIL for each item. Keep deployment blocked until the applicable permission and storage gates pass.
