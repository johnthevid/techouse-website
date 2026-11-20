# Changelog

Recorded milestones for the Techouse website. Dates use the project's Asia/Manila calendar. These entries describe completed work; they are not retroactively created Git tags or GitHub Releases.

## Unreleased — Solar Calculator

- Simplify the calculator to one typed value. Step 2 asks "When do you use the most electricity?" (Mostly during the day / Day and night / Mostly at night) in place of the goal question; step 3 asks for the monthly bill and "How much of your bill should solar take on?" (Just the essentials / Essentials and more / Most of my bill). The two sliders are gone; the electricity rate and panel type move into an optional "Fine-tune" disclosure. Homes always use residential pricing; businesses switch to C&I above 24 kWp. Coverage choices recalculate a showing result immediately.

- Fix the recommended setup ignoring evening usage: when 50% or more of use is after sunset, the calculator now recommends the setup with a battery sized to that night use (residential "Day + night", C&I storage). C&I daytime-only systems now shrink with the night share (workbook cell E33), and C&I storage hours rise above 3 when night use needs more.

- Merge the homepage refinement (simplified homepage and banners, brand opening, mobile revamp, three-step solar planner, Construction page) with the secure back office and Solar Calculator; retire the About page's unused second-panel CMS fields.

- Replace the sample solar budget estimator with a Solar Calculator ported from the Techouse sales workbook: panel-count sizing, automatic inverter/battery selection and Techouse price-list ranges (A0–A2 residential/SME, T4–T6 C&I).
- Compare residential setups (daytime, day + 50% night, day + night) or C&I setups (daytime, daytime + 3-hour storage) side by side; the selected setup and equipment carry into the inquiry.
- Make the calculator's electricity rate editable in the back office (Website customizer → Solar calculator), with an optional source note shown to visitors.
- Show the electricity rate beside the monthly bill to compact the estimator; trim result-panel notes.
- Add a day/night electricity-use slider that sizes batteries and updates setup prices.
- Redesign the phone estimator: stacked bill and rate, tighter spacing, swipeable setup comparison.
- Add model unit tests; not deployed.

## 1.0.1 — 4 November 2026

- Approved GitHub source release from `update/1.0.1`, then separately deployed to Cloudflare on 4 November 2026 as Worker `8676aa74-6c27-4155-a000-7de006d6d1ea`. Ten hosted browser check groups passed; no database/content changes.
- System/component review passed 19 checks; fixed restored-visit lookup, calendar keyboard focus and cross-tab form-loss edge cases. Inquiry styling extracted into `inquiry.css` without changing cascade order.
- Hide header/mobile/footer project-entry links on every inquiry division variant.
- Show annual potential savings (monthly estimate × 12), with assumptions retained.
- Compact paired visit calendar, coordinated shell resizing, side entrance, downward calendar exit and upward ticket entrance; reduced-motion supported.
- Hide visit actions while choosing and after saving; cancellation restores the action with a recommendation.
- Add ticket link to solar project examples; these remain credited reference projects.
- Add official Facebook/TikTok footer links; LinkedIn pending, Instagram omitted.
- Add tiny pre-blurred previews for 105 bundled content images (~24 KB script); keep original image URLs and lazy loading. Uploaded/external images are not covered by the bundled preview map.
- Compressed the saved-request banner and restored torn-edge/perforated ticket styling while retaining the green visual anchor.
- Added a blurred repeat-inquiry prompt before inquiry navigation: cancel, view saved requests or continue with estimate context preserved.
- Returning visits show confirmation and tickets; selecting a ticket expands its compact details inline alongside a sector slideshow (2/3 and 1/3 on desktop), with a separate new-inquiry action.
- Made saved inquiries immediately visible as selectable overview cards with location/date/status previews, one selected state, a connected compact detail panel and structured site-visit summary.
- Redesigned returning inquiry hierarchy with a branded primary request card, compact history, structured facts and horizontal project slides.
- Corrected inquiry/slideshow grid containment, responsive stacking, saved-reference styling and returning-visitor spacing.
- Sector-matched project slideshow now occupies the saved inquiry sidebar, with accessible controls and detail/portfolio links.
- Returning visitors see compact saved inquiry history and can explicitly start another inquiry for any division; saved visit status is restored.
- Corrected transparent image previews to white and clear the preview layer once the original loads.
- Scheduling and inquiry delivery remain browser-local demonstrations.

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
