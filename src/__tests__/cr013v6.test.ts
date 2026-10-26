// CHANGE_REQUEST_013 v6 — week 7 (Bordeaux): the single-circuit
// enchaînement, the Luc Léger test, weeks 3 to 6 and 8 to 11 untouched.
//
// One describe block per item of the change request's own "Tests that must
// pass" list, in its order, then the "Expected behaviour" screens. References:
// `handoffs/CHANGE_REQUEST_013_v6_week7_bordeaux.md`,
// `handoffs/WEEK_7_FINAL_2026-10-19_v3.md` (the week 7 fixture),
// `handoffs/rules/season_plan.md` v5 and `handoffs/rules/test_battery.md` v3.
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createElement } from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import CoachConcoursApp from '../CoachConcoursApp';
import { generatePlan, validateWeek } from '../coach/planner';
import { recipeById } from '../coach/recipes';
import {
  AFTER_MAX_TEST_LINE,
  BACKUP_BENCH,
  BACKUP_LUC_LEGER,
  BACKUP_OBSTACLE,
  BACKUP_ROWS,
  WEEK7_THURSDAY_NOTICE,
  enchainementGap,
  isCircuitEnchainement,
  lucLegerVmaKmh,
  lucLegerVmaOf,
  missedReps
} from '../coach/seasonV4';
import { DAILY_BALANCE_LINE, SEASON_PLAN_V4, WEEK7_SUNDAY_NOTE, drillsOf, memoryBlockOf } from '../coach/sessionShapes';
import { checkWeek } from '../coach/weekChecker';
import type { CircuitSpec, PlannedSession, SessionRecipe, SessionResult, TrainingWeek } from '../coach/types';

const weeks = generatePlan();
const WEEK_STARTS: Record<number, string> = {
  3: '2026-09-21', 4: '2026-09-28', 5: '2026-10-05', 6: '2026-10-12', 7: '2026-10-19',
  8: '2026-10-26', 9: '2026-11-02', 10: '2026-11-09', 11: '2026-11-16'
};
const weekNo = (n: number): TrainingWeek => weeks.find((week) => week.startDate === WEEK_STARTS[n])!;
const on = (week: TrainingWeek, date: string): PlannedSession | undefined => week.sessions.find((item) => item.date === date);
const recipeOn = (week: TrainingWeek, date: string): SessionRecipe => recipeById[on(week, date)!.recipeId]!;
const textsOf = (recipe: SessionRecipe): string[] => [
  recipe.title, recipe.purpose, recipe.warmup ?? '', recipe.cooldown ?? '', recipe.notice ?? '',
  ...recipe.blocks.flatMap((block) => [block.title, block.faire, block.regle ?? '', block.noter ?? '', block.details ?? ''])
];
const blockTitles = (recipe: SessionRecipe): string[] => recipe.blocks.map((block) => block.title);
const drillIds = (recipe: SessionRecipe): string[] => drillsOf(recipe).map((drill) => drill.drillId);

const W7 = () => weekNo(7);
const mon = () => recipeOn(W7(), '2026-10-19');
const tue = () => recipeOn(W7(), '2026-10-20');
const wed = () => recipeOn(W7(), '2026-10-21');
const thu = () => recipeOn(W7(), '2026-10-22');
const fri = () => recipeOn(W7(), '2026-10-23');

// ---------- 1. week 7 reproduces WEEK_7_FINAL v3 block for block ----------

