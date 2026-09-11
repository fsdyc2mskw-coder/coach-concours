# Coach Concours, agent routing (which model, which effort, for what)

version: 1 (10 September 2026). Read with `00_HOW_I_WORK.md`. Decided once. Only section 4
(current model names) is expected to change. Drive copy is the source; this is a mirror.

## 0. Defaults that cover 90 % of sessions without reading further

```
 Cowork / Claude sessions ........ TOP   (truth gets set here)
 Codex ........................... the tier written in the CHANGE_REQUEST header
 anything with no file written ... FAST
```

Deviate only when the file in front of you says another tier.

## 1. Three tiers, chosen by the step, never by mood

```
 TIER    FOR WHAT                                          CLAUDE          CODEX / GPT
 ─────   ───────────────────────────────────────────────   ─────────────   ─────────────────
 TOP     sets the truth: rule, WEEK_n_FINAL, review,       effort high     Extended thinking
         reconciliation, engine change request
 MID     applies a decision already made: rewrite a file   effort medium   Standard thinking
         after a decision, draft cards from a decided
         list, fill a template, data/infra change request
 FAST    read or look up: "what is Friday", reformat,      effort low      Light thinking
         translate, quick check of one file
```

Rule of thumb: output will be frozen → TOP. Output is a draft someone at TOP reviews → MID.
Nothing written to a file → FAST.

## 2. Thinking world

```
 STEP                                        TOOL               TIER
 cockpit · rules · precedence · reviews      Claude (Cowork)    TOP
 WEEK_n_FINAL draft, review and freeze       Claude (Cowork)    TOP
 cards: decide the list · check vs S1        Claude (Cowork)    TOP
 cards: draft 5-10 at a time                 Claude             MID
 engine change request                       Claude (Cowork)    TOP
 data / infra change request                 Claude (Cowork)    MID
 APP_REPORT review ("app = specs?")          Claude (Cowork)    TOP
 Notion note → FINAL "as trained"            Claude (Cowork)    MID
 show me tomorrow · reformat · translate     Claude             FAST
```

## 3. Coding world

```
 CR       KIND     CODER                       TIER
 CR-003   data     Codex mini                  MID
 CR-004   infra    Codex mini                  MID
 CR-001   engine   Codex max                   TOP
 CR-002   engine   Codex max                   TOP
 CR-005   infra    Codex max (OAuth fiddly)    TOP
 future data  → as CR-003 · future engine → as CR-001 · every new CR carries a "tier:" line
 review of any APP_REPORT against the specs → Claude (Cowork), TOP
```

One request per coding session, whatever the tier. A data or infra request never needs the
top coder; an engine request never goes to the small one.

## 4. Current model names (the only section that changes)

| Tier | Claude (Cowork / Claude Code) | Codex |
|---|---|---|
| TOP | Claude Fable 5.1 or Opus 5, effort high | GPT-5.1-Codex-Max (Extended) |
| MID | Claude Sonnet 5, effort medium | GPT-5-Codex-Mini (Standard) |
| FAST | Claude Haiku 4.5 or Sonnet 5, effort low | n/a |

Checked 10 September 2026 against the Claude models overview and the OpenAI model release
notes. When a name changes, edit this table only; sections 0-3 stay.

## 5. How the tier reaches you without thinking

```
 open a chat ──► the file you work on says its tier   (CR header "tier:", cockpit item [TOP]/[MID])
             ──► pick that model once for that chat
             ──► the agent states the tier back in its first reply and flags a mismatch
```

## 6. Two guardrails

- A quick question about a rule is FAST; changing that rule is TOP, even one line.
- If a MID or FAST answer proposes a decision (new rule, new dose, new drill), it is a draft:
  it goes through a TOP pass in Cowork before any file is frozen.
