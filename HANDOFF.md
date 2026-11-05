# Current handoff

Updated: 5 November 2026.

## Accepted PHP 55,000 scope and independent Tip — 5 November 2026

Client selected the PHP 55,000 quotation, not the PHP 65,000 builder package. Preserve feature/page-builder and feature/staff-chatbot as archived demo history; do not include builder in the delivery. Created feature/tip-assistant directly from v1.0.1 (1d2e16e). Extracted only staff-helper.js/css and minimal app/index hooks, renamed Pip to Tip, removed all builder guides, intents and dependencies. Tip remains a complimentary deterministic back-office guide for projects, text/images and inquiry review/deletion, without a connected AI service or automatic save/delete actions. Existing CMS browser test passed. Independent Tip test verifies no builder global, no builder topic, guide routing, no remote writes and mobile bounds; responsive positioning corrected and targeted test rerun. Source is local/uncommitted; no merge/push/deployment.

Client meeting: signing expected 6 November; initial payment expected next Friday (13 November). Formal kickoff remains subject to signed agreement, initial payment and required inputs/access. User authorizes working ahead locally and wants delivery, testing, documentation, video guide and orientation planned end-to-end. Important scope/schedule mismatch to reconcile before signing: latest supplied PHP55k quotation targets initial review in 3 weeks, content by end week5, up to 2 follow-up batches and final integration/testing/handover within 2 weeks after final batch/approvals. Do not silently promise all staggered content in 3 weeks. Accepted 55k includes partner banner/page/inquiry category, email OTP, Google Maps pin + manual roof outline/area in ticket, one Google Calendar/appointment type, baseline CMS/content population and 90-minute orientation. Builder, retainer and photography remain separate.

Next delivery priority: reconcile signed scope/milestones and content dates, collect approved technical calculator/product inputs and provider access, then implement real inquiry storage/inbox notification and remaining CMS product management before dependent OTP, maps/ticket, calendar and partner flow. Keep local previews distinct from functional live integrations. Reserve testing, hosted acceptance, handover/quick-start documentation and walkthrough recording time. No new paid services, live emails or publication implied by local preparation.


## Latest: approved 1.0.1 GitHub source release

The user approved publishing the reviewed 1.0.1 source to GitHub on 4 November 2026. Prepare/commit the approved branch, fast-forward `main`, and create annotated tag `v1.0.1`. Cloudflare publication is **not** authorized by this request and remains unchanged.

Git terminal authentication is unavailable; the connected GitHub app returns 404 for this private repository. Publication therefore depends on the user's signed-in GitHub Desktop unless another normal authentication route becomes available. Do not extract Desktop credentials, force-push, overwrite remote work, or claim a successful push without verification.

Validation remains 19 passing checks / 14 groups, 48 parsed scripts/modules, and 31 reviewed visual comparisons. No application behavior changed during release preparation; package/release metadata updated to 1.0.1.



## Current state

- Original baseline: Stable Build 1 — Final, Code Reviewed, approved 3 November 2026. Archive/checksum identity is in releases/stable-build-1.json. The archive remains local and is excluded from Git.
- Working source includes later Cloudflare routing, font/image/cache loading improvements and desktop banner layout containment.
- Live Worker: techouse at https://techouse.johndavidceasar.workers.dev.
- Latest deployed version: 9be19ffd-8de2-4e61-b43c-ca5e9f7ac46f.
- Last website validation: 12 regression groups passed; 13 hover layout comparisons passed; five live pointer activations and exit behavior passed. No animation source/timing changes were made.
- User reports substantially smoother hover. Exact user-device FPS difference has not been reproduced in automated testing.

## Active task: repository documentation

GitHub Desktop successfully pushed initial commit `30fffe5` to `johnthevid/techouse-website`; local origin/main records that push and the user confirmed the files on GitHub. The connected GitHub app still returns 404 for this repository, and terminal Git has no usable HTTPS credentials. Use the signed-in GitHub Desktop to push local commits until separate terminal authentication is configured.

Expanded README.md with verified features, limitations, local setup, dependencies, deployment, cross-device workflow and recovery. Added CHANGELOG.md, RELEASES.md and GITHUB_ABOUT.md. No GitHub version tags, GitHub Releases, published packages or automatic deployment have been created. GitHub About metadata is prepared as text and still needs applying in the repository sidebar.