describe('CR-013 v6 — week 7 reproduces WEEK_7_FINAL_2026-10-19_v3.md block for block', () => {
  it('the skeleton: Mon CrossFit · Tue skill · Wed Luc Léger + intervals · Thu enchaînement · Fri skill · Sat rest · Sun flight note', () => {
    expect(W7().sessions.map((item) => [item.id, item.load])).toEqual([
      ['2026-10-19:crossfit_class', 'hard'],
      ['2026-10-20:skill_park', 'moderate'],
      ['2026-10-21:run_intervals', 'hard'],
      ['2026-10-22:enchainement', 'hard'],
      ['2026-10-23:skill_park', 'moderate']
    ]);
    expect(SEASON_PLAN_V4[7]!.load).toBe(3);
    expect(SEASON_PLAN_V4[7]!.dailyLine).toBe(DAILY_BALANCE_LINE);
    expect(SEASON_PLAN_V4[7]!.dayNotes).toEqual({ SUN: 'Vol vers Kingston · repos' });
    expect(on(W7(), '2026-10-24')).toBeUndefined();
    expect(on(W7(), '2026-10-25')).toBeUndefined();
    expect(validateWeek(W7())).toEqual([]);
  });

  it('Mon 19: the coach’s class, jumps adapted, recorded only', () => {
    expect(mon().kind).toBe('crossfit_class');
    expect(`${mon().title} · ${mon().notice}`).toBe('Cours CrossFit · Adapter les sauts (trail de 20 km samedi).');
    expect(mon().blocks).toEqual([]);
  });

  it('Tue 20: Compétences courtes · parc, about 40 min: bench with ball 10 · racket in balance 10 · WILL 10', () => {
    const recipe = tue();
    expect(recipe.title).toBe('Compétences courtes · parc');
    expect(recipe.durationMin).toBe(40);
    expect(recipe.warmup).toBe('Échauffement ~5 min · repérer pour jeudi : muret plat (banc), mur ou banc à hauteur de poitrine (obstacle), barre hanches-poitrine (tirages) ; pour mercredi : une ligne plate de 20 m.');
    expect(blockTitles(recipe)).toEqual(['Équilibre sur banc avec balle — 10 min', 'Raquette en équilibre — 10 min', 'Cardio, WILL 10 (Cross Ops) — 10 min']);
    expect(recipe.blocks[0]!.faire).toBe('Muret plat ou bordure : marches, demi-tours, échanges officiels.');
    expect(recipe.blocks[0]!.details).toBe(BACKUP_BENCH);
    expect(recipe.blocks[1]!.faire).toBe('Autour de 5-6 obstacles, puis le long du muret plat.');
    expect(recipe.blocks[2]!.faire).toBe('AMRAP 10 min : 3 burpees · 10 pompes · 10 squats.');
    expect(recipe.blocks[2]!.spec).toMatchObject({ kind: 'cardio', format: 'amrap', target: null });
    expect(drillIds(recipe)).toEqual(['skill:bench_ball_falls', 'skill:bench_ball_turn', 'skill:racket_balance_drops', 'cardio:will10_rounds']);
  });

  it('Wed 21: Test Luc Léger + fractionné, about 70 min: the test first, 10 min recovery, 4 × 4 at 5:10 (5th optional)', () => {
    const recipe = wed();
    expect(recipe.title).toBe('Test Luc Léger + fractionné');
    expect(recipe.durationMin).toBe(70);
    expect(recipe.warmup).toBe('Échauffement ~10 min, footing + 2-3 accélérations.');
    expect(recipe.blocks.map((block) => block.kind)).toEqual(['luc_leger', 'rest', undefined]);
    expect(recipe.blocks[0]!.faire).toBe('20 m mesurés, application bip au protocole Léger (palier 1 à 8,5 km/h, +0,5 km/h par minute). Continu, atteindre la ligne à chaque bip, sans pause. Fin au DEUXIÈME bip manqué de suite.');
    expect(recipe.blocks[0]!.regle).toBe(BACKUP_LUC_LEGER);
    expect(recipe.blocks[1]!.title).toBe('Récupération — 10 min');
    expect(recipe.blocks[1]!.faire).toBe('Marche 3 min, footing facile 7 min.');
    expect(recipe.blocks[2]!.faire).toBe('4 × 4 min à 5:10 /km, récupération 2 min en trottinant · 5e répétition seulement si la 4e est à 5:15 ou plus vite ET effort ressenti 4 ou moins.');
    expect(recipe.blocks[2]!.regle).toBe(AFTER_MAX_TEST_LINE);
    expect(recipe.cooldown).toBe('Retour au calme.');
    expect(drillIds(recipe)).toEqual(['test:luc_leger_stage', 'test:luc_leger_leg']);
  });

  it('Thu 22: Enchaînement · BORDEAUX 10, about 55 min: warm-up + priming · fresh test · the circuit · fatigue test · rest 3 · ROUMI', () => {
    const recipe = thu();
    expect(recipe.title).toBe('Enchaînement · BORDEAUX 10');
    expect(recipe.durationMin).toBe(55);
    expect(recipe.notice).toBe(WEEK7_THURSDAY_NOTICE);
    expect(blockTitles(recipe)).toEqual([
      'Échauffement ~5 min + priming',
      'Test à froid',
      'BORDEAUX 10 · 2 tours chrono · cap 10:00',
      'Test fatigué — dans les 30 s',
      'Repos — 3 min',
      'ROUMI (Cross Ops p 14) · 10 tours chrono'
    ]);
    expect(recipe.blocks[0]!.faire).toBe('Échauffement ~5 min · priming : 2 × 10 s de sprint.');
    expect(recipe.blocks[1]!.faire).toBe('Banc avec balle : 1 échange officiel · raquette : 1 passage.');
    const circuit = recipe.blocks[2]!;
    expect(circuit.faire).toBe('Un tour, dans l’ordre : sprint 20 m · slalom ~15 m (aller droit, retour en slalom) · obstacle, rythme officiel : 5 passages aller (une balle de tennis dans la casquette à chaque fois), 4 retour sans balle (9 passages) · 10 tirages à la barre · 8 burpees complets · 45 s de corde.');
    expect(circuit.regle).toBe('Burpees poitrine au sol · tirages corps gainé · passage bâclé → backup C pour la suite du circuit · ça vacille sur le banc → descendre exprès · vertige → stop, ça compte.');
    expect(circuit.details).toBe(`${BACKUP_OBSTACLE} ${BACKUP_ROWS}`);
    expect(circuit.spec).toMatchObject({ kind: 'circuit', laps: 2, capMin: 10, card: { cardId: 'BLK_bordeaux_10' } });
    expect(recipe.blocks[3]!.faire).toBe('Dans les 30 s après le circuit : banc avec balle, 1 échange · raquette, 1 passage.');
    expect(recipe.blocks[5]!.faire).toBe('10 tours chrono : 10 squats · 5 burpees · 10 squat jumps.');
    expect(recipe.blocks[5]!.spec).toMatchObject({ kind: 'cardio', format: 'for_time', target: null, atoms: [{ cardId: 'BLK_roumi' }] });
    expect(recipe.cooldown).toBe('Retour au calme.');
    expect(drillIds(recipe)).toEqual([
      'fresh:bench_ball', 'fresh:racket',
      'ench:bordeaux10_time_s', 'ench:bordeaux10_station_at_cap', 'ench:backup',
      'tired1:bench_ball', 'tired1:racket',
      'cardio:roumi_time_s'
    ]);
  });

  it('Fri 23: Compétences chrono, about 35 min: hoops the full 11 · racket course 5 · skipping EMOM 8 · bench with ball 5', () => {
    const recipe = fri();
    expect(recipe.title).toBe('Compétences chrono');
    expect(recipe.durationMin).toBe(35);
    expect(recipe.purpose).toContain('Vol de nuit');
    expect(blockTitles(recipe)).toEqual(['Cerceaux : les 11 · 4 passages', 'Parcours raquette — 5 min', 'Corde EMOM — 8 min', 'Banc avec balle — 5 min']);
    expect(recipe.blocks.map((block) => block.faire)).toEqual([
      'Les 11 cerceaux, aller ballon dans les bras, retour en dribble · 4 passages.',
      '5 min continu, plat + obstacles.',
      'Chaque minute : 5 pied droit · 5 pied gauche · 10 pieds joints, repos le reste.',
      '5 min, demi-tours compris.'
    ]);
    expect(drillIds(recipe)).toEqual(['skill:hoops11_foot', 'skill:hoops11_hand', 'skill:racket_course_drops', 'skill:skipping_emom8_clean', 'skill:bench_ball_falls', 'skill:bench_ball_turn']);
  });

  it('no memory block is invented: the FINAL file has none (KEEP, question in the report)', () => {
    for (const recipe of [tue(), thu(), fri()]) expect(memoryBlockOf(recipe)).toBeNull();
  });
});

