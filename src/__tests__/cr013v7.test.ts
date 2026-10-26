// CHANGE_REQUEST_013 v7 — week 8 (Kingston): four new cards, KINGSTON 10
// scored as laps + station, an enchaînement without tests, the W9-W11
// skeleton of season_plan v5 and the answers Q1-Q13 to APP_REPORT_013_v5.
//
// One describe block per item of the change request's own "Tests that must
// pass" list, in its order, then the "Expected behaviour" screens. References:
// `handoffs/CHANGE_REQUEST_013_v7_week8_kingston.md`,
// `handoffs/WEEK_8_FINAL_2026-10-26.md` (the week 8 fixture),
// `handoffs/rules/season_plan.md` v5 and
// `handoffs/DECISIONS_APP_REPORT_013v5_2026-10-12.md`.
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createElement } from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import CoachConcoursApp from '../CoachConcoursApp';
import { cardById } from '../data/exerciseCards';
import { planWithMoves, withMove } from '../coach/dayMoves';
import { generatePlan, validateWeek } from '../coach/planner';
import { recipeById } from '../coach/recipes';
import {
  KINGSTON10_LAPS_DRILL,
  KINGSTON10_STATION_DRILL,
  REMATCH_SOURCE_SESSION_ID,
  TUESDAY_WARMUP_LINE,
  WARMUP_LINE,
  WEEK8_NO_TEST_LINE,
  WEEK9_MONDAY_TITLE,
  enchainementGap,
  hasGapTests,
  isCircuitEnchainement
} from '../coach/seasonV4';
import { DAILY_BALANCE_LINE, SEASON_PLAN_V4, blockOfKind, drillsOf, memoryBlockOf, memoryModulesOf } from '../coach/sessionShapes';
import { checkWeek } from '../coach/weekChecker';
import type { CardioBlock, CircuitSpec, PlannedSession, SessionRecipe, SessionResult, StrengthSpec, TrainingWeek } from '../coach/types';

const weeks = generatePlan();
const WEEK_STARTS: Record<number, string> = {
  3: '2026-09-21', 4: '2026-09-28', 5: '2026-10-05', 6: '2026-10-12', 7: '2026-10-19',
  8: '2026-10-26', 9: '2026-11-02', 10: '2026-11-09', 11: '2026-11-16'
};
const weekIn = (list: TrainingWeek[], n: number): TrainingWeek => list.find((week) => week.startDate === WEEK_STARTS[n])!;
const weekNo = (n: number): TrainingWeek => weekIn(weeks, n);
const on = (week: TrainingWeek, date: string): PlannedSession | undefined => week.sessions.find((item) => item.date === date);
const recipeOn = (week: TrainingWeek, date: string): SessionRecipe => recipeById[on(week, date)!.recipeId]!;
const textsOf = (recipe: SessionRecipe): string[] => [
  recipe.title, recipe.purpose, recipe.warmup ?? '', recipe.cooldown ?? '', recipe.notice ?? '',
  ...recipe.blocks.flatMap((block) => [block.title, block.faire, block.regle ?? '', block.noter ?? '', block.details ?? ''])
];
const blockTitles = (recipe: SessionRecipe): string[] => recipe.blocks.map((block) => block.title);
const drillIds = (recipe: SessionRecipe): string[] => drillsOf(recipe).map((drill) => drill.drillId);

const W8 = () => weekNo(8);
const mon = () => recipeOn(W8(), '2026-10-26');
const tue = () => recipeOn(W8(), '2026-10-27');
const wed = () => recipeOn(W8(), '2026-10-28');
const thu = () => recipeOn(W8(), '2026-10-29');
const fri = () => recipeOn(W8(), '2026-10-30');
const sat = () => recipeOn(W8(), '2026-10-31');
const sun = () => recipeOn(W8(), '2026-11-01');

// ---------- 1. week 8 reproduces WEEK_8_FINAL block for block ----------

