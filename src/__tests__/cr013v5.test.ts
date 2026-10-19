// CHANGE_REQUEST_013 v5 — season_plan.md v4 (weeks 6 to 11), week 6 at the
// park, the ENCHAÎNEMENT, the GAP, the week 10 rematch.
//
// One describe block per item of the change request's own "Tests that must
// pass" list, in its order, then the "Expected behaviour" screens. References:
// `handoffs/CHANGE_REQUEST_013_v5_season_reshape_week6.md`,
// `handoffs/rules/season_plan.md` v4, `handoffs/WEEK_6_FINAL_2026-10-12_v2.md`
// (the week 6 fixture) and `handoffs/DECISIONS_SEASON_RESHAPE_2026-10-12_v3.md`.
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createElement } from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import CoachConcoursApp from '../CoachConcoursApp';
import { planWithMoves, withMove } from '../coach/dayMoves';
import { MEMORY_CYCLE } from '../coach/memoryCycle';
import { featuredCard, withMemoryVideo } from '../coach/memoryGame';
import { generatePlan, validateWeek } from '../coach/planner';
import { recipeById } from '../coach/recipes';
import {
  LOW_LUNG_SAFETY_LINE,
  REMATCH_LINE,
  TO_BUILD_PREFIX,
  enchainementGap
} from '../coach/seasonV4';
import {
  DAILY_BALANCE_LINE,
  SEASON_PLAN,
  SEASON_PLAN_V4,
  blockOfKind,
  drillsOf,
  isPoliceSession,
  memoryBlockOf,
  memoryShapeOf,
  type SeasonWeekV4
} from '../coach/sessionShapes';
import { checkWeek } from '../coach/weekChecker';
import { createInitialState } from '../infrastructure/coachStorage';
import { cardRef } from '../data/exerciseCards';
import type { ExerciseBlock, PlannedSession, SessionRecipe, SessionResult, StormSpec, TrainingWeek } from '../coach/types';

const weeks = generatePlan();
const WEEK_STARTS: Record<number, string> = {
  3: '2026-09-21', 4: '2026-09-28', 5: '2026-10-05', 6: '2026-10-12', 7: '2026-10-19',
  8: '2026-10-26', 9: '2026-11-02', 10: '2026-11-09', 11: '2026-11-16'
};
const weekIn = (list: readonly TrainingWeek[], n: number): TrainingWeek => list.find((week) => week.startDate === WEEK_STARTS[n])!;
const weekNo = (n: number): TrainingWeek => weekIn(weeks, n);
const on = (week: TrainingWeek, date: string): PlannedSession | undefined => week.sessions.find((item) => item.date === date);
const recipeOn = (week: TrainingWeek, date: string): SessionRecipe => recipeById[on(week, date)!.recipeId]!;
const textsOf = (recipe: SessionRecipe): string[] => [
  recipe.title, recipe.purpose, recipe.warmup ?? '', recipe.cooldown ?? '', recipe.notice ?? '',
  ...recipe.blocks.flatMap((block) => [block.title, block.faire, block.regle ?? '', block.noter ?? '', block.details ?? ''])
];
const blockTitles = (recipe: SessionRecipe): string[] => recipe.blocks.map((block) => block.title);

// ---------- 1. the table ----------

