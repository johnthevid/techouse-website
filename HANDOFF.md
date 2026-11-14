# Current handoff

Updated: 4 November 2026.

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


## Official development branch setup — 9 November 2026

Created local `demo/1.0.1` and `develop` directly from `update/1.0.1` (1d2e16e). Current branch: `develop`. Demo branch preserves the unmodified reviewed demo; release tag v1.0.1 remains unchanged. `main` was not moved. Tip remains on `feature/tip-assistant` (eb2ebbe), pending deliberate integration without the discontinued page builder.

User intends visual improvements, removal of redundant elements and a less obstructive homepage intro. No website source, styling, animation, data or version number changed in this setup. Updated WORKFLOW.md with branch roles. Verified clean starting tree and branch commit identities; no browser tests necessary for branch/documentation setup. Branches have not been published to GitHub and Cloudflare has not been deployed. Next: publish both branches using GitHub Desktop, then create focused work branches from develop.


## Homepage refinement — 9 November 2026

Current branch `feature/homepage-refinement`, created from `develop`. Simplified homepage division panels to the existing main heading, division name and a larger Discover more action; removed division eyebrows, explanatory copy, bullet lists and hover/tap instruction text. Expanded desktop headings now reach clamp(48px, 5.2vw, 84px). Action buttons have a reversible CSS ripple-like hover/focus fill. Removed obsolete hook/description inputs from the legacy homepage customizer without deleting stored content.

Made the overlay scrollbar wider and Techouse red, preserving its transparent gutter and native scrolling. The homepage About cue now uses an 850ms eased scroll, interruptible by wheel, touch, pointer or keyboard input and canceled on route teardown; ordinary wheel/trackpad scrolling remains native. Existing intro timing/choreography was not changed in this pass.

Image previews now wait for decoding, reveal through a 550ms blur transition and respect reduced motion. Homepage image loads delayed beyond 1.5 seconds show a small Techouse loading indicator; errors stop the pulse and show Image unavailable. Cached images bypass the reveal animation; stale source callbacks are ignored. Product previews still clear after decode to avoid transparent-image artifacts. Asset cache hashes refreshed locally.

Validation: JS syntax and diff whitespace checks passed. Full regression run passed 19/20 checks initially, exposing product-preview cleanup timing; corrected it and the affected 1.0.1 browser suite then passed. New responsive homepage checks cover 1440/1024/390px, full and reduced motion, keyboard expansion, CTA navigation, overflow, delayed and failed images, and About scrolling. Desktop/mobile screenshots inspected. Final targeted homepage/editor rerun is recorded below. Safari was not tested (no local WebKit test runtime available).

Local server started on http://127.0.0.1:8787 for owner review. No release/version bump, GitHub push, merge or Cloudflare deployment. Demo and main branches unchanged. Pending owner visual review before publishing/merging.

Final targeted verification passed: homepage responsive/full-motion/reduced-motion/loading/error/navigation/scroll test and existing protected-editor browser workflow. Initial new scroll test required restoring keyboard focus before clicking the re-collapsed CTA; test corrected without changing application behavior. Formatting, syntax and whitespace checks passed.


### Scrollbar visual follow-up
User requested solid white, rounded ends and golden-ratio height. Overlay thumb now remains white on hover and uses viewport height / phi (approximately 61.8%). Existing position and drag calculations use the actual thumb height. Transparent gutter and scroll-lock handling unchanged. Local only; no push or deployment.

Scrollbar follow-up: owner selected the shorter complementary golden-ratio proportion (38.2% of viewport height), retaining solid white rounded ends. Border remains zero and outline-like box shadow removed. Syntax/whitespace checks passed; local only, no deployment.


### Homepage copy and category ordering
Removed the two opening invitation lines. Intro playback now tolerates the absent invitation, avoiding a null-reference failure and removing its unused animation steps. Division labels remain below idle headings and appear above expanded desktop headings (including keyboard expansion); touch layouts keep the original below-heading ordering. Responsive homepage checks passed at 1440/1024/390px, including an assertion that the expanded label is above the heading. Tagline destination was unspecified; asked the owner and used below the main question as a reversible default pending feedback. No push/deployment.


### Homepage action placement and circular ripple
Owner confirmed tagline below the main question. Moved About us into the intro directly below that tagline, preserving the existing scroll action and dismissal logic. Quote and About actions now have reversible circular white fills on hover/focus, dark text in the light state, and reduced-motion handling. Increased header/intro horizontal gutters to clamp(28px, 5vw, 96px), with responsive width constraints. Photography remains full bleed.

Responsive homepage browser checks passed at 1440/1024/390px, including expanded-label position, About button below tagline, desktop gutter, circular fill state, scroll action and existing loading/navigation cases. Whitespace and formatting checks passed. Local preview remains on port 8787; no push, merge or deployment.


