## Stable Build 1 code review — 3 November 2026

The current local build is the final, code-reviewed Stable Build 1, approved on 3 November 2026. The review is documented in `../deliverables/Stable_Build_1_Code_Review_2026-11-03.md`. The pre-review source and private recovery backups are listed in `../releases/README.md`.

Use the platform on port 8787 for the protected back office and shared website content. The standalone static preview remains a separate browser-local demo. Inquiry sending and site visits are still demos. The dated sections below record the prototype’s evolution; later platform notes supersede earlier storage/security descriptions.

The equipment tabs use a connected horizontal track, adaptive grid height and synchronized 560 ms easing. `solar-journey.js` owns the shared `calculateEstimate` planning model used by the displayed estimator and inquiry handoff. Preserve the approved homepage intro and stylesheet order.

## Secure base build added 30 October 2026

The original static preview remains a presentation prototype. The new Cloudflare-compatible platform in `../platform/` provides server-verified password + authenticator MFA and a basic shared CMS. Run `node ../platform/local.mjs` with Node 24+ to use port 8787, and provision the owner through its private invitation workflow. In platform mode, public pages use server content and office links lead to `/admin`. The older static server on 8765 does not supply those protections. See [platform setup](../platform/README.md). Inquiry sending and visits remain explicitly labeled demos until connected separately.

# Techouse website — start here

This folder contains the editable **presentation prototype**. It uses plain HTML, CSS, and JavaScript. There is no build step, framework, WordPress installation, production database, protected staff login, or email-delivery service.

Start with [KNOWLEDGE_TRANSFER.md](KNOWLEDGE_TRANSFER.md) for the walkthrough, editing examples, demo checklist, and next-phase plan.

## Read the source in this order

1. `index.html` — which files load, their order, and the shared page containers.
2. `app.js` — shared division data, URL routes, page templates, and demo storage.
3. `banner.js` — homepage wording, banners, About section, and hover behavior.
4. `solar-journey.js` — solar content, questions, selections, and inquiry prefilling.
5. `divisions.js` — division templates and the illustrative calculator.
6. `experience.js` — intro playback, skip, guided steps, illustrations, and lesson transitions.
7. `solar-extras.js` — energy examples, page progress, disclosures, and portfolio prompt.

## Find the right file quickly

| You want to change… | Start here | Search for… |
|---|---|---|
| Opening statement, banner titles, hooks | `banner.js` | `const copy`, `function html` |
| Homepage About text | `banner.js` | `company-intro` |
| Shared division descriptions | `app.js` | `const divisions` |
| Solar hero | `divisions.js` | `Turn sunlight into` |
| Solar questions and learning copy | `solar-journey.js` | `function mount` |
| Learning-card heading overrides | `experience.js` | `const titles` |
| Calculator formula and result markup | `divisions.js` | `function calculate` |
| Calculator default assumptions | `divisions.js` | `name="price"`, `name="rate"` |
| Energy comparison copy and assumptions | `solar-extras.js` | `function updateEnergy` |
| Inquiry form | `app.js` | `function inquiryPage` |
| Inquiry estimate summary | `solar-journey.js` | `function prefill` |
| Post-inquiry popup | `solar-extras.js` | `function afterInquiry` |
| Product models, specifications, PDFs | `catalogue.js` | `const products` |
| Intro size, weight, timing, scroll lock | `experience.js` + `experience.css` | `landingEntrance`, `data-emphasis` |
| Banner hover | `banner.js` + `banner.css` | `desktopOpen`, `.division-banner` |
| General colours and fonts | `styles.css` | `:root`, `@import` |
| Final calculator appearance | `solar-extras.css` | `.estimate-inputs`, `.estimate-result` |
| Larger-text toggle | `readability.js` + `readability.css` | `mount`, `.larger-text` |

## Preview

Serve this folder with a local web server, then open its address in a browser. The current working preview uses port 8765. Reuse that preview while it is running. See the walkthrough for starting another preview safely.

## Editing conventions

- Two-space indentation and consistent quotes are set in `.prettierrc.json`.
- JavaScript HTML templates remain strings so formatting does not alter their whitespace or behavior.
- CSS files are now expanded, but the existing cascade and intentional later overrides are preserved.
- Comments mark responsibilities, dependencies, editable content, and prototype limits. They do not repeat obvious code.
- Keep division IDs, form field names, and section IDs stable unless you also update their consumers.
- The project intentionally has no package installation requirement. Optional formatting tools do not become runtime dependencies.

## Current limitations

News and demo inquiries use `localStorage`, which is separate for each browser and origin. Changing the domain, protocol, or preview port changes the storage origin. Solar selections and estimate context are kept in memory and reset on a full refresh. The intro runs once during the current page load and can replay after a refresh.

The back office is publicly accessible demo UI. `noindex` is a search-indexing request, not access control. Use fictional details in demonstrations. Production content editing, secure staff accounts, shared storage, approved business calculations, email delivery, and backups remain future work.

