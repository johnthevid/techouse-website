# Stable Build 1 — Final Release and Backups

## Historical pre-review backups

`Techouse_Stable_Build_1_BEFORE_CODE_REVIEW_2026-11-03_193157.tar.gz` is the dated, verified source snapshot taken before the 3 November 2026 code review. It contains the complete site/assets and platform source, excluding local databases, environment secrets and runtime dependencies. `Techouse_Stable_Build_1_BEFORE_CODE_REVIEW_2026-11-03_193157.tar.manifest.json` records its archive/file SHA-256 hashes. The earlier `techouse-stable-build-1.tar.gz` remains unchanged.

## Private local recovery

`PRIVATE_Stable_Build_1_DATABASE_2026-11-03_193157.tar.gz` contains the consistent local database and its matching `auth-key`. Its file access is owner-only (mode 600). It is not encrypted. Keep it private and outside public website assets. No browser-localStorage data or external hosting accounts are included.

## Restore safely

Extract the source into a separate folder first and compare its hashes with the manifest. Keep the current working copy until the restored copy has been checked. To recover local shared content and sign-in, stop the local server, then restore the database and matching key together into the restored platform’s private `.data` folder (folder mode 700; files mode 600). Never restore only one half of that pair over a different installation. Start the restored preview and verify it before replacing a working copy.

These archives are on this computer; they are not an off-device disaster-recovery service.

## Reviewed source

`Techouse_Stable_Build_1_CODE_REVIEWED_2026-11-03.tar.gz` contains the cleaned source, regression tests and review report. It is the reviewed snapshot subsequently promoted to final Stable Build 1, separate from the historical pre-review backup and excludes private local state. Its adjacent manifest records the archive and per-file hashes.

## Current final release

`Techouse_Stable_Build_1_FINAL_CODE_REVIEWED_2026-11-03.tar.gz` is the authoritative, client-approved **Stable Build 1 — Final, Code Reviewed** source release. `stable-build-1.json` points to this archive and its checksum. All earlier archives remain unchanged as historical backups; none is the current stable release. `stable-build-1-pre-review.json` preserves the former release metadata.
