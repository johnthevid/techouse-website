<div align="center">

# Techouse Website

**Construction. Energy. New possibilities.**

Corporate website and protected content-management workspace for Techouse, built with HTML, CSS and JavaScript, and hosted on Cloudflare Workers with D1.

[Hosted preview](https://techouse.johndavidceasar.workers.dev) · [Getting started](#getting-started) · [Features](#current-features) · [Releases](RELEASES.md) · [Development workflow](WORKFLOW.md)

**Techouse 1.0 · Private development repository · Manual deployment**

</div>

> **Project status:** The original code-reviewed Stable Build 1 was approved on 3 November 2026. This repository also includes the subsequent Cloudflare hosting and performance updates. The hosted site remains a development preview; demo content and unfinished service integrations are identified below.

## Contents

- [Current features](#current-features)
- [Included and excluded](#included-and-excluded)
- [Technology and packages](#technology-and-packages)
- [Getting started](#getting-started)
- [Pages and routes](#pages-and-routes)
- [Project structure](#project-structure)
- [Testing and visual fidelity](#testing-and-visual-fidelity)
- [Cloudflare deployment](#cloudflare-deployment)
- [Working across computers with Codex](#working-across-computers-with-codex)
- [Releases and recovery](#releases-and-recovery)
- [Assets and permissions](#assets-and-permissions)

## Current features

### Public website

| Area                | Available now                                                                                                                                                       |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Homepage            | Five photographic division panels, approved opening text animation, skip control with duration progress, interactive hover expansion and About section              |
| Business divisions  | Solar Energy, Construction, Prefabricated Buildings, Real Estate Development and Elevator Engineering; Solar has the most complete offering and interactive content |
| Solar planning      | Property/priority questions, illustrative system-cost and savings estimates, and inquiry handoff                                                                    |
| Solar equipment     | Skyworth panel, inverter and battery categories, connected horizontal category slider, adaptive content height, model details and manufacturer datasheets           |
| Project portfolio   | Residential, commercial and industrial categories, project details, image presentation and slide-up/slide-out detail dialog with backdrop transitions               |
| Company information | About page, team/leadership/office tabs, Google Maps office embed and credited building interior photo; team photographs and leadership details remain pending      |
| Contact             | Shared call-options dialog, phone/Viber QR options, calling-app links and office map links                                                                          |
| Company updates     | Published post listing and individual update pages, backed by shared content in platform mode                                                                       |
| Usability           | Responsive layouts, keyboard controls and focus states, reduced-motion support, larger-text control and back-to-top navigation                                      |

### Protected back office

- Invite-only account setup with password sign-in and authenticator-based MFA.
- Recovery codes, account security controls, session expiry and sign-out.
- Shared project and update editing with draft/published states.
- Basic supported website text and banner-image editing.
- Search/filter tools, unsaved-change handling and stale-save conflict detection.
- Light, dark and grey office themes.
- D1-backed shared content on Cloudflare; SQLite-backed local development.

The protected CMS supports a defined set of fields. It is not a general drag-and-drop site builder. Some richer editing controls in the older browser-local prototype have not been ported to the protected CMS; see [platform details](platform/README.md).

### Loading and animation improvements

- Exact DM Sans and Manrope variable fonts served from local assets.
- Early homepage image/font loading hints.
- Content-fingerprinted static files with long-lived browser caching; private responses remain uncached.
- Lossless elevator hero conversion; total hero asset size reduced from 3,902,841 to 3,172,480 bytes.
- Desktop hover layout containment after intro/arrival playback, preserving the approved animation source, timings and typography transitions.

Performance checks showed reduced rendering work in controlled samples. They do not establish a guaranteed frame rate across devices or browsers.

## Included and excluded

| Included in Git                                   | Kept outside Git                                                            |
| ------------------------------------------------- | --------------------------------------------------------------------------- |
| Website HTML/CSS/JavaScript and required assets   | Passwords, authentication keys, recovery codes and provider credentials     |
| Worker, local server and schema migration source  | Local `.data/`, SQLite databases and Cloudflare OAuth state                 |
| Regression tests and local package definition     | Installed dependencies, `.wrangler/` state and generated test output        |
| Current Cloudflare deployment configuration       | Private database recovery archives                                          |
| Setup, workflow, handoff and release records      | Compressed source backup archives; archive checksums/manifests are retained |
| Original code-review report and asset attribution | Contracts, quotations, client presentations and generated diagnostics       |

### Preview content and functional limits

- The preview uses **13 credited third-party reference projects: 4 residential, 6 commercial and 3 industrial**. They are presentation references, not verified Techouse achievements. Some project information is assumed for demonstration.
- Solar calculations are planning illustrations, not quotations, engineering designs or guaranteed bill savings.
- Inquiry submission remains a browser-local demonstration. It does not send an email or establish that Techouse received a request.
- Site-visit scheduling is a demonstration; no live booking integration is connected.
- Phone/Viber actions depend on the user's device, installed apps and number availability.
- Team photos and completed leadership profiles are not supplied yet. The office image is a credited building interior reference.
- No payment processing, ecommerce checkout, unrestricted site builder or completed offering/catalogue for every non-solar division is included.
- Authentication protections do not make public forms spam-proof or prank-proof. Public anti-abuse integrations and a real inquiry workflow are not represented as complete.
- A custom domain and full hosted production acceptance remain outstanding. The preview retains a `noindex` directive.

## Technology and packages

| Component           | Current implementation                                                                                  |
| ------------------- | ------------------------------------------------------------------------------------------------------- |
| Front end           | HTML, layered CSS, vanilla JavaScript, hash-based routing                                               |
| Production server   | Cloudflare Workers; `platform/worker.mjs` with a deployment adapter                                     |
| Production database | Cloudflare D1 via the `DB` binding                                                                      |
| Local runtime       | Node.js **24 or later**, built-in HTTP server and `node:sqlite`                                         |
| Browser tests       | Playwright **1.62.1**, pinned as a development dependency; installed Google Chrome is used by the tests |
| Test runner         | Built-in `node:test`                                                                                    |
| Deployment CLI      | Wrangler **4.157.0** was used for the recorded deployments; examples below pin that version             |
| Typography          | Self-hosted DM Sans and Manrope variable fonts                                                          |
| Icons and QR        | Local Material Symbols SVG artwork and vendored QR generation code                                      |

There is no React/Vue framework, WordPress installation or front-end bundling requirement. The deployment preparation script refreshes stylesheet/script cache fingerprints; it does not compile the interface.

**Packages:** `platform/package.json` is marked `private`. No Techouse npm package, GitHub Package or container image has been published. Wrangler is an operator tool, not an application runtime dependency. Font, icon and QR resources retain their third-party terms.

## Getting started

### 1. Install prerequisites

- Git or GitHub Desktop, signed into an account with access to this private repository.
- Node.js **24+** with npm.
- Google Chrome for the browser regression tests.
- Codex is optional for running the site, but project instructions are included for development assistance.

### 2. Clone the repository

In GitHub Desktop, choose **File → Clone Repository**, select `johnthevid/techouse-website`, and choose a local folder. Alternatively:

```sh
git clone https://github.com/johnthevid/techouse-website.git
cd techouse-website
```

### 3. Install development dependencies and start

From the repository root:

```sh
cd platform
npm install
npm run dev
```

Open:

- Website: <http://127.0.0.1:8787/>
- Back-office sign-in: <http://127.0.0.1:8787/admin>

Keep the terminal running; stop with **Ctrl+C**. Use the platform server for protected back-office work. The older standalone static preview does not provide server authentication or shared CMS persistence.

### 4. Provision a local account, if needed

A fresh clone does not include a local database, password or production account. In another terminal, from `platform/`:

```sh
node invite.mjs your-email@example.com
```

Open the private setup URL written to `platform/.data/setup.url` on that computer while the local server is running. It expires after 30 minutes. Set your password, then sign in and enroll an authenticator. Keep recovery codes in your password manager. Provisioning does not overwrite an existing account.

Do not upload or paste the setup URL, password, authenticator secret or recovery codes into project files or chat.

### Local data is separate

Local development creates a private database and matching authentication key under `platform/.data/`. Each computer starts with its own local state. Git does not transfer that state, and starting the local server does not download the hosted D1 database. Seed/reference content and hosted edits are separate; use the documented platform tools deliberately rather than copying production credentials or replacing database content.

## Pages and routes

| Page                   | Route                                                                                                   |
| ---------------------- | ------------------------------------------------------------------------------------------------------- |
| Home                   | `/#/`                                                                                                   |
| Division directory     | `/#/divisions`                                                                                          |
| Solar experience       | `/#/divisions/solar`                                                                                    |
| Other divisions        | `/#/divisions/construction`, `/prefabrication`, `/development`, `/elevators` under the divisions prefix |
| Solar equipment        | `/#/divisions/solar/products/panels`, `/inverters`, `/batteries` under the products prefix              |
| About                  | `/#/about`                                                                                              |
| Project inquiry demo   | `/#/inquiry`                                                                                            |
| Updates                | `/#/updates`                                                                                            |
| Protected sign-in      | `/admin`                                                                                                |
| Protected office shell | `/office.html` (requires a valid session)                                                               |

## Project structure

```text
techouse-website/
├── README.md                 Project overview and setup
├── AGENTS.md                 Root instructions for Codex
├── HANDOFF.md                Current task and deployment context
├── WORKFLOW.md               Multi-device and release workflow
├── CHANGELOG.md              Recorded changes
├── RELEASES.md               Release identities and recovery guidance
├── GITHUB_ABOUT.md           Repository About text and suggested topics
├── STABLE_BUILD_1.md          Original approved baseline record
├── site/                     Website, office interface and static assets
│   ├── app.js                Shared routing and rendering
│   ├── banner.js             Landing content and panel interactions
│   ├── experience.js         Approved intro and experience behavior
│   ├── catalogue.js          Equipment catalogue and category movement
│   ├── hover-performance.css Desktop hover containment
│   └── assets/               Photos, fonts, icons and datasheets
├── platform/
│   ├── worker.mjs            Server routes, authentication and shared content
│   ├── local.mjs             Local HTTP/SQLite adapter
│   ├── invite.mjs            Local invitation provisioning
│   ├── migrations/           Database schema source
│   ├── seeds/                Development/reference content
│   └── tests/                Functional, security and browser regression tests
├── deployments/techouse-1.0/ Current Worker adapter/configuration and status
├── releases/                 Tracked archive identities and manifests
└── deliverables/              Tracked original code-review report
```

Existing local folders may also contain ignored private archives and client documents. Their presence on the original laptop does not mean they are part of the repository.

For component editing, start with [site/README.md](site/README.md), [design conventions](site/DESIGN_SYSTEM.md) and [site instructions](site/AGENTS.md). Some older prototype notes describe historical behavior; this README and the current deployment records distinguish the protected platform from that prototype.

## Testing and visual fidelity

From `platform/`:

```sh
npm test
```

The suite currently contains **12 test groups**, covering account setup, password/MFA flows, sessions, request validation, content persistence and conflict handling, private office access, catalogue navigation, responsive browser behavior and cache policy. Browser tests require Chrome and the installed Playwright package.

Recorded validation for the current website code:

- All 12 regression test groups passed.
- The loading update preserved 16 controlled desktop/mobile screenshots pixel-for-pixel against the original stable baseline.
- The later hover update passed 13 layout comparisons plus live pointer/exit checks. Pixel-identical screenshots are not claimed for that later comparison.
- Hosted password/MFA sign-in and draft-save persistence were separately exercised by the user.

These are recorded checks, not an assertion that every future commit passes automatically. Automated GitHub Actions checks have not been configured.

**Preserve the approved homepage intro.** Typography interpolation, timing, easing and choreography must not change without explicit user instruction. Honor reduced-motion preferences, keyboard access and the existing square-cornered design direction.

## Cloudflare deployment

### Current environment

| Setting                         | Value                                                      |
| ------------------------------- | ---------------------------------------------------------- |
| Worker                          | `techouse`                                                 |
| Hosted preview                  | <https://techouse.johndavidceasar.workers.dev>             |
| Static assets                   | `ASSETS`, sourced from `site/`                             |
| Shared database                 | D1 database `techouse`, binding `DB`                       |
| Application origin              | Exact hosted HTTPS origin in `APP_ORIGIN`                  |
| Cookies                         | `COOKIE_SECURE=true` on the hosted site                    |
| Authentication encryption       | Cloudflare secret `AUTH_KEY`; its value is never committed |
| Authoritative deployment config | `deployments/techouse-1.0/wrangler.jsonc`                  |

The deployment adapter handles explicit HTML asset routing and cache response policy. The generic `platform/wrangler.jsonc` is a starting template, not the configuration used for the current hosted release.

### Release an approved code update

Publishing is **manual**. Pushing to GitHub does not deploy the website.

From the repository root, move into the deployment folder before running Wrangler:

```sh
cd deployments/techouse-1.0
npx wrangler@4.157.0 login
npx wrangler@4.157.0 deploy
```

Complete provider sign-in privately. Deploy only with the user's release instruction and access to the intended account. The existing configuration targets the current personal-account Worker; it is not a generic new-account provisioning script.

Wrangler runs `refresh-assets.mjs` before upload. This regenerates script/style version hashes so cached browsers can discover changed files. Run from this directory so the custom build resolves correctly. After deployment, verify the site, record its Worker version and commit any generated HTML/cache-version and release-record changes.

A normal code release must not re-import projects, reset accounts, replace `AUTH_KEY` or apply remote database migrations automatically. Database changes require their own reviewed migration and recovery plan.

See [deployment status](deployments/techouse-1.0/STATUS.md) and [machine-readable hosting record](deployments/techouse-1.0/hosting-record.json). Separate preview/staging infrastructure and GitHub-triggered deployments are not configured yet.

## Working across computers with Codex

1. **Start:** Fetch the latest repository changes. Check the branch and local changes before pulling.
2. **Develop:** Use a descriptive update branch. Ask Codex to read `AGENTS.md` and `HANDOFF.md` before editing.
3. **Check:** Run relevant tests and review appearance/behavior.
4. **Handoff:** Update `HANDOFF.md`, commit the work and push the branch before switching computers.
5. **Continue:** On the other device, fetch, select that branch and pull the committed work.
6. **Release:** Merge approved work into `main`; deploy only when instructed.

Git transfers committed source and project notes. It does not transfer an open chat, unsaved edits, local databases or sign-in credentials. Avoid editing the same shared branch on both computers concurrently. Do not force-push or discard local changes to make the copies match.

Detailed instructions: [WORKFLOW.md](WORKFLOW.md).

## Releases and recovery

- **Original Stable Build 1:** Final, code reviewed, approved 3 November 2026. Its source archive stays unchanged outside Git; checksums and file manifests are tracked.
- **Current Techouse 1.0:** Original baseline plus later hosting and loading/hover improvements. The first Git checkpoint is `30fffe5`.
- **Latest recorded Worker deployment:** `9be19ffd-8de2-4e61-b43c-ca5e9f7ac46f`, verified 4 November 2026.
- **GitHub Releases/tags:** None created as part of this setup. Do not confuse a Cloudflare Worker version, a local backup archive and a GitHub Release.

Read [RELEASES.md](RELEASES.md) for the version table, baseline checksum and rollback guidance, and [CHANGELOG.md](CHANGELOG.md) for the recorded development history.

GitHub code history complements separate backups. Source archives, hosted data and authentication recovery material need their own secure off-device recovery arrangements. A website code rollback does not roll back D1 content.

## Assets and permissions

This is a private client-development repository; no blanket open-source license is granted by its presence on GitHub. Do not redistribute client branding, content or third-party material without appropriate permission.

Asset attribution and licenses are recorded under:

- [General asset sources](site/assets/SOURCES.md)
- [Reference project sources](site/assets/project-references/SOURCES.md)
- [Skyworth product sources](site/assets/skyworth-products/SOURCES.md)
- [Solar story sources](site/assets/solar-story/SOURCES.md)
- [Font sources and license notes](site/assets/fonts/SOURCES.md)
- [Material icon license](site/assets/icons/LICENSE.txt)

Third-party photos and reference projects remain credited to their original sources. Font/icon/vendor terms continue to apply independently of this repository's private status.
