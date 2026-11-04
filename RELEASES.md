# Releases and recovery

## Current identities

| Record                             | Identity                                               | Meaning                                                                                              |
| ---------------------------------- | ------------------------------------------------------ | ---------------------------------------------------------------------------------------------------- |
| Original approved baseline         | Stable Build 1 — Final, Code Reviewed; 3 November 2026 | Immutable historical source snapshot                                                                 |
| First Git checkpoint               | `30fffe513e908608976c36c58231e2d054fa27ff`             | Current-at-import code, including later hosting/performance changes; not the original archive source |
| Hosted release name                | Techouse 1.0                                           | Website currently served from the temporary Cloudflare address                                       |
| Latest recorded Worker version     | `9be19ffd-8de2-4e61-b43c-ca5e9f7ac46f`                 | Desktop hover layout containment update                                                              |
| Immediate prior Worker version     | `6121f911-614f-4073-9049-23c0c2cf428e`                 | Font, hero-image and browser-cache loading update                                                    |
| GitHub Releases / Git version tags | None created during setup                              | Git commits and provider versions exist without a GitHub Release                                     |
| Published packages                 | None                                                   | `platform/package.json` is private; no npm/GitHub Package is published                               |

The hosting record is in [deployments/techouse-1.0/hosting-record.json](deployments/techouse-1.0/hosting-record.json). New deployments must update that record and this history as appropriate.

## Original baseline archive

Filename:

```text
Techouse_Stable_Build_1_FINAL_CODE_REVIEWED_2026-11-03.tar.gz
```

SHA-256:

```text
ed3f4f715821e1d187ae477bdd14ca117a36f6a7cbdf37cfb275e9e4eb5e9147
```

The authoritative checksum is the `sha256` field in [releases/stable-build-1.json](releases/stable-build-1.json); verify it before restoring. The archive itself is intentionally excluded from Git. Its adjacent per-file manifest is tracked under `releases/`. Keep the archive in a secure separate backup location; a clone does not recreate the archive file.

The original source archive contains no private database or matching authentication key. Private local recovery material is a separate excluded backup and must not be uploaded to GitHub or public static assets.

## Recommended future release process

1. Develop on an update branch and preserve handoff notes.
2. Run relevant functional, security, browser and visual checks.
3. Review the changes and merge the user-approved update into `main`.
4. Deploy manually only when the user authorizes publication.
5. Verify the hosted site; record the deployment version and any outstanding issues.
6. Commit generated cache-version changes and release records so the saved source reflects the deployment.
7. When a new stable release is approved, create a clearly named Git tag and optional GitHub Release for that exact commit. Include change notes, known limitations and validation results.

No historical tag should be attached to newer code merely to fill the Releases panel. To tag the original Stable Build 1, first recover and verify its exact archive tree separately.

## Recovery boundaries

- **Source:** Git commits restore committed source. The separately retained archive restores the original reviewed baseline after checksum verification.
- **Worker deployment:** The recorded prior Worker version is a rollback reference, subject to provider availability and compatibility with the current data/schema. Verify before using it.
- **Hosted data:** D1 content is not backed up by a Git commit or Worker version. Handle data backups/restores separately.
- **Local authentication:** Restore a local database and its matching authentication key together. Do not replace only one half of the pair or silently generate a replacement key beside an existing database.
- **Production authentication:** Do not rotate or restore the production secret as a side effect of a code rollback.

Current development-preview limits are listed in [README.md](README.md). Publishing a release does not itself establish full production acceptance.