describe('CR-013 v5 — SEASON_PLAN_V4 reproduces the table of section A cell for cell', () => {
  //  wk  dates          load  Mon       Tue                Wed           Thu               Fri           Sat               Sun
  const expected: SeasonWeekV4[] = [
    { week: 6, startDate: '2026-10-12', endDate: '2026-10-18', load: 4, dailyLine: DAILY_BALANCE_LINE, days: { MON: { kind: 'crossfit_class' }, TUE: { kind: 'run_intervals', lowLung: true }, WED: { kind: 'skill_park' }, THU: { kind: 'crossfit_class' }, FRI: { kind: 'enchainement' }, SAT: { kind: 'trail_day' } } },
    // CHANGE_REQUEST_013 v6 — week 7 rebuilt (season_plan v5, WEEK_7_FINAL v3); cr013v6.test.ts holds its content.
    { week: 7, startDate: '2026-10-19', endDate: '2026-10-25', load: 3, dailyLine: DAILY_BALANCE_LINE, days: { MON: { kind: 'crossfit_class' }, TUE: { kind: 'skill_park' }, WED: { kind: 'run_intervals' }, THU: { kind: 'enchainement' }, FRI: { kind: 'skill_park' } }, dayNotes: { SUN: 'Vol vers Kingston · repos' } },
    { week: 8, startDate: '2026-10-26', endDate: '2026-11-01', load: 2, days: { TUE: { kind: 'travel_speed', optional: true }, THU: { kind: 'travel_mini_ench' }, SAT: { kind: 'travel_skill_kit' } } },
    { week: 9, startDate: '2026-11-02', endDate: '2026-11-08', load: 3, days: { TUE: { kind: 'easy_run' }, WED: { kind: 'easy_run' }, THU: { kind: 'skill_park' }, FRI: { kind: 'enchainement' }, SAT: { kind: 'crossfit_class' }, SUN: { kind: 'easy_run' } } },
    { week: 10, startDate: '2026-11-09', endDate: '2026-11-15', load: 5, days: { MON: { kind: 'crossfit_class' }, TUE: { kind: 'run_intervals', lowLung: true }, WED: { kind: 'enchainement' }, THU: { kind: 'skill_park' }, FRI: { kind: 'enchainement' }, SAT: { kind: 'trail_day' } } },
    { week: 11, startDate: '2026-11-16', endDate: '2026-11-20', load: 1, days: { MON: { kind: 'crossfit_class' }, TUE: { kind: 'run_intervals' }, WED: { kind: 'skill_park', offload: true }, FRI: { kind: 'police_event' } } }
  ];

  it('has exactly weeks 6 to 11, each equal to its row', () => {
    expect(Object.keys(SEASON_PLAN_V4).map(Number)).toEqual([6, 7, 8, 9, 10, 11]);
    for (const row of expected) expect(SEASON_PLAN_V4[row.week], `week ${row.week}`).toEqual(row);
  });

  it('the generated weeks follow it day for day, with the load of each kind', () => {
    const LOAD = { crossfit_class: 'hard', run_intervals: 'hard', skill_park: 'moderate', enchainement: 'hard', travel_speed: 'hard', travel_mini_ench: 'hard', travel_skill_kit: 'low', trail_day: 'moderate', easy_run: 'low', police_event: 'event' } as const;
    const days = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'] as const;
    for (const row of expected) {
      const week = weekNo(row.week);
      const want = days.flatMap((day, offset) => {
        const slot = row.days[day];
        if (!slot) return [];
        const date = new Date(Date.parse(`${row.startDate}T12:00:00Z`) + offset * 86_400_000).toISOString().slice(0, 10);
        return [[date, slot.kind, LOAD[slot.kind]]];
      });
      expect(week.sessions.map((item) => [item.date, item.kind, item.load]), `week ${row.week}`).toEqual(want);
      expect(week.sessions.every((item) => item.id === `${item.date}:${item.kind}`)).toBe(true);
      expect(validateWeek(week), `week ${row.week}`).toEqual([]);
    }
  });

  it('the display names, in French', () => {
    const titles = Object.fromEntries(weeks.slice(5).flatMap((week) => week.sessions.map((item) => [item.kind, recipeById[item.recipeId]!.title])));
    expect(titles).toMatchObject({
      skill_park: 'Compétences au parc',
      enchainement: 'Enchaînement',
      travel_speed: 'Voyage · Vitesse (T1)',
      travel_mini_ench: 'Voyage · Mini-enchaînement (T2)',
      travel_skill_kit: 'Voyage · Kit compétences (T3)',
      trail_day: 'Trail',
      easy_run: 'Footing facile'
    });
  });

  it('the week bar reads the v4 load; weeks 3 to 5 keep the v3 rows', () => {
    expect(Object.keys(SEASON_PLAN).map(Number)).toEqual([3, 4, 5]);
  });
});

// ---------- 2. weeks 3, 4, 5 unchanged ----------

describe('CR-013 v5 — weeks 3, 4 and 5 reproduce their locked files (fixtures unchanged)', () => {
  it('same session ids, recipe ids and loads as before v5', () => {
    expect([3, 4, 5].map((n) => weekNo(n).sessions.map((item) => [item.id, item.recipeId, item.load]))).toEqual([
      [
        ['2026-09-21:crossfit_class', 'crossfit-coached-v1', 'hard'],
        ['2026-09-22:run_intervals', 'run-intervals-v1-week-3', 'hard'],
        ['2026-09-24:skill_session', 'skill-session-v1-week-3', 'low'],
        ['2026-09-25:chain_session', 'chain-session-v1-week-3', 'hard'],
        ['2026-09-26:trail_maintenance', 'trail-maintenance-v1', 'moderate']
      ],
      [
        ['2026-09-28:crossfit_class', 'crossfit-coached-v1', 'hard'],
        ['2026-09-29:run_intervals', 'run-intervals-v1-week-4', 'hard'],
        ['2026-10-01:skill_session', 'skill-session-v2-week-4', 'moderate'],
        ['2026-10-02:chain_session', 'chain-session-v2-week-4', 'hard'],
        ['2026-10-03:trail_maintenance', 'trail-maintenance-v2-week-4', 'moderate']
      ],
      [
        ['2026-10-05:crossfit_class', 'crossfit-coached-v1', 'hard'],
        ['2026-10-06:run_intervals', 'run-intervals-v1-week-5', 'hard'],
        ['2026-10-07:skill_session', 'skill-session-v2-week-5', 'moderate'],
        ['2026-10-08:chain_session', 'chain-session-v3-week-5', 'hard'],
        ['2026-10-11:trail_event', 'trail-event-2026-10-11', 'event']
      ]
    ]);
  });

  it('the week 5 sessions are block for block what they were (titles)', () => {
    expect(blockTitles(recipeOn(weekNo(5), '2026-10-07'))).toEqual(['Mémoire · PLAN — 4 min', 'Corde à sauter — 18 min', 'Cardio, « Quatre coins » 30/15 — 10 min']);
    expect(blockTitles(recipeOn(weekNo(5), '2026-10-08'))).toEqual([
      'Référence fraîche — 2 min', 'Mémoire · ORDRE — 4 min', 'Puissance, EMOM 6 — 6 min',
      'Enchaînement B, la fin du test — 11 min', 'Cardio, « La montée », croissant — 10 min', 'Tail B — 4 min'
    ]);
    expect(recipeOn(weekNo(5), '2026-10-06').blocks[0]!.faire).toBe('3 × 4 min à 5:25 /km, récupération 3 min en trottinant');
  });
});

// ---------- 3. week 6 = WEEK_6_FINAL_2026-10-12_v2 ----------