// ---------- 2. weeks 3-6 and 8-11 unchanged ----------

describe('CR-013 v6 — weeks 3, 4, 5, 6, 8, 9, 10, 11 reproduce their current fixtures', () => {
  // The session ids and recipe ids of v5 (main 0fcaafb, then f8e9a36), read
  // before this change. Results are stored by session id.
  const FIXTURE: Record<number, string[]> = {
    6: ['2026-10-12:crossfit_class|crossfit-coached-v1', '2026-10-13:run_intervals|run-intervals-v2-week-6', '2026-10-14:skill_park|skill-park-v1-week-6', '2026-10-15:crossfit_class|crossfit-coached-v1', '2026-10-16:enchainement|enchainement-v1-week-6', '2026-10-17:trail_day|trail-day-v1-week-6'],
    // CHANGE_REQUEST_013 v7 — week 8 is WEEK_8_FINAL (cr013v7.test.ts); week 9
    // gains its optional Monday (season_plan v5), the other ids are unchanged.
    9: ['2026-11-02:travel_speed|travel-speed-to-build-week-9-mon', '2026-11-03:easy_run|easy-run-to-build-week-9', '2026-11-04:easy_run|easy-run-to-build-week-9', '2026-11-05:skill_park|skill-park-to-build-week-9', '2026-11-06:enchainement|enchainement-to-build-week-9', '2026-11-07:crossfit_class|crossfit-coached-v1', '2026-11-08:easy_run|easy-run-to-build-week-9'],
    10: ['2026-11-09:crossfit_class|crossfit-coached-v1', '2026-11-10:run_intervals|run-intervals-v2-week-10', '2026-11-11:enchainement|enchainement-to-build-week-10-wed', '2026-11-12:skill_park|skill-park-to-build-week-10', '2026-11-13:enchainement|enchainement-v1-week-10', '2026-11-14:trail_day|trail-day-v1-week-10'],
    11: ['2026-11-16:crossfit_class|crossfit-coached-v1', '2026-11-17:run_intervals|run-intervals-v2-week-11', '2026-11-18:skill_park|skill-park-to-build-week-11', '2026-11-20:police_event|police-event-2026-11-20']
  };

  it('same session ids and recipe ids, weeks 6 and 8 to 11', () => {
    for (const [n, want] of Object.entries(FIXTURE)) {
      expect(weekNo(Number(n)).sessions.map((item) => `${item.id}|${item.recipeId}`), `week ${n}`).toEqual(want);
    }
  });

  it('weeks 3 to 6 and 8 to 11 still validate clean', () => {
    for (const n of [3, 4, 5, 6, 8, 9, 10, 11]) expect(validateWeek(weekNo(n)), `week ${n}`).toEqual([]);
  });

  it('week 6 keeps its blocks (the two-storm enchaînement), weeks 3 to 5 are covered by their own fixtures', () => {
    expect(blockTitles(recipeOn(weekNo(6), '2026-10-16'))).toEqual([
      'Mise en place — 3 min', 'Échauffement ~5 min + priming', 'Test à froid — 3 min', 'Mémoire · RÈGLES — 4 min',
      'Tempête 1 · « ACHERON PARK » — 7 min', 'Test fatigué 1 — 3 min', 'Repos — 3 min',
      'Tempête 2 · « DEATH BY OBSTACLE » — 7 min', 'Test fatigué 2 — 3 min'
    ]);
  });
});