The current working source is newer than the original stable archive. Preserve this distinction when creating commits or release tags. This documentation update changes no website behavior and requires no Cloudflare deployment.

## Limits and private state

Hosted D1 content stays on Cloudflare. Local databases, authentication keys, OAuth configuration, contracts, diagnostic artifacts and private recovery archives are excluded from Git. Hosted sign-in/MFA and draft persistence were verified by the user. Inquiry delivery and site visits remain demos.

## 1.0.1 update — local review candidate

Working branch `update/1.0.1`. Implemented inquiry CTA suppression, annual confirmation savings, calendar/ticket motion and state changes, official Facebook/TikTok links (LinkedIn pending; no Instagram), and lightweight blurred bundled-image previews. Added desktop/mobile visit lifecycle and preview/social regression coverage in `platform/tests/update-101-browser.test.mjs`.

Full 13-test suite passed with local Chrome enabled. Desktop/mobile calendar screenshots inspected. New extended check verifies previews and official-link count. Approved homepage intro/banner animation source remains untouched. Inquiry/visit data remain local demos. No Cloudflare deployment, remote database change, Git push, merge or release tag performed. User should review locally before release. A formatting-only cleanup was declined by automatic review to preserve uncommitted work; the formatter's existing stylesheet output was retained.

### Additional 1.0.1 review changes

Moved post-inquiry project examples into the right contact sidebar as a sector-matched slideshow with previous/next, pause/play, detail and sector-filtered portfolio links. Selected sector is carried as structured estimate data into the saved inquiry; older records without it show all sectors. Autoplay pauses for reduced motion, focus, hover, hidden/offscreen state and stops after removal. Empty sectors show an honest empty state.

Added compact browser-local inquiry history, current-request view on return/reload, explicit Make another inquiry action for any division, and restoration of saved demo visit status. No server receipt is claimed. After a second save, the new-form flag is removed so refresh shows the current ticket.

Fixed black product-image artifacts: preview generation now composites transparency onto white and removes the preview background on successful full-image load, including cached images. Original product files untouched. Added sector/history/repeat-inquiry and loaded-image background checks to the desktop/mobile regression. Existing browser workflow test now explicitly starts a second inquiry when an earlier request exists.

Final validation for these additions: the 12 existing regression groups passed; the expanded 1.0.1 browser group then passed with isolated per-sector sample projects, repeat submissions, reloads and white product-image backgrounds at both desktop/mobile widths. Product and inquiry screenshots inspected. No live data changed and no deployment/push performed.

### Inquiry layout correction

Fixed intrinsic slideshow overflow that squeezed the inquiry card: inquiry columns now use minmax(0, …), with explicit shrink/width constraints through the carousel track and cards. Desktop columns align; widths ≤800px stack. Saved-reference controls now have structured styling/selected state, compact current-request spacing, and a shorter returning-visitor hero. Inline visit calendar stacks inside its inquiry card. Expanded browser coverage passed all 3 sectors at 2560,1440,768,390px, asserting no horizontal page overflow, readable inquiry widths, correct desktop top alignment/mobile stacking and slideshow containment. Desktop/mobile screenshots reviewed. Local only; not deployed or pushed.

### Inquiry visual hierarchy redesign

Returning inquiry page now uses a compact history utility panel, a solar-specific headline, and a primary dark-green/warm-white request card with gold divider, structured location/installation facts, annual estimate where available, request disclosure and next-step action. Reference project slides are horizontal image/copy cards with compact estimates and controls; responsive layout retains containment and stacks the main columns at ≤1100px. Saved visit information sits inside the ticket body. Original homepage/intro untouched. Extended desktop/mobile browser group passed at 2560x1440,1440,768,390px across all sectors; reviewed desktop/mobile screenshots. No deployment, push, merge or tag.

### Visible inquiry-card selector

Replaced the collapsed saved-reference list with always-visible selectable cards: division/installation label, location, saved date, reference, demo/visit status and selected state. Card selection updates the details and sector slideshow. The selected-request panel is more compact and visually aligned with the cards; annual savings use a continuous summary row, and the visit schedule uses a structured date/time/status section. The existing detailed request disclosure still keeps long request text out of the overview. Refreshing a saved visit preserves this redesigned panel. Local review only; no release/push/deployment.

Visible-card validation passed at 2560,1440,768,390px across all sectors, including two immediately visible cards, exactly one selected card, switching from construction back to Solar, repeat submissions, reload persistence and image backgrounds. Desktop screenshot with two cards inspected; no horizontal overflow.