describe('CR-013 v7 — week 8 reproduces WEEK_8_FINAL_2026-10-26.md block for block', () => {
  it('the skeleton: Mon light · Tue to Sat hard · Sun trail day', () => {
    expect(W8().sessions.map((item) => [item.id, item.load])).toEqual([
      ['2026-10-26:easy_run', 'low'],
      ['2026-10-27:skill_park', 'hard'],
      ['2026-10-28:skill_park', 'hard'],
      ['2026-10-29:run_intervals', 'hard'],
      ['2026-10-30:enchainement', 'hard'],
      ['2026-10-31:skill_park', 'hard'],
      ['2026-11-01:trail_day', 'moderate']
    ]);
    expect(SEASON_PLAN_V4[8]!.dailyLine).toBe(DAILY_BALANCE_LINE);
    expect(DAILY_BALANCE_LINE).toBe('2 min d\'équilibre sur une jambe pendant le brossage des dents');
    expect(validateWeek(W8())).toEqual([]);
  });

  it('Mon 26: Facile · journée de terrain, about 45 min: the ladder · easy run 30 min', () => {
    expect([mon().title, mon().durationMin]).toEqual(['Facile · journée de terrain', 45]);
    expect(blockTitles(mon())).toEqual(['Échelle d’équilibre Kingston — 12 min', 'Footing facile — 30 min']);
    expect(mon().blocks[1]!.faire).toBe('30 min, 8,5 km/h ou plus lent.');
    expect(drillIds(mon())).toEqual(['balance:ladder_touchdowns', 'balance:ladder_drops']);
  });

  it('Tue 27: Compétences + cardio, about 60 min, flagged above the usual limit: ladder · rope mix 15 · CARDIO RUN B', () => {
    expect([tue().title, tue().durationMin, tue().warmup]).toEqual(['Compétences + cardio', 60, WARMUP_LINE]);
    expect(tue().notice).toContain('Au-dessus de la limite habituelle');
    expect(blockTitles(tue())).toEqual(['Échelle d’équilibre Kingston — 12 min', 'Corde mix 15 — 15 min', 'CARDIO RUN B (Cross Ops p 14) · max de tours en 30 min']);
    expect(tue().blocks[2]!.faire).toBe('Max de tours en 30 min : 800 m de course en extérieur · 20 burpees.');
    expect(drillIds(tue())).toEqual(['balance:ladder_touchdowns', 'balance:ladder_drops', 'rope:onefoot_misses', 'rope:clean_cards', 'cardio:cardiorunb_rounds', 'cardio:cardiorunb_metres']);
  });

  it('Wed 28: Force + EAGLE, about 50 min, gym: thrusters 5 × 8 at 2 × 10 kg · EAGLE · tired balance', () => {
    expect([wed().title, wed().durationMin, wed().warmup]).toEqual(['Force + EAGLE', 50, WARMUP_LINE]);
    expect(blockTitles(wed())).toEqual(['Thrusters haltères 5 × 8 — 12 min', 'EAGLE (Cross Ops p 14) · max de tours en 20 min', 'Équilibre fatigué — 5 min']);
    const thrusters = wed().blocks[0]!;
    expect(thrusters.kind).toBe('strength');
    expect(thrusters.spec).toMatchObject({ kind: 'strength', sets: 5, reps: 8, restS: 90 } satisfies Partial<StrengthSpec>);
    expect(thrusters.faire).toContain('5 × 8, 2 × 10 kg, repos 90 s');
    expect(wed().blocks[1]!.faire).toBe('Max de tours en 20 min : 400 m de course en extérieur · 10 squat jumps · 10 burpees.');
    expect(wed().blocks[2]!.faire).toContain('étapes 1 et 2 seulement : 30 s par jambe, 3 tours, repos 20 s');
    expect(drillIds(wed())).toEqual(['strength:thruster_kg', 'strength:thruster_reps', 'cardio:eagle_rounds', 'balance:tired_touchdowns']);
  });

  it('Thu 29: Fractionné · tapis, about 55 min: 5 × 3 min at 12,0 km/h, incline 1 %, jog 2 min at 8 km/h · tired balance', () => {
    expect([thu().title, thu().durationMin]).toEqual(['Fractionné · tapis', 55]);
    expect(thu().warmup).toBe('Échauffement ~15 min à 8,5 km/h + 3 × 20 s à 13 km/h.');
    expect(thu().blocks[0]!.faire).toBe('5 × 3 min à 12,0 km/h (5:00 /km), pente 1 %, 2 min de footing à 8 km/h entre.');
    expect(blockTitles(thu())[1]).toBe('Équilibre fatigué — 5 min');
    expect(thu().cooldown).toBe('Retour au calme 10 min facile.');
    expect(drillIds(thu())).toEqual(['balance:tired_touchdowns']);
  });

  it('Fri 30: Enchaînement · KINGSTON 10, about 35 min: warm-up + priming · the circuit · MAX · walk 5', () => {
    expect([fri().title, fri().durationMin]).toEqual(['Enchaînement · KINGSTON 10', 35]);
    expect(blockTitles(fri())).toEqual(['Échauffement ~5 min + priming', 'KINGSTON 10 · max de tours en 10 min', 'MAX (Cross Ops p 17) · 10 tours chrono', 'Marche — 5 min']);
    expect(fri().blocks[0]!.faire).toBe('Échauffement ~5 min · priming : 2 × 10 s de sprint.');
    const circuit = fri().blocks[1]!;
    for (const station of ['1 navette 4 × 20 m', '2 cinq fois : 1 burpee (poitrine au sol) + 1 squat jump', '3 10 pompes, poitrine au sol',
      '4 cerceaux, les 11, aller, pieds selon la couleur (erreur : retour au cerceau 1)',
      '5 sur une jambe sur le tapis plié, balle autour de la taille : 10 s droite + 10 s gauche',
      '6 carte de corde : 5 pied droit · 5 pied gauche · 10 pieds joints (erreur : on recommence le bloc)']) expect(circuit.faire).toContain(station);
    expect(circuit.regle).toBe('Pas de repos prévu · vertige → stop, ça compte · sans cerceaux : station 4 = 10 sauts de corde sur une jambe (5 par jambe).');
    expect(fri().blocks[2]!.faire).toBe('10 tours chrono : 10 abdos · 10 pompes · 15 squats.');
    expect(drillIds(fri())).toEqual([KINGSTON10_LAPS_DRILL, KINGSTON10_STATION_DRILL, 'cardio:max_time_s']);
  });

  it('Sat 31: RUSSIAN, about 45 min, no gym: ladder · RUSSIAN with the swaps · tired balance', () => {
    expect([sat().title, sat().durationMin, sat().warmup]).toEqual(['RUSSIAN', 45, WARMUP_LINE]);
    expect(blockTitles(sat())).toEqual(['Échelle d’équilibre Kingston — 12 min', 'RUSSIAN (Cross Ops p 17) · max de tours en 20 min', 'Équilibre fatigué — 5 min']);
    expect(sat().blocks[1]!.faire).toBe('Max de tours en 20 min : 10 pompes (pour 10 tractions) · 10 squat jumps (pour 10 box jumps) · 10 burpees · 10 squat jumps · 400 m en extérieur.');
    expect(drillIds(sat())).toEqual(['balance:ladder_touchdowns', 'balance:ladder_drops', 'cardio:russian_rounds', 'balance:tired_touchdowns']);
  });

  it('Sun 1: TRAIL only, no detail (R-SP-10)', () => {
    expect([sun().title, sun().blocks, sun().durationMin]).toEqual(['Trail', [], null]);
  });

  it('every card used exists in the index of 25 October; no memory block is invented (KEEP, question in the report)', () => {
    for (const id of ['S09_kingston_balance_ladder', 'S10_rope_mix_15', 'S00_dumbbell_thruster', 'BLK_kingston_10', 'S00_push_up', 'S00_full_burpee', 'S00_jump_squats']) expect(cardById[id], id).toBeDefined();
    for (const session of W8().sessions) {
      const recipe = recipeById[session.recipeId]!;
      expect(memoryBlockOf(recipe), session.id).toBeNull();
      for (const drill of drillsOf(recipe)) expect(cardById[drill.cardId], `${session.id} ${drill.drillId}`).toBeDefined();
    }
  });

  it('D: every score is a drillScore with the suggested id; no stored field was added', () => {
    const all = W8().sessions.flatMap((session) => drillIds(recipeById[session.recipeId]!));
    expect(new Set(all)).toEqual(new Set([
      'balance:ladder_touchdowns', 'balance:ladder_drops', 'balance:tired_touchdowns', 'rope:onefoot_misses', 'rope:clean_cards',
      'cardio:cardiorunb_rounds', 'cardio:cardiorunb_metres', 'strength:thruster_kg', 'strength:thruster_reps', 'cardio:eagle_rounds',
      'ench:kingston10_laps', 'ench:kingston10_station', 'cardio:max_time_s', 'cardio:russian_rounds'
    ]));
    const types = readFileSync(resolve(__dirname, '../coach/types.ts'), 'utf8');
    const block = (name: string) => types.slice(types.indexOf(`export interface ${name} {`), types.indexOf('\n}\n', types.indexOf(`export interface ${name} {`)));
    expect(block('SessionResult')).not.toMatch(/kingston|laps|thruster|rope|ladder/i);
    expect(block('CoachState')).not.toMatch(/kingston|laps|thruster|rope|ladder/i);
  });
});