describe('CR-013 v5 — week 6 reproduces WEEK_6_FINAL_2026-10-12_v2.md block for block', () => {
  const week = weekNo(6);

  it('Mon 12 and Thu 15 CrossFit (recorded only) · Sat 17 trail day · Sun 18 nothing', () => {
    for (const date of ['2026-10-12', '2026-10-15']) {
      expect(on(week, date)).toMatchObject({ kind: 'crossfit_class', status: 'coached', load: 'hard' });
      expect(recipeOn(week, date).blocks).toEqual([]);
    }
    expect(on(week, '2026-10-17')!.kind).toBe('trail_day');
    expect(on(week, '2026-10-18')).toBeUndefined();
  });

  it('Tue 13: 12 warm-up · 5 × 4 at 5:10, jog 2, rep 5 ≤ rep 1 + 5 s · 4 walk · low-lung 6 × 30 m (hold 10-15 m) · 8 cool-down, about 58 min', () => {
    const tuesday = recipeOn(week, '2026-10-13');
    expect(tuesday.warmup).toBe('12 min : 10 min de footing facile + 3 accélérations de 15 s.');
    expect(blockTitles(tuesday)).toEqual(['5 × 4 min à 5:10 — main set', 'Marche — 4 min', 'Sprints poumons vides, 6 × 30 m — 6 min']);
    expect(tuesday.blocks[0]!.faire).toBe('5 × 4 min à 5:10 /km, récupération 2 min en trottinant');
    expect(tuesday.blocks[0]!.regle).toBe('La répétition 5 pas plus lente que la répétition 1 + 5 s.');
    expect(tuesday.blocks[2]!.faire).toContain('cette semaine : tenir 10 à 15 m');
    expect(tuesday.cooldown).toBe('8 min : footing de retour au calme.');
    expect(tuesday.durationMin).toBe(58);
    // scores: 5 rep paces (the existing pace boxes) · effort · metres held (one number)
    expect(drillsOf(tuesday).map((drill) => [drill.drillId, drill.measure])).toEqual([['intervals:low_lung_metres', 'metres_held']]);
  });

  it('Wed 14, Compétences au parc: warm-up ~5 · QUI MANQUE 4 · obstacle 16 · bench 7 · racket 6 · hoops 6 · WILL 10 · cool-down 4', () => {
    const wednesday = recipeOn(week, '2026-10-14');
    expect(on(week, '2026-10-14')!.load).toBe('moderate');
    expect(wednesday.warmup).toBe('Échauffement ~5 min');
    expect(blockTitles(wednesday)).toEqual([
      'Mémoire · QUI MANQUE ? — 4 min', 'Obstacle, ton mur — 16 min', 'Équilibre sur banc avec balle — 7 min',
      'Raquette — 6 min', 'Cerceaux avec ballon — 6 min', 'Cardio, WILL 10 (Cross Ops) — 10 min'
    ]);
    expect(wednesday.cooldown).toBe('4 min : retour au calme.');
    expect(wednesday.durationMin).toBe(58);

    const [, obstacle, bench, racket, hoops, cardio] = wednesday.blocks as [ExerciseBlock, ExerciseBlock, ExerciseBlock, ExerciseBlock, ExerciseBlock, ExerciseBlock];
    expect(obstacle.faire).toContain('4 franchissements depuis la marche · 4 avec 5 m d’élan');
    expect(obstacle.faire).toContain('RYTHME OFFICIEL × 5 : chaque tour = 5 allers avec une balle de tennis déposée dans la « boîte rouge » (une casquette), 4 retours sans balle');
    expect(bench.faire).toContain('balle A au départ, balle B au bout');
    expect(racket.faire).toContain('seulement si le passage 2 = 0 chute');
    expect(hoops.faire).toContain('Départ vert + 5 cerceaux');
    expect(hoops.faire).toContain('5 à 6 passages');
    expect(cardio.faire).toBe('AMRAP 10 min : 3 burpees · 10 pompes · 10 squats.');
    expect(cardio.details).toContain('squats sautés');
    expect(cardio.spec).toMatchObject({ kind: 'cardio', format: 'amrap', durationMin: 10, target: null });

    // scores: rounds (0-5) · hesitations · touchdowns · drops per pass (3) · foot · hand errors · WILL 10 rounds
    expect(drillsOf(wednesday).map((drill) => [drill.drillId, drill.measure])).toEqual([
      ['memory:missing', 'memory_card'],
      ['skill:obstacle_rounds', 'rounds_done'], ['skill:obstacle_hesitations', 'hesitations'],
      ['skill:bench_touchdowns', 'touchdowns'],
      ['skill:racket_pass1', 'drops'], ['skill:racket_pass2', 'drops'], ['skill:racket_pass3', 'drops'],
      ['skill:hoops_foot_errors', 'foot_errors'], ['skill:hoops_hand_errors', 'hand_errors'],
      ['cardio:will10_rounds', 'rounds']
    ]);
    expect(obstacle.spec).toMatchObject({ kind: 'skill_block', stationId: 2 });
    expect(bench.spec).toMatchObject({ kind: 'skill_block', stationId: 9 });
  });

  it('Fri 16, Enchaînement: set-up 3 · warm-up ~5 + priming · fresh test · RÈGLES · storm 1 · tired 1 · rest 3 · storm 2 · tired 2 · cool-down 5', () => {
    const friday = recipeOn(week, '2026-10-16');
    expect(on(week, '2026-10-16')!.load).toBe('hard');
    expect(friday.warmup).toBeNull();
    expect(blockTitles(friday)).toEqual([
      'Mise en place — 3 min', 'Échauffement ~5 min + priming', 'Test à froid — 3 min', 'Mémoire · RÈGLES — 4 min',
      'Tempête 1 · « ACHERON PARK » — 7 min', 'Test fatigué 1 — 3 min', 'Repos — 3 min',
      'Tempête 2 · « DEATH BY OBSTACLE » — 7 min', 'Test fatigué 2 — 3 min'
    ]);
    expect(friday.blocks[1]!.faire).toBe('Échauffement ~5 min · priming : 2 × 10 s de sprint à plat · 3 sauts en longueur.');
    expect(friday.blocks[4]!.faire).toContain('burpees qui montent : tour 1 = 2, tour 2 = 4, tour 3 = 6, tour 4 = 8, tour 5 = 10…');
    expect(friday.blocks[5]!.faire).toMatch(/^Dans les 30 s après la tempête/);
    expect(friday.blocks[7]!.faire).toContain('Minute n = n franchissements de l’obstacle + n burpees + n tirages sous la barre');
    expect(friday.blocks[7]!.faire).toContain('répéter le dernier niveau terminé');
    // the rules shown on both storms
    for (const index of [4, 7]) {
      expect(friday.blocks[index]!.regle).toMatch(/^Franchissement brouillon → 2 box jumps sur le bloc bas pour le reste de la tempête/);
      expect(friday.blocks[index]!.details).toContain('Burpees poitrine au sol, expirer en poussant · tirages corps droit, poitrine à la barre.');
      expect(friday.blocks[index]!.regle).toContain('ça vacille sur le banc → descendre exprès');
      expect(friday.blocks[index]!.regle).toContain('vertige → stop, marcher, ça compte quand même');
    }
    expect(friday.cooldown).toBe('5 min : marcher, mollets, hanches, 5 respirations lentes avec une longue expiration.');
    // scores: both storm scores · box jumps used · hoops and bench FRESH, TIRED 1, TIRED 2
    expect(drillsOf(friday).map((drill) => drill.drillId)).toEqual([
      'fresh:hoops', 'fresh:bench_ball', 'memory:rules',
      'storm1:acheron_lap', 'storm1:acheron_burpees', 'storm1:box_jumps_used',
      'tired1:hoops', 'tired1:bench_ball',
      'storm2:death_minute', 'storm2:box_jumps_used',
      'tired2:hoops', 'tired2:bench_ball'
    ]);
  });

  it('the daily line sits on the week, not in a session', () => {
    expect(SEASON_PLAN_V4[6]!.dailyLine).toBe('2 min d\'équilibre sur une jambe pendant le brossage des dents');
    for (const session of week.sessions) expect(textsOf(recipeById[session.recipeId]!).join(' ')).not.toContain('brossage');
  });

  it('every suggested drill id of section D exists, stored in drillScores', () => {
    const ids = new Set([...drillsOf(recipeOn(week, '2026-10-13')), ...drillsOf(recipeOn(week, '2026-10-14')), ...drillsOf(recipeOn(week, '2026-10-16'))].map((drill) => drill.drillId));
    for (const id of ['fresh:hoops', 'tired1:hoops', 'tired2:hoops', 'fresh:bench_ball', 'tired1:bench_ball', 'tired2:bench_ball',
      'storm1:acheron_lap', 'storm1:acheron_burpees', 'storm2:death_minute', 'skill:obstacle_rounds', 'skill:obstacle_hesitations',
      'cardio:will10_rounds', 'intervals:low_lung_metres']) expect(ids, id).toContain(id);
  });

  it('the new cards and blocks are registered (index of 12 October)', () => {
    for (const id of ['S02_obstacle_wall_official', 'S09_bench_walk_with_ball', 'S00_full_burpee', 'S00_bar_row', 'S00_low_lung_sprint', 'BLK_will_10', 'BLK_acheron_park', 'BLK_death_by_obstacle']) {
      expect(() => cardRef(id), id).not.toThrow();
    }
  });
});