### Homepage action fade follow-up
Replaced all three homepage button ripple fills with 350ms background/color fades. Discover more is dark with a subtle outline and white text by default, highlighting white on hover or keyboard focus. About us moved out of the intro to the landing section's bottom-left (24px from the bottom, aligned to the intro gutter). Existing scroll action, reduced-motion preference and dismissal behavior retained. Updated targeted layout test to check bottom-left placement and white hover state. Local only; no push/deployment.

On touch/narrow screens the About action sits at the bottom of the opening text area, above the vertically stacked panels, so it remains visible before scrolling dismisses the cue.

Headline shadow follow-up: widened the radial gradient and reduced its center opacity with additional transparent falloff stops. Narrow-screen extent stays bounded to the side gutters. No animated blur added; text/layout unchanged. Local only.


### Homepage hierarchy follow-up
Moved About us to bottom-center, separating the company scroll destination from the Solar panel; narrow screens retain the cue in the opening text area's lower region. Tagline weight is now 300. Restored the quote action to transparent/outlined at rest with a white fading hover/focus highlight. Updated responsive placement and weight assertions. No push or deployment.


### Simplified hovered division hierarchy
Division names now remain below their headlines in idle and expanded states, with larger type (17–21px idle, 22–30px expanded desktop). Removed the Discover more actions and empty details wrappers. Panel click and keyboard activation remain the navigation path. Removed obsolete details/CTA handlers and updated responsive hierarchy/navigation checks. Quote and About controls remain available. No push/deployment.

Division copy alignment: outer desktop text edges and expanded panels now use the shared page gutter; compressed inactive panels retain readable internal spacing. Touch/mobile copy uses the same horizontal gutter as the headline and navigation. Local only.

Opening message position: lowered headline and tagline together by 32px on desktop and 24px on touch/narrow layouts, preserving their internal spacing and intro choreography. Local only; no deployment.


### Opening-message font exploration
Enlarged the final opening headline to clamp(56px, 6.8vw, 98px) and tagline to clamp(20px, 1.65vw, 28px), with mobile sizes 42–64px and 18–22px. Trying the already self-hosted DM Sans on this message only, retaining the light tagline and original promise-stage size rules. Manrope comparison captured at identical sizes; no new font downloads or global type changes. Checked 1440/1024/390px: no horizontal overflow or page errors, mobile message clears About cue. Comparison PNGs are outside the source repository in workspace outputs/homepage-type-exploration. Local only; no push/deployment.

Removed the homepage About us scroll button at owner's request. Company section and header-logo scroll action remain. Removed the cue-only scroll listener and adjusted the existing regression to verify absence and exercise the retained logo action. Syntax/whitespace checks passed; no push/deployment.

Opening tagline updated to “We bring the newest technology to the Philippines.” (corrected spelling). Local only; no deployment.


## Brand opening, hover stability and CMS review — 9 November 2026

Current branch feature/homepage-refinement. Previous visual work saved locally at ccfcb70 before replacing the intro. No GitHub push, merge, version bump or Cloudflare deployment. Local server restarted on port 8787 to load backend changes.

Replaced the older typing/typography-morph opening with a white brand curtain: zoom-out of the symbol, symbol moves left while the existing Techouse wordmark appears, then the editable company promise. Final requested promise hold is 2100ms (100ms shorter than the requested longer 2200ms hold). The white curtain slides down over 950ms, then the homepage question reveals first (600ms), followed by staggered division copy (550ms, 85ms stagger). About button remains removed. Company promise no longer renders beneath the homepage headline; its hidden source remains editable for the intro only. No external logo/typeface assets copied from the reference site.

Opening retains visible Skip, Escape, reduced-motion bypass, bounded image decoding, a 10-second cleanup failsafe, navigation cleanup and restoration of original inert/opacity states. Animations use transform/opacity instead of per-character typing or animated font metrics. Added site/brand-intro.css.

Hover text now uses inverse-scale transitions rather than frame-by-frame font-size/weight interpolation. Desktop heading rows and label slots reserve consistent heights: heading baseline and label start remain fixed across idle, expanded and rapid switching states. Existing photo expansion and panel navigation remain. Quote hover uses a background-color fade.

CMS review found stale invitation/hook/description fields still accepted by the server. Removed those fields from the active editor/schema; new division labels are editable alongside headings/images. Backend safely validates and discards retired keys on the next save so old drafts do not fail; unknown selectors remain rejected. No database migration or automatic rewriting of stored client copy. Editor descriptions now explain intro-only promise and division labels.