// ---------- 2. weeks 3 to 7 unchanged; week 7 results still attach ----------

describe('CR-013 v7 — weeks 3 to 7 reproduce their current fixtures; week 7 results still attach', () => {
  // The session ids and recipe ids of main ae62b62, read before this change.
  const FIXTURE: Record<number, string[]> = {
    6: ['2026-10-12:crossfit_class|crossfit-coached-v1', '2026-10-13:run_intervals|run-intervals-v2-week-6', '2026-10-14:skill_park|skill-park-v1-week-6', '2026-10-15:crossfit_class|crossfit-coached-v1', '2026-10-16:enchainement|enchainement-v1-week-6', '2026-10-17:trail_day|trail-day-v1-week-6'],
    7: ['2026-10-19:crossfit_class|crossfit-coached-v1-week-7', '2026-10-20:skill_park|skill-park-v2-week-7-tue', '2026-10-21:run_intervals|run-intervals-v3-week-7-luc-leger', '2026-10-22:enchainement|enchainement-v2-week-7', '2026-10-23:skill_park|skill-park-v2-week-7-fri']
  };

  it('same session ids and recipe ids, weeks 6 and 7; weeks 3 to 7 validate clean', () => {
    for (const [n, want] of Object.entries(FIXTURE)) expect(weekNo(Number(n)).sessions.map((item) => `${item.id}|${item.recipeId}`), `week ${n}`).toEqual(want);
    for (const n of [3, 4, 5, 6, 7]) expect(validateWeek(weekNo(n)), `week ${n}`).toEqual([]);
  });

  it('a Thursday 22 October result is still keyed to its session, unchanged', () => {
    const result: SessionResult = {
      sessionId: '2026-10-22:enchainement', status: 'done', completedAt: '2026-10-22T19:00:00Z', note: '',
      drillScores: [{ drillId: 'ench:bordeaux10_time_s', measure: 'time_s', value: 585 }]
    };
    const plan = generatePlan({ [result.sessionId]: result });
    const session = weekIn(plan, 7).sessions.find((item) => item.id === result.sessionId)!;
    expect(session.recipeId).toBe('enchainement-v2-week-7');
    expect(drillsOf(recipeById[session.recipeId]!).map((drill) => drill.drillId)).toContain('ench:bordeaux10_time_s');
  });

  it('week 7 keeps its v6 texts (the circuit, the tests, the GAP)', () => {
    const thursday = recipeOn(weekNo(7), '2026-10-22');
    expect(blockTitles(thursday)).toEqual(['Échauffement ~5 min + priming', 'Test à froid', 'BORDEAUX 10 · 2 tours chrono · cap 10:00', 'Test fatigué — dans les 30 s', 'Repos — 3 min', 'ROUMI (Cross Ops p 14) · 10 tours chrono']);
    expect(hasGapTests(thursday)).toBe(true);
  });
});