// ---------- 3. no travel placeholder in week 7; week 8 keeps them ----------

describe('CR-013 v6 — week 7 has no travel placeholder; week 8 still has its travel placeholders', () => {
  const TRAVEL = ['travel_speed', 'travel_mini_ench', 'travel_skill_kit'];
  it('week 7', () => {
    expect(W7().sessions.some((item) => TRAVEL.includes(item.kind) || item.kind === 'trail_day')).toBe(false);
    for (const session of W7().sessions) expect(recipeById[session.recipeId]!.blocks.some((block) => block.kind === 'to_build'), session.id).toBe(false);
  });
  // CHANGE_REQUEST_013 v7 — week 8 has no travel placeholder either.
  it('week 8', () => {
    expect(weekNo(8).sessions.some((item) => TRAVEL.includes(item.kind))).toBe(false);
  });
});

// ---------- 4. the single-circuit enchaînement ----------

describe('CR-013 v6 — the single-circuit enchaînement (R-SP-15); week 6 and the week 10 Friday keep the two storms', () => {
  it('week 7 Thursday: one circuit, fresh test before, fatigue test right after, a Cross Ops block', () => {
    const recipe = thu();
    expect(isCircuitEnchainement(recipe)).toBe(true);
    const kinds = recipe.blocks.map((block) => block.kind);
    expect(kinds).toEqual(['warmup', 'skill_test', 'circuit', 'skill_test', 'rest', 'cardio']);
    expect(kinds.filter((kind) => kind === 'storm')).toEqual([]);
    expect(recipe.blocks.flatMap((block) => (block.spec?.kind === 'skill_test' ? [block.spec.moment] : []))).toEqual(['fresh', 'tired1']);
  });

  it('week 6 Friday and the week 10 Friday rematch keep the two-storm shape', () => {
    for (const recipe of [recipeOn(weekNo(6), '2026-10-16'), recipeOn(weekNo(10), '2026-11-13')]) {
      expect(isCircuitEnchainement(recipe)).toBe(false);
      expect(recipe.blocks.filter((block) => block.kind === 'storm')).toHaveLength(2);
    }
  });

  it('the Cross Ops block after the circuit is not flagged as a second hard block (R-SP-08)', () => {
    expect(validateWeek(W7())).toEqual([]);
  });

  it('is enforced: a second circuit, or a circuit with no fatigue test after it, is flagged', () => {
    const recipe = thu();
    const original = recipe.blocks;
    try {
      recipe.blocks = [...original, original[2]!];
      expect(validateWeek(W7()).some((error) => error.includes('un seul circuit'))).toBe(true);
      recipe.blocks = original.filter((_, index) => index !== 3);
      expect(validateWeek(W7()).some((error) => error.includes('test fatigué dans les 30 s'))).toBe(true);
    } finally {
      recipe.blocks = original;
    }
  });

  it('the GAP fresh → tired is computed for bench with ball and racket, as in v5', () => {
    const rows = enchainementGap([
      { drillId: 'fresh:bench_ball', value: 1 }, { drillId: 'tired1:bench_ball', value: 3 },
      { drillId: 'fresh:racket', value: 0 }, { drillId: 'tired1:racket', value: 2 }
    ]);
    expect(rows.map((row) => [row.skill, row.gap1])).toEqual([['bench_ball', 2], ['racket', 2]]);
  });
});

