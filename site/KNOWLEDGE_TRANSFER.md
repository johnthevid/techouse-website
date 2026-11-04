# Techouse website knowledge transfer

Audience: the project manager and developers taking over the prototype. This explains the code that exists now; it does not claim that the proposed production system has been delivered.

## 1. Understand the three tools

**HTML** describes the structure of a page: headings, paragraphs, links, images, and forms.

**CSS** describes its appearance: fonts, colours, spacing, responsive layouts, and some animation.

**JavaScript** supplies behavior: choosing a page, building its markup, expanding banners, calculating an estimate, and carrying selections into the inquiry.

The browser reads `index.html` first. That file loads the styling and scripts. Most visible content is built by JavaScript and inserted into the page; this is why searching only `index.html` will not find the headings you see on screen.

A framework is not needed to edit or run this prototype. It also does not use WordPress yet.

## 2. What happens when the site opens

1. `index.html` supplies empty header, main, footer, notification, and dialog containers.
2. Deferred scripts load in their written order and expose modules such as `window.TechouseBanner`.
3. `app.js`, loaded last, calls `render()`.
4. The router reads the part of the address after `#`, chooses a page template, and writes its HTML into the main container.
5. The renderer mounts banner/division behavior, inquiry prefilling, the larger-text control, presentation enhancements, and solar extras.
6. On another route, the old page markup is replaced and page interactions mount again.

Keep this ordering intact. For example, the solar sections must exist before the guided steps can attach to their fields.

Module lifecycle rules matter: if you add a document/window listener, timer, observer, or scroll lock, arrange cleanup when leaving its route. Prefer attaching a page-specific listener to the page's own element. Never leave the document locked after navigation or Skip.

## 3. Your editing workstation

You need:

- The **whole `site` folder**, including `assets`.
- A code editor. An editor such as VS Code can open this folder and search all files together.
- A browser for previewing and inspecting the page.
- A local web server. Python's built-in server is sufficient for this prototype.

If the current preview is already running, keep using it. To start a separate one, open a terminal and run these as two lines:

```sh
cd "/Users/johndavidperez/Documents/ChatGPT/CNC solar/Techouse Website/site"
python3 -m http.server 8766 --bind 127.0.0.1
```

Then open `http://127.0.0.1:8766/`. Port 8766 is used here to avoid colliding with the existing preview on 8765. This address only works on this computer. Press Control+C in that terminal to stop that server.

If `python3` is unavailable, use your editor's local preview server. No Node.js installation is necessary merely to run the website.

Opening the folder does not publish anything. The local address is not a public client link.

## 4. Make your first text change

Start with a banner hook, a low-risk edit you can practise before the client meeting.

1. Open `banner.js`.
2. Find `const copy`.
3. Find the solar object's `hook`.
4. Replace only the sentence inside the quotes.
5. Save, refresh the preview, and skip the intro if you are checking the final layout.

For example:

```js
hook: 'Let your roof do more.',
```

could become:

```js
hook: 'Start with sunlight. Explore your savings.',
```

Use double quotes if your sentence contains a straight apostrophe:

```js
hook: "Let's explore solar for your property.",
```

Leave the comma and the property name intact. A missing quote, comma, bracket, or backtick can prevent the script from running.

### Banner heading and label

In the same object:

```js
label: 'SOLAR ENERGY',
title: 'Power your<br>tomorrow.',
```

`label` tells visitors which division they are viewing. `title` is the creative heading. `<br>` is an intentional line break. Keep headlines short and inspect all five together on desktop and mobile after changing them.

### The opening company statement

Search `banner.js` for `Techouse brings the newest technology`. It appears inside the homepage template. Change the sentence there; intro timing and size are controlled separately in `experience.js` and `experience.css`.

### Solar text