// ---------- 3. no travel placeholder in week 8 ----------

describe('CR-013 v7 — week 8 has no travel placeholder', () => {
  it('no travel kind, no named gap', () => {
    for (const session of W8().sessions) {
      expect(['travel_speed', 'travel_mini_ench', 'travel_skill_kit'], session.id).not.toContain(session.kind);
      expect(recipeById[session.recipeId]!.blocks.some((block) => block.kind === 'to_build'), session.id).toBe(false);
    }
  });
});

// ---------- 4. KINGSTON 10: laps AND station; BORDEAUX 10 keeps time OR station ----------

describe('CR-013 v7 — KINGSTON 10 stores laps AND station together; BORDEAUX 10 keeps « time OR station »', () => {
  afterEach(() => { cleanup(); vi.useRealTimers(); localStorage.clear(); });

  it('the two score shapes', () => {
    const kingston = fri().blocks.find((block) => block.kind === 'circuit')!.spec as CircuitSpec;
    expect([kingston.score, kingston.laps, kingston.capMin]).toEqual(['laps_and_station', null, 10]);
    expect(kingston.drills.map((drill) => [drill.drillId, drill.measure])).toEqual([[KINGSTON10_LAPS_DRILL, 'laps'], [KINGSTON10_STATION_DRILL, 'station_reached']]);
    const bordeaux = recipeOn(weekNo(7), '2026-10-22').blocks.find((block) => block.kind === 'circuit')!.spec as CircuitSpec;
    expect([bordeaux.score, bordeaux.laps]).toEqual([undefined, 2]);
    expect(bordeaux.drills.map((drill) => drill.measure)).toEqual(['time_s', 'station_at_cap', 'backup']);
  });

  it('is enforced: a KINGSTON 10 scored « time OR station » is flagged', () => {
    const spec = fri().blocks.find((block) => block.kind === 'circuit')!.spec as CircuitSpec;
    const original = spec.score;
    try {
      spec.score = 'time_or_station';
      expect(validateWeek(W8()).some((error) => error.includes('section C'))).toBe(true);
    } finally {
      spec.score = original;
    }
  });

  it('Fri 30 Retour: « 3 tours, station 4 » stores both, and no GAP line appears', async () => {
    await openWeek('2026-10-30');
    await openCard('2026-10-30:enchainement');
    fireEvent.click(screen.getByText('Retour'));
    const laps = await screen.findByLabelText('Tours complets — KINGSTON 10') as HTMLInputElement;
    const station = screen.getByLabelText('ET station atteinte à 10:00 (1 à 6) — KINGSTON 10') as HTMLInputElement;
    fireEvent.change(laps, { target: { value: '3' } });
    fireEvent.change(station, { target: { value: '4' } });
    expect([laps.value, station.value]).toEqual(['3', '4']);
    expect(screen.queryByText(/Écart/)).toBeNull();

    vi.useRealTimers();
    await new Promise((done) => setTimeout(done, 700));
    const stored = JSON.parse(localStorage.getItem('coach-concours-state-v2')!).state.results['2026-10-30:enchainement'] as SessionResult;
    expect(stored.drillScores!.map((score) => [score.drillId, score.measure, score.value])).toEqual([[KINGSTON10_LAPS_DRILL, 'laps', 3], [KINGSTON10_STATION_DRILL, 'station_reached', 4]]);
    expect(Object.keys(stored).sort()).toEqual(['completedAt', 'drillScores', 'note', 'sessionId', 'status']);
  });
});