// ---------- 5. the circuit score: time OR station at cap ----------

describe('CR-013 v6 — the circuit score accepts a total time OR the station at the cap, never both', () => {
  afterEach(() => { cleanup(); vi.useRealTimers(); localStorage.clear(); });

  it('typing one clears the other; the time is typed m:ss and stored in seconds', async () => {
    await openWeek('2026-10-22');
    await openCard('2026-10-22:enchainement');
    fireEvent.click(screen.getByText('Retour'));
    const time = await screen.findByLabelText('Temps total — BORDEAUX 10') as HTMLInputElement;
    const station = screen.getByLabelText('OU station atteinte à 10:00 (tour 1 : 1-6, tour 2 : 7-12)') as HTMLInputElement;
    fireEvent.change(time, { target: { value: '9:30' } });
    expect(time.value).toBe('9:30');
    fireEvent.change(station, { target: { value: '11' } });
    expect(station.value).toBe('11');
    expect(time.value).toBe('');
    fireEvent.change(time, { target: { value: '9:45' } });
    expect(station.value).toBe('');
    fireEvent.click(screen.getByRole('group', { name: 'Backup utilisé' }).querySelectorAll('button')[2]!);

    vi.useRealTimers();
    await new Promise((done) => setTimeout(done, 700));
    const stored = JSON.parse(localStorage.getItem('coach-concours-state-v2')!).state.results['2026-10-22:enchainement'] as SessionResult;
    expect(stored.drillScores!.map((score) => [score.drillId, score.value])).toEqual([['ench:bordeaux10_time_s', 585], ['ench:backup', 3]]);
    expect(Object.keys(stored).sort()).toEqual(['completedAt', 'drillScores', 'note', 'sessionId', 'status']);
  });
});

