# FEAT-002 SOP-1 — revision 2 recovery submission evidence

Executor: `01a1e8ef-c296-7890-8bf9-59c95d55fbfc` (actual host `CODEX_THREAD_ID`).
Card: <https://github.com/jf3096/todo-app-lab/issues/12>, revision 2.
Recovery authority and scope: current card revision 2, with independent impact report <https://github.com/jf3096/todo-app-lab/issues/12#issuecomment-6948845689>.

## Version and environment

- Candidate and freshly checked remote main: `6b2d3cc987b09a05d85276d2f36b02be85a67040`.
- New detached baseline worktree, clean before and after the run. The shared primary worktree and the earlier evidence worktree were not changed.
- Windows; Node v26.13.0; Playwright 1.65.0; installed Chromium 1248 executable. Browser version is recorded in `replay.json`.
- README startup path: `npm start`; actual owned service: <http://127.0.0.1:4173/>; HTTP 200.
- GitHub Pages latest build was `built` at the candidate SHA. Deployment `7821008060` also references the candidate SHA. This is a source correspondence check, not a claim that the live page was used for replay.
- Replay window: `2026-11-17T13:19:42.798Z` through `2026-11-17T13:20:00.217Z`.

## AC self-checks

### AC-01 — PASS (executor self-check only)

Cold-read the current child card and root #11; GitHub native parent readback returned #11. Compared the complete candidate SHA with remote main and the new isolated worktree HEAD. Started the README command only after confirming port 4173 was unused. The page returned HTTP 200 and the actual browser path below ran against that owned service.

### AC-02 — PASS (executor self-check only)

Created a new non-persistent Chromium context with no user profile, no cookies and initially empty localStorage/sessionStorage. Entered the single synthetic text `v3-created-at-check` in `#task-input` and clicked `button[type=submit]`. Inspected `#task-list > li.task-item`, its HTML, actual text, `time`, `[data-created-at]`, `.task-created-at`, and the synthetic localStorage. Reloaded and repeated the same inspection.

After both add and reload, exactly one matching task remained. All three creation-time selector counts were zero. List text contained the synthetic text and the delete control, not a creation date or time. Persisted task fields were exactly `id`, `text`, and `completed`; the stored bytes were unchanged by reload. Conclusion: **GAP_CONFIRMED at the candidate SHA**, not a product implementation.

Existing candidate tests were run through an external configuration against the same owned service and the same installed browser, without editing product files, repository tests, or the existing config: **11 passed**. Coverage includes task operations and persistence, text-injection defense, invalid/unavailable/quota-limited storage, and 375px/1280px light/dark layout assertions. Those assertions do not constitute a separate human or independent visual approval.

The current 1280px light after-reload screenshot was actually opened. It shows the synthetic task, a completion checkbox, a bordered delete button, and no per-task date/time. The white task panel and header fit within the viewport. This observation is limited to that screenshot.

### AC-03 — PASS (executor self-check only)

Evidence files are published as immutable same-repository blob links in the new formal submission. `sha256-manifest.json` maps every cited local evidence file to its raw byte SHA-256. Each submission hash is calculated from the committed Git blob and compared with fetched remote raw bytes, avoiding text newline conversion or hashing a different file.

The older immutable receipt remains unchanged:

- File: <https://github.com/jf3096/todo-app-lab/blob/3c1d2b5ee7f8103656dd1304b1e7ad7314676c65/artifacts/feat-002-v3/operation-scope-receipt.json>
- Incorrect historical submission mapping: `10e2ea4851e40e83926d0607b0a75612cfda77043942facc680139039fb85135`.
- Correct actual file-byte SHA-256: `12a907fee04513406a39e16f4a7afcdb96bd1c7b3f9cb98e4bdb6021add5dd04`.
- Recomputed from both the immutable Git blob and the fetched raw URL; the bytes match. No historical report or comment was edited.

### AC-04 — PASS (executor self-check under revision 2 only)

This run used only fresh synthetic browser contexts, not a real user profile or storage. The key replay observed only same-origin static requests, empty cookies/sessionStorage and the synthetic localStorage item. The regression suite also uses isolated contexts and synthetic storage fixtures. Product paths and baseline working-tree status were unchanged before/after the run.

Cleanup targeted only the npm PID `92028` created by this run and its descendants. The synthetic context was closed, the browser was closed, the stop command exited 0, and port 4173 was read back as not listening. No pre-existing listener or unrelated process was terminated. Local detached worktrees and evidence are retained for audit/reproduction; no shared or older resources were deleted.

The revision-2 recovery decision resolves the earlier scope-routing question: AC-04 assesses this round's change/data/cleanup/handoff boundary. It does not demand an unlimited historical negative proof. No claim is made about all historical actions; the prohibition on real-user-data access remains unchanged.

## Responses awaiting independent review

1. `feat-002-sop1-fb-scope-receipt-hash`: corrected the old receipt's mapping to the actual immutable bytes, kept its precise URL, and verified remote accessibility. See `feedback-response.json`.
2. `feat-002-sop1-fb-user-data-scope-route`: consumed the explicit revision-2 recovery decision and its independent impact report; supplied a new current-round replay, synthetic-storage/network boundary, unchanged-product check, owned-service cleanup and handoff. No historical proof was invented.

Neither feedback item is declared closed by the executor. Both require the new independent verifier's own judgment and report.

## Cold-start handoff and risks

- Current behavior: task add/reload persistence works; per-task creation time is absent at the candidate SHA.
- No product implementation occurred. The candidate is not frozen until the current submission passes independent verification and the completion gate is legitimately applied.
- Prototype discussion must decide readable time format, timezone and missing-timestamp treatment for old data. Do not use page-open time as an invented creation time.
- The prototype confirmation gate and final human PR review remain required at their designated stages. This investigation does not approve them.
- Remaining action: a genuine new independent session reads the card and precise new submission URL, reruns the key path, checks actual hashes and both feedback responses, registers its own round and writes its own report. Do not complete or close this card before that gate passes.