// ---------- 5. the enchaînement without tests ----------

describe('CR-013 v7 — week 8 enchaînement: no fresh test, no fatigue test, no GAP, nothing marked missing', () => {
  it('no skill test, the flag, the line, and no GAP even with scores', () => {
    expect(fri().blocks.some((block) => block.kind === 'skill_test')).toBe(false);
    expect(fri().noGapTests).toBe(true);
    expect(fri().notice).toBe(WEEK8_NO_TEST_LINE);
    expect(isCircuitEnchainement(fri())).toBe(true);
    expect(hasGapTests(fri())).toBe(false);
    expect(drillsOf(fri()).some((drill) => /^(fresh|tired1|tired2):/.test(drill.drillId))).toBe(false);
    expect(enchainementGap([{ drillId: KINGSTON10_LAPS_DRILL, value: 3 }, { drillId: KINGSTON10_STATION_DRILL, value: 4 }])).toEqual([]);
  });

  it('weeks 7, 9 and 10 keep their tests; the flag is refused outside week 8', () => {
    expect(hasGapTests(recipeOn(weekNo(7), '2026-10-22'))).toBe(true);
    expect(hasGapTests(recipeOn(weekNo(10), '2026-11-13'))).toBe(true);
    for (const n of [7, 9, 10]) for (const session of weekNo(n).sessions) expect(recipeById[session.recipeId]!.noGapTests, session.id).toBeUndefined();
    const thursday = recipeOn(weekNo(7), '2026-10-22');
    try {
      thursday.noGapTests = true;
      expect(validateWeek(weekNo(7)).some((error) => error.includes('semaine 8 seulement'))).toBe(true);
    } finally {
      delete thursday.noGapTests;
    }
  });
});

// ---------- 6. the ladder and rope texts, as written in section B ----------

