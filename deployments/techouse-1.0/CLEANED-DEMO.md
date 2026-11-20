# Techouse cleaned presentation demo

Worker: `techouse-cleaned`. Expected address: https://techouse-cleaned.johndavidceasar.workers.dev

Uses the public static site with browser-local demo inquiries. No production database, secrets, scheduled jobs or staff accounts are bound. Staff/API paths are unavailable. This is separate from the existing `techouse` deployment.

Deploy manually from this folder using pinned Wrangler 4.157.0:

```sh
wrangler deploy --config wrangler.cleaned.jsonc
```

Git branch: demo/cleaned-solar (current site and Solar Calculator from main, plus these three demo files). Do not merge these demo files into main or overwrite the existing `techouse` Worker as part of this demo.

Deployed 11 November 2026. Worker version: 740c32f1-d8c8-4638-b187-1777571d62d1. Live homepage, contact title, solar calculation, equipment catalogue and blocked staff/API routes verified in Chrome. Only ASSETS binding is present. GitHub push remains blocked by connection resets.

CTA update deployed from source commit 801fd24 on 11 November 2026. Live checks verified all five CTAs, Solar reveal and CTA navigation without page errors.

Solar Calculator update prepared 20 November 2026 on branch demo/cleaned-solar: two-step planner, three-option tiles, refreshed asset versions. Checked against a local stand-in for this Worker (static site, `/api/` and staff paths return 404): no page errors or failed requests at 1440 px and 390 px. Not deployed yet.