// ---------- 4. CrossFit days ----------

describe('CR-013 v5 — W6 Saturday has no CrossFit; W9 Monday has no CrossFit; W9 Saturday has CrossFit', () => {
  it('the three cells', () => {
    expect(on(weekNo(6), '2026-10-17')!.kind).toBe('trail_day');
    expect(weekNo(6).sessions.filter((item) => item.kind === 'crossfit_class').map((item) => item.date)).toEqual(['2026-10-12', '2026-10-15']);
    expect(on(weekNo(9), '2026-11-02')).toBeUndefined();
    expect(on(weekNo(9), '2026-11-07')).toMatchObject({ kind: 'crossfit_class', status: 'coached', load: 'hard' });
  });
});

// ---------- 5. the enchaînement ----------

describe('CR-013 v5 — enchaînement: two storms, three tests, not flagged for two hard blocks', () => {
  const friday = recipeOn(weekNo(6), '2026-10-16');
  const storms = friday.blocks.filter((block) => block.kind === 'storm').map((block) => block.spec as StormSpec);

  it('two storms of 7 min with 3 atoms each (R-TL-11), three tests in order', () => {
    expect(storms.map((storm) => [storm.storm, storm.card.cardId, storm.durationMin, storm.atoms.map((atom) => atom.cardId)])).toEqual([
      [1, 'BLK_acheron_park', 7, ['S01_slalom_18m', 'S02_obstacle_wall_official', 'S00_full_burpee']],
      [2, 'BLK_death_by_obstacle', 7, ['S02_obstacle_wall_official', 'S00_full_burpee', 'S00_bar_row']]
    ]);
    const tests = friday.blocks.filter((block) => block.spec?.kind === 'skill_test').map((block) => (block.spec as { moment: string }).moment);
    expect(tests).toEqual(['fresh', 'tired1', 'tired2']);
  });

  it('the week validates clean: no "one hard block" check, no dose cut', () => {
    const errors = validateWeek(weekNo(6));
    expect(errors).toEqual([]);
    expect(errors.some((error) => /bloc dur|R-TL-04/.test(error))).toBe(false);
    expect(on(weekNo(6), '2026-10-16')!.volumeFactor).toBe(1);
  });

  it('R-SP-08: a hard Monday class does not cut the enchaînement or the WOD (volumeFactor stays 1)', () => {
    const results: Record<string, SessionResult> = {
      '2026-10-12:crossfit_class': { sessionId: '2026-10-12:crossfit_class', status: 'done', effort: 5, note: '', overlapTags: ['heavy_legs'], completedAt: '2026-10-12T19:00:00Z' }
    };
    const week = weekIn(generatePlan(results), 6);
    expect(week.sessions.every((item) => item.volumeFactor === 1)).toBe(true);
    expect(week.sessions.some((item) => item.adaptationNote)).toBe(false);
  });

  it('is enforced: a storm with five atoms, or the tests out of order, is flagged', () => {
    const recipe = recipeOn(weekNo(6), '2026-10-16');
    const original = recipe.blocks;
    try {
      recipe.blocks = original.map((block) => (block.spec?.kind === 'storm' && block.spec.storm === 2
        ? { ...block, spec: { ...block.spec, atoms: [...block.spec.atoms, cardRef('S00_air_squats'), cardRef('S00_jump_squats')] } }
        : block));
      expect(validateWeek(weekNo(6)).some((error) => error.includes('R-TL-11'))).toBe(true);
      recipe.blocks = [original[0]!, original[1]!, original[3]!, original[4]!, original[2]!, ...original.slice(5)];
      expect(validateWeek(weekNo(6)).some((error) => error.includes('R-SP-11'))).toBe(true);
    } finally {
      recipe.blocks = original;
    }
  });
});

