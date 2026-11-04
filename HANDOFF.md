# Current handoff

Updated: 4 November 2026.

## Current state

- Original baseline: Stable Build 1 — Final, Code Reviewed, approved 3 November 2026. Archive/checksum identity is in releases/stable-build-1.json. The archive remains local and is excluded from Git.
- Working source includes later Cloudflare routing, font/image/cache loading improvements and desktop banner layout containment.
- Live Worker: techouse at https://techouse.johndavidceasar.workers.dev.
- Latest deployed version: 9be19ffd-8de2-4e61-b43c-ca5e9f7ac46f.
- Last website validation: 12 regression groups passed; 13 hover layout comparisons passed; five live pointer activations and exit behavior passed. No animation source/timing changes were made.
- User reports substantially smoother hover. Exact user-device FPS difference has not been reproduced in automated testing.

## Active task: GitHub setup

Prepared root ignore rules, project instructions and cross-device workflow. Origin is https://github.com/johnthevid/techouse-website.git. Initial local source checkpoint is prepared; no source has been uploaded. Local Git authentication is not configured, and the connected GitHub app currently returns 404 for this repository. Next: user signs in on this laptop, verify private visibility and remote history, then push main without force. Do not enable automatic deployment during this setup.

The current working source is newer than the original stable archive. Preserve this distinction when creating commits or release tags.

## Limits and private state

Hosted D1 content stays on Cloudflare. Local databases, authentication keys, OAuth configuration, contracts, diagnostic artifacts and private recovery archives are excluded from Git. Hosted sign-in/MFA and draft persistence were verified by the user. Inquiry delivery and site visits remain demos.
