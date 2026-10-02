# Production verification plan

**Status: NOT RUN. Deployment remains blocked.** This is a plan for separately authorized server/provider verification, not evidence that any live check passed. No server connection, production command, restart, submission, ACL change, data repair, deployment, commit or push is authorized by this document.

Use the approved source/build snapshot throughout. Assign named people to the roles below before execution. Record each gate's date, environment, operator, method, PASS/FAIL/NOT RUN and restricted evidence location. Keep credentials, environment values, real CVs, applicant details and raw provider responses out of reports. Use approved synthetic identities, recipient mailboxes and documents; agree who will reconcile test records afterward. Do not delete them automatically.

The repository documents a server path, PM2 name and port, but these are not verified live facts. Discover actual values through authorized access. Begin with read-only inspection; obtain a separate approved change window for modifications, restart/crash exercises, writer pauses or exact-path recovery.

## Gates and accountable owners

| Gate | Required owner | Evidence and pass criterion | Status |
| --- | --- | --- | --- |
| 1. Runtime and storage topology | Platform operator + application maintainer | Verified hosts, workers, PID namespaces, identities, listeners and resolved mounts match the supported protocols | NOT RUN |
| 2. Private access and upload screening | Security/storage operator + recruitment owner | Effective access tests and clean/rejected/unscannable/error screening evidence; staff cannot open pending/unapproved documents | NOT RUN |
| 3. CV persistence and reconciliation | Application maintainer + data owner | Synthetic mount/retry/failure checks pass; historical/retained transactions have an approved reconciliation disposition | NOT RUN |
| 4. Consent protocol and migration | Application maintainer + platform operator | Supported identity checks/mount operations pass; all writers use one protocol; legacy state has verified quiescent recovery | NOT RUN |
| 5. Proxy identity and abuse controls | Network/security operator | Trusted ingress cannot be bypassed or spoofed; intended limits hold across actual workers/hosts/restarts | NOT RUN |
| 6. CRM and email delivery | CRM administrator + business recipient | Synthetic records and required email receipts reach correct owners; duplicate/uncertain-response handling is demonstrated | NOT RUN |
| 7. Consistent backup and isolated restore | Backup operator + data owner | Recent successful backup and isolated restored dataset/permissions verified; approved recovery objectives met | NOT RUN |
| 8. PM2/process health and release persistence | Platform operator + application maintainer | Correct runtime/artifact, healthy processes/cache, reviewed logs and controlled restart/persistence evidence | NOT RUN |

### 1. Establish the actual topology

- Record OS, service/deployer/proxy/backup identities and group memberships; actual Node/Next/React/PM2 versions; working directory; build directory and build identity; start arguments, worker count and fork/cluster mode. Inspect only required configuration fields; avoid broad process/environment dumps that can expose secrets.
- Draw the complete ingress path: browser, CDN/load balancer if present, final proxy, every backend listener and every worker/host. Include IPv4/IPv6, containers, scheduled/background writers, alternate ingress and shared volumes. Record the responsible owner for each boundary.
- Resolve `CAREERS_STORE_DIR`, `COOKIE_CONSENT_STORE_PATH` and `ADMIN_USERS_PATH` privately, plus `cwd/storage/admin-activity.jsonl`, SEO/redirect/site-file stores and any other active state. Record symlink targets, filesystem/mount IDs, share type, persistence across releases, quotas/free space and which processes write each root.
- **Pass only when consent writers share one uniquely identified Windows/Linux host, one OS PID namespace, one private local filesystem and one new protocol version.** Multiple workers within that boundary are supported. Cross-host/container-PID-namespace or network-storage arrangements need a reviewed alternative; matching path strings alone are insufficient.

### 2. Verify private access and screening

Apply the [storage permission model](storage-permissions.md) to the actual identities and resolved paths. Export the current ACL/owner baseline privately before proposing changes. Check parent traversal/delete rights, inherited/default ACLs, shares and all static/proxy mappings. Other users must not read CVs, hashes, private logs or backups, or modify application code.

Use uniquely named synthetic sentinels on the intended mount to verify allowed service access and denied unrelated-principal access. Check that private roots, `.transactions`, locks, staging files, backups, `.env*` and `.git` are not publicly served. Inspect routing/configuration first; do not request a real private file through HTTP to demonstrate a leak. On Windows, POSIX `chmod` is not an ACL repair. Workstation ACL remediation remains its own gate; production results do not close the confirmed workstation finding.