// ---------- 6. trail day and warm-ups ----------

describe('CR-013 v5 — trail_day shows no distance; warm-ups are one line in W6+', () => {
  it('every trail day is the label "Trail" and nothing else (R-SP-10)', () => {
    const trails = weeks.slice(5).flatMap((week) => week.sessions.filter((item) => item.kind === 'trail_day'));
    // CHANGE_REQUEST_013 v6 — the optional week 7 Sunday trail is gone (flight).
    expect(trails.map((item) => item.date)).toEqual(['2026-10-17', '2026-11-14']);
    for (const session of trails) {
      const recipe = recipeById[session.recipeId]!;
      expect(recipe.title).toBe('Trail');
      expect(recipe.blocks).toEqual([]);
      expect(recipe.durationMin).toBeNull();
      expect(recipe.warmup).toBeNull();
      expect(textsOf(recipe).join(' ')).not.toMatch(/\d+\s*km|D\+/);
    }
  });

  it('warm-ups are one line, "Échauffement ~5 min" on the park sessions (R-SP-09)', () => {
    for (const week of weeks.slice(5)) {
      for (const session of week.sessions) {
        const recipe = recipeById[session.recipeId]!;
        const warmups = [recipe.warmup, ...recipe.blocks.filter((block) => block.kind === 'warmup').map((block) => block.faire)].filter((text): text is string => Boolean(text));
        for (const text of warmups) expect(text, session.id).not.toMatch(/\n/);
        if (session.kind === 'skill_park' || session.kind === 'enchainement') for (const text of warmups) expect(text, session.id).toMatch(/^Échauffement ~5 min/);
      }
    }
  });

  it('is enforced: a two-line warm-up is flagged', () => {
    const recipe = recipeOn(weekNo(6), '2026-10-14');
    const original = recipe.warmup;
    try {
      recipe.warmup = 'Échauffement ~5 min\n3 min de footing';
      expect(validateWeek(weekNo(6)).some((error) => error.includes('R-SP-09'))).toBe(true);
    } finally {
      recipe.warmup = original;
    }
  });
});

// ---------- 7. the named gaps of weeks 7 to 11 ----------

describe('CR-013 v5 — W7-W11 sessions other than W10 Friday show "Contenu à construire" and no copied content', () => {
  const contentKinds = ['skill_park', 'enchainement', 'travel_speed', 'travel_mini_ench', 'travel_skill_kit', 'easy_run'];
  const week6Texts = new Set(weekNo(6).sessions.flatMap((session) => recipeById[session.recipeId]!.blocks
    .filter((block) => block.kind !== 'memory')
    .flatMap((block) => [block.title, block.faire, block.regle, block.noter, block.details].filter(Boolean) as string[])));

  it('each one: its kind, its day, the memory card of the cycle when it is a police session, and the named gap', () => {
    let count = 0;
    // CHANGE_REQUEST_013 v6 — week 7 has its content (cr013v6.test.ts).
    for (const n of [8, 9, 10, 11]) {
      for (const session of weekNo(n).sessions) {
        if (!contentKinds.includes(session.kind)) continue;
        if (session.id === '2026-11-13:enchainement') continue; // the rematch (section E)
        count += 1;
        const recipe = recipeById[session.recipeId]!;
        const gap = recipe.blocks.filter((block) => block.kind === 'to_build');
        expect(gap.map((block) => block.title), session.id).toEqual([`${TO_BUILD_PREFIX} (semaine ${n})`]);
        expect(gap[0]!.faire).toBe('À construire dans Cowork.');
        expect(recipe.blocks.every((block) => block.kind === 'to_build' || block.kind === 'memory'), session.id).toBe(true);
        expect(recipe.blocks.some((block) => block.kind === 'memory'), session.id).toBe(isPoliceSession(session.kind));
        expect(drillsOf(recipe).every((drill) => drill.measure === 'memory_card'), session.id).toBe(true);
        for (const text of textsOf(recipe)) expect(week6Texts.has(text), `${session.id}: ${text}`).toBe(false);
      }
    }
    expect(count).toBe(11); // W8 3 · W9 5 · W10 2 · W11 1
  });

  it('CrossFit stays the coach’s class, the W10 and W11 Tuesdays carry the values of section C, the test stays fixed', () => {
    expect(on(weekNo(11), '2026-11-20')).toMatchObject({ id: '2026-11-20:police_event', status: 'fixed_event', load: 'event' });
    expect(recipeOn(weekNo(11), '2026-11-18').notice).toBe('Semaine d’allègement.');
  });

  it('is enforced: week 6 content copied into a week 8 session is flagged (R-SP-03)', () => {
    const recipe = recipeOn(weekNo(8), '2026-10-31');
    const original = recipe.blocks;
    try {
      recipe.blocks = [...original, recipeOn(weekNo(6), '2026-10-14').blocks[1]!];
      expect(validateWeek(weekNo(8)).some((error) => error.includes('R-SP-03'))).toBe(true);
    } finally {
      recipe.blocks = original;
    }
  });

  it('W8 "opt" is marked optional and never counts as missed (v6: the W7 optional trail is gone)', () => {
    expect(recipeOn(weekNo(8), '2026-10-27').optional).toBe(true);
    const optional = weeks.slice(5).flatMap((week) => week.sessions).filter((item) => recipeById[item.recipeId]!.optional).map((item) => item.id);
    expect(optional).toEqual(['2026-10-27:travel_speed']);
  });
});