### Progressive returning-visitor flow

Returning inquiry routes now show only a branded saved-request confirmation, immediately visible ticket cards, then a separate invitation to make another request. The main form/details grid is hidden until a ticket is chosen or a new inquiry is explicitly started. Selecting a ticket opens a centered, strongly anchored detail view with Back to your inquiries, green/gold request header, grouped project/annual-estimate/visit blocks. Related project slideshow is optional in a closed disclosure, not shown by default. New-request form hides the ticket overview; Back restores overview without deleting saved records. Receipt copy remains honest about local demo storage, not staff receipt. Existing homepage intro unchanged. Local only; no deployment or push.

Progressive-flow validation: all 13 regression groups passed, including the four-width/three-sector returning-visitor overview, explicit ticket selection, optional related projects, new request, refresh and back-navigation checks. Overview and focused-detail desktop screenshots inspected. Overview clears Viewing/selected labels when no detail is open. Ticket selection moves focus to the displayed request and scrolls to its start.

### Inline collapsible tickets

Ticket selection now expands a shared detail row vertically inside the visible request-card list. The overview receipt and all cards stay visible; clicking the selected card again or Collapse inquiry closes the row without route changes. Expansion respects reduced motion. Desktop expansion uses roughly 2/3 ticket and 1/3 visible sector slideshow, stacked at ≤900px. Ticket spacing/heading/estimate are compressed. Saving a demo visit now restores this same compact view instead of the older large confirmation/torn-ticket layout. New-request flow remains separate. No push, merge or deployment.

Inline-flow checks passed for all sectors at 2560,1440,768,390px: same-card expand/collapse, visible overview while expanded, no dedicated detail navigation, desktop 2/3 proportion and aligned slideshow, mobile stacking, repeated inquiries and reloads. Twelve existing regression groups also passed. Fixed explicit card-column counts so adding a full-row expansion cannot create extra narrow auto-fit columns. Desktop expansion screenshot inspected.

### Repeat-inquiry entry prompt

All ordinary public inquiry-link clicks now show a focused native dialog when browser-local requests already exist. Choices: Cancel/stay, View my inquiries (overview), Continue with a new inquiry (new=1). Existing division/estimate query parameters are preserved; estimator target handlers still capture the reviewed estimate before navigation. Escape/backdrop cancel, focus restoration and root scroll lock are included, with blurred/dimmed backdrop and reduced-motion handling. First-time visitors and modified/new-tab clicks retain normal behavior. Copy reports local demo saves, not live staff receipt. No Cloudflare activity or Git push.

Repeat-prompt verification: all 13 regression groups passed. Added cancel/Escape, unchanged route/scroll, correct inquiry count, scroll-lock, view overview and Continue estimate-preservation checks across four screen widths. Final settled desktop prompt screenshot inspected with blurred backdrop and readable controls. Local-only state unchanged on Cloudflare.

### Compact receipt and restored ticket styling

Compressed the saved-request banner with a side-by-side confirmation icon and text, reduced padding/gaps, retaining heading weight, green background and gold rule. Expanded request retains its green header but now uses torn top/bottom edges, a dashed perforation, side notches and warm paper body. Styling only; no flow/data changes. Desktop/mobile existing interaction checks passed in a focused run and screenshots inspected. Local only, no deployment or push.

## 1.0.1 system/component review — completed locally

Baseline suite passed. Additional component checks reproduced and fixed three bugs: malformed visit siblings hiding valid visits, date-button rebuild losing keyboard focus, and other-tab storage notifications discarding an open calendar. Added `platform/tests/release-101-components.test.mjs`; final complete suite passed 19 tests (14 top-level groups, five new component scenarios), no skips/failures. Inquiry CSS extracted to `site/inquiry.css` immediately after `solar-extras.css`, preserving rule order and visual behavior. 48 JS/module syntax checks passed; checked local references and fingerprints clean.

Compared 31 desktop/mobile views with a pre-review working-copy snapshot: 30 exact matches; remaining difference limited to unchanged mobile header-logo rasterization, with no layout change. Approved intro/banner/hover/slider sources byte-identical. Detailed local report and QA evidence: `deliverables/1.0.1-review-20261104/Techouse_1.0.1_System_and_Component_Review.md` (ignored/private). No data migration, push, merge, tag or Cloudflare deployment. Await owner's final visual review/release instruction.
