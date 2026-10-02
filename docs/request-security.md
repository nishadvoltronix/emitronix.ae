# Request identity, abuse controls and uploaded documents

This document separates application controls from the proxy, worker and document-screening checks still required before deployment. No environment file, secret, proxy configuration, production data or scanner was changed or accessed by this repair.

## Confirmed local findings and repairs

The careers, contact, consent and both administrator login handlers previously selected the first arbitrary `X-Forwarded-For` value, with `X-Real-IP` as a fallback. A client that could supply those values could rotate its rate-limit identity and contaminate IP audit fields. Whether an external client can do so through the real ingress was not verified. The cookie-administrator login also accepted an origin constructed from arbitrary forwarded host/protocol headers.

The shared [request-security helper](../lib/requestSecurity.ts) now ignores those headers. All five rate-limit maps are replaced by the bounded local limiter described below. Cookie-administrator login accepts the verified `site.url` origin in production and its direct request URL origin in nonproduction; raw `Host`, forwarded host and forwarded protocol no longer supply an alternate allowed origin. Missing/invalid origins and `Sec-Fetch-Site: cross-site` are rejected. This does not replace password/session validation.

## Explicit proxy contract

By default, `clientIp()` returns `unknown`, regardless of any submitted forwarding header. Requests therefore share the existing endpoint allowance until a verified proxy identity contract is enabled. This is deliberately conservative; enabling production traffic without reviewing the proxy contract can cause legitimate users to share a small rate-limit bucket.

The only opt-in is the nonsecret process environment setting `EMITRONIX_TRUST_PROXY=1`. No other value enables trust. When enabled, the helper accepts exactly one validated IP address from **`X-Emitronix-Client-IP`**. It never reads `X-Forwarded-For`, `X-Real-IP` or a left/right element from an IP chain. Empty, invalid, oversized, port-bearing, comma-separated and zone-qualified values map to `unknown`. Equivalent IPv6 spellings and IPv4-mapped IPv6 forms are normalized to the same limit key.

This opt-in is an operator assertion about verified ingress, not cryptographic proof of the peer. NextRequest does not expose an authenticated socket peer address that this handler can use to establish the proxy's identity. A client reaching a trusted-mode backend directly can forge the dedicated header. Forwarding headers may only be used for security decisions when the actual trusted proxy boundary is enforced. [NextRequest API](https://nextjs.org/docs/app/api-reference/functions/next-request), [forwarded-address security considerations](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/X-Forwarded-For)

Before enabling the setting, an authorized operator must verify all of the following:

- The backend is reachable only through the reviewed proxy path, using a private/loopback bind and appropriate firewall/network policy. Verify both IPv4 and IPv6, every worker/listener and any alternate ingress.
- The final trusted ingress **removes every incoming instance** of `X-Emitronix-Client-IP` and replaces it with one IP derived from its verified connection/proxy chain. It must never append the client-supplied header or copy an unchecked first XFF value.
- If a CDN/load balancer precedes the final proxy, establish that upstream's authenticated/network-restricted identity before accepting its address claim. The last proxy must emit one canonical end-client address, not an unverified chain.
- Proxy configuration handles request host/protocol correctly for the application while restricting allowed public hosts. Cookie-administrator production login intentionally uses `https://emitronix.ae`, through `site.url`, rather than accepting arbitrary forwarded origins.
- A controlled synthetic request with forged XFF, X-Real-IP, duplicate/custom client-IP headers and forwarded host/protocol reaches the application with only the proxy's verified identity. Requests attempting to bypass ingress must be unreachable.
- Shared/NAT addresses and the application's conservative `unknown` bucket are included in expected behavior and monitoring. Do not disable limits or enable header trust merely to make a smoke test pass.

No proxy IP range, forwarding hop count or infrastructure product is guessed here. Setting the opt-in and applying its ingress policy are authorized server actions. This repository change did not enable the setting in a real environment.

## Local rate-limit behavior

| Endpoint | Per-process allowance per client identity | Window |
| --- | --- | --- |
| `/api/contact` | 5 | 15 minutes |
| `/api/careers` | 5 | 15 minutes |
| `/api/cookie-consent/consent` | 25 | 15 minutes |
| `/api/admin/auth/login` | 8 | 15 minutes |
| `/api/admin/cookie-consent/login` | 5 | 15 minutes |