// ---------- 8. the GAP ----------

describe('CR-013 v5 — the GAP is computed from drillScores; no new stored field', () => {
  const scores = [
    { drillId: 'fresh:hoops', value: 1 }, { drillId: 'tired1:hoops', value: 3 }, { drillId: 'tired2:hoops', value: 4 },
    { drillId: 'fresh:bench_ball', value: 0 }, { drillId: 'tired1:bench_ball', value: 2 }
  ];

  it('tired minus fresh, per skill and per storm', () => {
    expect(enchainementGap(scores)).toEqual([
      { skill: 'hoops', label: 'Cerceaux', unit: 'erreurs', fresh: 1, tired1: 3, gap1: 2, tired2: 4, gap2: 3 },
      { skill: 'bench_ball', label: 'Banc avec balle', unit: 'touchers', fresh: 0, tired1: 2, gap1: 2 }
    ]);
  });

  it('nothing until a fresh test and a tired test hold a number', () => {
    expect(enchainementGap([{ drillId: 'tired1:hoops', value: 3 }])).toEqual([]);
    expect(enchainementGap([{ drillId: 'fresh:hoops', value: 3 }])).toEqual([]);
    expect(enchainementGap(undefined)).toEqual([]);
  });

  it('no stored field was added: SessionResult and CoachState are as before v5', () => {
    const types = readFileSync(resolve(__dirname, '../coach/types.ts'), 'utf8');
    const block = (name: string) => types.slice(types.indexOf(`export interface ${name} {`), types.indexOf('\n}\n', types.indexOf(`export interface ${name} {`)));
    expect(block('SessionResult')).not.toMatch(/gap|storm|lowLung|enchainement/i);
    expect(block('CoachState')).not.toMatch(/gap|storm|lowLung|enchainement/i);
    expect(block('DrillScore')).not.toMatch(/gap/i);
  });
});

// ---------- 9. the Tuesday ----------

describe('CR-013 v5 — W6 Tuesday shows 5 × 4 @ 5:10, jog 2, and the low-lung block with its safety line', () => {
  it('week 6', () => {
    const tuesday = recipeOn(weekNo(6), '2026-10-13');
    const lowLung = blockOfKind(tuesday, 'low_lung')!;
    expect(tuesday.blocks.indexOf(lowLung)).toBe(tuesday.blocks.length - 1);
    expect(lowLung.regle).toBe(LOW_LUNG_SAFETY_LINE);
    expect(LOW_LUNG_SAFETY_LINE).toBe('jamais d\'hyperventilation avant · stop si vertige · loin de la circulation');
    expect(lowLung.faire).toContain('Expirer à fond, sprinter 30 m sans inspirer');
  });

  it('W10: 4 × 3 at 5:15, jog 2, + low-lung; W11: 4 × 1 at 5:00, jog 2, no low-lung; W7-W9: no intervals', () => {
    const w10 = recipeOn(weekNo(10), '2026-11-10');
    expect(w10.blocks[0]!.faire).toBe('4 × 3 min à 5:15 /km, récupération 2 min en trottinant');
    expect(blockOfKind(w10, 'low_lung')!.regle).toBe(LOW_LUNG_SAFETY_LINE);
    const w11 = recipeOn(weekNo(11), '2026-11-17');
    expect(w11.blocks.map((block) => block.faire)).toEqual(['4 × 1 min à 5:00 /km, récupération 2 min en trottinant']);
    // CHANGE_REQUEST_013 v6 — week 7 Wednesday is the Luc Léger test + intervals.
    for (const n of [8, 9]) expect(weekNo(n).sessions.some((item) => item.kind === 'run_intervals'), `week ${n}`).toBe(false);
  });

  it('volumeFactor never changes reps, length or pace (R-WS-20)', () => {
    for (const n of [6, 10, 11]) expect(weekNo(n).sessions.find((item) => item.kind === 'run_intervals')!.volumeFactor).toBe(1);
  });
});

// ---------- 10. three hard days ----------