The upload signature/MIME checks are not malware screening. Recruitment/security must approve a private quarantine and scan/safe-view workflow **before staff or downstream software opens originals**. Test small synthetic PDF/DOC/DOCX, an approved harmless detection fixture, pending scans, encrypted/unscannable files, timeout and scanner outage. Pass requires correct release/block decisions, restricted access, monitoring and a responsible operator; no error path may label an unscanned file clean. Never send private CVs to a public analysis service or invent a retention policy. See [request security](request-security.md).

### 3. Verify CV storage and reconcile safely

- Under the real service identity, use an isolated synthetic fixture on the intended filesystem to test exclusive creation, atomic rename and hardlink publication between `.transactions` and the careers root. The directories must be on the same filesystem; a copy fallback does not satisfy the existing protocol.
- With synthetic fixtures and controlled test processes, cover complete file/metadata publication, metadata failure, owned cleanup, cleanup denial, retry, concurrent workers and process interruption. Within the existing ten-minute duplicate window, verified retries must reuse one complete pair; outside it, old valid pairs remain preserved. Confirm fixed diagnostic codes/opaque references and generic public errors without CV or applicant content.
- Follow the [career transaction contract](career-upload-storage.md). An abandoned CV transaction lock requires operator reconciliation; this protocol does not automatically reclaim it. Stop every relevant writer and take a consistent backup before any approved exact-path repair. Determine whether the final metadata and referenced CV form an accepted pair before changing anything. Preserve uncertain state.
- Historical files lacking a new transaction intent are outside automatic recovery. A separately authorized metadata/reference inventory may identify discrepancies without opening CV contents. The data owner must approve each recovery/disposal decision and its exact paths. No arbitrary directory sweep, age-based deletion or bulk lock removal is permitted.
- Career success means private storage committed. Its CRM notification is best effort; a crash or notification failure can leave an accepted application without an alert. A verified duplicate retry reuses storage and does not automatically replay that notification. Assign a monitored missing-notification reconciliation process; storage idempotency alone does not close delivery verification.

### 4. Verify consent ownership and migration

Follow [consent crash recovery](consent-storage-recovery.md). Validate Linux boot/process-start/PID-namespace identity visibility or the fixed Windows process-start query under the actual service identity, including other writer processes. Unknown/foreign/malformed/permission-denied ownership must fail closed; no timeout or lock age authorizes takeover.

In isolated synthetic storage on the intended mount, verify nonempty lock-directory publication, atomic store replacement, concurrent workers, a live owner exceeding the wait deadline, confirmed-dead-owner recovery before/after commit, and cleanup-denial diagnostics. Preserve unrelated files and newer ownership tokens. Replayed consent events can count twice after a commit/response crash; no exactly-once event guarantee is claimed.

Before any later approved rollout, establish a quiescent migration window: **stop every old writer, including workers/jobs/old releases, before enabling any new writer**. Mixed-version rolling operation is unsupported. Back up JSON plus associated lock/staging state. A legacy ownerless `.lock` must remain until the operator proves it abandoned and approves exact-path recovery; the application fails closed with `CONSENT_LOCK_LEGACY`. Nonblocking preparation directories and unrelated historical temporary files are not swept automatically.

### 5. Verify the trusted proxy and global limits

- Default behavior ignores all forwarding headers and uses the shared `unknown` bucket. Enable `EMITRONIX_TRUST_PROXY=1` only through an approved configuration change after proving the following boundary. No other value opts in, and the setting itself is not proof of a trusted peer.
- Every backend listener must be unreachable by untrusted clients except through the reviewed ingress, using verified private/loopback binding and firewall/network rules. Check IPv4, IPv6 and alternate ports/hosts. Any preceding CDN/load balancer must have a verified restricted/authenticated relationship with the final proxy.
- The final proxy must strip **every incoming instance** of `X-Emitronix-Client-IP` and overwrite it with one validated address derived from the verified connection chain. It must not append values or copy arbitrary first-XFF input. The application ignores `X-Forwarded-For` and `X-Real-IP`.
- Use synthetic requests to prove forged/duplicate custom headers, XFF chains, X-Real-IP and forwarded host/protocol cannot select application identity or bypass login origin checks. Production cookie-admin login requires the verified `site.url` origin; foreign/missing origins and cross-site requests must fail. Record public host restrictions and TLS handling.
- Verify global request/body/concurrency and login-abuse policy at the real edge or an approved shared counter. Current application limits are per-process, bounded to 10,000 active keys per endpoint and reset by restart: contact/careers/cookie-admin login 5, admin login 8, consent 25, each per 15 minutes. Multiple workers multiply local allowances; demonstrate intended policy across workers and approved restart scenarios without attacking real users. Include NAT/shared addresses and the `unknown` bucket. Do not disable limits to pass a smoke test.

