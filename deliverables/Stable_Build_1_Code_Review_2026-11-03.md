# Stable Build 1 — Code Review

Date: 3 November 2026. Baseline: client-approved Stable Build 1, preserved before changes.

## Result

Reviewed the source, made targeted fixes and readability improvements, and kept the approved presentation. All 11 automated test groups pass. All 16 controlled desktop/mobile screenshot comparisons match pixel-for-pixel after fonts, images and finite transitions settle. The homepage intro and banner JavaScript and every CSS file match the pre-review backup byte-for-byte.

This is a local development review, not production acceptance or an independent security certification. No production deployment, real administrator sign-in or live-content edits were performed.

## Backup taken before edits

- Source: `../releases/Techouse_Stable_Build_1_BEFORE_CODE_REVIEW_2026-11-03_193157.tar.gz`.
- Integrity manifest: `../releases/Techouse_Stable_Build_1_BEFORE_CODE_REVIEW_2026-11-03_193157.tar.manifest.json`. SHA-256: `76b6e17e2fc032fdfc03c1bf2115755344601870910eb2a1eb24bdf90e29ef70`.
- Private recovery: `../releases/PRIVATE_Stable_Build_1_DATABASE_2026-11-03_193157.tar.gz`. Contains a consistent SQLite backup and its matching authentication encryption key, with owner-only file access. Kept separate from the shareable source archive.
- Verified every source archive entry against the original file and verified SQLite integrity before archiving. The original Stable Build 1 archive is also retained.

## Confirmed findings and changes

| Finding | Change | Verification |
|---|---|---|
| Changes-review “Save & leave” checked the dirty state immediately after an asynchronous submit, leaving the dialog open after a successful online save. | Wait for the actual customizer save outcome. Failed saves keep the draft/dialog open; successful saves close the review and follow the requested destination. Submitted customizer fields remain inert while saving so later edits cannot be incorrectly marked saved. | Browser regression exercises an injected save conflict, retained draft and successful retry/navigation. |
| The inquiry handoff calculated savings differently from the displayed estimator, ignoring the requested offset. | Added one shared planning calculation used by both the display and handoff. Existing budget, generation, maintenance and payback calculations remain the same. | Existing default estimate assertions pass; a PHP 6,000 bill at 20% carries PHP 1,200 into the inquiry. |
| A malformed percent-encoded project URL could throw in `openProject` despite the page renderer handling it. | Decode safely and show the existing unavailable-project message. Draft projects are excluded from detail lookup. | Browser visits a malformed project URL and closes the resulting dialog without page errors. |
| Old portfolio gallery handlers and observers remained after project cards changed to static linked tiles. | Removed unused slide/caption/count/autoplay handlers and unused intersection tracking. Kept current cards, sector tabs, pagination and project dialog. | Public screenshots unchanged and project/back-office browser flows pass. |
| The sign-in script still contained a second editor implementation that never loaded content after the move to `/office.html`. | Removed that unreachable editor implementation and its unused state; retained setup, sign-in, MFA, recovery and account-security flows. | Authentication, publishing and account-security tests pass. Sign-in script shrank from 17,578 to 9,908 bytes despite clearer formatting. |
| Currency animation constructed a new international number formatter for every value/frame; live preview copied unrelated project/post content. | Reuse currency formatters and take a narrow text/image snapshot for the customizer preview. | Existing estimator output and live-preview tests pass. No speed benchmark claim is made. |
| Catalogue resize work could repeat within a frame and unnecessarily measure product grids when only banner height was needed. | Coalesce resize work to one animation frame, measure only banners, reuse the approved 560 ms motion settings, preload each banner once and release finished slide closures. | Connected-track, adaptive-height, rapid-click, stable-position, mobile and reduced-motion checks pass. |
| Some malformed JSON/photo shapes caused server errors instead of validation responses. | Require object-shaped JSON/content maps/entries, string IDs and object-shaped gallery photos. Check gallery size before processing photos. | New validation regressions verify 400 responses and acceptance of normal content. |
| Local startup treated every key read error like a missing key and could generate a replacement over the existing key. | Only provision a key for a new data folder. Refuse unreadable/invalid keys and a missing key beside an existing database; create exclusively to avoid competing startup overwrites. | New isolated tests verify valid-key retention, invalid/unreadable/missing-key refusal and fresh-folder provisioning. |
| Several modules and asset-version URLs were compressed or difficult to scan. | Applied the existing formatting rules to edited/unprotected modules; replaced long historical query strings with a concise review version, retaining asset order. Added current-build notes to the READMEs. | Syntax/format checks and the unchanged screenshots confirm the presentation is retained. |

## Review coverage

Manually reviewed public routing, markup construction and escaping; the solar flow and calculations; equipment switching; project dialogs and portfolio lifecycle; customizer persistence and isolated previews; office editing, uploads and themes; sign-in/MFA/session/CSRF paths; server validation; local asset and database/key handling. The approved intro/banner implementation was inspected but left unchanged.

The source audit parsed 55 first-party HTML/JavaScript/CSS/config/test files without syntax errors. Its CSS pass inspected 2,749 rules and 7,032 declarations. All 22 first-party browser scripts also compile. Direct quoted local asset references resolved, and catalogue tests verify the manufacturer PDF links return PDF responses. Third-party vendored QR code was retained rather than rewritten.

Repeated CSS declarations exist, including substantial overlap in `divisions.css`. They were documented and retained: removing or moving an earlier rule can change how an intervening override behaves. The stylesheet order and all CSS bytes are preserved in this review. A future CSS consolidation needs its own responsive/state comparison pass.

## Evidence

- Full suite: 11 groups passed, 0 failed, approximately 14.7 seconds on the final functional run. It covers authentication/MFA, sessions, CSRF, stored content, version conflicts, account security, browser editing, themes/responsiveness, solar estimator and equipment navigation.
- Added server regressions: `platform/tests/review-regressions.test.mjs`.
- Extended browser regressions: `round3-browser.test.mjs` and `solar-catalogue-navigation.test.mjs`.
- 16 full-page comparisons: homepage, About, divisions, Solar, panels, inverters, inquiry and updates at widths 1440 and 390. Same content, reduced motion, decoded images, loaded fonts and settled painting. All final comparisons were pixel-identical. An initial transient paint difference disappeared after settling transitions.
- Browser visual capture and functional flows reported no uncaught page errors.
- Approved intro/banner scripts and all CSS files verified against the backup manifest.
- Machine-readable source and screenshot comparison summaries: `review-evidence-20261103/`.

## Boundaries and remaining launch work

Inquiry sending and site-visit requests remain labeled browser-local demos. The solar catalogue still uses source-defined product records; the active server schema/editor handles projects/posts and company text/images, not a product-record CMS. Client-approved final project material, leadership/team content, provider setup, real hosted delivery and hosted system acceptance remain separate release work.

The current tests use isolated temporary databases and Chrome. They do not establish behavior in the deployed Cloudflare runtime or replace final hosted/browser acceptance. No assets were downsampled, CSS purged, dependencies added to the website runtime, or approved animation choreography changed.