Verification: initial complete suite passed 22 tests. Latest targeted tests passed for stable hover anchors at 1440/1024/390px; full opening/Skip/reduced motion/navigation/failed logo; retired-field compatibility; and protected CMS label edit/live-preview/save. Inspected desktop opening/draining/headline-only/expanded views and mobile opening/final views. Safari/WebKit unavailable locally, so Safari remains a manual review item. Final complete regression result recorded below.

Final complete regression: 22 tests passed, zero failures/skips (including five calendar/storage component scenarios). Edited JS syntax and diff whitespace checks passed. Local visual captures inspected for draining curtain, headline-first reveal, fixed hover anchors and mobile intro/final page. Await owner review before push/merge/deployment.


## Fixed-layout banner copy and simplified homepage About — 9 November 2026

Desktop banner copy now uses its full expanded layout width in every state, with constant font metrics and reserved heading/label slots. CSS transforms alone grow/shrink the text; removed the JS inverse-size measurement/animation loop. Inner text offsets no longer switch between idle/active positions. Responsive tests assert identical text-box width/font size before/after hover and unchanged vertical anchors during rapid switching.

Added an accessible arrow-only circular scroll link beneath the Solar copy, pointing to #company. It shares the existing smooth, interruptible scroll helper and reveals with Solar text. On touch layouts it remains in normal content flow.

