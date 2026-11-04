## Stable Build 1 review — 3 November 2026

The local build has been reviewed and tested; this does not change production launch requirements. Startup now refuses to replace a missing key beside an existing database, an unreadable key or an invalid key. Restore the matching database/key backup if recovery is needed. A brand-new data folder still provisions its key automatically.

The active editor is `/office.html`, including its existing customizer and project gallery tools. Obsolete editor logic on the sign-in page has been removed. Content requests now reject non-object JSON and malformed gallery entries with validation errors. See `../deliverables/Stable_Build_1_Code_Review_2026-11-03.md` for fixes, verification and remaining work.

## Update 31 October 2026

After password + MFA sign-in, `/admin` now opens the original back-office design at `/office.html#/office`. The existing visual customizer, live previews, project library with up to three images, and post editor save through authenticated server endpoints with CSRF and content-version checks. Unauthenticated requests cannot load the private office bootstrap. The prior basic-editor limitation below describes the first build and is superseded by this update.

Authenticator enrollment now includes a QR generated locally by the vendored Project Nayuki MIT library (license retained in `site/vendor/qrcodegen.js`). No authenticator secret is sent to an external QR service. The manual key remains available.

Use **Account security** in the office header, or `/admin#security`, to change your password or remove the authenticator. Each requires the current password plus a fresh authenticator or unused recovery code, is rate-limited, and revokes all sessions. MFA removal also invalidates recovery codes and requires fresh enrollment on the next sign-in. The site never grants password-only publishing after removal. There is no email reset bypass.

Do not share passwords in chat. Change any disclosed password through Account security; the existing password is not needed by the developer.

# Techouse base platform

Created 30 October 2026. This is a working local foundation and Cloudflare Worker source, not a completed production deployment or an independent security certification.

## Run locally

Use Node.js 24 or later. From this folder:

```sh
node invite.mjs johndavidceasar@gmail.com
node local.mjs
```

The first command creates a private, single-use setup link in `.data/setup.url`, valid for 30 minutes. Open that URL on this computer, set a password of at least 16 characters, then sign in and enroll a TOTP authenticator. Provisioning cannot overwrite an existing account. Never commit `.data`, paste passwords into chat, or put secrets under `site/`.

- Website: http://127.0.0.1:8787/
- Admin: http://127.0.0.1:8787/admin
- The separate 8765 server is still the old presentation prototype. It does not provide these protections or shared CMS data.
- Local HTTP is restricted to loopback and uses an HttpOnly, SameSite cookie without Secure. Deployed mode requires HTTPS and a Secure `__Host-` cookie.

The authenticator setup uses a private manual setup key: add a time-based account with issuer Techouse, 6 digits, 30 seconds, SHA-1. Apps supporting TOTP can use it. No external QR service receives the secret. Eight one-use recovery codes appear after enrollment; store them in a password manager. Losing the authenticator AND all recovery codes requires a verified operator-assisted reset; no insecure email bypass is supplied.

## What works

- Invite-only account setup. No default credentials or public registration.
- Password hashing with scrypt N=16384, r=8, p=5 and a unique random salt.
- Password plus authenticator required before publishing. Enrollment is verified before activation; codes cannot be replayed; recovery codes are hashed and consumed once.
- MFA secrets encrypted at rest with AES-GCM under AUTH_KEY, kept outside the database. Back up that key securely: losing it makes enrolled secrets unreadable.
- Short-lived pre-authentication challenges, one-hour absolute admin sessions, session rotation, logout revocation, CSRF tokens and exact Origin checks.
- Login/MFA attempt limits, prepared database queries, bounded JSON requests, allowlisted text selectors, media restrictions, security headers and audit events.
- Shared CMS text, banners, projects, posts, draft/public states and optimistic version checks preventing stale overwrites. Unsaved-change warning and discard are included.
- The public site consumes only published records. In platform mode the old `#/office` route redirects to `/admin`; localStorage is not authority for published content or authentication.

The CMS is deliberately basic. It currently edits project/post covers; project covers replace the gallery with that cover. Existing multi-image galleries remain in records until a cover is replaced. The older prototype's full customizer preview and gallery-management experience has not yet been ported to the secure CMS. Media are resized and persisted inside the content document for this base; the maximum content request is 5 MB. Migrate media to R2 before large content libraries. No customer contact data should be put into public CMS content.

## What remains before launch

1. Create Client-owned Cloudflare services, approve costs and data handling, configure real domain/APP_ORIGIN, apply the schema, provision the production account and secret, and test in the actual Workers runtime.
2. Set COOKIE_SECURE=true in production. Restrict origin to the exact HTTPS address; do not use wildcard origins. Do not expose the local adapter to the Internet.
3. Migrate approved prototype content explicitly. Browser-saved content is not silently imported, and sample portfolio claims must be reviewed before public publication.
4. Connect real inquiry delivery, shared inquiry records, Turnstile and visit/calendar services. Those public forms still disclose their demo behavior; this change does not silently send data or mail.
5. Complete server-side image decoding/R2 storage and richer gallery management if needed. The current API validates image MIME/encoding patterns and the CMS re-encodes uploads; no malware-scanning service is claimed.
6. Agree backup retention, automate secure database/media exports to a separate destination, test restoration and key recovery. D1 recovery alone does not back up independent media or the encryption key.
7. Verify HTTPS headers, DNS, production access, quotas, actual email delivery and supported devices. Obtain client acceptance. No uptime or “unhackable” claim is made.

## Cloudflare deployment outline

`worker.mjs` uses native Worker Request/Response APIs with D1 prepared statements and `node:crypto` scrypt. The compatibility date is 2026-10-30. `local.mjs` supplies a SQLite/filesystem adapter only for this computer; it is never shipped as the Worker.

Use the current Cloudflare Wrangler CLI after connecting the Client's account:

```sh
npx wrangler d1 create techouse
# Put the returned database ID in wrangler.jsonc.
npx wrangler d1 migrations apply techouse --remote
npx wrangler secret put AUTH_KEY
# Enter a newly generated 32-byte hex production secret privately, not the development key.
# Set APP_ORIGIN to the approved HTTPS domain and retain COOKIE_SECURE=true.
npx wrangler deploy
```

A production administrator must be provisioned via an operator-created invitation (hash of a random 32-byte token, allowed email, expiry) in D1. Then use `/admin#setup=<private token>` and the same one-time workflow. Do not put a raw invitation token or password into SQL history; create a hashed invitation through a secure operator script. Reconcile the production runtime, auth CPU budget and billing before opening access. Deployment is not executed by the local test suite.

## Testing and maintenance

```sh
npm install
npm test
```

Runtime has no npm dependencies. Playwright is a development dependency and the browser test uses an isolated headless Google Chrome installation (not the user's profile). With the bundled workspace runtime, set PLAYWRIGHT_MODULE to its Playwright package.json. Tests create temporary databases and do not use the real administrator or stored customer content.

Round 1: enrollment/publishing and unauthenticated access, CSRF, injection attempts.
Round 2: persistence/version conflicts/recovery and MFA/recovery replay, session rotation, unsafe media/links and escaped bootstrap data.
Round 3: browser flow/mobile and expired sessions, attempt limits, invitation reuse, secure cookie mode and filesystem isolation.

See `../../deliverables/Techouse_Base_Build_Test_Report_2026-10-30.md` for evidence and limitations. A daily Worker scheduled handler removes expired sessions/limits and audit records older than 90 days. Keep code, schema, providers and recovery procedures maintained. Dependency updates require repeat regression testing.
