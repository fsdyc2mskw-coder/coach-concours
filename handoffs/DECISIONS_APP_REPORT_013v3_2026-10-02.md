# Decisions on APP_REPORT_013_v3 (2 October 2026)

Taken by the athlete with Claude (Cowork), one question at a time. Tier TOP. These answers are
the athlete's explicit current decision (precedence 1). They go into pull request #11
(`cr-013-v3-week5-engine`) BEFORE the merge, as part of CR-013 v3. In the rule files they are
folded in at the next version of each file (week 6 build); until then THIS FILE WINS over
`weekly_shape.md` v7, `run_intervals_progression.md` v4 and `season_plan.md` v3.

```
 #   question                         decision                                    code in PR #11
 1   travel week days (Wed + Thu)     keep as built; she drags sessions herself   no
 2   power block in the hotel         KEEP a power block in W7-W8; placeholder    no
                                      until the W7 build writes the hotel version
 3   power EMOM W6, W9, W10           REUSE the W5 power EMOM for now             YES
                                      (same drill, same "best jump" box).
                                      A dedicated CR-019 will write the remaining
                                      power blocks later (see below)
 4   travel cardio                    HOOPS TRAVEL WITH HER. In W7-W8 only the    YES
                                      wall bars are missing; hoops atoms stay,
                                      equipment lists keep the hoops
 5   rule of three atoms              KILLED. A cardio block may have up to       YES
                                      FOUR atoms. Reused cardio keeps its 4
                                      atoms (no squats removed in W9-W11). The
                                      copied cardio of W6-W11 is a temporary
                                      filler, replaced at each week build
 6   "Quatre coins" recording         option A: one box "Tours faits (sur 3)"     no
                                      + free text, as built
 7   heat rule (above 28 °C)          KILLED, over-engineered. Remove the heat    YES
                                      line from every Tuesday screen and text
 8   hard days side by side           keep as built; she moves days herself       no
 9   chain B transition note          keep the coder's sentence                   no
 10  week 8 tails                     at the W8 build, with the W8 focus          no
 11  engine chain 57 / 54 min W9-W10  accepted                                    no
```

## What the coder changes in PR #11

```
 3  POWER_EMOM reused: weeks 6, 9, 10 get the week 5 power EMOM unchanged (R-SP-05 style
    reuse). Weeks 7 and 8 keep the placeholder "Puissance à l'hôtel : à construire".
 4  travel weeks drop WALL BARS only. Hoops atoms stay in the reused cardio; the
    "atomes à remplacer" line names only what is really missing; equipment lists keep
    the hoops.
 5  R-WS-30 becomes "FOUR atoms maximum". Delete the exception list for the W5 Wednesday
    cardio (no longer needed). The reuse rule no longer removes a 4th atom.
 7  delete the heat line ("au-dessus de 28 °C ...") and any test that asserts it.
    The repeat rule R-WS-22 stays exactly as built before this CR.
    update the tests and add a section "Answers of 2 October" to APP_REPORT_013_v3.md
```

## Rule changes to fold in later (week 6 build)

```
 weekly_shape.md        v8   R-WS-30: four atoms maximum, exception line removed
 run_intervals          v5   heat clause removed from the adjustment rule
 season_plan.md         v4   travel PACK adds the hoops; NOT USED keeps wall bars only;
                             travel chain may use hoops; power block kept in the hotel
 ledger                      R-TL-11 four atoms maximum
```

## New change request number

```
 CR-019 [TOP]  power blocks for weeks 6 to 10: a dedicated power EMOM per week (home and
               hotel versions), written with the athlete before W7. Until then W6, W9, W10
               reuse the W5 power EMOM and W7-W8 show a placeholder.
```