These existing allowances are unchanged. Each endpoint keeps at most 10,000 active identity buckets, removes expired buckets when their expiry is reached, and denies a new identity if capacity is full. It never evicts an active bucket to admit a new one, since doing so would reset an attacker's allowance. Existing buckets still obey their remaining allowance while the map is full. Capacity failure returns the endpoint's existing rate-limit response.

This is **per-process**, not distributed protection. Separate processes/hosts have separate counters and a restart clears them. Multiple workers can multiply the effective allowance. An edge limit or approved shared counter is required when the intended policy must span workers, instances or restarts. Verify global request/body/concurrency limits and login-abuse controls at the real ingress; a finite in-memory map does not establish DDoS protection. Do not assume PM2 is single-worker without checking its actual configuration.

Contact in-flight and recent-submission deduplication also remains process-local. The provider accepts a `DUPLICATE_DATA` result, but that does not prove tenant uniqueness policy or exactly-once CRM delivery. A retry after an uncertain provider response or across workers may create duplicate records. The authorized CRM verification stage must establish the desired provider uniqueness/idempotency behavior using synthetic submissions; no new Redis/database dependency or live CRM change was introduced.

Career files have stronger local persistence semantics: the verified transaction receipt and exclusive claim coordinate workers using the same supported storage root, preserving complete file/metadata pairs and blocking unresolved transactions. This does not make provider notifications exactly once, support independent storage copies, or make the process-local request limiter distributed. See [career storage and reconciliation](career-upload-storage.md).

## Upload validation and remaining screening gate

The careers endpoint bounds the actual multipart body to 9 MiB and the CV to 8 MiB, requires the existing valid Content-Length, accepts PDF/DOC/DOCX extensions, checks their leading signatures, generates storage filenames and keeps files outside `public`. The additional MIME check rejects declared mismatches while allowing empty/generic binary types and compatible document aliases; multipart media-type matching is exact. Browser-provided MIME is not authoritative and can be absent or inferred from the extension. [Browser Blob type behavior](https://developer.mozilla.org/en-US/docs/Web/API/Blob/type)

These checks are format and resource controls. They do **not** prove a complete valid document or detect malware, PDF active content, Office macros/embedded objects, a ZIP masquerading as DOCX, document exploits or decompression attacks. The application does not execute or extract uploaded CVs, and this review found no CV download/execution endpoint. The outstanding risk includes unsafe handling when a staff member or downstream tool opens an untrusted document. A successful upload must never be described as a clean security scan. [OWASP file-upload guidance](https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html)

The authorized production plan must establish:

- Private isolated upload storage, restricted service/operator access, no static/public mapping and no execution workflow. Verify ACLs and mount semantics using [the permission checklist](storage-permissions.md).
- A private, approved malware/document-screening workflow before staff or downstream software opens the original file. Decide whether quarantine, antivirus, content disarm/reconstruction or a sandbox is appropriate for the accepted formats, including the existing DOC support.
- Explicit handling for pending scans, encrypted/unscannable documents, scan errors, timeouts and rejected files. A scanner outage must not silently label a document clean. Preserve accepted data and reconciliation evidence under the approved process.
- Defined operator ownership, safe viewing procedure, scan-result monitoring and signatures/engine updates. Confirm legitimate PDF, DOC and DOCX applications remain usable.
- A management-approved retention/deletion policy and consistent private backup/restore procedure. This change invents no retention period and deletes no historical CVs.

No CV was sent to a scanner, external service or public third-party analysis site. Transferring private CV content for screening requires an approved data-processing destination and authorization. No unconfigured scanner command, guessed server configuration or ad-hoc document parser was added to create the appearance of a passed screening gate.

## Evidence required for closure

- [ ] Record the actual proxy/CDN chain, private backend listeners and sanitized-header rule; prove spoofed custom/header-chain values cannot choose the application's identity.
- [ ] Record the runtime trust setting without exporting secrets, and verify expected client identities using synthetic traffic.
- [ ] Verify canonical production cookie-administrator login and rejection of foreign/forwarded origins, with existing password/session controls intact.
- [ ] Record worker/host counts and demonstrate the intended global abuse limit independently of local per-process tests.
- [ ] Verify provider duplicate/uncertain-response behavior and accepted-career notification ownership with approved synthetic data.
- [ ] Verify private file access plus the approved scan/quarantine/pre-open handling workflow; retain clean/rejected/error-path evidence without exposing real CV contents.

Until these server and workflow checks pass, forwarded-header infrastructure, global abuse enforcement, live CRM idempotency and upload screening remain explicit deployment gates.