## Design reference and icons

[DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) records the Material Design 3 reference, the local Material Symbols renderer, and the square-corner rule for cards and actions. `icons.js` loads before the page modules; `design-system.css` loads last. Those two files extend the loading order documented above.

## Website content tools

Back office now includes **Website customizer** (opening copy, division banner copy/images, landing About, detailed About) and **Solar projects** (create/edit/remove, photo, sample label, published/draft status). The post editor also accepts custom cover uploads. JPEG, PNG and WebP images are decoded, resized to at most 1440px and compressed before browser-local storage. Saving reports storage failures; these changes are not shared across devices, browsers, or preview origins.

`customizer.js` owns the content schema, upload handling and portfolio rendering; `content-tools.css` styles these tools. `TechouseContent.apply(path)` runs before page enhancement modules so the intro uses edited copy. Thirteen credited online references seed the portfolio (4 residential, 6 commercial, 3 industrial), never represented as completed Techouse projects. Production needs authenticated editing, shared database/object storage and approval workflows.

### Portfolio galleries

`portfolio-data.js` contains the sourced examples. `portfolio.js` renders sector tabs, horizontal cards, three-per-page pagination, gallery arrows/dots, autoplay and pause. Only visible, unfocused, unhovered galleries advance; reduced motion starts playback paused. `customizer.js` supports sector selection and up to three project photos. Uploading appends to the editable gallery; individual photos can be removed or selected as the cover. The original three untouched concept records migrate to the new references while edited or custom records remain.

Each reference gallery includes the named project photo and a separately captioned related installation for comparison; it does not claim they are two views of one site. Photo/source notes are in `assets/project-references/SOURCES.md`. Provider-owned images are private prototype references; replace them with approved Techouse photos or secure reuse rights before public publication.

Scrolling and page-edge behavior use the browser defaults. No custom wheel spring, image stretching or footer displacement is applied.

### Customizer editing and resets

The customizer now shows current text in four focused panels, a live website preview and unsaved-change status. Save & preview opens the relevant website page. Individual fields, sections or all customizer settings can be restored to original source defaults. Resets are staged until Save; Discard changes reloads the last saved settings. Resetting the customizer only clears text/banner overrides and never deletes projects, blog posts or inquiries. Saving an unchanged default removes its override so future source improvements remain visible.

### Back-office preview, draft review and project library

`office-ui.js` enhances the customizer with an isolated iframe that renders the actual landing page. Draft text and image overrides are sent only to that child window with a source-checked postMessage handshake; the preview never persists them. Replay intro starts the real animation in the child, and Show final view skips it. The frame blocks navigation and scrolling; Full screen enlarges the same preview. Browser file previews are supported by using the real local index.html URL rather than fetching markup.

The editor tracks values against its saved baseline, highlights changed fields, counts changes by section and offers a before/after review. In-app navigation prompts to save, discard or keep editing; closing/reloading uses the browser’s unsaved-changes prompt. Other-tab storage updates no longer rebuild open content editors. Save acknowledges the new baseline only after storage succeeds.

The solar project library has All/Residential/Commercial/Industrial filters, title/location/capacity search and five records per page, alongside a compact editor. These management pages remain browser-local prototype tools.

### Unified division editor and project galleries

The Division banners panel now contains one workspace per division, including its photo, headline, subtitle and description; the obsolete separate images tab is removed by the office UI. The selected division is outlined in the child preview. Landing About uses the actual company entrance replay; Detailed About previews the complete page with grouped heading/body fields. Preview view context and selected division are passed in the existing source-checked child-window handshake.

Project photo selections append to an editable thumbnail list, capped at three images. Remove stages a deletion, Make cover reorders the list, and saving commits the current gallery. Existing galleries above the limit remain visible for deliberate cleanup rather than being silently truncated. Published projects require a photo; image-free work can stay a draft. The library includes All/Published/Drafts status views combined with the existing sector/search filters and five-row pagination. New and Edit modes have distinct badges, border accents and reduced-motion-aware transitions. The internal hidden project key uses projectId to avoid shadowing the HTML form id property.

### Simplified solar demo journey

The primary flow is property type → main priority → estimated cost → inquiry. Routine/time-of-use is no longer asked or inserted into the inquiry. The calculator follows discovery immediately; only the monthly bill and coverage target are shown initially, with rate, system type and pricing assumptions under optional adjustments. The calculated budget and inquiry action appear before optional system-size and energy-equivalent details. The priority selects an initial grid or battery illustration. Calculation and inquiry prefilling still use the same model.

Project examples follow the estimate. Energy education and equipment/datasheet references remain in closed optional disclosures at the bottom. `experience.js` derives the question count from fieldsets and uses the two-step property/priority sequence. The education carousel is retained within the optional guide. No satellite mapping, automatic rooftop detection or new server integration is implied by the quote-flow reference.