// ---------- 6. Luc Léger before the intervals; VMA computed ----------

describe('CR-013 v6 — the Luc Léger block comes before the interval block; the VMA is computed, never typed', () => {
  it('the order on Wed 21', () => {
    const kinds = wed().blocks.map((block) => block.kind ?? 'main');
    expect(kinds.indexOf('luc_leger')).toBeLessThan(kinds.indexOf('main'));
    expect(kinds[0]).toBe('luc_leger');
  });

  it('VMA = 8.0 + 0.5 × (stage reached − 1): stage 9 → 12.0 km/h', () => {
    expect(lucLegerVmaKmh(9)).toBe(12.0);
    expect(lucLegerVmaKmh(1)).toBe(8.0);
    expect(lucLegerVmaKmh(undefined)).toBeUndefined();
    expect(lucLegerVmaKmh(0)).toBeUndefined();
    expect(lucLegerVmaOf([{ drillId: 'test:luc_leger_stage', value: 9 }, { drillId: 'test:luc_leger_leg', value: 6 }])).toEqual({ vma: 12, stage: 9, leg: 6 });
  });

  it('there is no VMA box: no drill of the week measures a VMA', () => {
    for (const session of W7().sessions) expect(drillsOf(recipeById[session.recipeId]!).some((drill) => /vma/i.test(`${drill.drillId} ${drill.scoreLabel}`))).toBe(false);
  });

  it('only one Luc Léger test in the season (R-TB-01)', () => {
    const withTest = weeks.flatMap((week) => week.sessions).filter((session) => recipeById[session.recipeId]!.blocks.some((block) => block.kind === 'luc_leger'));
    expect(withTest.map((session) => session.id)).toEqual(['2026-10-21:run_intervals']);
  });
});

// ---------- 7. the optional 5th rep ----------

describe('CR-013 v6 — the optional 5th interval rep never counts as missed', () => {
  it('4 reps done → 0 missed; 5 → 0; 3 → 1', () => {
    expect(missedReps(wed(), 4)).toBe(0);
    expect(missedReps(wed(), 5)).toBe(0);
    expect(missedReps(wed(), 3)).toBe(1);
  });
});

// ---------- 8. hard days flagged, never blocked ----------

describe('CR-013 v6 — Wed 21 + Thu 22 hard days are flagged, never blocked', () => {
  it('the checker flags Thursday (two hard days in a row) and the validator has no error', () => {
    const flags = checkWeek(W7());
    const thursday = flags.filter((flag) => flag.date === '2026-10-22');
    expect(thursday.map((flag) => [flag.code, flag.hard])).toEqual([['C1', false]]);
    expect(flags.every((flag) => !flag.hard)).toBe(true);
    expect(validateWeek(W7())).toEqual([]);
  });
});

// ---------- 9. one-line warm-ups, no predicted time, no mock test ----------

