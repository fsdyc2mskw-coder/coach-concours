# Coach Concours, rules for the coder (read on every run, keep short)

You are the coder for a one-athlete training app (React, TypeScript, Vite PWA, GitHub Pages).
The thinking (rules, cards, weekly plans) lives in Google Drive; you only see its mirror in
`handoffs/`. Never decide anything sporting: write the question in the APP_REPORT.

## Read order
1. `handoffs/00_COCKPIT.md` section 9, then `handoffs/00_AGENT_ROUTING.md`.
2. Only the change request named in the issue (`handoffs/CHANGE_REQUEST_nnn_*.md`) and the
   files it lists under "Inputs". Nothing else unless the CR points to it.

## Tier
- The CR header carries a `Tier:` line. It sets your model and effort.
- State the tier in your first comment, and say if the model you run on does not match.

## How to work
- One change request per issue, exactly as written. Out-of-scope items are not touched.
- Branch names are `cr-nnn-short-title`, never the bare `cr-nnn`, cut with no upstream
  (`git switch --no-track -c cr-nnn-short-title origin/main`). Open a pull request titled
  `CR-nnn <short title>`.
- Keep CI steps as they are (`no-personal-names`, validate, typecheck, test, build, deploy).
- Add tests to the existing harness when the CR lists tests. Do not fix unrelated bugs; list them.
- Write `handoffs/APP_REPORT_nnn.md` in the same pull request: what changed, substitutions,
  questions, files touched, verification, and the commit hash.
- The coder never tags, never merges and never pushes to main. The athlete merges the pull
  request on GitHub. After she confirms the merge, the Cowork chat publishes the tag `cr-nnn`
  (or `cr-nnn-v2` for a version) on the merge commit, through the GitHub Releases page in her
  own browser. Nothing creates a tag automatically.

## Never
- A person's name, e-mail, hostname, device name or personal folder path in any file or
  commit. The person training is "the athlete"; anyone else is a role.
- A secret in the repository. `VITE_GOOGLE_CLIENT_ID` and `PERSONAL_NAMES` are repository secrets.
- A session dated after 20 November 2026. Invented heart-rate targets or loads.
- Regenerating Week 1: it is loaded as data from `handoffs/WEEK_1_FINAL_2026-09-07_to_13.md` v3.
