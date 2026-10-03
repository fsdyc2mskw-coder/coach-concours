# Rules: memory, the four game cards

version: 3 (2 October 2026). v2 (23 Sep) archived in `90_Archive/`.
Changes in v3, all the athlete's decisions of 2 October 2026:
· from week 5 every memory block is ONE GAME CARD of the memory game (CR-018);
· the four cards rotate in a 2-week cycle, one card per police session;
· the weekly recall check out of 33 (old R-MM-04) is replaced by the score of each card;
· a reminder to watch the official video, every 2 weeks;
· M4 (eyes closed) kept from week 9, after the card;
· M1, M2, M3 are retired as session content (the cards cover them); M5 stays unused.
The circuit layout used by the PLAN card is `floor_plan.md` v1.

## The four cards

```
 CARD          WHAT SHE DOES                                   SCORE
 PLAN          places the 11 stations in their dotted boxes   right boxes / 11
               on the room plan (floor_plan.md v1)
 ORDRE         drags the 11 stations onto the places 1 to 11   right places / 11
 QUI MANQUE    10 stations in order, one gap, 4 choices,       right answers / 3
               3 rounds
 RÈGLES        10 pictures (slalom, hoops, obstacle, nuts),    right answers / 10
               answers "correct" or "faux"
```

Each card starts fresh: no saved progress inside a game (the athlete's choice).

## The cycle (one card per police session, 2 per week)

```
 week   SKILL session (Thu)   CHAIN session (Fri)   extras
 W5     PLAN                  ORDRE                 video
 W6     QUI MANQUE            RÈGLES
 W7     PLAN                  ORDRE                 video
 W8     QUI MANQUE            RÈGLES
 W9     PLAN                  ORDRE                 video · M4 6 min
 W10    QUI MANQUE            RÈGLES                M4 6 min
 W11    PLAN (taper, Wed 18)  none                  video · M4 6 min
```

Week 4 is unchanged: it keeps its live memory block and its recall check out of 33.

## Rules

```
R-MM-01 | hard | One memory block per police session, at the start. From W5 it holds ONE game card (the cycle above), about 4 min; from W9 the card is followed by M4, 6 min eyes closed. The block never exceeds 12 min. | memory.card == CYCLE[week][session]; duration <= 12
R-MM-02 | hard | A card asks to place, order, recognise or judge correct / faux; it never asks to explain the circuit or a rule (10 Sep decision). | card.kind in {plan, order, missing, rules}
R-MM-03 | hard | The cycle repeats every 2 weeks: week A = PLAN (skill) + ORDRE (chain), week B = QUI MANQUE (skill) + RÈGLES (chain). W5, W7, W9, W11 are A weeks. | week odd → A
R-MM-04 | hard | From W5, every card records its own score (right answers out of its maximum) as the session's memory measure. It replaces the recall check out of 33. No target, no streak, no prediction. | memory.measure == card.score / card.max
R-MM-05 | hard | In the first police session of W5, W7, W9 and W11 the memory block shows one reminder line: "Regarde la vidéo officielle en entier (3 min 49)". She watches it on her own; nothing is scored or recorded. | video_reminder on first police session of odd weeks from W5
R-MM-06 | hard | M4 = full visualisation, eyes closed, about 6 min, from W9 to W11, after the card. Not scored. | M4 in weeks 9-11 only
R-MM-07 | hard | Any card can also be played freely from the app's memory home, at any time; free play records nothing. | free play → no measure
```

## Precedence until the week 5 build

This file wins over the memory column of `season_plan.md` v2 (M2 / M3 entries) and over the
4-6 min length in `weekly_shape.md` v6 R-WS-12, until `season_plan.md` v3 and `weekly_shape.md`
v7 fold this cycle in. M1 to M5 stay defined below, for history.

```
 M1 order and action · M2 done-when and what fails · M3 transitions
 M4 full visualisation, eyes closed (kept, R-MM-06) · M5 fatigued recall (unused since 22 Sep)
```