describe('CR-013 v6 — warm-ups are one line; no text predicts an official time; no full mock test', () => {
  it('across week 7', () => {
    for (const session of W7().sessions) {
      const recipe = recipeById[session.recipeId]!;
      const warmups = [recipe.warmup, ...recipe.blocks.filter((block) => block.kind === 'warmup').map((block) => block.faire)].filter((text): text is string => Boolean(text));
      for (const text of warmups) expect(text, session.id).not.toMatch(/\n/);
      expect(session.kind).not.toMatch(/mock/);
      for (const text of textsOf(recipe)) {
        expect(text, session.id).not.toMatch(/6:15|6’15|temps officiel|chrono officiel|prédi|test blanc|simulation complète|circuit complet/i);
      }
    }
  });

  it('every cardio block carries no target', () => {
    for (const session of W7().sessions) {
      for (const block of recipeById[session.recipeId]!.blocks) if (block.spec?.kind === 'cardio') expect(block.spec.target).toBeNull();
    }
  });

  it('the circuit cap is between 8 and 10 min', () => {
    const spec = thu().blocks.find((block) => block.kind === 'circuit')!.spec as CircuitSpec;
    expect(spec.capMin).toBeGreaterThanOrEqual(8);
    expect(spec.capMin).toBeLessThanOrEqual(10);
  });
});

// ---------- the screens: expected behaviour ----------

async function openWeek(today: string) {
  localStorage.clear();
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

describe('CR-013 v6 — the screens', () => {
  afterEach(() => { cleanup(); vi.useRealTimers(); localStorage.clear(); });

  it('week 7: the five sessions, Saturday empty, Sunday the flight note only', async () => {
    const container = await openWeek('2026-10-19');
    expect(container.querySelector('.daily')!.textContent).toContain(DAILY_BALANCE_LINE);
    expect(container.querySelector('.weekbar')!.getAttribute('aria-label')).toBe('Charge de la semaine : 3 sur 5');
    const days = Object.fromEntries(dayTexts(container));
    expect(days['2026-10-19']).toContain('Cours CrossFit');
    expect(days['2026-10-20']).toContain('Compétences courtes · parc');
    expect(days['2026-10-21']).toContain('Test Luc Léger + fractionné');
    expect(days['2026-10-22']).toContain('Enchaînement · BORDEAUX 10');
    expect(days['2026-10-23']).toContain('Compétences chrono');
    expect(days['2026-10-24']).toBe('Repos');
    expect(days['2026-10-25']).toBe(WEEK7_SUNDAY_NOTE);
    expect(container.querySelector('.prog b')!.textContent).toBe('Séances 0/5');
  });

  it('Wed 21 Retour: « palier 9, navette 6 » shows a computed VMA of 12,0 km/h; 5 pace boxes, the 5th optional', async () => {
    await openWeek('2026-10-21');
    await openCard('2026-10-21:run_intervals');
    fireEvent.click(screen.getByText('Retour'));
    fireEvent.change(await screen.findByLabelText('Palier atteint — test Luc Léger'), { target: { value: '9' } });
    fireEvent.change(screen.getByLabelText('Navette — test Luc Léger'), { target: { value: '6' } });
    expect(await screen.findByText('VMA : 12,0 km/h · calculée (palier 9, navette 6)')).toBeTruthy();
    // the VMA is text, never a box
    expect(screen.queryAllByLabelText(/VMA/).some((node) => node.tagName === 'INPUT')).toBe(false);
    expect(screen.getByLabelText('Rép 4')).toBeTruthy();
    expect(screen.getByLabelText('Rép 5 · optionnelle')).toBeTruthy();
    expect(screen.queryByLabelText(/Rép 6/)).toBeNull();
  });

  it('Thu 22 shows the « above the limit » line', async () => {
    await openWeek('2026-10-22');
    await openCard('2026-10-22:enchainement');
    expect(screen.getByText(WEEK7_THURSDAY_NOTICE)).toBeTruthy();
  });
});