Simplified the homepage About section (not the separate #/about route): removed Get to know Techouse, the right-hand planning links and the second paragraph; centered the heading, shorter summary and retained More about Techouse action. Replaced the slow multi-stage alignment/typing choreography with a 420ms reveal and 60ms stagger. Mobile heading fits a compact two-line layout. Be a partner deferred to a separate branch as requested.

Removed the second About paragraph from editor fields and active backend schema, while accepting/discarding its retired selector on future saves for compatibility. Local backend restarted to load this rule; no remote content/schema changes.

Checks: four targeted tests passed (responsive banner geometry/arrow/About flow; intro lifecycle; retired-content API compatibility; protected CMS preview/save). Desktop/laptop/mobile screenshots inspected. JS syntax and whitespace checks passed. Safari remains untested locally. No push, merge or Cloudflare deployment.


### Arrow label and expanded division labels
Solar's down arrow now morphs from a 48px circle into a 136px capsule on hover or keyboard focus, revealing About us to its right. Arrow position and surrounding layout remain fixed; reduced motion disables the transition. Expanded desktop division labels use a single line with their final-width box, including Real estate development and Elevator engineering. Checked both labels fit inside their panels and arrow expansion/label visibility at 1440px and 1024px. Syntax/whitespace checks passed. Local only; no push/deployment.


## About story, footer hierarchy and button polish — 9 November 2026

Reworked the homepage About block into a text-only story: headline on the left, larger possibility-led introduction and a quieter closing line below/right, with More about Techouse retained. Added editable story/closing fields; retired prior summary selectors are safely discarded on future saves. No automatic database rewrite or remote migration.

Moved public social links into a Social column alongside Explore and Let's talk. Moved the full company name beneath the footer logo and removed the lower footer row. Existing official Facebook/TikTok destinations and non-linked pending LinkedIn label retained. Responsive footer wraps to three/two navigation columns below the brand.

Raised intro logo/message group 42px for optical centering. Solar down-arrow icon now sits in a fixed grid-centered 46px interior container; measured center offsets were exactly 0px on both axes at rest. Capsule hover behavior remains. Quote action uses an opacity-animated white layer (450ms), with header-specific selectors so the existing header transition rule cannot override the text-color fade. Measured intermediate opacities ~0.43 in / ~0.65 out, confirming a gradual transition rather than a snap.

Verification: updated homepage/CMS/intro/security/catalogue/component checks passed. Complete run initially reported one mobile inquiry scroll-restoration assertion; a 390px isolated rerun and then the full four-width inquiry suite passed unchanged. Kept the strict assertion, added viewport/layout diagnostics and optional TECHOUSE_TEST_WIDTH for focused investigation; no inquiry behavior changed. Desktop story/footer and raised-intro screenshots and mobile overflow inspected. Local backend restarted for story field rules. No push/merge/deployment; Safari still requires manual review.


### Centered homepage story — 10 November 2026
Centered the company headline, story paragraphs and CTA on one shared axis. Retained the larger story introduction and quieter closing line, with a 680px reading width. Reduced heading-to-story gap to 36px on desktop (existing 28px mobile spacing retained). Updated existing alignment assertion. Local only; no push/deployment.


### Footer refinement and reverse About-button fade — 10 November 2026
Improved the public footer with consistent page gutters, aligned four-column desktop navigation, a divided brand block, stronger company-name hierarchy and larger readable links. Tablet/mobile layouts stack the brand above three/two navigation columns with a horizontal divider. Existing destinations and pending LinkedIn state preserved; office footer excluded from public padding rules.

More about Techouse now fades its dark fill away over 450ms, revealing the section background with dark text while retaining the original dark border. Hover/focus no longer lifts the button or shifts its arrow. Reduced motion remains supported.

Checked footer layouts at 1440/1024/390px with no horizontal overflow; inspected desktop/mobile screenshots. Measured an intermediate About-fill opacity and verified fully transparent hover plus unchanged border. Formatting/whitespace checks passed. Local only; no push, merge or Cloudflare deployment.


## Homepage/footer simplification and unified solar planner — 10 November 2026
Renamed the down-arrow label to About Techouse; desktop pointer movement in the bottom 112px no longer opens division panels. Added more vertical company-story space and restored the closing tagline about bringing the newest technology to the Philippines. Public footer uses consistent column spacing, removes the brand divider, and includes a current-year copyright beneath the company name.
Removed Solar cover eyebrow/footer slogan, property/estimate/project section eyebrows, divisions-directory eyebrow and next-division eyebrow. Photo overlays retain only heading/subtext, with understated source credit. Solar property and priorities now share page one; the existing calculator is page two within the same planner panel, with a back action preserving selections. Existing section navigation switches the correct planner page before scrolling. Calculator formulas and inquiry handoff unchanged. Existing browser workflows now explicitly open the estimate step.
Validation: dedicated two-page planner browser check passed at 1440/390px (selection preservation, estimate calculation, navigation, no horizontal overflow, no page errors); both homepage responsive/intro lifecycle tests passed. Mobile full-page screenshot inspected. Whitespace check passed. Entire regression suite not rerun; Safari remains a manual check. Local only, no push/merge/deployment. Preview already listening on port 8787; attempted second start correctly reported address in use.


### Three-step solar flow and calculator restoration — 10 November 2026
Owner revised the two-page planner to three steps: Your area type, Your needs, Cost calculation. Only the relevant fieldset is visible in each discovery step; priority imagery now updates again on the needs step. Shared progress supports direct navigation; Back preserves selections and calculation values. Calculator retains its original split input/results design, restored to the full planner width without the inset border/padding. Section navigation labels now match the flow. Targeted desktop/mobile browser test passed, including hidden-step behavior, needs selection, backtracking, full calculator width, calculation, section navigation and overflow. Desktop full-page capture inspected. Local only; no push/deployment.

### Shared hero/footer margins — 10 November 2026
Aligned division hero copy and public footer container with the existing division-wrap width: max 1240px with 50px minimum desktop gutters, 24px gutters at <=900px. Full-bleed imagery/footer backgrounds retained. Added desktop/mobile geometric equality assertion to planner browser coverage. Local only; no deployment.

### Banner-aligned public margins and cohesive planner — 10 November 2026
Owner requested the banner gutter across public pages. Added shared --site-gutter clamp(28px,5vw,96px) and applied it to public containers, division wraps, cover copy and footer contents; office workspace excluded. Full-bleed backgrounds retained. Removed the standalone Your needs calculator back button. The shared three-step header now uses equal segments, green active state and gold underline, joined to one bordered content frame. A single outer heading/description changes for the cost step; removed the duplicate inner calculator heading. Step-header navigation preserves all selections and calculator values. Existing calculator split retained.
Checks: homepage responsive/intro lifecycle plus three-step planner tests passed (3 tests), including desktop/mobile margin equality, calculation, selection persistence, absence of removed back button and no overflow. Mobile full-page planner capture inspected. Whitespace check and asset cache refresh passed. Local only; no push/merge/deployment.

### Connected solar progress indicator — 10 November 2026
Replaced rectangular step tabs with numbered circular markers and connecting lines. Prior steps show checkmarks/green connectors; current step has a green marker and gold focus ring; upcoming steps remain outlined. Labels stay beneath markers, including mobile. Click/keyboard navigation and aria-current preserved, with explicit accessible step/status names. Planner desktop/mobile test passed, including calculation, backtracking, margins and overflow. Asset refresh and whitespace checks passed. Local only; no push/deployment.

### Solar polish and simpler equipment entry cards — 10 November 2026
Added a 320ms, 5px blur/opacity reveal when switching planner steps. Running reveals are cancelled on subsequent selection; reduced motion bypasses it. Calculator input surface now matches discovery's warm form background with white fields/cards and muted green borders. Removed optional-guide/technical-reference eyebrows and the Your solar starting point result eyebrow. Equipment overview cards now contain category image, heading and one View all models destination, stretched across the full card; removed featured-model/rating/datasheet clutter from this overview only. Product category pages and their datasheets remain intact. Browser coverage checks all three destinations, removed content, rapid-switch blur cleanup, calculator behavior and desktop/mobile margins. Local only; no push/deployment.


### Equipment banner copy cleanup — 10 November 2026
Removed Techouse × Skyworth eyebrow and equipment-range/datasheet availability caption from the shared category banner template (panels, inverters, batteries). Category headings, descriptions, tabs, model cards and datasheet actions unchanged. JS syntax/whitespace checks passed; local only, no deployment.

### Intro choreography exploration — 10 November 2026
Owner requested a new intro sequence: retain symbol/wordmark reveal, shrink the lockup to 72%, introduce a large 30–64px company promise from above, hold 2.4s, fade content and drop the white curtain. Homepage question then reveals at viewport center, holds 1.1s and moves to its original location over 800ms before division copy reveals. Headline geometry/line breaks remain unchanged; movement uses transforms. Skip/Escape, reduced-motion bypass and original style/inert restoration retained; failsafe raised to 13s to cover the additional reading beats. Desktop promise screenshot inspected. Local only; no release/push/deployment. Intro test timeout updated to cover longer user-requested sequence, including failed-logo path.


### Intro experiment reverted — 10 November 2026
Owner rejected the latest intro experiment. Restored previous logo/wordmark reveal, small promise with 2.1s hold, white curtain drop, headline reveal in its original position and then division copy. Removed logo shrink, oversized message and centered-headline hold/move. Restored 10s failsafe and previous test timeout. All solar/planner/catalogue/footer/margin changes preserved. Local only.


### Homepage header-action fade — 10 November 2026
Call us and Request a quote now fade in together over 650ms when the curtain clears and the homepage headline reveals. Intro scroll lock/inert behavior retained. Skip/navigation/failsafe restore original inline opacity and remove the temporary reveal class; reduced motion still bypasses the intro. Local only; no deployment.

## Cleaned demo publication — 11 November 2026
User authorized pushing the current feature/homepage-refinement version and creating a separate Cloudflare demo named techouse-cleaned. Contact card now uses Let’s Talk as its heading, with the duplicate eyebrow removed. Prepared isolated wrangler.cleaned.jsonc/cleaned-demo.mjs; no DB/auth secrets/cron bindings, no staff/API routes, noindex headers. Existing techouse Worker unchanged.
Validation: full suite had 21/23 passing; two tests needed updating for hidden calculator steps and a scroll-settlement race. Calculator test now explicitly selects its step. Cancel test waits for stable scrolling before taking its baseline; strict position assertion unchanged. Both failed groups then passed (catalogue and four-width inquiry lifecycle); other 21 checks passed in the full run. Cloudflare OAuth attempt timed out before authorization; deployment pending user sign-in. Git publication status will be recorded after push.

Publication outcome: source commit 48fe3f7 created on feature/homepage-refinement. Initial GitHub push failed with a connection reset; retry attempted using HTTP/1.1. No confirmed remote publication. Cloudflare login timed out twice without authorization; no deployment executed. Demo wrapper isolation/root/noindex checks passed locally. User can push this branch through signed-in GitHub Desktop and authorize Cloudflare before deployment continues.


### Cleaned demo deployed — 11 November 2026
Cloudflare OAuth completed successfully. Deployed separate techouse-cleaned Worker, version baa95920-c363-42d9-bff1-a4ab43ba86f1, at https://techouse-cleaned.johndavidceasar.workers.dev. Only ASSETS binding; no DB/secrets/staff accounts. Verified live homepage, Let’s Talk contact card, solar calculation, catalogue, and 404s for admin/office/API routes with no browser page errors. Existing techouse deployment untouched. Latest GitHub push retry failed with connection reset; user can push feature/homepage-refinement through GitHub Desktop. Deployment records committed locally.


## Division CTA placement and slide reveal — 11 November 2026
Added approved division CTAs under category names on homepage: saving/building/creating/shaping possibilities/elevating. Actions enter the corresponding division using the existing route transition. Desktop copy group shifts up 64px as one fixed-layout block; CTA occupies reserved space, avoiding text reflow. Mobile actions remain visible in normal flow. CTA reveals left-to-right from -28px over 450ms with a soft fade; exit reverses with delayed visibility removal. Reduced motion disables transitions. Previous fixed-anchor test adjusted for the explicitly requested 64px group movement while retaining constant width/font metrics checks. Local only; hosted cleaned demo unchanged.


### CTA demo update deployed — 11 November 2026
User authorized updating techouse-cleaned with committed CTA changes (source 801fd24). Deployed version 740c32f1-d8c8-4638-b187-1777571d62d1 at https://techouse-cleaned.johndavidceasar.workers.dev. Live Chrome verified five CTA links, Solar action reveal and navigation into the solar planner with no page errors. ASSETS-only deployment; original techouse and database untouched. No GitHub push requested/performed in this turn.


## Division icons assigned to refinement — 11 November 2026
Owner clarified banner/division icon changes belong on feature/homepage-refinement. Preserved supplied SVG library, homepage category icons, division directory/header icons and narrow-header fit fix here. Oversized icon experiment remains reverted. Partnership page/banner/inquiry work is saved separately on feature/partnership. No deployment.


### Large icon/headline layout reverted — 11 November 2026
Owner rejected the implemented Shared left edge icon/header arrangement after preview. Removed large heading icon, category repositioning and related typography overrides; restored prior small category icon, below-heading label and approved CTA slide animation. Preview files remain separate from website code. No deployment.

## About layering and division action polish — 11 November 2026
Owner requested white CTA defaults across all divisions. Homepage banner actions, photographic division header quote actions and hero actions now use white fill/dark text, fading to transparent with white outline/text on hover/focus; approved CTA slide reveal retained. Solar hero icon moved from above its headline into the savings action, replacing the peso glyph. Removed solar-guidance markup and handlers from planner. About cue's expanded capsule can cross above the Construction panel: scoped hover/focus removes Solar clip-path/paint containment and raises its stacking level. Desktop 1024px hit test verified the capsule's far edge remains interactive; checked white header/hero CTAs on all five division pages, removed Solar icon/guidance and planner desktop/mobile checks. Local only; not committed/deployed.

### Homepage layering correction — 11 November 2026
Review found Solar's elevated About-cue state could escape above the main headline because the division group had no independent stacking context. Set division-banners to a local isolated z-index-0 context; headline remains at layer 3 above the entire group. Panel-local About elevation still works over Construction without competing with headline/header. 1024px hit tests verified both headline-over-Solar and About-over-Construction. Both responsive homepage and intro lifecycle tests passed. Local only; no commit/deployment.

## Division margins, header and idle showcase — 11 November 2026
Doubled only division-content-page gutters (all /divisions/* routes), leaving homepage banner margins/style intact. Solar subnav uses matching gutter/right call position. Public nav labels News and Join Us! (partnership inquiry destination until separate partnership page is merged). More legible white nav text and consistent header across division pages. On narrow division headers the menu replaces links to avoid overflow.
Hero CTA surrounding-image samples compute a softened complementary RGB colour with contrast-selected black/white text, updated on image load/resize only. Latest request overrides Solar with a static metallic gold gradient and gentle hover shine; other division hero actions retain sampled colour. Solar sampling bypassed. Division header uses a dark neutral gradient scrim extending below the bar to fade smoothly into photography.
Desktop homepage idle showcase starts after 30s inactivity, cycles divisions every 3.8s while keeping the main question visible, and restores normal state on activity. Disabled for reduced motion, touch/narrow layouts, hidden tab, offscreen banner and open dialogs; listeners/timers cleaned on route teardown. Simulated-clock check verified start, advancement and stop. All five division pages checked at 1440/1024/390px with no overflow and correct doubled gutters. Gold default/hover and header gradient browser checks recorded separately. Local only; no commit/push/deployment.

### Idle brand lockup and calculator copy cleanup — 11 November 2026
Idle slideshow replaces the homepage question visually with the white Techouse horizontal logo/wordmark, in the question's original position, sized to 70% of measured heading height. Question remains laid out; activity removes idle state and restores normal copy. Removed the two selected result-panel paragraphs (sample pricing and economics note); existing assumptions disclosure below the calculator retained. Solar planner desktop/mobile browser test passed; idle logo geometry/activity restoration checked separately. Local only; no commit/deployment.

## Construction research/draft and normal idle presentation — 11 November 2026
Owner revised idle slideshow to match manual hover exactly. Removed idle brand markup/styles/sizing and persistent-headline override; existing normal has-expanded headline fade now applies. 30s timer/cycle/activity restoration unchanged.
Moved Solar savings-action icon before its text. Researched official MDC/DMCI/Megawide pages; added docs/CONSTRUCTION_CONTENT_PLAN.md with sources, recommended sections, required Techouse facts and directory recommendation. Construction now has concise hero without decorative eyebrow/standalone icon/footer slogan, project-type starting cards, discussion process, brief checklist, optional FAQs and construction inquiry context. Service packages and project portfolio are not invented; require client confirmation. Our divisions remains intact pending navigation decision. Local only; no commit/push/deployment.

### Refinement-only Join Us placeholder and shared CTA styling — 11 November 2026
Removed partnership-specific inquiry prefill/heading handling from refinement branch. Join Us is a non-navigating aria-disabled placeholder; actual partnership draft remains on feature/partnership. Removed adaptive hero-colour sampling now that owner chose consistent metallic gold across all five division hero CTAs. Shared division header Call us is white with outlined hover/focus treatment. Light-page Start a project restores original base filled style/interaction instead of the new outlined override. Removed directory illustration note and footer tagline, retaining company name/copyright. Verified live local light-page CTA and removed copy, plus gold hero CTA and white header Call on all five division pages. No commit/push/deployment.

## Gold hover, Solar call hierarchy and return-layer styling — 12 November 2026
Gold hero CTAs now explicitly retain their metallic gradient on hover/focus, moving only the light band. Solar's header Call us is transparent/secondary when the quote action is present; it may still become the prominent replacement when that quote is suppressed by an in-page action.
Investigated apparent older design during back-to-home animation: outgoing DOM was cloned live, not an old saved website version, but removal of IDs and destination body-class changes caused styles to be lost or overridden. Transition CSS is now derived automatically from current stylesheet rules and scoped to the inert outgoing layer. Original IDs are recorded as data-snapshot-id aliases, preserving selector priority without duplicate live IDs; route-body selectors resolve against the layer's captured classes instead of the new homepage. Selector lists are split at top level to avoid changing rule priority. Existing staggered banner return, blur/dim timings and layer cleanup remain. No manual parallel page design or persistent copy introduced.
Checks: desktop/mobile return regression verifies exact hero margin/font/gradient equality, gold retention on hover, no duplicate IDs, cleanup and no page errors. Both homepage responsive and intro lifecycle tests also passed (3 tests total). Full suite not rerun; no cross-browser performance guarantee. Local only; uncommitted, not pushed/deployed.

## Mobile refinement and annotation cleanup — 14 November 2026
Removed the selected About panel eyebrows, news eyebrow, saved-inquiry hero eyebrow and card-selection explanation. Removed contact QR hint/help markup and its obsolete switching handler; QR/app switching remains functional. Removed remaining prefab/development/elevator hero division labels, standalone icons and bottom slogans. Added soft rounded public-nav hover/focus highlights as explicitly requested; Join Us remains disabled placeholder.
Phone division gutters now 24px instead of doubled desktop gutters; desktop margins unchanged. Made photo-header menu visible with white icon/border, maintained 44px menu/link targets and bounded scrolling for open menus. Solar phone form precedes supporting photo; footer spacing/wrapping improved. Contact desktop grid reclaims removed text rows. Existing mobile direct-call behavior retained; no intro/hover choreography changes.
Validation: local Chrome routes About/news/inquiry/all five divisions at 360/390/768/1440px have no horizontal overflow or page errors. Phone menu opens and navigates; desktop Phone/Viber switching and contact close verified. Desktop contact visually reviewed. Existing solar planner regression passed desktop/mobile including selections, calculations and aligned margins. Edited files formatted; asset versions refreshed; diff whitespace check clean. Safari and physical-device testing not performed. Local only; no commit, push or deployment.

## Header fit, compact dropdown and intro hold — 14 November 2026
Shortened Solar header/mobile inquiry CTA to Request a quote, retaining its solar inquiry destination. Reduced nav gaps/padding and kept labels non-wrapping so desktop links remain a single line with rounded hover/focus highlights. Smaller-screen menus now use compact spacing, green/gold treatment, clear current-page highlight and 220ms downward fade entry; reduced motion disables it. Join Us stays disabled. Intro tagline reading hold reduced exactly 150ms from 2100 to 1950; other choreography unchanged.
Verified header child bounds do not overlap at 1440 and 1280px, responsive dropdown open/Escape at 1024/768/390, no horizontal overflow, phone menu screenshot visually reviewed. Asset versions refreshed and whitespace checks clean. Local only; no commit/push/deployment.

### Compact left dropdown — 14 November 2026
Owner requested smaller navigation panel positioned on the left. Division dropdown capped at 280px (clamped to viewport gutters), left-aligned labels, reduced padding with 44px touch targets; existing reveal retained. Intro tagline hold shortened another 200ms, now 1750ms. Local only; no commit or deployment.

### Dropdown alignment correction — 14 November 2026
Owner clarified the compact dropdown should be on the right. Anchored to right page gutter beneath the menu control; retained width, left-aligned labels and animation. Local only, no deployment.

### Glass dropdown surface — 14 November 2026
Added translucent green glass background with 24px backdrop blur/saturation, soft inner highlight and shadow; light pages use light glass. Includes WebKit prefix and near-opaque unsupported-browser fallback. Right anchoring, compact width, label contrast and existing reveal retained. Responsive menu checks passed. Local only; no commit/deployment.

### White dropdown surface — 14 November 2026
Owner replaced glass treatment with white to match About Techouse cue hover. Dropdown now opaque white/dark green labels, subtle green active/hover highlight, no backdrop blur; right placement, compact dimensions and reveal preserved. Local only, not deployed.

### Dropdown option motion — 14 November 2026
White dropdown opens with 260ms soft downward fade; options reveal over 220ms with 35ms stagger. Menu control has subtle press feedback/open highlight. Reduced-motion disables reveal and press transforms. Responsive menu checks passed; local only, no push/deploy.

## Solar navigation label — 14 November 2026
Combined Your property & needs and Cost calculation subnav links into Savings calculator pointing to the existing solar-start planner. Three-step flow unchanged. Local only, not committed/deployed.

## Delivery sequencing and compact tablet calculator — 14 November 2026
Read supplied Tier 2 PHP55k contract/quotation and existing Project Tracker; created DEVELOPMENT_CHECKLIST.md ordering client inputs, responsive approval, live inquiry foundation, OTP/maps, Calendar, partnership/CMS/content/Tip, integration tests and hosted acceptance/handover. Preserves actual contract layout-approval payment gate and week3 review/week5 content/+2-week completion schedule. Tip requires written coverage; builder excluded. Existing tracker not modified.
Added compact calculator styling only for 901–1200px wide viewports up to 820px tall: tighter progress/input/coverage spacing and smaller illustration/result copy, retaining controls, disclosures and calculation logic. Local only, not committed/deployed.

## Compact mobile/tablet redesign — 14 November 2026
Added site/mobile-refinement.css after existing refinement layer. Homepage at up to 1100px/touch uses compact horizontal division rows with question above and visible CTA/category; removed automatic intersection expansion on compact layouts. Added whitespace after heading breaks so hidden mobile br does not join words. About cue moves outside Solar to landing root and is fixed bottom-right on compact layouts; returns to Solar content on desktop resize. Desktop 1440 banner choreography and intro unchanged.
Reviewed public routes at 375x667, 768x1024, 812x375 and 1024x768: homepage, directory, About, news, inquiry, all five divisions and panel catalogue; no page errors/horizontal overflow. Reduced excessive mobile content spacing, improved phone form widths/footer, retained mobile-first form ordering. Landscape calculator at 640–1100px has two balanced columns; portrait remains stacked for readability. Fixed two null-node DOM insertions in calculation results that rendered literal null after earlier copy removal. Calculations unchanged.
Added mobile regression test for collapsed rows, heading spacing, floating cue, CTA navigation, landscape columns and null-free working results. Existing desktop hover test uses >1100px breakpoint to match requested compact tablet layout. Browser testing is Chrome emulation, not physical-device or Safari verification. Local only; no commit/push/deployment.

## Scroll-focused mobile banner experiment — 14 November 2026
Owner clarified one expanded story plus thin white strips. Compact homepage now starts Solar expanded (280–380px based on viewport); other rows are 72/76px with only headline and division icon. Only active row shows photo/category/CTA. Passive scroll listener chooses the story nearest viewport center, with motion-settle interval and scroll delta threshold to limit layout feedback; no wheel/touch interception. Tapping a closed strip expands without navigation; CTA enters division. Keyboard CTA focus expands its story. Floating About cue changed to white/dark icon. Desktop unchanged. Verified tap/scroll focus through elevators at phone/tablet sizes and retained calculator regression flow. Local experiment, not committed/deployed.

## Shared compact backdrop and top reset — 14 November 2026
Replaced white collapsed strips with transparent rows/dashed separators over one sticky viewport-height image scene. Scene crossfades to the active division image with light static blur/dark contrast overlay and stops at the homepage banner section; About company content remains a separate light block. Top scroll <=12px explicitly restores Solar before motion-settle guards. Floating About cue stays white. Desktop/fine-pointer native/custom page indicators hidden via CSS; wheel/touch/keyboard scrolling unchanged. Added regression assertions for active scene and top reset; tap/scroll progression verified locally. Local only, no commit/push/deploy.

## Crisp compact images, thinner strips and mobile footer — 14 November 2026
Removed scene blur; photos stay sharp with radial/vertical vignette for text contrast. Collapsed strips reduced to 56px, preserving adequate touch area. Height transition now 580ms and image crossfade 600ms; scroll selection records the latest offset during settling and advances at most one story in the scroll direction to avoid reflow-driven reversals. Reduced motion remains instantaneous. Explicit opaque isolated About/footer surfaces cover the scene beneath, keeping full-colour footer logo readable. Phone footer uses full-width brand/contact followed by Explore/Social columns with 44px link targets. Visually checked phone full-page screenshot, tap/scroll at phone/tablet and mobile regression (passed). Local only, no commit/push/deploy; physical Safari testing remains.