- The solar hero title and basic page markup are in `divisions.js`.
- Questions, explanatory copy, and much of the section ordering are in `solar-journey.js`.
- The lesson-card titles are also assigned in `experience.js` through `const titles`.
- Energy examples, the technical invitation, and the post-inquiry popup are in `solar-extras.js`.

If a change seems to be overwritten, search the same phrase or selector across the folder. An enhancement module may replace the base template after it renders.

## 5. How templates work

You will see code such as:

```js
return `<h2>${heading}</h2>`;
```

The backticks create a template string. `${heading}` inserts a JavaScript value into that string. The resulting string becomes HTML when the renderer assigns it to `innerHTML`.

For a text-only edit, preserve the backticks, `${...}` expressions, tags, IDs, and class names. Those IDs and classes connect the markup to styling and event handlers.

Long HTML template strings were deliberately preserved during formatting to avoid changing their whitespace or behavior. The surrounding functions, data, control flow, and CSS have been expanded for navigation.

When adding user-supplied content, follow the existing escaping helpers instead of inserting untrusted text directly into HTML. Prefer `textContent` for plain dynamic text.

## 6. Change appearance without changing behavior

CSS rules use selectors to identify what they style:

```css
.banner-hook {
  font-size: 16px;
  line-height: 1.55;
}
```

`font-size` changes text size. `line-height` changes space between lines. `margin` changes space outside an element; `padding` changes space inside it.

The stylesheet layers load in this order:

1. `styles.css` — global foundations.
2. `banner.css` — original banner experience.
3. `divisions.css` — division pages and catalogue.
4. `readability.css` — readability and homepage additions.
5. `solar-journey.css` — initial solar flow.
6. `experience.css` — later intro, guided flow, and lesson refinements.
7. `solar-extras.css` — final calculator, comparisons, progress, and popup refinements.

Later rules can override earlier ones, depending on selector specificity. Repeated selectors reflect the iterative prototype work. Search for all occurrences before editing, and do not delete or reorder overrides just because they look duplicated. A future cleanup should consolidate them with visual regression checks.

Use browser inspection to see which rule wins. Changes made only in browser developer tools are temporary; copy a confirmed change into the source file and save it.

## 7. Change behavior carefully

`banner.js` controls expansion, return animations, the logo's About scroll, and the top-edge spring. `experience.js` controls intro typing, timing, Skip, scroll locking, and the guided lesson flow.

The intro currently runs once per full page load. It does not replay on ordinary in-site navigation. Skip must always cancel running animation work, reveal navigation, and release scroll locks. Reduced-motion visitors bypass the intro.

After any animation edit, test:

- Normal completion and early Skip.
- Stationary pointer at intro end, followed by fresh pointer movement.
- Immediate hover after interaction resumes.
- Keyboard focus and narrow screens.
- Navigating away and returning without a stuck overlay or locked scroll.

## 8. Understand the calculator before editing it

The sample calculation lives in `divisions.js`, inside `calculate()`:

```text
Monthly consumption = monthly bill ÷ electricity rate
Target generation = monthly consumption × desired offset / 100
Capacity = target generation ÷ (4 × 0.8 × 30)
Capacity is rounded up to the next 0.5 kWp
Monthly generation = rounded capacity × 4 × 0.8 × 30
Base budget = capacity × sample price per kWp + optional battery allowance
Displayed budget = base budget ±15%
```

This is an illustration, not approved engineering or pricing logic. Because capacity rounds upward, generation may exceed the selected target. It does not model hourly demand, actual roof conditions, shading, tariffs, battery runtime, or export credits.

Results appear only after **Calculate cost**. Editing an input clears the old result and inquiry action until recalculated. Energy comparisons in `solar-extras.js` are separate alternatives using the same estimated energy, not a list of appliances guaranteed to run together.

Change defaults, formula, explanatory copy, and inquiry summary consistently. For production, Techouse must approve business assumptions, and the server must validate/recompute submitted values instead of trusting the browser.

## 9. Add content or a page

### Another product

