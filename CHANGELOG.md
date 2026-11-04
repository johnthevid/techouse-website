# Changelog

Recorded milestones for the Techouse website. Dates use the project's Asia/Manila calendar. These entries describe completed work; they are not retroactively created Git tags or GitHub Releases.

## 4 November 2026 — GitHub and cross-device documentation

- Initial source checkpoint `30fffe5` pushed to `johnthevid/techouse-website` using GitHub Desktop.
- Added root ignore rules, Codex instructions, local setup, handoff and manual-release workflow.
- Expanded repository documentation with feature/limitation inventory, package information, About metadata and release/recovery guidance.
- Private local state, credentials, compressed backups and client documents remain excluded.
- GitHub automatic deployment and automated Actions checks are not configured.

## 4 November 2026 — Desktop hover rendering

- Added desktop-only banner layout containment after intro/arrival playback.
- Kept the original intro/banner script and stylesheet bytes unchanged; no timing, easing or typography transition changes.
- Retained layout containment after comparing baseline and alternative compositing approaches. Limited throttled samples showed approximately 21% lower layout work and 20% lower raster work; this is not a device-independent FPS claim.
- Passed 13 layout comparisons and five live pointer activation/exit checks. The website regression suite passed all 12 groups.
- Worker version: `9be19ffd-8de2-4e61-b43c-ca5e9f7ac46f`.

## 4 November 2026 — Font, image and cache loading

- Self-hosted the exact approved variable font files and added loading hints.
- Added content-fingerprinted cache URLs and immutable caching for versioned static assets, with private responses kept uncached.
- Converted the elevator hero to a pixel-identical lossless WebP; total hero asset bytes fell by approximately 19%.
- Added cache regression coverage and pre-deploy cache-version generation.
- Passed 12 regression groups and 16 controlled pixel-identical screenshot comparisons.
- Worker version: `6121f911-614f-4073-9049-23c0c2cf428e`.

## 3–4 November 2026 — Initial Cloudflare hosting and verification

- Published Techouse 1.0 to the temporary personal-account workers.dev address.
- Added explicit HTML routing for the sign-in and office shells using a deployment adapter.
- Configured D1, secure hosted cookies and a private authentication secret.
- Imported 13 credited reference projects; did not transfer local administrator credentials or browser-local inquiries.
- User verified hosted password setup, MFA, draft persistence and sign-out/sign-in.
- Routing-corrected Worker version: `d305807d-c5a2-456f-9a07-1e382fbebf96`.

## 3 November 2026 — Stable Build 1, final code reviewed

- Approved the final reviewed baseline after cleanup and regression/visual checks.
- Review included save-and-leave handling, shared solar-estimate handoff, malformed route handling, validation and local recovery safeguards, and removal of obsolete code.
- Passed 11 test groups and 16 controlled visual comparisons.
- Preserved the approved intro, banner behavior and CSS during the review.
- Saved the final immutable source archive and its SHA-256/file manifest. Older pre-review archives remain historical backups.

See [RELEASES.md](RELEASES.md) for exact identities and recovery boundaries.
