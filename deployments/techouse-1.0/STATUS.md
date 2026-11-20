# Techouse 1.0.1 — Cloudflare hosting

Updated: 4 November 2026 (Asia/Manila).

- Personal account: johndavidceasar@gmail.com.
- Worker: `techouse`.
- Address: https://techouse.johndavidceasar.workers.dev
- D1 database: `techouse`, UUID `186b525d-4f1c-4f8b-87f0-d83df59355f7`, binding `DB`.
- Current deployed version: `8676aa74-6c27-4155-a000-7de006d6d1ea`.
- Rollback reference: `9be19ffd-8de2-4e61-b43c-ca5e9f7ac46f`.
- Source release: `v1.0.1`, commit `1d2e16eec87e40ac883e9aafcdd00a7577cb15b1`.
- Source: reviewed 1.0.1 update; original Stable Build 1 archive remains unchanged.
- Deployment config: `wrangler.jsonc` in this folder; Wrangler 4.157.0 used.
- `APP_ORIGIN` is the address above; `COOKIE_SECURE=true`; `AUTH_KEY` was entered by the user as a Cloudflare secret. No secret value is recorded here.

## Cloudflare-specific adaptation

`worker-entry.mjs` delegates to the approved platform Worker. Static asset HTML handling is disabled and the root asset is resolved explicitly to `index.html`. This prevents Cloudflare's default `.html` redirects from looping on `/admin` or returning empty HTML when the Worker loads the office shell. No presentation or intro source was changed.

The site's `.assetsignore` excludes maintenance Markdown and editor settings from uploaded public assets.

## Checks completed

- Local Cloudflare workerd integration: homepage, admin/index HTML, isolated account setup, password sign-in, MFA verification, private office/bootstrap HTML, content save, logout and signed-out access protection.
- Live HTTP: homepage/admin/bootstrap return 200; signed-out office redirects to admin; private content returns 401.
- Isolated live browser: homepage renders, panels show three records, switching to inverters shows five records, admin sign-in renders, no uncaught page errors.

## Initial setup sequence — historical

1. User confirms the live homepage.
2. Transfer approved website content to the new D1 database. At the initial deployment, it contains zero projects and zero posts. No local account credentials or inquiries have been copied.
3. Confirm the hosted administrator email, create a short-lived invitation and let the user set their password and enroll MFA privately.
4. Verify real hosted setup/sign-in/publishing, including runtime/plan limits, and finish hosted system acceptance.

Inquiry delivery and site visits remain demos; hosting does not make those integrations live. No custom domain or paid-plan change was made.

## Content transfer — 4 November 2026

The user executed the guarded content import in the Cloudflare D1 console. Live public bootstrap verified 13 credited reference projects (4 residential, 6 commercial, 3 industrial) and 0 posts. Administrator credentials and browser-local inquiries were not transferred. The next step is to confirm the hosted administrator email and provision a private setup invitation.

## Hosted account and persistence checks — 4 November 2026

The user confirmed password setup, authenticator enrollment and recovery-code handling for johndavidceasar@gmail.com. The user created a Hosting test draft, refreshed and confirmed persistence, then signed out and signed back in with password and MFA successfully. These hosted account actions were performed by the user; the assistant did not receive the password, authenticator secret or recovery codes.

The final unauthenticated HTTP check confirmed 13 published projects, 0 published posts, no Hosting test draft in the public bootstrap, and HTTP 401 for private content. Cleanup: the user can remove the Hosting test draft from Updates.

Hosting and the exercised content/sign-in functions are working. Inquiry email delivery and site-visit scheduling remain browser-local demos. A custom domain, complete hosted acceptance across all supported browsers and production service integrations are separate remaining work.

## Loading update — 4 November 2026

Deployed version `6121f911-614f-4073-9049-23c0c2cf428e`. Before editing, all 191 final Stable Build 1 manifest files matched; no baseline source drift explained the reported frame-rate difference. The original final archive remains unchanged. A separate BEFORE_LOADING_OPTIMIZATION archive preserves the pre-update source.

The update self-hosts the exact variable fonts, preloads homepage hero assets, uses a pixel-identical lossless WebP for the elevator hero, and adds fingerprinted immutable static caching. Hero transfer size decreased from 3,902,841 to 3,172,480 bytes. Animation source files banner.js, experience.js, banner.css and experience.css remain byte-for-byte unchanged.

Validation: 12 test groups passed; 16 controlled desktop/mobile screenshots were pixel-identical to final Stable Build 1. Isolated Cloudflare runtime authentication, MFA and save checks passed. Live homepage, product tabs and sign-in render without uncaught errors. Live static cache and private no-store headers passed. No hosted database content was modified.

Post-deploy browser sample: cold load 1,891 ms, warm load 140 ms; hover average 16.67 ms/frame in both runs. Intro average 16.76/16.78 ms. Cold loading was slower than the earlier 420 ms sample, so these non-controlled network timings do not establish a first-load improvement. Neither baseline nor updated headless testing reproduced sustained lower hosted FPS. User-device verification remains necessary. Detailed evidence is in deliverables/performance-20261104.

For future manual updates, run Wrangler from this deployment folder with Node on PATH. Its custom build runs refresh-assets.mjs to refresh script/style content hashes before upload. Do not run the deployment from the workspace root with only a --config argument unless the build working directory is also adjusted.

## Desktop hover rendering — 4 November 2026

Version `9be19ffd-8de2-4e61-b43c-ca5e9f7ac46f` adds scoped layout containment with no animation source changes. All 12 regression groups and 13 layout comparisons passed. Details: `../../deliverables/hover-performance-20261104/REPORT.md`. Prior version remains available for rollback.

## Techouse 1.0.1 — 4 November 2026

User authorized deployment of reviewed source commit `1d2e16eec87e40ac883e9aafcdd00a7577cb15b1` (source tag `v1.0.1`). Wrangler 4.157.0 deployed Worker version `8676aa74-6c27-4155-a000-7de006d6d1ea` to the existing temporary address. Prior version `9be19ffd-8de2-4e61-b43c-ca5e9f7ac46f` is the code rollback reference.

- Ten hosted browser check groups passed: homepage/hover; three product categories; estimate/annual confirmation/local visit save; saved ticket reload/inline expansion/slideshow; repeat prompt; mobile layout; sign-in screen; approved asset bytes and versioned cache policy.
- No uncaught browser errors. Verification blocked remote non-GET/HEAD requests and recorded zero remote writes. Test inquiries/visits existed only in an isolated temporary browser, then were discarded.
- Live homepage/admin/bootstrap HTTP checks passed. Signed-out office redirects to admin; private content returns 401. Private responses remain no-store, homepage no-cache, versioned assets immutable.
- Public bootstrap remains byte-identical to pre-deployment: 13 projects, 0 published posts. No database migration/import, account provisioning, secret rotation, custom-domain or paid-plan change was performed.
- Homepage intro and hover were verified after allowing the existing banner entrance to finish. Earlier smoke-check timeouts were test synchronization errors, not deployment code changes.

Local source validation before release: 19 checks passed; 31 visual comparisons reviewed. Inquiry delivery and site visits remain explicitly labeled demos. Full authenticated production acceptance and live service integrations remain separate.