Add a record in `catalogue.js` following an existing product's structure. Use an existing category identifier. Add the image and PDF under `assets`, match file names exactly, and check that links open. Adding a fourth category also requires changes to category navigation/templates.

### Another page

Create a template function, add its route in `app.js` inside `render()`, and link to it with a `#/...` address. Add a mount function only if the page needs behavior beyond normal links/forms. Keep mount cleanup in mind.

### Another division

This is broader than editing a heading. Update the shared `divisions` array, banner copy keyed by its ID, any hard-coded overview links, content templates, imagery, inquiry choices, and layout assumptions about five panels. Confirm scope before promising an additional division.

### Another image

Keep asset paths relative to `site`. Add meaningful alternative text for informative images. Do not present illustrative imagery as completed Techouse work.

## 10. Live editing in front of the client

1. Keep a known-good copy or a Git checkpoint before the meeting.
2. Open the exact file and phrase you expect to edit before screen sharing.
3. Make one small wording or CSS change, save, and refresh.
4. Show the result at the client's screen size.
5. Record larger requests instead of attempting risky restructuring live.

If a saved edit is not visible, hard-refresh the page and check the script/style path in `index.html`. Its `?v=...` values are cache labels, not source filenames. Update the relevant label when shipping an updated version. Local changes are not live until the revised files are deployed.

If the screen becomes blank, check the browser console and undo the last edit. Check the matching quotes, backticks, and brackets before changing anything else.

## 11. What hosting does and does not add

A static host can serve this folder's files. Hosting does not automatically add a shared database, staff authentication, email delivery, backups of business records, or a production CMS.

The demo back office saves news and inquiries in `localStorage`. It is not secure staff administration. Different browsers or hosting origins see different saved records. Avoid collecting real customer details through the prototype.

## 12. Next phases and decisions

**Phase 1 — finish the presentation.** Approve copy, images, interaction behavior, mobile layout, and the inquiry journey. Gather real approved project material and verified manufacturer/partnership claims.

**Phase 2 — confirm production scope.** Confirm content limits, editor count, required pages, inquiry destination, pricing assumptions, account ownership, hosting/domain arrangement, and responsibilities. The existing agreement still needs alignment with final decisions; notably, the deck/latest discussion used 60-minute training while older agreement/guide copies said 90 minutes.

**Phase 3 — implement production services.** The existing proposal uses a custom WordPress theme and a small site plugin, with PHP and MySQL on compatible hosting. That requires converting the design into WordPress templates and content models, not merely uploading these static files into WordPress. Staff accounts, permissions, approved content fields, email delivery, and server-side calculator validation must be built and tested. An alternative backend is a separate architecture/scope decision.

**Phase 4 — validate and launch.** Check real inquiry delivery and failures, editor permissions/recovery, approved calculator answers, responsive layouts, keyboard use, reduced motion, performance, content rights, privacy requirements, backups, and restore. Obtain acceptance before public launch and complete the agreed source/content handover.

**Phase 5 — maintain.** Separate fixing scoped defects from ongoing updates, renewal management, backups, content assistance, and new features. Use the completed agreement to define support.

The static design can be preserved during production work. The missing part is the shared, secure system behind it.

## 13. Suggested internal handover session

- 5 minutes: trace `index.html` → `render()` → selected page.
- 10 minutes: edit one banner heading and one solar paragraph.
- 10 minutes: change a CSS rule and inspect desktop/mobile output.
- 10 minutes: walk through calculator → inquiry and explain where state lives.
- 5 minutes: distinguish the prototype from production and confirm open decisions.

Success means you can find the right file, make a small edit, explain how it reaches the screen, and identify when a request needs production development.

## 14. Material icons and sharp-corner components

See [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md). Standard icons now come from a local Material Symbols sprite, rendered through `icons.js`. `design-system.css` is the final stylesheet layer and enforces square cards, buttons, dialogs, and fields. Keep this layer last when extending the CSS list in section 6.
