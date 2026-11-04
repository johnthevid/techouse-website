# Stable Build 1 — Final, Code Reviewed

Status: **current approved stable baseline**. Confirmed by the client on 3 November 2026 after the code review and cleanup.

The code-reviewed working website is the actual final Stable Build 1. Earlier pre-review versions are historical backups, not the current stable release. Future changes must start from this final reviewed baseline.

The approved public website, back office, equipment slider with adaptive height and synchronized 560 ms easing, dialogs, navigation and scrollbar behavior are preserved. The review fixes include asynchronous save-and-leave handling, consistent solar estimate handoff, malformed project-link handling, validation and local recovery safeguards, removal of obsolete code and readability/performance cleanup.

Validation carried forward from the completed review: all 11 test groups pass; all 16 controlled desktop/mobile screenshot comparisons match. The approved intro/banner scripts and all CSS were unchanged by that review. This promotion changes release records only; no website behavior or appearance changed.

The homepage intro text animation must not change without explicit client instruction (see site/AGENTS.md).

Final source archive: `releases/Techouse_Stable_Build_1_FINAL_CODE_REVIEWED_2026-11-03.tar.gz`. The canonical release manifest is `releases/stable-build-1.json`; per-file hashes are in the archive’s adjacent manifest. The archive includes source, assets, tests, this release record and review evidence. It excludes private databases, authentication keys, environment secrets and runtime dependencies. Private recovery backups remain separate.

Review report: `deliverables/Stable_Build_1_Code_Review_2026-11-03.md`.

This final stable development baseline does not mean production deployment or hosted acceptance. Existing demo/reference content and documented launch requirements still apply.
