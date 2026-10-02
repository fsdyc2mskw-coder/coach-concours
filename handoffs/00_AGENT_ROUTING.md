# Coach Concours, agent routing (which model, which effort, for what)

version: 4 (24 September 2026). Read with `00_HOW_I_WORK.md` (same folder). Decided once. Only
section 4 (current model names) is expected to change. v1 to v3 archived (`90_Archive/`).
Change in v4 (the athlete's decision of 24 September): **gate 3, the tag, is now published by the
Cowork chat in the athlete's own logged-in Chrome, after she confirms the merge.** She no longer
publishes it by hand. The merge stays hers (gate 2). Section 3 and section 3b rewritten.

## 0. Defaults that cover 90 % of sessions without reading further

```
 Cowork / Claude chat ............ TOP (truth gets set here)
 coder (the athlete's session) ... the tier written in the CHANGE_REQUEST header
 anything with no file written ... FAST
```

Deviate only when the file in front of you says another tier.

## 1. Three tiers, chosen by the step, never by mood

```
 TIER   FOR WHAT                                                        MODEL · EFFORT
 ─────  ───────────────────────────────────────────────────────────────  ───────────────────
 TOP    sets the truth: rule, WEEK_n_FINAL, review, reconciliation,     Opus (or Fable) · high
        engine change request, persistence contract
 MID    applies a decision already made: rewrite a file after a         Sonnet · medium
        decision, draft cards from a decided list, fill a template,
        data / infra change request, tests, theme
 FAST   read or look up: "what is Friday", reformat, translate,         Haiku · low
        quick check of one file
```

Rule of thumb: output will be frozen → TOP. Output is a draft someone at TOP reviews → MID.
Nothing written to a file → FAST.

## 2. Thinking world (Cowork chat)

```
 STEP                                        TIER
 cockpit · rules · precedence · reviews      TOP
 WEEK_n_FINAL draft, review and freeze       TOP
 cards: decide the list · check vs S1        TOP
 cards: draft 5-10 at a time                 MID
 engine change request                       TOP
 data / infra change request                 MID
 APP_REPORT review ("app = specs?")          TOP
 WEEK_n_NOTES → FINAL "as trained"           MID
 publish the tag after a merge (3b)          MID
 show me tomorrow · reformat · translate     FAST
```

## 3. Coding world (the athlete's own Claude Code session)

```
 the athlete: "implement CR-nnn" in the Cowork chat                       gate 1
 → Cowork reads the CR in Drive 04, states its tier and model, gives the one
   sentence to paste into her Claude Code session on the repository
 → the coder (model of the tier): reads CLAUDE.md and handoffs/00_COCKPIT.md
   section 9, codes on branch cr-nnn-short-title, runs typecheck, test, build,
   writes handoffs/APP_REPORT_nnn.md ending with the commit hash, opens the pull
   request "CR-nnn <title>", never merges, never tags, never pushes to main
 → Cowork reads the report and explains it in plain words
 → the athlete presses Merge on GitHub                                    gate 2
 → the athlete tells the chat the merge is done ("merged CR-nnn")
 → Cowork publishes the tag in her Chrome, section 3b                     gate 3
 → Cowork copies the report to Drive 04 and writes the next cockpit version
```

Exception: a cloud worker started from the Cowork chat is used only when a push probe passes
(the repository must be in the task's authorised sources). Same brief, same gates.

One request per session. A data or infra request never needs the top model; an engine
request never goes to the small one. The coder never merges and never tags. Nothing creates
a tag automatically.

## 3b. The tag, published by the chat in the athlete's logged-in Chrome (gate 3)

Only after the athlete confirms the merge. The merge stays hers, on GitHub; the chat never merges.

```
 1  read the merge SHA: git log --merges on origin/main, or the pull request page
 2  open https://github.com/<github-username>/coach-concours/releases/new?target=<merge-sha>&tag=cr-nnn
    (for a version of a delivered CR: cr-nnn-v2, cr-nnn-v3)
 3  check, before publishing:
    · the Target field shows the short merge hash, not "main"
    · the tag field reads the right tag
    · the title reads "CR-nnn <title>"
    · Release label: None, not "Latest"
 4  Publish release; confirm the release page shows the tag on the merge hash
 5  report the tag and the hash in ONE line
 6  delete the merged branch on GitHub
```

```
 NEVER   a tag before the merge · a tag on any commit other than the merge commit
         · the browser used to push code, merge, or edit files
```

`<github-username>` is read at run time from the repository remote; it is never written into
a file (sanitation rule). The browser is the athlete's own Chrome (Claude in Chrome); the chat
reads that browser's skill before its first step. If Chrome is not reachable, the chat gives the
athlete the one URL of step 2 and the checks of step 3 instead, and she publishes by hand.

## 4. Current model names (the only section that changes)

| Tier | Cowork chat | coder |
|---|---|---|
| TOP | Claude Fable 5.1 or Opus 5, effort high | Opus, effort high, ≤ 80 turns |
| MID | Claude Sonnet 5, effort medium | Sonnet, effort medium, ≤ 40 turns |
| FAST | Claude Haiku 4.5 or Sonnet, effort low | Haiku, effort low, ≤ 10 turns |

Checked 22 September 2026. When a name changes, edit this table only; sections 0-3b stay.
`max`, `xhigh` and `ultracode` are never used: a request that needs them is too big, split it.

## 5. How the tier reaches you without thinking

```
 the file you work on says its tier (CR header "Tier:", cockpit item [TOP]/[MID])
   ──► Cowork states it back before starting, and names the coder's model from it
   ──► the coder states the tier in its first line and flags a mismatch
```

## 6. Two guardrails

- A quick question about a rule is FAST; changing that rule is TOP, even one line.
- If a MID or FAST answer proposes a decision (new rule, new dose, new drill), it is a draft:
  it goes through a TOP pass in Cowork before any file is frozen.