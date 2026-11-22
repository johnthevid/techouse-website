# Current handoff

Updated: 22 November 2026.

## Latest: Be a partner page and partner banners (branch `claude/busy-hopper-jnb9qg`, 22 Nov 2026)

- Task: build the solar sales partner page from the agent agreement (Solar Sales Agency Agreement) and the user-approved Claude Design draft, in the site's current design system, with catchy promo banners and lighter mobile/desktop copy.
- New `site/partner.js` and `site/partner.css`. Route `#/partnership` reuses the division-page cover, sticky subnav and question list. Order (user's): cover "Refer solar. Earn 5%." → earnings slider (illustration only) → 7-step journey slideshow with n/7 progress and photos → plain-words term sheet with "Read the fine print" → You / Techouse expectations → questions → dark close with an oversized gold button. No eyebrow labels. Phones hide section ledes and role descriptions.
- Terms shown publicly (user confirmed): 5% per closed, signed and paid project; paid within 7 days of final payment; 6-month renewing term; 15 days' notice; chargebacks, confidentiality, responsibility, Philippine law/Makati venue in the fine print. The general manager's name and ID number are not on the site.
- Apply goes to the existing inquiry form via `#/inquiry?topic=partnership` (`TechousePartner.prepareInquiry` retitles it, selects Solar, hides capacity, rewrites the side panel). The form is still the browser-local demo: applications are not sent anywhere.
- Banners: Solar page after project examples (₱25,000 worked example, labelled), About after "How we work" (three-step route), Divisions strip above the directory, Updates strip after the posts. Homepage banners and intro untouched.
- Navigation: header "Join Us!" placeholder → "Be a partner" link; phone menu "Coming soon" → "Be a partner · Earn 5% referring solar clients"; footer Explore gains "Be a partner". On the partner page the header action reads "Become a partner".
- Landing header (`banner.js`): "Refer & Earn" button (handshake icon, gold outline, metallic gold on hover) between Call us and Request a quote, linking to `#/partnership`; it fades in with the existing header actions, so the intro is unchanged. Hidden under 600px, where the phone menu carries the link. Footer Let's talk gains "Refer & earn 5%". Checked at 1440, 1024, 820 and 390.
- Photos are existing site assets (Unsplash and third-party reference projects), marked "Illustrative photo" on the journey.
- `platform/tests/mobile-refinement.test.mjs`: phone menu label expectation updated. Tests 35/35 (Node 22 in the cloud container). Browser-checked at 1440 and 390: calculator, slideshow (buttons, dots, arrow keys, swipe), fine print, inquiry prefill, no console errors or horizontal overflow. Asset versions refreshed with `deployments/techouse-1.0/refresh-assets.mjs`.
- To confirm with Techouse: what the 5% is calculated on, lead attribution between partners, how soon applicants are called, and the company name (agreement says "Techouse Construction Corporation"; site says "Techouse Technology Construction Corp").
- Not merged to main; not deployed. Supersedes the generic draft on `feature/partnership`.

## Latest: manual security review and hardening (branch `bugfix/security`, 22 Nov 2026)

- Task: run the claude-security plugin on the whole repository and patch its findings. The plugin could not run in the cloud session (its Workflow and agent tools are unavailable), so a manual review was done instead. It is not the plugin's verified multi-agent scan.
- Reviewed: `platform/worker.mjs` (sign-in, invitations, TOTP/recovery, sessions, CSRF/origin, rate limits, content validation, headers/CSP), `deployments/techouse-1.0/` adapter and config, platform local/provisioning scripts, browser rendering of saved content (`app.js`, `portfolio.js`, `customizer.js`, `office-ui.js`, `admin.js`, `secure-office.js`), `site/.assetsignore`, and tracked files plus Git history for committed secrets. No XSS, injection, auth bypass or committed secret found.
- Fixed in `platform/worker.mjs`:
  1. Second-factor guessing: the five-attempt cap was per sign-in session, so someone with the password could start new sessions for more TOTP guesses (about 40 per 15 minutes). Added a per-account cap of 20 verify attempts per hour (`mfa-user:` rate key).
  2. Project `createdAt` was stored unvalidated (any JSON type or size). It now accepts only a date string of 40 characters or fewer; anything else becomes the current time.
- Tests: new `platform/tests/security-hardening.test.mjs` (both fail on the old code). Full suite 34/34 pass, browser tests included.
- Not changed (noted only): HSTS has no `includeSubDomains`/`preload`, which is acceptable on a workers.dev host but worth adding on a custom domain; the per-email login cap can lock a known admin out for 15 minutes.
- Merged into `main` at the user's request on 22 Nov 2026 (clean merge; 35/35 tests on the merged main, Node 22 in the cloud container).
- Deployment: not deployed. The Worker change needs the user's release instruction; no database changes.

## Latest: real-town GPS, menu motion, compact phone projects (branch `feature/solar-gps-projects`, 22 Nov 2026)

- GPS: the live demo already worked but could only pick from 56 suggestion cities (Nasugbu became Tagaytay, Iligan became Cagayan de Oro). `site/assets/data/ph-places.json` (113 KB, 41 KB gzipped, fetched only on tap) holds 1,521 municipalities with provinces and 4,372 places; `experience.js` picks the nearest place within 25 km and fills "Town · Province". The 56-city list remains the fallback. Built by `platform/tools/ph-places/` from GeoNames via the all-the-cities package; credit in `site/assets/data/SOURCES.md` and in the fill message ("Place names from GeoNames"). Checked: Nasugbu, Iligan, Quezon City, Makati, Lipa, Baguio, Cebu, Davao, Tagbilaran, Puerto Princesa, Calamba; Singapore is refused.
- Phone section menu: items enter 8px / 220 ms, 40 ms apart after the panel drops, leave together in 120 ms; the menu icon turns as it swaps. Reduced motion: no movement.
- Projects (`solar-calculator.css`, `portfolio.js`): phone rows 112 px photo + text (section 1,977 → 875 px); savings tint without the gold left bar on all sizes; pagination hidden for a single page. Optional guides (`solar-journey.js`): icon, title, contents line and a chevron, joined into one list.
- Checks: 32/32 (one run had a timing flake in update-101's slide counter; passed alone and on rerun).
- Not merged to main; not deployed.

## Latest: solar planner steps (branch `feature/solar-planner-steps`, 21 Nov 2026)

- Mockup approved for phone; desktop step 1 kept as before with icons added (user's direction).
- Step 1 (`site/experience.js`, `site/solar-journey.js`): Material icons home / storefront / factory on the property tiles (added to `icons.js` and `assets/icons/material-symbols.svg` with my_location, light_mode, routine, dark_mode, power, electric_bolt; official 24px weight-400 paths). Phone hides the property photo. "Use my location" uses the browser's position and picks the nearest of the 56 listed cities (approximate coordinates in `experience.js`, 50 km limit); nothing is stored or sent. Hidden when geolocation or a secure context is unavailable.
- `platform/worker.mjs` Permissions-Policy: `geolocation=(self)` (was `geolocation=()`, which blocked the button). Camera and microphone remain off.
- Step 2 (`site/divisions.js`): bill, then "When do you use the most electricity?", then "How much of your bill should solar take on?" one at a time; answered questions fold into summaries with Change. No pre-selection; homes see "Suggested for homes" on Day and night, businesses "Suggested for businesses" on Mostly daytime, coverage "Suggested" on Essentials and more. The estimate calculates when both are answered (Calculate button removed) and recalculates on answer changes, and 450 ms after bill or rate typing. Invalid bill or rate shows a note in the result panel. Keyboard: arrows browse, Enter or Space confirms.
- Taste skill: installed from github.com/Leonxlnx/taste-skill as the user skill `design-taste-frontend` (not in the repo); its form and motion rules were applied. Its site gate targets whole marketing pages and was not run here.
- Checks: 32/32 tests; impeccable detector flags only pre-existing homepage items (loading dot, intro clip-path, gold glow, stripes).
- Result card (`site/divisions.js`, `solar-calculator.css`): setup and price, then the Let's talk button; savings, payback, system size, metrics, energy examples and the pricing note sit in `details.estimate-more`. Setup cards: `div.solar-scenario` holding the radio label (name, price, "Saves about ₱… a month") and `details.solar-scenario-more` (summary, payback, parts). Opening a card's details does not select it.
- Phone section menu (`site/solar-extras.js`, `solar-calculator.css`, under 700px): `.solar-subnav-toggle` names the section in view (the last one whose top reaches 40% of the screen), opens `#solar-subnav-links` as a dropdown, closes on a link, Escape or an outside tap, and marks the current link with `aria-current`. Comparison spacing on phones restored to 32px above. Construction's section bar is unchanged.
- Not merged to main; not deployed. The demo branch needs main merged in after approval.

## Latest: division and About content from the company presentation (`feature/division-projects`, merged into main 22 Nov 2026; not deployed)

Written in the company's voice from the recorded Taglish company introduction (no quotes, no named speaker; the user's choice). Excluded: pricing, the royalty project, bank minimums, sales Q&A and the Solar Group joint venture (awaiting confirmation).

- Prefabrication (new page in `divisions.js`): how modules are made, standard module specs (7.2 × 3.6 × 3 m, ~23 m², 15 cm walls, 12 cm roof, 3,000–5,000 PSI, up to 3 storeys), uses, delivery FAQ, brief.
- Elevator engineering (new page): three brands (Hitachi China-made; EPSS by Yida Express Elevator Co., Ltd., Huzhou, per the user; Shanghai Mitsubishi), lift types, installation/maintenance/modernisation, FAQ, brief.
- Construction: new "Two ways we build" section (precast modules vs cast-in-place up to ~10 storeys) and subnav link.
- Solar (`solar-journey.js`): BC vs TOPCon and equipment ranges inside the technical reference panel. Calculator unchanged.
- About (`app.js`): "Our story" timeline and "How we work" values after the CMS-editable introduction.
- New `site/division-content.css`. Real estate stays generic.
- Facts to confirm with the client before release are listed in the conversation summary; tests 33 of 33.
- Prefabrication 3D module (`site/module-3d.js`, styles in `division-content.css`): shaped after the client's factory footage (closed grey concrete box, 2.4 m doorway at one end under a 0.6 m roof canopy, a front window, two recessed panels on the back; client videos are not in the repo), drawn on a canvas with its own projection (no library, no CSS 3D, so Safari matches Chrome). Blocks are painted far to near using separating planes, ordered only where their screen outlines overlap, so there is no clipping, stacked or single. Dragging turns the whole model; on release it coasts with the flick and eases back into the slow sway (no snap). Dimension labels are upright HTML placed at projected points on the edges facing the viewer, glide across when the facing edge changes, and stay inside the frame. "Stack to 3 storeys" drops two more modules in. Pauses off-screen and in hidden tabs; static under reduced motion. Checked at 1280 px and 390 px, including drag and stacking.

## Earlier: project showcase on every division (branch `feature/division-projects`)

From `main`; not merged, not deployed. No database migration: projects stay in the content record, which already accepted a `division` field.

- `site/portfolio.js`: one showcase for all divisions, configured per division (categories, key-fact label, heading). Solar is unchanged (sectors, savings estimate, investment and roof details). Construction (residential/commercial/industrial), Prefabrication (housing, schools & dormitories, commercial), Real estate (residential, commercial, mixed-use) and Elevators (new installation, maintenance, modernisation) show their own facts; a division without published projects shows a "Project stories are on the way" note with an inquiry link.
- Routes: `#/divisions/<division>/projects/<id>` opens the project dialog over its division page; "Back to project examples" returns to that division's section. Every non-solar division page now has the `#projects` section.
- Back office (Projects): a Division field switches categories and the key-fact label; solar-only fields (system, payback, maintenance, roof) hide for other divisions; the library filters by division. Records without a division are Solar.
- `platform/worker.mjs` validates the division and its categories (`projectDivisions`, kept in step with `portfolio.js`). New test `platform/tests/division-projects.test.mjs`.
- Tests: 33 of 33 pass. Browser-checked: all five division pages, project dialogs, direct project links, and creating/editing/filtering an Elevators project in the back office.
- Next: real project photos and details from the client (Dasmariñas prefab homes, Malabon, elevator jobs); confirm the Binangonan project may be claimed publicly.

## Latest: phone and tablet homepage merged into main (20 Nov 2026)

`feature/mobile-view` merged into `main` at the user's instruction. Not deployed; publishing still needs a separate release instruction.

- Phones (under 600px): chapter over a 2 × 2 pill grid with a menu (`site/mobile-home.*`). Touch tablets (600px+ wide and tall, no hover): five panels opened by tapping (`site/tablet-home.*`). Desktop and trackpad tablets keep the hover banners. Details in the two feature-branch sections below.
- Conflicts resolved: `site/index.html` kept main's Solar Calculator assets and added the two new modules, then asset versions were regenerated; `platform/tests/mobile-refinement.test.mjs` kept the phone/tablet branches and main's two-step planner (`data-step="1"`).
- Tests on the merge: 32 of 32 pass.

## Latest: repository cleanup (20 Nov 2026)

- `main`: asset-version fix and test (3d236cf), then this cleanup. `develop` fast-forwarded to `main` so feature → develop → main works again.
- Deleted branches whose commits are all in `main`: `claude/loving-goodall-89njs2`, `integrate/homepage-refinement`, `feature/solar-calcu`, `feature/homepage-refinement` (its demo Worker files live on `demo/cleaned-solar`).
- Untouched, awaiting the user's decision: `feature/mobile-view` (1 commit not in main, created 20 Nov), `feature/partnership` (1), `feature/page-builder` (3), `feature/staff-chatbot` (5), `feature/tip-assistant` (1). `demo/1.0.1` kept as the preserved snapshot.
- Demo: `demo/cleaned-solar` is the only branch to deploy `techouse-cleaned` from (WORKFLOW.md, Presentation demo). Redeployed 20 Nov 2026, 01:33 UTC; the live index.html asset versions match `demo/cleaned-solar` exactly. Live check: two-step planner, no page errors or failed requests at 1440 and 390 px.
- `feature/partnership`: `main` merged in (footer keeps the Be a partner link; partnership and Construction inquiry prefills both kept); 33/33 tests.
- Branch deletions and archive tags are refused from the cloud session; the user deletes `feature/staff-chatbot`, `feature/tip-assistant` and the four merged branches on GitHub. `feature/page-builder` kept on hold; `feature/mobile-view` in progress.
- Code tidy: removed 288 lines of CSS for the removed planner step and sliders (`experience.css`, `hover-performance.css`, `mobile-refinement.css`, `solar-extras.css`, `content-tools.css`); screenshots before and after are pixel-identical at 1440 and 390 px. Asset versions refreshed.
- Prettier not run: the repository has no Prettier configuration, and Prettier's defaults would rewrite quoting across the codebase.
- Checks: 32/32.

## Latest: stale asset versions fixed (branch `integrate/homepage-refinement`)

- Report: the `techouse-cleaned` demo (redeployed 20 Nov 2026, 01:11 UTC) showed a three-step planner with a broken layout.
- Cause found in source: `site/index.html` carried out-of-date `?v=` tags for eight files (experience.js, solar-journey.js, divisions.js, solar-extras.js/.css, customizer.js, office-ui.js) and none for solar-calculator.js/.css. Versioned files are cached for a year (`asset-cache.mjs`), so a browser that had loaded the earlier demo kept the old three-step `experience.js` while picking up the new unversioned `solar-calculator.css`.
- Fix: ran `deployments/techouse-1.0/refresh-assets.mjs` and committed the tags. New `platform/tests/asset-versions.test.mjs` fails whenever a tag does not match its file.
- Not verified on the live demo: this container cannot reach workers.dev, and the Cloudflare connector lists Workers but not their static files. Which source the 20 Nov deploy used is unknown. The `techouse-cleaned` config (`wrangler.cleaned.jsonc`, `cleaned-demo.mjs`) exists only on `feature/homepage-refinement`.
- Checks: 32/32. Not deployed; not yet on main.

## Latest: two-step solar planner and result card redesign (branch `integrate/homepage-refinement`)

- Planner (`site/experience.js`): two steps, "Your property" (type + optional location) and "Your estimate". The daily-use question is a tile group (`name="nightShare"`, 25/50/75) in the estimate form (`site/divisions.js`), above coverage. Homes default to Day and night, businesses to Mostly daytime, until chosen (`site/solar-journey.js`). Usage and coverage tiles recalculate a showing result immediately.
- Result card: "Indicative budget", setup name, a one-line reason ("Matches how you use electricity." + setup summary for the recommended setup), price, then a three-figure row (monthly savings, payback, system size; two columns on phones). Comparison legend and badge in sentence case; `.solar-start fieldset` had removed the comparison's padding, now restored. Phone swipe row opens on the recommended card.
- Design pass used the project's `unslop` skill in polish mode (existing brand kept). No "impeccable" skill exists in this project.
- Dead CSS for the removed step 2 (`.priority-step`, `.priority-stage` in `experience.css`) remains.
- Checks: `node --test tests/*.test.mjs` 31/31. Prettier not run.
- Deployment: not deployed; main not updated.

## Latest: simplified Solar Calculator inputs (branch `integrate/homepage-refinement`)

- Task: user found the calculator asked for too many values; wanted words instead of sliders so visitors only type their bill.
- Step 2 (`site/solar-journey.js`, `site/experience.js`): "When do you use the most electricity?" replaces the goal question. Mapping: Mostly during the day 25% night, Day and night 50%, Mostly at night 75%. Homes default to Day and night, businesses to Mostly during the day, until the visitor picks one. Photos: lower-bills, backup, stored-energy.
- Step 3 (`site/divisions.js`): bill, then three coverage tiles (Just the essentials 50%, Essentials and more 80% default, Most of my bill 95%), then a "Fine-tune (optional)" disclosure with the back-office rate and panel type. Hidden inputs carry `nightShare` and `sector`.
- Recommendation: night ≥70% → Day + night; ≥40% → Day + 50% of night; else Daytime. C&I: ≥40% → storage.
- Pricing model (`site/solar-calculator.js`): Residential always uses A0–A2 residential packages; Commercial/Industrial use the workbook's Residential/SME model up to 24 kWp, then C&I.
- Old slider CSS removed from `solar-calculator.css` and `solar-extras.css`; a few dead `.solar-offset-control` rules remain in `hover-performance.css` and `mobile-refinement.css`.
- Checks: `node --test tests/*.test.mjs` 31/31. Prettier not run.
- Deployment: not deployed; main not updated.

## Latest: Solar Calculator night-usage fix (branch `integrate/homepage-refinement`)

- Task: user testing found that choosing mostly evening usage still recommended a setup with no battery.
- Cause: the recommended setup followed only the planner goal ("Lower my electricity bill" → daytime-only) and ignored the day/night slider. C&I also ignored the slider.
- Fix: `recommendedScenario(segment, nightShare)` in `site/solar-journey.js` recommends Day + night (residential) or storage (C&I) when night use is 50% or more; badge reads "Recommended". In `site/solar-calculator.js`, C&I daytime PV = full PV × (1 − night) per workbook E33, and C&I storage hours = max(3, night × 4.5 PSH).
- Known workbook difference kept on purpose: the workbook's "Day + 50% Night" battery (K21) multiplies the already-reduced PV size, so it undersizes; the site uses full PV × night × PSH × 50%.
- Checks: `node --test tests/*.test.mjs` 30/30 (browser tests via the local Playwright shim).
- Deployment: not deployed; main not updated.

## Latest: homepage refinement merged into main with the Solar Calculator

**Task:** Combine `main` (secure back office, Solar Calculator) with `feature/homepage-refinement`. Take the refinement's visual and layout work (simplified homepage and banners, brand opening, mobile revamp, three-step solar planner, Construction page) while keeping main's authenticated back end, and align the back office with the simplified pages.

**Merge decisions:**
- Kept main's authenticated back end. The refinement branch made no authentication changes. Its `worker.mjs` field changes are included, merged with the calculator's `settings` validation.
- Left out the refinement's isolated "cleaned demo" deployment files (`CLEANED-DEMO.md`, `cleaned-demo.mjs`, `wrangler.cleaned.jsonc`). That demo is a separate static Worker with no back end, and its own note said not to merge it into main. They remain on `feature/homepage-refinement`.
- Kept the refinement's project agent skills (`.claude/skills/unslop`, `.claude/skills/stageshow`) and the `.gitignore` rule that shares only `.claude/skills/`.
- Conflicts: `index.html` uses the refinement's asset list plus `solar-calculator.js`. `divisions.js` uses the calculator template and rendering plus the refinement's Construction page and eyebrow removal. `solar-journey.js` drops both the old system-type switch and the goal-guidance line. HANDOFF keeps both histories. The tests keep both sides' waits.
- Calculator field labels no longer carry "01 / 02 / 03" prefixes, which duplicated the planner's own three steps.

**Back office aligned with the simplified pages:** The refinement already retired the banner subtitle/description and homepage invitation fields and added "About story" and "About closing line". Every remaining customizer field was checked against the merged homepage and About page. The three "Second panel" About fields (`.scope-panel`) edited nothing, because that panel was replaced by the People/Office tabs. They were removed from the customizer and office headings and added to the server's retired list, so older drafts containing them save cleanly.

**Checks:** 29/29 tests pass. Three refinement-era tests clicked a `data-scroll="estimator"` control that the refinement's own Solar nav no longer creates; they also failed on the untouched refinement branch. They now use the planner's step button (`.discovery-progress [data-step="2"]`). Desktop and phone screenshots of the homepage and the calculator inside the planner were reviewed, with no page errors or horizontal overflow.

**Deployment:** Not deployed. The live `techouse` Worker remains on 1.0.1.


## Latest: Solar Calculator (branch `feature/solar-calcu`)

**Task:** Replace the sample solar estimator with a Solar Calculator based on the Techouse sales workbook (Calculator, Packages and Pricelist sheets) supplied by the user.

**Completed:**
- Added `site/solar-calculator.js`, a DOM-free model ported from the workbook. Sizing: bill ÷ rate ÷ 30 ÷ 4.5 PSH, ÷ (1 − 20% loss) × target offset. Panels are rounded up to 620 W TOPCon or 660 W BC. Inverters are picked automatically (DC/AC ≤ 1.25) and batteries in 16.07/10.49/5.12 kWh sizes. Accessories and installation are priced per panel.
- Residential/SME (≤ 24 kWp) compares Daytime solar, Day + 50% of night and Day + night. The price range runs from tier A0 (low) to A2 (high, list price). Larger systems use C&I 380 V grid-tied inverters, tiers T4–T6, and compare Daytime solar with Daytime + 3-hour storage. Only the A2/A0/T6/T4 tiers are in source; A1/T5/T3 and the workbook's contact/agent sheets were deliberately not copied.
- The model reproduces the workbook outputs, e.g. ₱196,979–₱234,292 for Day + 50% night at ₱6,000/₱16, and ₱4,449,115–₱4,965,868 for C&I day-only at ₱250,000/₱12.
- Estimator UI (`divisions.js`, `solar-journey.js`, new `solar-calculator.css`): the inputs are bill, coverage target, and optional rate (default ₱16, as in the workbook), panel technology and share used after sunset. Results show the highlighted setup (from the visitor's goal) plus a full-width selectable comparison with equipment lists, savings and payback. The inquiry handoff carries the chosen setup, equipment list and budget. The sample ₱/kWp, battery allowance and maintenance inputs were removed.
- Assumptions copy updated in `divisions.js` and `solar-extras.js`.

**Follow-up (same day), back-office rate and compact layout:**
- Website customizer → **Solar calculator** section: staff set the electricity rate (₱/kWh, 1–100) and an optional source note, e.g. "Meralco, November 2026". Stored as `settings.electricityRate` / `settings.electricityRateNote` in the shared content document. `worker.mjs` validates it and the public calculator uses it as the default rate. Visitors can still edit the rate. No schema migration is needed (content is one JSON row). No official Meralco API exists, so the rate is updated manually each month.
- Estimator layout: the electricity rate now sits beside the monthly bill in one card, with a subgrid keeping both inputs aligned when labels wrap on phones. "Adjust estimate details" keeps panel technology and share used after sunset. The system type, installed base price, battery allowance and maintenance allowance stay removed. Shortened the results-panel notes, and moved the payback exclusions into "See assumptions".
- Tests: added settings validation and a back-office browser check (save the rate, confirm it in the database and on the public page). 23/23 tests pass.

**Follow-up 2, day/night slider and phone layout:**
- New visible slider "03 / When do you use most of your electricity?" (0–90% after sunset, default 60%) replaces the hidden number field. It shows the daytime/after-sunset split and drives battery size and setup prices; for example, Day + night at ₱6,000 goes from ₱263k–₱313k (60%) to ₱217k–₱259k (20%). C&I setups still use the 3-hour storage rule.
- Phone (≤600 px): the bill and rate stack, with the rate as a compact row; padding is tighter; the result labels sit above their values; setup cards become a swipe row with the next card peeking. Desktop: the results panel no longer stretches with a large gap, and card figures are label/value rows on every screen size.
- `solar-catalogue-navigation.test.mjs` now targets the coverage slider by name, since two sliders share its style class. 23/23 tests pass.

**Follow-up 3, compact estimator:** The two sliders share one card. Each is one line with the question and value, followed by a thin track and end labels. The coverage message is a single line with a small sun. The day/night readout is a compact "40% day / 60% night" value. The results panel sizes to its content, with the price capped at 46 px and tighter rows; setup cards are tighter. Section height went from 1,674 to 1,258 px on desktop (1440 wide) and from 2,648 to 2,143 px on phone (390 wide). The coverage note "A target, not guaranteed bill savings" moved from the card into "See assumptions". 23/23 tests pass.

**Checks:** All 22 tests passed (`npm test`), including the new `platform/tests/solar-calculator.test.mjs`. Browser tests ran against the container's Chromium via a temporary uncommitted Playwright shim, because Google Chrome (`channel: "chrome"`) was unavailable. Updated the expected estimator values in `round3-browser.test.mjs` and `update-101-browser.test.mjs`. The latter now waits for the estimate entrance animation before recording the scroll position, because clicking a moving target made Playwright re-scroll. Desktop (1440) and mobile (390) screenshots were reviewed. Prettier could not be run in that session.

**Remaining:** Enter the current Meralco rate in the back office after deployment (the code default stays ₱16). Confirm and that publishing A2/A0 and T6/T4 prices on the public site is approved. Run Prettier and the browser tests with local Chrome. `portfolio.js` project savings still use the older 4 h / 80% model. Script/style cache versions for the new files are added by `refresh-assets.mjs` at deployment.

**Deployment:** Not deployed. A Git push does not authorize a release.


## Latest: 1.0.1 deployed to Cloudflare

The user authorized and completed the manual release to the existing `techouse` Worker. Live version: `8676aa74-6c27-4155-a000-7de006d6d1ea`; deployed source: `1d2e16eec87e40ac883e9aafcdd00a7577cb15b1` (`v1.0.1`). Rollback reference: `9be19ffd-8de2-4e61-b43c-ca5e9f7ac46f`.

Ten live browser check groups passed with no uncaught errors or remote writes; HTTP access/cache checks passed. Public bootstrap is byte-identical before/after (13 projects, 0 published posts). Database, existing accounts/secrets and domain setup were unchanged. Deployment records in `deployments/techouse-1.0/` are updated. Source release is already on GitHub; the follow-up deployment-record commit must be pushed through the signed-in GitHub Desktop because terminal authentication is still unavailable. No redeployment is needed for documentation-only commits.

Local review remains 19 passing checks, with approved intro/hover/slider sources unchanged. Inquiry delivery/calendar scheduling remain browser-local demos.

## Latest: touch-tablet homepage (feature/mobile-view)

Added on `feature/mobile-view`; not merged to `main`, not deployed.

- New `site/tablet-home.js` and `site/tablet-home.css`, mounted from `banner.js` like the phone module (they share `TechouseMobileHome.read`).
- Applies at 600px wide and 600px tall or more on devices without hover (touch tablets: iPad mini, iPad, iPad Pro, Galaxy Tab, open Galaxy Z Fold). Desktop, laptops and tablets with a mouse or trackpad keep the hover banners; landscape phones keep the old accordion.
- Five panels from the desktop, opened by tapping: a tap opens a panel without navigating, its button goes to the division, the round X (or Escape) closes it, tapping another panel switches. Landscape uses the desktop columns (others greyscale; titles sized to fit); portrait uses stacked bands below the question, with the first band's own photo running up behind the header, blurred and vignetted. The page scrolls normally to About and the footer.
- Phone breakpoint moved from 767px to 599px so the iPad mini and open Fold get the tablet panels.
- Fixed an existing `banner.js` crash: Escape on touch layouts referenced an undefined `point`.
- Tests: mobile-refinement now covers the tablet tap flow at 768 x 1024 and 1024 x 768. 22 of 25 pass; the same 3 older solar-page failures remain (removed `[data-scroll="estimator"]` link).

## Earlier: phone homepage (feature/mobile-view)

Branch `feature/mobile-view` (from `feature/homepage-refinement`) carries the approved phone homepage, from the client proposal's Option 3 "Pill grid". Not merged to `main`; not deployed.

- New `site/mobile-home.js` and `site/mobile-home.css`, loaded from `index.html`; `banner.js` mounts/destroys the module with the landing. Applies under 600px (was 768px until the tablet layout landed); desktop banners are unchanged.
- Layout: one full-screen division photo, the chosen division as a chapter (counter, headline, label, gold call-to-action), the other four as a balanced 2 × 2 pill grid. Pills are placed absolutely by script, so taps never reflow into extra rows; a returning division takes the tapped pill's slot.
- Tuned values from the mock-up dials: blur 10%, vignette 80%, shade 115%, photo brightness 135%.
- Header gains a menu button after the call icon: Our divisions, About Techouse, News, Join us & be a partner (coming soon), Start a project, email, phone. Page scroll is locked while it is open; Escape closes it.
- Content is read from the rendered banners, so CMS banner text and images carry over. The approved intro is untouched; the chapter and pills follow its reveal phases.
- Tests: homepage-refinement and mobile-refinement updated for the phone hero and passing. 22 of 25 pass; the 3 failures (round3-browser F3, solar-catalogue-navigation, update-101-browser) also fail without this change: they click the solar page's removed `[data-scroll="estimator"]` link.
- Mock-ups (proposal and concept pages, stageshow scenes) are not in the repository yet.
- Next: tablet and unusual-screen mock-ups (iPad mini, iPad, Android and tall tablets, Galaxy Fold, Surface Duo).

## Earlier: project agent skills (feature/homepage-refinement)

Added third-party design skills under `.claude/skills/` so every Claude Code session on this repository loads them: `unslop` (heydamir/unslop, CC BY 4.0, keep the author credit) and `stageshow` (benjitaylor/skills, MIT). Scripts were reviewed before install; no install hooks. `.gitignore` now admits only `.claude/skills/`; other `.claude/` files (local settings, state) stay untracked. No website behavior changed; no deployment. Next: homepage refinement on this branch, starting with an unslop audit. Homepage intro animation remains off-limits without explicit instruction.

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