describe('CR-013 v7 — the ladder and rope texts show as written in section B', () => {
  const cr = readFileSync(resolve(__dirname, '../../handoffs/CHANGE_REQUEST_013_v7_week8_kingston.md'), 'utf8');
  const cardTexts = cr.slice(cr.indexOf('**Card texts shown in the app'));
  const section = cardTexts.slice(cardTexts.indexOf('```') + 3, cardTexts.indexOf('```', cardTexts.indexOf('```') + 3));
  const [ladderText, ropeText] = section.split(/\n\s*\n/);
  const words = (text: string) => text.toLowerCase().replace(/[’']/g, ' ').match(/[\p{L}\p{N}-]+/gu) ?? [];
  const contains = (haystack: string[], needle: string[]) => haystack.join(' ').includes(needle.join(' '));
  const blockWords = (recipe: SessionRecipe, title: string) => {
    const block = recipe.blocks.find((item) => item.title === title)!;
    return words([block.title, block.faire, block.noter, block.regle, block.details].filter(Boolean).join(' '));
  };

  it('ÉCHELLE D’ÉQUILIBRE KINGSTON: every line of the card text', () => {
    const shown = blockWords(mon(), 'Échelle d’équilibre Kingston — 12 min');
    const lines = ladderText!.split('\n').map((line) => line.trim()).filter(Boolean);
    expect(lines.length).toBeGreaterThan(10);
    for (const line of lines) expect(contains(shown, words(line)), line).toBe(true);
  });

  it('CORDE MIX 15: every line of the card text', () => {
    const shown = blockWords(tue(), 'Corde mix 15 — 15 min');
    const lines = ropeText!.split('\n').map((line) => line.trim()).filter(Boolean);
    expect(lines.length).toBeGreaterThan(5);
    for (const line of lines) expect(contains(shown, words(line)), line).toBe(true);
  });
});

// ---------- 7. Q1-Q13 ----------

describe('CR-013 v7 — the answers Q1 to Q13 of APP_REPORT_013_v5', () => {
  it('Q1: no repeat / advance rule from week 6 (already on main): a slow week 6 Tuesday changes nothing', () => {
    const slow: SessionResult = { sessionId: '2026-10-13:run_intervals', status: 'done', completedAt: '2026-10-13T19:00:00Z', note: '', repPacesSec: [400, 400, 400, 400, 400] };
    const after = generatePlan({ [slow.sessionId]: slow });
    for (const n of [8, 10, 11]) expect(weekIn(after, n).sessions.map((item) => item.recipeId)).toEqual(weekNo(n).sessions.map((item) => item.recipeId));
    expect(recipeOn(weekIn(after, 10), '2026-11-10').blocks[0]!.faire).toBe(recipeOn(weekNo(10), '2026-11-10').blocks[0]!.faire);
  });

  it('Q2: the week 10 low-lung dose is unchanged (set at the W10 build)', () => {
    expect(blockOfKind(recipeOn(weekNo(10), '2026-11-10'), 'low_lung')!.title).toBe('Sprints poumons vides, 6 × 30 m — 6 min');
  });

  it('Q3: the week 10 rematch Friday keeps the 4 min card, not the 10 min M4', () => {
    const rematch = recipeOn(weekNo(10), '2026-11-13');
    expect(rematch.rematchOf).toBe(REMATCH_SOURCE_SESSION_ID);
    expect(blockOfKind(rematch, 'memory')!.title).toBe('Mémoire · RÈGLES — 4 min');
    expect(memoryModulesOf(rematch)).toEqual([]);
    // M4 stays on the other W9-W11 police sessions.
    expect(memoryModulesOf(recipeOn(weekNo(10), '2026-11-11'))).toEqual(['M4']);
    expect(memoryModulesOf(recipeOn(weekNo(9), '2026-11-05'))).toEqual(['M4']);
  });

  it('Q4: the Tuesday warm-up is one line « Échauffement ~10 min (footing) » (weeks 10 and 11; week 6 locked)', () => {
    expect(TUESDAY_WARMUP_LINE).toBe('Échauffement ~10 min (footing)');
    for (const date of ['2026-11-10', '2026-11-17']) expect(recipeById[on(date < '2026-11-16' ? weekNo(10) : weekNo(11), date)!.recipeId]!.warmup).toBe(TUESDAY_WARMUP_LINE);
    expect(recipeOn(weekNo(6), '2026-10-13').warmup).toBe('12 min : 10 min de footing facile + 3 accélérations de 15 s.');
  });

  it('Q5: one box-jumps oui / non per storm (already on main)', () => {
    const ids = drillsOf(recipeOn(weekNo(10), '2026-11-13')).filter((drill) => drill.measure === 'box_jumps_used').map((drill) => drill.drillId);
    expect(ids).toEqual(['storm1:box_jumps_used', 'storm2:box_jumps_used']);
  });

  it('Q6: the storm slalom keeps S01_slalom_18m (already on main)', () => {
    const storm1 = recipeOn(weekNo(10), '2026-11-13').blocks.find((block) => block.spec?.kind === 'storm' && block.spec.storm === 1)!;
    expect(storm1.spec?.kind === 'storm' && storm1.spec.atoms.map((atom) => atom.cardId)).toContain('S01_slalom_18m');
  });

  it('Q7: push-ups are the atom S00_push_up in the week 8 WODs; burpees chest to the floor (S00_full_burpee)', () => {
    const atoms = (recipe: SessionRecipe) => recipe.blocks.flatMap((block) => (block.spec?.kind === 'cardio' ? (block.spec as CardioBlock).atoms.map((atom) => atom.cardId) : []));
    expect(atoms(sat())).toEqual(['S00_push_up', 'S00_jump_squats', 'S00_full_burpee']);
    expect(atoms(fri())).toContain('S00_push_up');
    expect(atoms(tue())).toEqual(['S00_full_burpee']);
    expect(cardById.S00_full_burpee!.what).toContain('poitrine au sol');
  });

  it('Q8: Friday hoops tests are one number « erreurs » per pass; Wednesday keeps feet and hands apart (already on main)', () => {
    const fresh = recipeOn(weekNo(10), '2026-11-13').blocks.find((block) => block.spec?.kind === 'skill_test')!;
    expect(drillsOf({ ...fri(), blocks: [fresh] }).find((drill) => drill.drillId === 'fresh:hoops')!.measure).toBe('errors');
    expect(drillsOf(recipeOn(weekNo(6), '2026-10-14')).filter((drill) => drill.drillId.startsWith('skill:hoops')).map((drill) => drill.measure)).toEqual(['foot_errors', 'hand_errors']);
  });

  it('Q9: the phase labels W6 to W11', () => {
    expect([6, 7, 8, 9, 10, 11].map((n) => SEASON_PLAN_V4[n]!.phaseLabel)).toEqual(['Parc', 'Voyage · entretien', 'Voyage · entretien', 'Reprise', 'Charge', 'Allègement']);
  });

  it('Q10: three hard days stay silent on the planned week; a move that creates a new run shows the mark, never blocked', () => {
    expect(checkWeek(W8()).filter((flag) => flag.code === 'C2' || flag.code === 'C1')).toEqual([]);
    const moved = planWithMoves({}, withMove(withMove([], '2026-10-29:run_intervals', '2026-11-01'), '2026-11-01:trail_day', '2026-10-29'));
    const flags = checkWeek(weekIn(moved, 8)).filter((flag) => flag.code === 'C2');
    expect(flags.map((flag) => [flag.date, flag.hard])).toEqual([['2026-11-01', false]]);
    expect(validateWeek(weekIn(moved, 8))).toEqual([]);
  });

  it('Q11: the daily balance line on every week from W6 to W11', () => {
    for (let n = 6; n <= 11; n += 1) expect(SEASON_PLAN_V4[n]!.dailyLine, `week ${n}`).toBe(DAILY_BALANCE_LINE);
  });

  it('Q12: the two easy runs side by side in W9 stay (by design); Q13: week 5 is untouched', () => {
    expect(['2026-11-03', '2026-11-04'].map((date) => on(weekNo(9), date)!.kind)).toEqual(['easy_run', 'easy_run']);
    expect(weekNo(5).sessions.map((item) => item.id)).toEqual(['2026-10-05:crossfit_class', '2026-10-06:run_intervals', '2026-10-07:skill_session', '2026-10-08:chain_session', '2026-10-11:trail_event']);
  });
});

// ---------- 8. one-line warm-ups, no predicted time, no mock test, no session after 20 Nov ----------

describe('CR-013 v7 — warm-ups are one line; no text predicts an official time; no full mock test; no session after 20 Nov', () => {
  it('across weeks 8 to 11', () => {
    for (const n of [8, 9, 10, 11]) {
      for (const session of weekNo(n).sessions) {
        const recipe = recipeById[session.recipeId]!;
        const warmups = [recipe.warmup, ...recipe.blocks.filter((block) => block.kind === 'warmup').map((block) => block.faire)].filter((text): text is string => Boolean(text));
        for (const text of warmups) expect(text, session.id).not.toMatch(/\n/);
        expect(session.kind).not.toMatch(/mock/);
        expect(session.date <= '2026-11-20', session.id).toBe(true);
        for (const text of textsOf(recipe)) expect(text, session.id).not.toMatch(/6:15|6’15|temps officiel|chrono officiel|prédi|test blanc|simulation complète|circuit complet/i);
      }
    }
    expect(generatePlan().flatMap((week) => week.sessions).every((session) => session.date <= '2026-11-20')).toBe(true);
  });

  it('every cardio block carries no target; an outdoor run shows its distance and no pace (R-TL-12)', () => {
    for (const session of W8().sessions) {
      for (const block of recipeById[session.recipeId]!.blocks) {
        if (block.spec?.kind !== 'cardio') continue;
        expect(block.spec.target, block.title).toBeNull();
        if (/en extérieur/.test(block.faire)) {
          expect(block.faire).toMatch(/\b(400|800) m\b/);
          expect(`${block.faire} ${block.noter ?? ''}`).not.toMatch(/\d:\d\d|km\/h|\/km|cible :/);
        }
      }
    }
  });
});

// ---------- E. the W9-W11 skeleton of season_plan v5 ----------

describe('CR-013 v7 — weeks 9 to 11, skeleton of season_plan v5: only the W9 Monday changes', () => {
  it('week 9 Monday is an optional named gap; the rest of W9-W11 is as on main', () => {
    const monday = recipeOn(weekNo(9), '2026-11-02');
    expect([monday.title, monday.optional]).toEqual([WEEK9_MONDAY_TITLE, true]);
    expect(monday.blocks.map((block) => [block.kind, block.title])).toEqual([['to_build', 'Contenu à construire (semaine 9)']]);
    expect(weekNo(9).sessions.map((item) => item.id)).toEqual(['2026-11-02:travel_speed', '2026-11-03:easy_run', '2026-11-04:easy_run', '2026-11-05:skill_park', '2026-11-06:enchainement', '2026-11-07:crossfit_class', '2026-11-08:easy_run']);
    expect(weekNo(10).sessions.map((item) => item.id)).toEqual(['2026-11-09:crossfit_class', '2026-11-10:run_intervals', '2026-11-11:enchainement', '2026-11-12:skill_park', '2026-11-13:enchainement', '2026-11-14:trail_day']);
    expect(weekNo(11).sessions.map((item) => item.id)).toEqual(['2026-11-16:crossfit_class', '2026-11-17:run_intervals', '2026-11-18:skill_park', '2026-11-20:police_event']);
    for (const n of [9, 10, 11]) expect(validateWeek(weekNo(n)), `week ${n}`).toEqual([]);
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

describe('CR-013 v7 — the screens', () => {
  afterEach(() => { cleanup(); vi.useRealTimers(); localStorage.clear(); });

  it('week 8: the seven sessions, the daily line, the phase label, load 4', async () => {
    const container = await openWeek('2026-10-26');
    expect(container.querySelector('.kicker')!.textContent).toContain('Voyage · entretien');
    expect(container.querySelector('.daily')!.textContent).toContain(DAILY_BALANCE_LINE);
    expect(container.querySelector('.weekbar')!.getAttribute('aria-label')).toBe('Charge de la semaine : 4 sur 5');
    const days = Object.fromEntries(dayTexts(container));
    expect(days['2026-10-26']).toContain('Facile · journée de terrain');
    expect(days['2026-10-27']).toContain('Compétences + cardio');
    expect(days['2026-10-28']).toContain('Force + EAGLE');
    expect(days['2026-10-29']).toContain('Fractionné · tapis');
    expect(days['2026-10-30']).toContain('Enchaînement · KINGSTON 10');
    expect(days['2026-10-31']).toContain('RUSSIAN');
    expect(days['2026-11-01']).toContain('Trail');
    expect(container.querySelector('.prog b')!.textContent).toBe('Séances 0/7');
  });

  it('weeks 6 to 11 headers show the Q9 phase labels', async () => {
    const want: Record<string, string> = { '2026-10-12': 'Parc', '2026-10-19': 'Voyage · entretien', '2026-11-02': 'Reprise', '2026-11-09': 'Charge', '2026-11-16': 'Allègement' };
    for (const [date, label] of Object.entries(want)) {
      const container = await openWeek(date);
      expect(container.querySelector('.kicker')!.textContent, date).toContain(label);
      cleanup();
    }
  });

  it('week 9 Monday shows an optional gap', async () => {
    const container = await openWeek('2026-11-02');
    const days = Object.fromEntries(dayTexts(container));
    expect(days['2026-11-02']).toContain(WEEK9_MONDAY_TITLE);
    expect(days['2026-11-02']).toContain('contenu à construire');
  });

  it('Thu 29 Retour asks 5 paces', async () => {
    await openWeek('2026-10-29');
    await openCard('2026-10-29:run_intervals');
    fireEvent.click(screen.getByText('Retour'));
    expect(await screen.findByLabelText('Rép 5')).toBeTruthy();
    expect(screen.queryByLabelText(/Rép 6/)).toBeNull();
    expect(screen.getByLabelText('Touchers — équilibre fatigué')).toBeTruthy();
  });

  it('Fri 30 shows the « no test this week » line', async () => {
    await openWeek('2026-10-30');
    await openCard('2026-10-30:enchainement');
    expect(screen.getByText(WEEK8_NO_TEST_LINE)).toBeTruthy();
  });
});
