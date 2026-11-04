# Techouse website

Source for the Techouse corporate website and protected back office, hosted on Cloudflare Workers with D1.

- `site/`: public presentation, assets and interface scripts.
- `platform/`: server, local development adapter, database migrations and tests.
- `deployments/techouse-1.0/`: current Cloudflare deployment configuration and release status.
- `STABLE_BUILD_1.md` and `releases/stable-build-1.json`: original final code-reviewed baseline identity.
- `WORKFLOW.md`: switching computers and releasing updates.
- `HANDOFF.md`: current work and next steps for Codex.

## Local setup

Install Node.js 24 or later and Google Chrome (the browser tests use Chrome). From `platform/`, run `npm install`, then `npm run dev`. Open http://127.0.0.1:8787. Run `npm test` from that same folder for the regression suite.

A new computer starts with a separate local database and local account setup; it does not automatically download the hosted database or administrator credentials. See platform/README.md for provisioning. Use separate test data locally.

The hosted website is https://techouse.johndavidceasar.workers.dev. Inquiry delivery and site visits remain demos. The current source includes hosting and performance improvements after the original Stable Build 1 archive.

## What this repository excludes

Private local state, credentials, source backup archives, contracts, client presentations and generated diagnostics remain outside Git. The original archive is still on the originating laptop; its identity and checksums are tracked. Retain separate secure/off-device backups for recovery.
