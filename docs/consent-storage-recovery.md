# Consent storage ownership and crash recovery

The consent JSON remains a private flat file. Every event, settings update and reset holds a filesystem lock across its complete read/modify/atomic-replace operation. Identical accepted consent requests remain separate aggregate events; this is not exactly-once delivery after a commit/response crash.

## Supported runtime boundary

Use one uniquely identified Windows or Linux host, one OS PID namespace, one private local filesystem and only the new lock-protocol version across every writer. Multiple Node/PM2 workers on that host are supported by the protocol. Shared storage across hosts/containers, remote/network filesystems and mixed application versions require separate verification and must not be assumed safe.

Linux ownership uses the kernel boot ID, PID namespace, process start-time ticks and, when available, machine ID for reboot identification. Windows ownership uses the process creation time reported by `Get-Process.StartTime`. The Windows service must permit the fixed, hidden, noninteractive PowerShell identity query. If identity inspection is unavailable or permission is denied, ownership is not guessed. The service must be able to inspect its own identity and other consent writer processes. Unsupported platforms fail closed.

## Lock and write lifecycle

1. Create a private unique preparation directory containing a complete owner marker.
2. Atomically rename it to `<store>.lock-v2`. A live lock is nonempty, so it cannot be replaced by directory rename. No ownerless lock is exposed during acquisition.
3. Read the current consent JSON strictly. Corrupt or unreadable existing data is not replaced with defaults by a mutation.
4. Write complete JSON to the exact owner-token temporary file inside the lock directory, then atomically rename it to the store path.
5. Remove only the current token's temporary file and owner marker, then remove the empty lock directory nonrecursively.

A competing writer verifies the recorded owner. A confirmed exited process, zombie process, or safely identified reused PID permits recovery of that exact token's temporary file and marker. A delayed cleaner cannot remove a newer token's files; nonrecursive directory removal cannot remove a newer nonempty lock. Permissions, unexpected files, malformed markers, foreign ownership and uncertain identity fail closed with bounded diagnostic codes.

Lock age alone never authorizes recovery. A live writer remains protected beyond the 30-second request wait. A timed-out request can retry; after the owner exits, a subsequent attempt can reclaim the lock. A crash before metadata commit preserves the old JSON; a crash after commit preserves the new JSON. Recovery never rolls the store back from a temporary file.

Log messages and public errors do not include raw filesystem/JSON/process errors, paths, consent configuration, credentials or owner identity. The public API retains its generic failure response; fixed internal reason codes identify the failed boundary.

## Required rollout and legacy-lock review

**Stop every old writer before enabling the new protocol.** A check for an old lock cannot protect against an old binary that acquires its lock later. A rolling deployment mixing old and new lock protocols is unsupported.

An existing `<store>.lock` is a legacy lock with no owner information. The application rejects it with `CONSENT_LOCK_LEGACY`; it never deletes it based on age. An authorized operator must identify and stop all relevant writers, back up the store and associated files, establish that the old lock is abandoned, and approve any exact-path removal. No real legacy lock is removed by this repair or its tests.

## Other operational limits

- A crash before lock publication may leave a nonblocking private preparation directory. No arbitrary directory sweep or retention policy is introduced.
- Unrelated historical temporary files are not touched. Recovery addresses only the verified dead owner's exact token paths.
- Permission-denied cleanup can require permission repair and verified operator recovery/process restart. It is reported rather than silently bypassed.
- The filesystem must support exclusive creation, atomic directory publication and atomic file replacement across the lock directory and store directory.
- Atomic replacement is not a power-loss/fsync durability guarantee. Backup/restore and real restart/mount behavior remain server verification gates.
- Windows `chmod` modes do not establish a Windows ACL policy. Review service identities and inherited ACLs separately.

Relevant primitives: [Node process existence checks](https://nodejs.org/api/process.html#processkillpid-signal), [Windows process creation time](https://learn.microsoft.com/en-us/dotnet/api/system.diagnostics.process.starttime), [Linux process start-time fields](https://man7.org/linux/man-pages/man5/proc_pid_stat.5.html) and [Linux directory rename semantics](https://man7.org/linux/man-pages/man2/rename.2.html).
