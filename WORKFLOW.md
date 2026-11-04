# Working across computers

## One-time setup on another computer

Clone the private GitHub repository, open that folder in Codex, and follow README.md for local setup. Sign in to GitHub separately on each device; do not copy tokens or Cloudflare OAuth files through the repository. Cloudflare sign-in is needed only when performing authorized hosting operations.

## Starting work

Ask Codex to read AGENTS.md and HANDOFF.md and check `git status` and the current branch. With no uncommitted work, fetch the latest GitHub changes and update the intended branch with a fast-forward pull. If there are local changes or diverged commits, preserve and reconcile them before editing. Do not reset or force-push to make the copies match.

Use a descriptive update branch for new work. Keep `main` for approved code. Work on one computer at a time on a shared task unless separate branches are deliberately used.

## Before changing computers

Update HANDOFF.md, review the changed files, commit them with an accurate message, then push the branch to GitHub. Unfinished work can be saved as a clearly labeled work-in-progress commit on that branch. Confirm that the push succeeded before shutting down.

On the other computer, fetch, switch to the same branch and pull the saved changes. GitHub transfers committed code and notes; uncommitted files, local databases and chat history are not part of that transfer.

## Releasing an update

1. Test the update locally and review its changes and visual behavior.
2. Obtain the user's approval to merge the update into `main`.
3. Publish only after the user instructs a production release. GitHub automatic deployment is not configured.
4. Deploy from `deployments/techouse-1.0/` using an authenticated, pinned Wrangler installation. Its custom build refreshes asset cache versions. Keep credentials outside the repository.
5. Verify the live website, record the deployed Worker version and update HANDOFF.md and deployment records. Commit any generated asset-version changes and release records so GitHub reflects what was deployed.

The original Stable Build 1 archive remains immutable. A future Git tag for that baseline must point to the exact recovered archive source, not the current post-baseline code. Database backups and schema migrations require separate handling; reverting website code does not revert database changes.