describe('CR-013 v5 — three hard days are flagged, never blocked (R-SP-13)', () => {
  it('week 10, Mon CrossFit · Tue intervals · Wed enchaînement: flagged amber, not a validation error', () => {
    const flags = checkWeek(weekNo(10)).filter((flag) => flag.code === 'C2');
    expect(flags).toHaveLength(1);
    expect(flags[0]!.hard).toBe(false);
    expect(flags[0]!.text).toContain('R-SP-13');
    expect(validateWeek(weekNo(10))).toEqual([]);
  });

  it('a move that makes three hard days in week 6 is kept and flagged', () => {
    const moved = planWithMoves({}, withMove([], '2026-10-16:enchainement', '2026-10-14'));
    const week = weekIn(moved, 6);
    expect(week.sessions.filter((item) => item.date === '2026-10-14').map((item) => item.id)).toContain('2026-10-16:enchainement');
    expect(checkWeek(week).some((flag) => flag.code === 'STACK')).toBe(true);
    const swapped = planWithMoves({}, withMove(withMove([], '2026-10-16:enchainement', '2026-10-14'), '2026-10-14:skill_park', '2026-10-16'));
    const flags = checkWeek(weekIn(swapped, 6));
    expect(flags.some((flag) => flag.code === 'C2' && !flag.hard)).toBe(true);
  });
});

// ---------- 11. no official time, no mock test ----------

describe('CR-013 v5 — no text predicts an official time; no full mock test', () => {
  it('across every generated session', () => {
    for (const week of weeks) {
      for (const session of week.sessions) {
        expect(session.kind).not.toMatch(/mock/);
        for (const text of textsOf(recipeById[session.recipeId]!)) {
          expect(text).not.toMatch(/6:15|6’15|temps officiel|chrono officiel|prédi|test blanc|simulation complète|circuit complet/i);
        }
      }
    }
  });
});

// ---------- the memory cycle (KEEP) ----------

describe('CR-013 v5 — the CR-018 cycle is kept on the v4 police sessions', () => {
  it('police sessions from W6 are skill_park, enchainement, travel_mini_ench, travel_skill_kit', () => {
    const kinds = new Set(weeks.slice(5).flatMap((week) => week.sessions.filter((item) => isPoliceSession(item.kind)).map((item) => item.kind)));
    expect([...kinds].sort()).toEqual(['enchainement', 'skill_park', 'travel_mini_ench', 'travel_skill_kit']);
    for (let n = 6; n <= 11; n += 1) {
      if (n === 7) continue; // CHANGE_REQUEST_013 v6 — no memory slot in WEEK_7_FINAL v3.
      for (const session of weekNo(n).sessions.filter((item) => isPoliceSession(item.kind))) {
        const side = memoryShapeOf(session.kind) === 'skill_session' ? 'skill' : 'chain';
        expect(memoryBlockOf(recipeById[session.recipeId]!)!.game!.card, session.id).toBe(MEMORY_CYCLE[n]![side]);
      }
    }
  });

  it('the video line rides on the first police session of weeks 9 and 11 (v6: week 7 has no memory block)', () => {
    const firstWithVideo = (n: number) => weekNo(n).sessions.filter((item) => isPoliceSession(item.kind))
      .filter((item) => memoryBlockOf(withMemoryVideo(recipeById[item.recipeId]!, item.id, weeks))?.game?.video).map((item) => item.id);
    expect(firstWithVideo(6)).toEqual([]);
    expect(firstWithVideo(7)).toEqual([]);
    expect(firstWithVideo(9)).toEqual(['2026-11-05:skill_park']);
    expect(firstWithVideo(11)).toEqual(['2026-11-18:skill_park']);
  });

  it('the MÉMOIRE home features week 6’s first card due', () => {
    expect(featuredCard(weeks, {}, '2026-10-13')).toBe('missing');
  });
});

// ---------- the screens: expected behaviour ----------