### 6. Verify live CRM and email separately

The CRM administrator first verifies tenant/region, module, required fields, token refresh/scopes, record assignment and intended automation without copying credentials into evidence. The repository's server call creates Zoho records; no direct SMTP/mail sender was found in the active form flow. Identify the actual email mechanism and its owner rather than assuming a successful API call sends mail.

With explicit provider-submission authorization, send one uniquely tagged synthetic contact enquiry and one synthetic careers application. Correlate timestamp/request reference, accepted record ID, expected field mapping, owner/queue assignment and business-recipient acknowledgment. For careers, also verify the stored CV/metadata pair independently of notification success. Keep provider identifiers and mailbox evidence restricted.

Test immediate repeat, approved cross-worker repeat, delayed/uncertain provider response and notification failure using a provider test tenant or controlled approved fixture. Contact deduplication is process-local; Zoho `DUPLICATE_DATA` handling does not establish tenant uniqueness or exactly-once delivery. Confirm the intended duplicate rule and an operator recovery path for ambiguous outcomes without resubmitting real enquiries.

For every required email, verify actual delivery to the approved mailbox, correct recipient/assignment and handling of rejection, spam/quarantine or delayed delivery. A CRM record, HTTP success, workflow configuration screenshot or queued email alone does not prove mailbox receipt. Record who monitors failures and reconciles accepted careers applications without alerts.

### 7. Verify consistent backup and isolated restore

Identify the actual job/snapshot policy, last successful run, failure alerts, restricted destination/encryption, restore identities and management-approved recovery-point/recovery-time objectives. No retention interval or recovery objective is supplied by this checklist.

Back up a consistent dataset through a supported snapshot or approved coordinated writer pause. Include CV/metadata pairs and retained transactions; consent JSON and ownership/staging state; admin users/activity; runtime SEO/redirect/site configuration; and required runtime configuration through its separately protected secret-backup mechanism. An uncoordinated copy while writers mutate files is insufficient evidence of consistency.

Restore into a private isolated destination with all production writers and external providers disabled. Verify counts/manifests, hashes where appropriate, metadata references, parseability, permissions and synthetic read/write behavior without replacing live files. Review restored lock identity and incomplete transactions under the respective recovery protocols; never clear locks based solely on age. Record elapsed recovery and any missing/inconsistent data.

Atomic rename/hardlink and the local process-crash tests do **not** prove power-loss durability: these paths make no full fsync/directory-fsync guarantee. The storage/backup owner must assess mount, disk/cache and snapshot durability against the approved recovery objectives. A crash fixture must not be represented as a power-cut test.

### 8. Verify PM2/runtime health and persistence

Inspect the actual service/startup manager and artifact/version against the approved snapshot. Verify framework guards, ownership, working directory, worker settings, restart counts, memory/CPU, disk availability, secret-source permissions, log rotation and startup-on-boot policy. Do not infer installed runtime from `package.json` or assume the documented PM2 name/port is current.

On an isolated server fixture first, confirm supported URLs and policy pages return complete SSR content, client hydration succeeds, private mutations use the intended roots, and image/incremental regeneration works with narrowly scoped cache permissions. Next route revalidation needs writable cache paths; a blanket read-only build policy can break runtime behavior. Confirm release/rollback cleanup excludes every private persistent store.

Production restart/reload/reboot exercises require a separate approved maintenance plan and rollback/backup evidence. Test controlled shutdown/start and persistence using synthetic data, with no mixed consent protocol versions. Review logs against request paths, statuses and times; resolve unexplained 5xx, repeated failures, permissions, scanner and notification errors.

The local verification reproduced an intentional unknown warehouse URL returning the correct branded 404/noindex while Next logs `Internal: NoFallbackError`; the request/log evidence is retained in the local verification report. Preserve this distinction. Do not suppress all matching log strings: a supported URL, different stack or 5xx remains a separate failure to investigate.

## Closure

Attach evidence and named sign-off for every applicable gate. Unavailable access or an unexecuted exercise remains **NOT RUN**. Preserve failures and document the exact approved remediation/retest rather than changing checks to obtain PASS. Complete the independent [manual browser/device/accessibility checklist](pre-deployment-manual-checklist.md) and workstation ACL review as well. Completing this plan provides evidence for a later release decision; it does not authorize deployment, staging, committing or pushing.
