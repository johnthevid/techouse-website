# Techouse site conventions

- Read README.md and DESIGN_SYSTEM.md before changing components.
- Material Design 3 is the main reference for future UI components and interaction states.
- Use the self-hosted Material Symbols Outlined system in icons.js for standard interface icons.
- Keep cards, action buttons, dialogs, selection tiles, and text fields square-cornered. Do not introduce rounded Material pills/cards by default.
- Preserve the approved banner hover and intro behavior unless the user requests a change.
- Keep decorative icons hidden from assistive technology; label icon-only controls.
- Respect reduced motion and maintain keyboard access.
- Prototype inquiries/news remain browser-local. Do not imply live email, protected staff administration, or completed projects until implemented/approved.
- Format edited files with the existing Prettier configuration; do not reorder stylesheet/script layers casually.

- The homepage intro text animation is user-approved. Do not change its typography interpolation, timing, easing, or choreography without an explicit user instruction to change the animation. Requested skip controls/progress may be edited independently.

- The current approved baseline is **Stable Build 1 — Final, Code Reviewed**, confirmed on 3 November 2026. Use `../STABLE_BUILD_1.md` and `../releases/stable-build-1.json` as the release authority. Earlier pre-review archives are backups only. Preserve the reviewed baseline when implementing future changes.