describe('CR-013 v5 — the screens', () => {
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    localStorage.clear();
  });

  async function openWeek(today: string, results: Record<string, SessionResult> = {}) {
    localStorage.clear();
    if (Object.keys(results).length) {
      localStorage.setItem('coach-concours-state-v2', JSON.stringify({ storageVersion: 2, savedAt: 1, state: { ...createInitialState(), results } }));
    }
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(`${today}T12:00:00Z`));
    const view = render(createElement(CoachConcoursApp));
    await screen.findByText(/Séances/);
    return view.container;
  }

  async function openCard(sessionId: string) {
    const card = document.querySelector(`[data-card="${sessionId}"]`) as HTMLButtonElement;
    fireEvent.click(card);
    await screen.findByText('Ton programme');
  }

  const dayTexts = (container: HTMLElement) => Array.from(container.querySelectorAll('.slot')).map((slot) => [slot.getAttribute('data-slot'), slot.textContent]);

  it('week 6: the daily line, the load bar, the seven days as written', async () => {
    const container = await openWeek('2026-10-12');
    expect(container.querySelector('.daily')!.textContent).toContain('2 min d\'équilibre sur une jambe pendant le brossage des dents');
    expect(container.querySelector('.weekbar')!.getAttribute('aria-label')).toBe('Charge de la semaine : 4 sur 5');
    const days = Object.fromEntries(dayTexts(container));
    expect(days['2026-10-13']).toContain('Intervalles course');
    expect(days['2026-10-14']).toContain('Compétences au parc');
    expect(days['2026-10-15']).toContain('CrossFit coaché');
    expect(days['2026-10-16']).toContain('Enchaînement');
    expect(days['2026-10-17']).toMatch(/^🏃Trail···$/);
    expect(days['2026-10-18']).toBe('Repos');
  });

  it('Tue 13 Oct: 5 × 4 at 5:10, then the low-lung sprints with the safety line; Retour asks 5 paces and the metres held', async () => {
    await openWeek('2026-10-12');
    await openCard('2026-10-13:run_intervals');
    expect(screen.getByText('5 × 4 min à 5:10 /km, récupération 2 min en trottinant')).toBeTruthy();
    expect(screen.getAllByText(/Sprints poumons vides, 6 × 30 m/).length).toBeGreaterThan(0);
    fireEvent.click(screen.getByText('Retour'));
    expect(await screen.findByLabelText('Rép 5')).toBeTruthy();
    expect(screen.queryByLabelText('Rép 6')).toBeNull();
    expect(screen.getByLabelText('Mètres tenus sans respirer')).toBeTruthy();
  });

  it('Fri 16 Oct reads « à bloc »; after the fresh and tired scores the GAP is shown, computed', async () => {
    await openWeek('2026-10-12');
    await openCard('2026-10-16:enchainement');
    expect(screen.getByText(/Intensité : à bloc/)).toBeTruthy();
    fireEvent.click(screen.getByText('Retour'));
    const type = (label: string, value: string) => fireEvent.change(screen.getByLabelText(label), { target: { value } });
    type('Cerceaux — erreurs, à froid', '1');
    type('Banc avec balle — touchers, à froid', '0');
    type('Cerceaux — erreurs, fatigué 1', '3');
    type('Banc avec balle — touchers, fatigué 1', '2');
    type('Cerceaux — erreurs, fatigué 2', '4');
    expect(await screen.findByText('Écart · Cerceaux : +2 erreurs · calculé')).toBeTruthy();
    expect(screen.getByText('Écart · Banc avec balle : +2 touchers · calculé')).toBeTruthy();
    expect(screen.getByText('Écart · Cerceaux : +3 erreurs · calculé')).toBeTruthy();
    // the GAP is text, never a box to type into
    expect(screen.queryAllByLabelText(/Écart/).some((node) => node.tagName === 'INPUT')).toBe(false);
    fireEvent.click(screen.getByRole('group', { name: 'Box jumps utilisés — tempête 1' }).querySelector('button')!);

    vi.useRealTimers();
    await new Promise((done) => setTimeout(done, 700));
    const stored = JSON.parse(localStorage.getItem('coach-concours-state-v2')!).state.results['2026-10-16:enchainement'] as SessionResult;
    expect(stored.drillScores!.map((score) => [score.drillId, score.value])).toEqual([
      ['fresh:hoops', 1], ['fresh:bench_ball', 0], ['storm1:box_jumps_used', 1],
      ['tired1:hoops', 3], ['tired1:bench_ball', 2], ['tired2:hoops', 4]
    ]);
    // nothing but the existing fields
    expect(Object.keys(stored).sort()).toEqual(['completedAt', 'drillScores', 'note', 'sessionId', 'status']);
  });

  // CHANGE_REQUEST_013 v6 — week 7 is now WEEK_7_FINAL v3: the week 8
  // travel placeholders keep this check (cr013v6.test.ts holds week 7).
  it('week 8: the travel placeholders, Tuesday optional', async () => {
    const container = await openWeek('2026-10-26');
    const days = Object.fromEntries(dayTexts(container));
    expect(days['2026-10-26']).toBe('Repos');
    expect(days['2026-10-27']).toContain('Voyage · Vitesse (T1)');
    expect(days['2026-10-27']).toContain('optionnel');
    expect(days['2026-10-29']).toContain('Voyage · Mini-enchaînement (T2)');
    expect(days['2026-10-31']).toContain('Voyage · Kit compétences (T3)');
    for (const date of ['2026-10-27', '2026-10-29', '2026-10-31']) expect(days[date]).toContain('contenu à construire');
    // the optional Tuesday never counts as missed
    expect(container.querySelector('.prog b')!.textContent).toBe('Séances 0/2');
  });

  it('week 9: Monday empty, Tuesday and Wednesday easy runs, Saturday CrossFit', async () => {
    const container = await openWeek('2026-11-02');
    const days = Object.fromEntries(dayTexts(container));
    expect(days['2026-11-02']).toBe('Repos');
    expect(days['2026-11-03']).toContain('Footing facile');
    expect(days['2026-11-04']).toContain('Footing facile');
    expect(days['2026-11-07']).toContain('CrossFit coaché');
  });

  it('week 10 Friday shows the W6 storms with « Revanche » and the week 6 scores beside the boxes', async () => {
    const results: Record<string, SessionResult> = {
      '2026-10-16:enchainement': {
        sessionId: '2026-10-16:enchainement', status: 'done', effort: 5, note: '', completedAt: '2026-10-16T18:00:00Z',
        drillScores: [{ drillId: 'storm1:acheron_lap', measure: 'last_lap', value: 4 }, { drillId: 'storm2:death_minute', measure: 'highest_minute', value: 5 }]
      }
    };
    await openWeek('2026-11-09', results);
    await openCard('2026-11-13:enchainement');
    expect(screen.getByText(REMATCH_LINE)).toBeTruthy();
    expect(screen.getAllByText(/Tempête 1 · « ACHERON PARK »/).length).toBeGreaterThan(0);
    fireEvent.click(screen.getByText('Retour'));
    const lapBox = await screen.findByLabelText('Dernier tour atteint — ACHERON PARK');
    expect(lapBox.closest('div')!.textContent).toContain('Semaine 6 : 4');
    expect(screen.getByLabelText('Plus haute minute terminée — DEATH BY OBSTACLE').closest('div')!.textContent).toContain('Semaine 6 : 5');
  });

  it('week 6 Saturday: « Trail » with no distance anywhere on its screen', async () => {
    await openWeek('2026-10-12');
    await openCard('2026-10-17:trail_day');
    const panel = document.querySelector('.panel')!.textContent ?? '';
    expect(panel).not.toMatch(/km|D\+/);
  });
});
