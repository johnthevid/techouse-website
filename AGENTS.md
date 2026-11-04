# Techouse project instructions

- Read README.md, HANDOFF.md and WORKFLOW.md before changing the project.
- Follow site/AGENTS.md and site/DESIGN_SYSTEM.md for presentation changes.
- Preserve the final code-reviewed Stable Build 1 identity. Current code includes later hosting and performance updates; do not label it as the original archive.
- Never change the approved homepage intro typography, timing, easing or choreography without explicit user instructions.
- Never commit credentials, .data, local databases, private archives or Cloudflare login state. Keep production content separate from source control.
- Start by checking the current Git branch and working changes. Preserve uncommitted user work. Do not overwrite it to synchronize devices.
- Before a handoff, update HANDOFF.md with the task, completed work, checks, remaining work and deployment status. Do not record secret values or temporary setup links.
- Run checks appropriate to the change. State clearly if browser tests could not run.
- Keep deployment manual. A Git push does not authorize a production deployment. Obtain the user's release instruction before publishing a new update.
- Run Wrangler from deployments/techouse-1.0 so its asset-version build uses the correct working directory. Never apply remote database changes as part of an ordinary code deployment.
