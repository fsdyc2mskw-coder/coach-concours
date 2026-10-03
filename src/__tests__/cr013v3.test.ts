// CHANGE_REQUEST_013 v3 — season table v3, week 5 content, the engine chain,
// the new Tuesday paces.
//
// One describe block per item of the change request's own "Tests that must
// pass" list, in its order. References: `handoffs/rules/season_plan.md` v3,
// `handoffs/rules/weekly_shape.md` v7, `handoffs/rules/run_intervals_progression.md`
// v4 and `handoffs/WEEK_5_FINAL_2026-10-05.md` (the week 5 fixture).
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createElement } from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import CoachConcoursApp from '../CoachConcoursApp';
import { generatePlan, validateV4PoliceSessions, validateWeek } from '../coach/planner';
import { recipeById } from '../coach/recipes';
import {
  MAX_CARDIO_ATOMS,
  POWER_EMOM_HOTEL_PLACEHOLDER,
  SEASON_PLAN,
  blockOfKind,
  blockSequence,
  buildChainSessionRecipe,
  cardioBlockOf,
  cardioBlocksOf,
  chainBlockOf,
  drillsOfBlock,
  memoryModulesOf,
  powerEmomOf,
  skillBlockOf,
  skillStationOf,
  tailBOf,
  type SeasonWeek
} from '../coach/sessionShapes';
import { cardRef } from '../data/exerciseCards';
import { runIntervalsProgression } from '../data/runIntervalsProgression';
import type { PlannedSession, SessionRecipe, TrainingWeek } from '../coach/types';

const weeks = generatePlan();
const WEEK_STARTS: Record<number, string> = {
  3: '2026-09-21', 4: '2026-09-28', 5: '2026-10-05', 6: '2026-10-12', 7: '2026-10-19',
  8: '2026-10-26', 9: '2026-11-02', 10: '2026-11-09', 11: '2026-11-16'
};
const weekNo = (n: number): TrainingWeek => weeks.find((week) => week.startDate === WEEK_STARTS[n])!;
const sessionOf = (week: TrainingWeek, kind: string): PlannedSession | undefined => week.sessions.find((item) => item.kind === kind);
const recipeOf = (week: TrainingWeek, kind: string): SessionRecipe | undefined => {
  const session = sessionOf(week, kind);
  return session ? recipeById[session.recipeId] : undefined;
};
const textsOf = (recipe: SessionRecipe): string[] => [
  recipe.title, recipe.purpose, recipe.warmup ?? '', recipe.cooldown ?? '',
  ...recipe.blocks.flatMap((block) => [block.title, block.faire, block.regle ?? '', block.noter ?? '', block.details ?? ''])
];
const allTexts = (): string[] => weeks.flatMap((week) => week.sessions.flatMap((session) => {
  const recipe = recipeById[session.recipeId];
  return recipe ? textsOf(recipe) : [];
}));

// ---------- 1. the table ----------

describe('CR-013 v3 — SEASON_PLAN reproduces the v3 table cell for cell', () => {
  //  wk load phase   focus             cardio power memory chain      tails   run        hill        crossfit+  travel
  const expected: SeasonWeek[] = [
    { week: 3, phase: 'combine', load: 3, focus: 8, cardioMin: 10, powerJumps: 0, memory: 'LOCKED', chain: 'locked', tails: 'racket', runKm: [8, 9], runDay: 'SUN', hillSprints: 0, hillSprintsDay: null, crossfitPlus: null, travel: false, baseline: true, buildWeek: false },
    { week: 4, phase: 'combine', load: 4, focus: 11, cardioMin: 12, powerJumps: 3, memory: 'M1', chain: 'chain_A', tails: 'balance', runKm: [10, 11], runDay: 'SAT', hillSprints: 0, hillSprintsDay: null, crossfitPlus: null, travel: false, baseline: false, buildWeek: true },
    { week: 5, phase: 'trail', load: 2, focus: 10, cardioMin: 10, powerJumps: 3, memory: 'M2', chain: 'chain_B', tails: 'balance', runKm: 'RACE', runDay: 'SUN', hillSprints: 0, hillSprintsDay: null, crossfitPlus: null, travel: false, baseline: false, buildWeek: false },
    { week: 6, phase: 'reset', load: 3, focus: 8, cardioMin: 12, powerJumps: 3, memory: 'M2', chain: 'chain_B', tails: 'balance', runKm: [7, 7], runDay: 'SUN', hillSprints: 0, hillSprintsDay: null, crossfitPlus: '2026-10-17', travel: false, baseline: false, buildWeek: true },
    { week: 7, phase: 'travel', load: 3, focus: 10, cardioMin: 13, powerJumps: 5, memory: 'M3', chain: 'travel_T', tails: 'racket', runKm: [7, 8], runDay: 'SAT', hillSprints: 0, hillSprintsDay: null, crossfitPlus: null, travel: true, baseline: false, buildWeek: true },
    { week: 8, phase: 'travel', load: 4, focus: 'SLALOM_OR_RACKET', cardioMin: 15, powerJumps: 5, memory: 'M3', chain: 'travel_T', tails: 'racket', runKm: [7, 8], runDay: 'SAT', hillSprints: 0, hillSprintsDay: null, crossfitPlus: null, travel: true, baseline: false, buildWeek: true },
    { week: 9, phase: 'peak', load: 5, focus: 11, cardioMin: 15, powerJumps: 5, memory: 'M4', chain: 'ghost', ghostStations: [1, 11], tails: 'balance', runKm: [7, 8], runDay: 'SUN', hillSprints: 6, hillSprintsDay: 'TUE', crossfitPlus: '2026-11-07', travel: false, baseline: false, buildWeek: true },
    { week: 10, phase: 'peak', load: 3, focus: 11, cardioMin: 12, powerJumps: 5, memory: 'M4', chain: 'ghost', ghostStations: [1, 11], tails: 'balance', runKm: [7, 7], runDay: 'SAT', hillSprints: 6, hillSprintsDay: 'SAT', crossfitPlus: null, travel: false, baseline: false, buildWeek: false },
    { week: 11, phase: 'taper', load: 1, focus: 'LIGHT', cardioMin: 6, powerJumps: 0, memory: 'M4', chain: 'ghost_walk', tails: 'none', runKm: null, runDay: 'SAT', hillSprints: 0, hillSprintsDay: null, crossfitPlus: null, travel: false, baseline: false, buildWeek: false }
  ];

  it('has exactly weeks 3 to 11, each equal to its row', () => {
    expect(Object.keys(SEASON_PLAN).map(Number)).toEqual([3, 4, 5, 6, 7, 8, 9, 10, 11]);
    for (const row of expected) expect(SEASON_PLAN[row.week]).toEqual(row);
  });

  it('W8_WORST is gone; the ghost covers stations 1 to 11 in W9-W10 only', () => {
    expect(Object.values(SEASON_PLAN).some((row) => (row.focus as string) === 'W8_WORST')).toBe(false);
    expect(Object.values(SEASON_PLAN).filter((row) => row.chain === 'ghost').map((row) => [row.week, row.ghostStations])).toEqual([[9, [1, 11]], [10, [1, 11]]]);
  });
});

// ---------- 2. weeks 3 and 4 unchanged ----------

describe('CR-013 v3 — weeks 3 and 4 still reproduce their locked files (no change)', () => {
  it('same days, same session ids and recipe ids', () => {
    expect(weekNo(3).sessions.map((item) => [item.id, item.recipeId, item.load])).toEqual([
      ['2026-09-21:crossfit_class', 'crossfit-coached-v1', 'hard'],
      ['2026-09-22:run_intervals', 'run-intervals-v1-week-3', 'hard'],
      ['2026-09-24:skill_session', 'skill-session-v1-week-3', 'low'],
      ['2026-09-25:chain_session', 'chain-session-v1-week-3', 'hard'],
      ['2026-09-26:trail_maintenance', 'trail-maintenance-v1', 'moderate']
    ]);
    expect(weekNo(4).sessions.map((item) => [item.id, item.recipeId, item.load])).toEqual([
      ['2026-09-28:crossfit_class', 'crossfit-coached-v1', 'hard'],
      ['2026-09-29:run_intervals', 'run-intervals-v1-week-4', 'hard'],
      ['2026-10-01:skill_session', 'skill-session-v2-week-4', 'moderate'],
      ['2026-10-02:chain_session', 'chain-session-v2-week-4', 'hard'],
      ['2026-10-03:trail_maintenance', 'trail-maintenance-v2-week-4', 'moderate']
    ]);
  });

  it('Tue 29 Sep stays 4 × 4 min at 6:00 (decision 3)', () => {
    const tuesday = recipeOf(weekNo(4), 'run_intervals')!;
    expect(tuesday.blocks[0]!.faire).toContain('4 × 4 min à 6:00 /km');
  });

  it('the week 4 racket block keeps its three obstacle boxes (it was trained with them)', () => {
    const block = skillBlockOf(recipeOf(weekNo(4), 'skill_session')!)!;
    expect(block.drills.map((drill) => drill.drillId)).toEqual([
      'skill:S11_racket_on_board:drops', 'skill:S11_racket_on_board:touchdowns',
      'skill:S11_racket_obstacles:flat_1', 'skill:S11_racket_obstacles:obstacles', 'skill:S11_racket_obstacles:flat_2'
    ]);
  });

  it('the week 4 chain keeps tail A, a moderate chain block and its 49 min', () => {
    const chain = recipeOf(weekNo(4), 'chain_session')!;
    expect(chainBlockOf(chain)!.tailA!.cardId).toBe('S09_balance_ladder');
    expect(chainBlockOf(chain)!.intensity).toBe('moderate');
    expect(chain.title).toBe('Séance enchaînement');
    expect(chain.durationMin).toBe(49);
    expect(blockOfKind(chain, 'power_emom')).toBeNull();
  });
});

// ---------- 3. week 5 = WEEK_5_FINAL ----------

describe('CR-013 v3 — week 5 reproduces WEEK_5_FINAL_2026-10-05.md block for block', () => {
  const week = weekNo(5);

  it('the week: Mon CrossFit · Tue intervals · Wed skill · Thu engine chain · Fri rest · Sat nothing · Sun race; it validates clean', () => {
    expect(week.sessions.map((item) => [item.date, item.kind, item.load])).toEqual([
      ['2026-10-05', 'crossfit_class', 'hard'],
      ['2026-10-06', 'run_intervals', 'hard'],
      ['2026-10-07', 'skill_session', 'moderate'],
      ['2026-10-08', 'chain_session', 'hard'],
      ['2026-10-11', 'trail_event', 'event']
    ]);
    // Sat 10: the optional easy jog is NOT a session (no sixth day).
    expect(week.sessions.some((item) => item.date === '2026-10-10')).toBe(false);
    expect(validateWeek(week)).toEqual([]);
  });

  it('Tue 6 Oct: 3 × 4 min at 5:25, jog 3 min, no heat line (answer 7)', () => {
    const tuesday = recipeOf(week, 'run_intervals')!;
    expect(tuesday.blocks[0]!.title).toBe('3 × 4 min à 5:25 — main set');
    expect(tuesday.blocks[0]!.faire).toBe('3 × 4 min à 5:25 /km, récupération 3 min en trottinant');
    expect(tuesday.blocks[0]!.regle).toBeUndefined();
    expect(tuesday.warmup).toBe('15 min facile, puis 3 × 20 s d’accélérations progressives.');
    expect(tuesday.cooldown).toBe('10 min facile.');
  });

  // CHANGE_REQUEST_018 — the memory block is now the PLAN card, 4 min (it was
  // M2 for 6 min with the recall check), so the session is 2 min shorter.
  it('Wed 7 Oct, SKILL SESSION, skipping: warm-up 8 + 3 jumps · memory PLAN 4 · skipping 18 · « Quatre coins » 10 · cool-down 5', () => {
    const skill = recipeOf(week, 'skill_session')!;
    expect(skill.warmup).toBe('8 min : trot facile, chevilles, poignets, épaules ; puis 3 sauts en longueur, réception tenue, retour en marchant.');
    expect(blockSequence(skill)).toEqual(['warmup', 'memory', 'skill_block', 'cardio', 'cooldown']);
    expect(skill.blocks.map((block) => block.title)).toEqual(['Mémoire · PLAN — 4 min', 'Corde à sauter — 18 min', 'Cardio, « Quatre coins » 30/15 — 10 min']);
    expect(skill.cooldown).toBe('5 min : retour au calme, mollets et chevilles.');
    expect(skill.durationMin).toBe(45);

    // 2 MEMORY: the PLAN card of the memory game (CR-018), no module, no recall check
    expect(memoryModulesOf(skill)).toEqual([]);
    expect(skill.blocks[0]!.faire).toBe('PLAN DU PARCOURS · Replace les 11 postes dans la salle.');

    // 3 SKILL BLOCK, skipping, 18 min
    const block = skillBlockOf(skill)!;
    expect(block.stationId).toBe(10);
    expect(block.durationMin).toBe(18);
    expect(skill.blocks[1]!.faire).toContain('5 DROIT · 5 GAUCHE · 10 JOINTS');
    expect(skill.blocks[1]!.faire).toContain('Partie A : 6 × 45 s, 30 à 45 s de repos ; tour 6 = variante pièce (gauche d’abord)');
    expect(skill.blocks[1]!.faire).toContain('Partie B : 4 cartes seules, 1 min de repos, UN essai chacune');
    expect(skill.blocks[1]!.regle).toBe('Stop : deux reprises au même changement → régresser comme le dit la carte.');
    // scores: restarts per round A (6 boxes) · restarts per card B (4 boxes)
    expect(block.drills.map((drill) => [drill.cardId, drill.measure])).toEqual(Array.from({ length: 10 }, () => ['S10_block_switch_fresh', 'restarts']));
    expect(block.drills.filter((drill) => drill.scoreLabel.includes('partie A'))).toHaveLength(6);
    expect(block.drills.filter((drill) => drill.scoreLabel.includes('partie B'))).toHaveLength(4);

    // 4 CARDIO « Quatre coins »: 4 atoms, finisher high knees, no target
    const cardio = cardioBlockOf(skill)!;
    expect(cardio.atoms.map((atom) => atom.cardId)).toEqual(['S08_chain_out', 'S03_ladder_one_hand_object', 'S00_jumping_jacks', 'S00_air_squats']);
    expect(cardio.finisher!.cardId).toBe('S00_high_knees');
    expect(cardio.durationMin).toBe(10);
    expect(cardio.target).toBeNull();
    expect(cardio.toReplace).toBeUndefined();
    expect(skill.blocks[2]!.faire).toContain('4 postes, 30 s de travail, 15 s pour passer au suivant, 3 tours (9 min) + 1 min de finisher');
    expect(skill.blocks[2]!.noter).toContain('jumping jacks par tour, squats faits par tour, erreurs aux cerceaux');
  });

  // CHANGE_REQUEST_018 — the memory slot is the ORDRE card, still 4 min.
  it('Thu 8 Oct, ENGINE CHAIN: warm-up 9 · fresh 2 · memory ORDRE 4 · power EMOM 6 · chain B 11 · « La montée » 10 · tail B 4 · cool-down 4, about 50 min, hard', () => {
    const session = sessionOf(week, 'chain_session')!;
    const chain = recipeById[session.recipeId]!;
    expect(session.load).toBe('hard');
    expect(chain.title).toBe('Enchaînement moteur');
    expect(chain.durationMin).toBe(50);
    expect(chain.warmup).toMatch(/^9 min : « La ligne des 18 m »\./);
    expect(chain.warmup).toContain('montées de genoux, talons-fesses, carioca à gauche, carioca à droite');
    expect(chain.warmup).toContain('2 accélérations de 20 m (60 % puis 85 %)');
    expect(chain.warmup).toMatch(/puis 3 sauts en longueur, réception tenue, retour en marchant\.$/);
    expect(blockSequence(chain)).toEqual(['warmup', 'fresh_reference', 'memory', 'power_emom', 'chain_block', 'cardio', 'tail_b', 'cooldown']);
    expect(chain.blocks.map((block) => block.title)).toEqual([
      'Référence fraîche — 2 min', 'Mémoire · ORDRE — 4 min', 'Puissance, EMOM 6 — 6 min',
      'Enchaînement B, la fin du test — 11 min', 'Cardio, « La montée », croissant — 10 min', 'Tail B — 4 min'
    ]);
    expect(chain.cooldown).toBe('4 min : marche facile.');

    // 2 FRESH REFERENCE, balance ladder
    expect(drillsOfBlock(chain.blocks[0]!).map((drill) => drill.cardId)).toEqual(['S09_balance_ladder', 'S09_balance_ladder']);

    // 4 POWER EMOM 6: odd 2 broad jumps + slalom 18 m, even 6 jump squats; best jump
    const power = powerEmomOf(chain)!;
    expect(power.durationMin).toBe(6);
    expect(power.atoms.map((atom) => atom.cardId)).toEqual(['S00_broad_jumps', 'S01_slalom_18m', 'S00_jump_squats']);
    expect(power.drills.map((drill) => [drill.measure, drill.scoreLabel])).toEqual([['best_jump_cm', 'Meilleur saut du bloc (cm)']]);
    expect(chain.blocks[2]!.faire).toBe('EMOM 6. Minutes impaires : 2 sauts en longueur + slalom 18 m aller simple, pleine vitesse, retour en marchant. Minutes paires : 6 jump squats.');

    // 5 CHAIN B: 4 rounds, 60 s rest, slalom → skipping card → racket; no tail A
    const block = chainBlockOf(chain)!;
    expect(block.rounds).toBe(4);
    expect(block.restS).toBe(60);
    expect(block.durationMin).toBe(11);
    expect(block.stations).toEqual([1, 10, 11]);
    expect(block.intensity).toBe('hard');
    expect(block.tailA).toBeUndefined();
    expect(chain.blocks[3]!.faire).toBe('4 tours, 60 s de repos, aussi vite que propre : slalom 18 m aller-retour → 5 m de footing → UNE carte corde (5 D · 5 G · 10 J) → 5 m de footing → raquette au-dessus des 3 obstacles, un passage.');
    expect(drillsOfBlock(chain.blocks[3]!).map((drill) => drill.measure)).toEqual(['round_time_s', 'restarts', 'drops', 'cones_touched']);

    // 6 CARDIO « La montée »: wall bars + air squats (+4) + high knees (+10), no jump atom
    const cardio = cardioBlockOf(chain)!;
    expect(cardio.atoms.map((atom) => atom.cardId)).toEqual(['S03_ladder_climb_jump_finish', 'S00_air_squats', 'S00_high_knees']);
    expect(cardio.valueLabel).toBe('Dernier tour terminé');
    expect(chain.blocks[4]!.faire).toContain('air squats 4 · 8 · 12 · 16 · 20… (+4) + montées de genoux 20 · 30 · 40 · 50 · 60… (+10)');
    expect(chain.blocks[4]!.regle).toContain('AUCUN saut');

    // 7 TAIL B balance ladder, stop rule
    expect(tailBOf(chain)!.minutes.every((minute) => minute.drill.cardId === 'S09_balance_ladder')).toBe(true);
    expect(tailBOf(chain)!.stopRule).toContain('vertige ou 3 touchers dans une minute');
  });
});

// ---------- 4. the engine chain shape ----------

describe('CR-013 v3 — the engine chain (W5+): no tail A, a power EMOM that is not the cardio block, one cardio block, tail B last', () => {
  it('weeks 5 to 10', () => {
    for (const n of [5, 6, 7, 8, 9, 10]) {
      const chain = recipeOf(weekNo(n), 'chain_session')!;
      const sequence = blockSequence(chain);
      expect(chainBlockOf(chain)?.tailA, `week ${n}`).toBeUndefined();
      expect(sequence.filter((kind) => kind === 'power_emom'), `week ${n}`).toHaveLength(1);
      expect(cardioBlocksOf(chain), `week ${n}`).toHaveLength(1);
      expect(sequence.at(-2), `week ${n}`).toBe('tail_b');
      expect(sequence.at(-1)).toBe('cooldown');
      expect(sequence.indexOf('fresh_reference')).toBeLessThan(sequence.indexOf('power_emom'));
      expect(validateV4PoliceSessions(weekNo(n)), `week ${n}`).toEqual([]);
    }
  });

  it('is enforced: a power EMOM retagged as cardio would give two cardio blocks and is flagged (R-WS-16)', () => {
    const chain = structuredClone(buildChainSessionRecipe(5));
    chain.id = 'v3-fixture-chain-two-cardio';
    const power = chain.blocks.find((block) => block.kind === 'power_emom')!;
    power.kind = 'cardio';
    power.spec = { kind: 'cardio', format: 'emom', atoms: [cardRef('S00_jump_squats')], durationMin: 10, target: null };
    recipeById[chain.id] = chain;
    const errors = validateV4PoliceSessions(fixture(5, { chain }));
    expect(errors.some((error) => error.includes('R-WS-16'))).toBe(true);
  });

  it('is enforced: a tail A put back into the engine chain is flagged (R-WS-34)', () => {
    const chain = structuredClone(buildChainSessionRecipe(5));
    chain.id = 'v3-fixture-chain-tail-a';
    const block = chainBlockOf(chain)!;
    block.tailA = { ...cardRef('S09_balance_ladder'), drillId: 'tail_a:x', measure: 'touchdowns', scoreLabel: 'x' };
    block.tailASeconds = 30;
    recipeById[chain.id] = chain;
    expect(validateV4PoliceSessions(fixture(5, { chain })).some((error) => error.includes('R-WS-34'))).toBe(true);
  });

  it('is enforced: an engine chain with no power EMOM is flagged', () => {
    const chain = structuredClone(buildChainSessionRecipe(5));
    chain.id = 'v3-fixture-chain-no-power';
    chain.blocks = chain.blocks.filter((block) => block.kind !== 'power_emom');
    recipeById[chain.id] = chain;
    expect(validateV4PoliceSessions(fixture(5, { chain })).some((error) => error.includes('EMOM puissance'))).toBe(true);
  });

  it('the hard blocks are several, on purpose: no "one hard block" error in any engine week', () => {
    for (const n of [5, 6, 7, 8, 9, 10]) {
      expect(validateWeek(weekNo(n)).some((error) => /R-TL-04|un seul bloc dur/.test(error))).toBe(false);
    }
  });

  it('the engine chain reads "à bloc" in the data as hard', () => {
    for (const n of [5, 6, 7, 8, 9, 10]) expect(sessionOf(weekNo(n), 'chain_session')!.load).toBe('hard');
  });
});

// A two-session fixture week from a week number's own sessions, with any
// recipe replaced.
function fixture(n: number, replace: { skill?: SessionRecipe; chain?: SessionRecipe }): TrainingWeek {
  const week = weekNo(n);
  const skill = sessionOf(week, 'skill_session')!;
  const chain = sessionOf(week, 'chain_session')!;
  return {
    id: `v3-fixture-${n}`, startDate: week.startDate, endDate: week.endDate, phase: week.phase,
    sessions: [
      { ...skill, recipeId: replace.skill?.id ?? skill.recipeId },
      { ...chain, recipeId: replace.chain?.id ?? chain.recipeId }
    ]
  };
}

// ---------- 5. R-WS-30, four atoms maximum (answer 5 of 2 October) ----------

describe('CR-013 v3 — R-WS-30 allows four atoms; a fifth is flagged; reused cardio keeps its four', () => {
  it('the limit is four and the week 5 exception list is gone', async () => {
    expect(MAX_CARDIO_ATOMS).toBe(4);
    const module = await import('../coach/sessionShapes');
    expect('CARDIO_ATOM_EXCEPTIONS' in module).toBe(false);
    expect('maxCardioAtoms' in module).toBe(false);
    expect(validateV4PoliceSessions(weekNo(5)).some((error) => error.includes('R-WS-30'))).toBe(false);
  });

  it('a fourth atom in the week 5 engine chain cardio passes; a fifth is flagged', () => {
    const chain = structuredClone(buildChainSessionRecipe(5));
    chain.id = 'v3-fixture-chain-four-atoms';
    const atoms = (chain.blocks.find((block) => block.kind === 'cardio')!.spec as { atoms: unknown[] }).atoms;
    atoms.push(cardRef('S00_jumping_jacks'));
    recipeById[chain.id] = chain;
    expect(validateV4PoliceSessions(fixture(5, { chain })).some((error) => error.includes('R-WS-30'))).toBe(false);
    atoms.push(cardRef('S00_jump_squats'));
    expect(validateV4PoliceSessions(fixture(5, { chain })).some((error) => error.includes('R-WS-30'))).toBe(true);
  });

  it('a reused « Quatre coins » keeps its four atoms in weeks 9 to 11 (no air squats removed)', () => {
    for (const n of [9, 10, 11]) {
      const skill = recipeOf(weekNo(n), 'skill_session')!;
      expect(cardioBlockOf(skill)!.atoms.map((atom) => atom.cardId), `week ${n}`).toEqual(['S08_chain_out', 'S03_ladder_one_hand_object', 'S00_jumping_jacks', 'S00_air_squats']);
      expect(cardioBlockOf(skill)!.toReplace).toBeUndefined();
      expect(validateWeek(weekNo(n)), `week ${n}`).toEqual([]);
    }
  });
});

// ---------- 6. Tuesdays ----------

describe('CR-013 v3 — Tuesday sets W5-W11 equal run_intervals v4', () => {
  const tuesday = (n: number) => recipeOf(weekNo(n), 'run_intervals')!;

  it('each week, from the table', () => {
    const expected: Record<number, string> = {
      5: '3 × 4 min à 5:25 /km, récupération 3 min en trottinant',
      6: '5 × 4 min à 5:25 /km, récupération 3 min en trottinant',
      7: '6 × 2 min à 5:05 /km, récupération 2 min en trottinant',
      8: '3 × 5 min à 5:20 /km, récupération 3 min en trottinant',
      10: '4 × 3 min à 5:15 /km, récupération 2 min en trottinant',
      11: '4 × 1 min à 5:00 /km, récupération 2 min en trottinant'
    };
    for (const [n, text] of Object.entries(expected)) expect(tuesday(Number(n)).blocks[0]!.faire, `week ${n}`).toContain(text);
    expect(runIntervalsProgression.map((row) => row.week)).toEqual([2, 3, 4, 5, 6, 7, 8, 10, 11]);
  });

  it('W6 shows 5 × 4: the reset volumeFactor does not touch it (nor the taper one in W11)', () => {
    expect(tuesday(6).blocks[0]!.title).toBe('5 × 4 min à 5:25 — main set');
    expect(sessionOf(weekNo(6), 'run_intervals')!.volumeFactor).toBe(1);
    expect(sessionOf(weekNo(11), 'run_intervals')!.volumeFactor).toBe(1);
  });

  it('W7-W8 run on the treadmill and show the km/h', () => {
    expect(tuesday(7).blocks[0]!.title).toBe('6 × 2 min à 5:05 (11,8 km/h, sur tapis) — main set');
    expect(tuesday(8).blocks[0]!.title).toBe('3 × 5 min à 5:20 (11,3 km/h, sur tapis) — main set');
    for (const n of [7, 8]) {
      expect(tuesday(n).blocks[0]!.faire).toMatch(/^Sur tapis, pente 1 % : /);
      expect(tuesday(n).purpose).toContain('Sur tapis, pente 1 %');
    }
    for (const n of [5, 6, 10, 11]) expect(textsOf(tuesday(n)).join(' ')).not.toContain('tapis');
  });

  it('W9 Tuesday is the hill sprints: 6 sprints, walk back, never on a treadmill, no intervals', () => {
    const session = sessionOf(weekNo(9), 'run_intervals')!;
    const recipe = recipeById[session.recipeId]!;
    expect(session.date).toBe('2026-11-03');
    expect(recipe.blocks.map((block) => [block.kind, block.title])).toEqual([['hill_sprints', 'Côtes : 6 sprints de 8 à 10 s, retour en marchant']]);
    expect(recipe.blocks[0]!.faire).toContain('Jamais sur un tapis');
    expect(textsOf(recipe).join(' ')).not.toMatch(/\d+ × \d+ min à/);
    expect(validateWeek(weekNo(9))).toEqual([]);
  });

  it('no text anywhere says « Re-test »', () => {
    for (const text of [...allTexts(), ...runIntervalsProgression.map((row) => row.purpose)]) expect(text).not.toMatch(/re-?test/i);
  });

  it('no Tuesday screen or text carries the heat line (answer 7)', () => {
    for (let n = 3; n <= 11; n += 1) {
      for (const text of textsOf(tuesday(n))) expect(text, `week ${n}`).not.toMatch(/28 °C|ressenti/);
    }
  });
});

// ---------- 7. travel and crossfit_plus ----------

describe('CR-013 v3 — W7 and W8 have no Monday session; W6 and W9 have a Saturday CrossFit day and a Sunday run', () => {
  it('travel weeks: no Monday, Tuesday treadmill, Wednesday skill, Thursday engine chain, Saturday run', () => {
    for (const n of [7, 8]) {
      const week = weekNo(n);
      expect(week.sessions.some((item) => new Date(`${item.date}T12:00:00Z`).getUTCDay() === 1), `week ${n}`).toBe(false);
      expect(week.sessions.map((item) => item.kind)).toEqual(['run_intervals', 'skill_session', 'chain_session', 'trail_maintenance']);
      expect(validateWeek(week)).toEqual([]);
    }
    expect(weekNo(7).sessions.map((item) => item.date)).toEqual(['2026-10-20', '2026-10-21', '2026-10-22', '2026-10-24']);
  });

  it('travel weeks never name the wall bars or the ghost; the hoops travel and stay (answer 4)', () => {
    for (const n of [7, 8]) {
      for (const session of weekNo(n).sessions) {
        const text = textsOf(recipeById[session.recipeId]!).join(' ').toLowerCase();
        expect(text, `${session.id}`).not.toMatch(/espalier|fantôme|échelle extérieure/);
        expect(recipeById[session.recipeId]!.equipment.join(' ').toLowerCase()).not.toMatch(/espalier|échelle/);
      }
      const skill = recipeOf(weekNo(n), 'skill_session')!;
      expect(skill.equipment).toContain('cerceaux');
      expect(cardioBlockOf(skill)!.atoms.map((atom) => atom.cardId)).toContain('S08_chain_out');
    }
  });

  it('travel weeks: the reused cardio drops only the wall bars atoms and names that gap only', () => {
    const skill = recipeOf(weekNo(7), 'skill_session')!;
    const chain = recipeOf(weekNo(7), 'chain_session')!;
    expect(cardioBlockOf(skill)!.atoms.map((atom) => atom.cardId)).toEqual(['S08_chain_out', 'S00_jumping_jacks', 'S00_air_squats']);
    expect(cardioBlockOf(skill)!.toReplace!.map((atom) => atom.cardId)).toEqual(['S03_ladder_one_hand_object']);
    expect(cardioBlockOf(chain)!.toReplace!.map((atom) => atom.cardId)).toEqual(['S03_ladder_climb_jump_finish']);
    expect(skill.blocks.find((block) => block.kind === 'cardio')!.regle).toBe('Atomes à remplacer dans Cowork : un atome sans le matériel de l’hôtel.');
  });

  it('crossfit_plus: Sat 17 Oct and Sat 7 Nov are CrossFit days, hard, external content; the run moves to Sunday', () => {
    for (const [n, saturday, sunday] of [[6, '2026-10-17', '2026-10-18'], [9, '2026-11-07', '2026-11-08']] as const) {
      const week = weekNo(n);
      const crossfit = week.sessions.find((item) => item.date === saturday)!;
      expect(crossfit).toMatchObject({ kind: 'crossfit_class', load: 'hard', status: 'coached', id: `${saturday}:crossfit_class` });
      expect(recipeById[crossfit.recipeId]!.blocks).toEqual([]);
      expect(week.sessions.find((item) => item.kind === 'trail_maintenance')!.date).toBe(sunday);
      expect(week.sessions).toHaveLength(6);
      expect(validateWeek(week), `week ${n}`).toEqual([]);
    }
  });

  it('week 6 Tuesday 13 Oct shows 5 × 4 min at 5:25, Saturday 17 is CrossFit, the run is Sunday 18', () => {
    const week = weekNo(6);
    expect(week.sessions.map((item) => [item.date, item.kind])).toEqual([
      ['2026-10-12', 'crossfit_class'], ['2026-10-13', 'run_intervals'], ['2026-10-15', 'skill_session'],
      ['2026-10-16', 'chain_session'], ['2026-10-17', 'crossfit_class'], ['2026-10-18', 'trail_maintenance']
    ]);
  });
});

// ---------- 8. three hard days ----------

describe('CR-013 v3 — three hard days in a row are flagged, a crossfit_plus day counted as hard', () => {
  it('Fri chain · Sat crossfit_plus (load written moderate) · Sun hard: flagged', () => {
    const week = structuredClone(weekNo(6));
    week.sessions.find((item) => item.date === '2026-10-17')!.load = 'moderate';
    week.sessions.find((item) => item.date === '2026-10-18')!.load = 'hard';
    expect(validateWeek(week)).toContain('Trois journées explosives consécutives.');
  });

  it('the same Saturday as an ordinary moderate day breaks the run of three', () => {
    const week = structuredClone(weekNo(6));
    const saturday = week.sessions.find((item) => item.date === '2026-10-17')!;
    saturday.kind = 'skill_session';
    saturday.load = 'moderate';
    week.sessions.find((item) => item.date === '2026-10-18')!.load = 'hard';
    expect(validateWeek(week)).not.toContain('Trois journées explosives consécutives.');
  });

  it('the generated weeks never have three hard days in a row', () => {
    for (let n = 3; n <= 11; n += 1) expect(validateWeek(weekNo(n))).not.toContain('Trois journées explosives consécutives.');
  });
});

// ---------- 9. W8 placeholder, W9-W10 racket ----------

describe('CR-013 v3 — W8 skill block is a placeholder naming both options; W9-W10 skill station = 11, tails = balance', () => {
  it('week 8', () => {
    const skill = recipeOf(weekNo(8), 'skill_session')!;
    const block = blockOfKind(skill, 'skill_block')!;
    expect(block.placeholder).toBe(true);
    expect(block.title).toBe('Slalom ou raquette, à confirmer — 18 min');
    expect(skillStationOf(skill)).toBeNull();
  });

  it('weeks 9 and 10', () => {
    for (const n of [9, 10]) {
      expect(skillStationOf(recipeOf(weekNo(n), 'skill_session')!)).toBe(11);
      const chain = recipeOf(weekNo(n), 'chain_session')!;
      expect(tailBOf(chain)!.minutes.every((minute) => minute.drill.cardId === 'S09_balance_ladder')).toBe(true);
      expect(drillsOfBlock(chain.blocks[0]!).every((drill) => drill.cardId === 'S09_balance_ladder')).toBe(true);
    }
  });

  it('week 7 reuses the week 5 skipping block unchanged (R-SP-05)', () => {
    expect(skillBlockOf(recipeOf(weekNo(7), 'skill_session')!)).toEqual(skillBlockOf(recipeOf(weekNo(5), 'skill_session')!));
  });

  it('week 6 reuses chain B unchanged; travel and ghost chains are named gaps', () => {
    expect(chainBlockOf(recipeOf(weekNo(6), 'chain_session')!)).toEqual(chainBlockOf(recipeOf(weekNo(5), 'chain_session')!));
    expect(blockOfKind(recipeOf(weekNo(7), 'chain_session')!, 'chain_block')!.title).toBe('Enchaînement voyage : à construire — 11 min');
    expect(blockOfKind(recipeOf(weekNo(9), 'chain_session')!, 'chain_block')!.title).toBe('Circuit fantôme : à venir, postes 1 à 11 — 11 min');
  });

  it('weeks 6, 9, 10 reuse the week 5 power EMOM unchanged, same best-jump box (answer 3)', () => {
    const week5 = recipeOf(weekNo(5), 'chain_session')!;
    for (const n of [6, 9, 10]) {
      const chain = recipeOf(weekNo(n), 'chain_session')!;
      expect(powerEmomOf(chain), `week ${n}`).toEqual(powerEmomOf(week5));
      expect(blockOfKind(chain, 'power_emom')).toEqual(blockOfKind(week5, 'power_emom'));
      expect(drillsOfBlock(blockOfKind(chain, 'power_emom')!).map((drill) => drill.drillId)).toEqual(['power:best_jump']);
    }
  });

  it('weeks 7 and 8: the hotel power block is a named gap until the week 7 build (answer 2)', () => {
    for (const n of [7, 8]) {
      const block = blockOfKind(recipeOf(weekNo(n), 'chain_session')!, 'power_emom')!;
      expect(block.placeholder, `week ${n}`).toBe(true);
      expect(block.title).toBe(`${POWER_EMOM_HOTEL_PLACEHOLDER} — 6 min`);
      expect(drillsOfBlock(block)).toEqual([]);
    }
  });
});

// ---------- 10. racket per set ----------

describe('CR-013 v3 — the racket skill block scores one row per set (6 obstacle boxes)', () => {
  it('weeks 9 and 10', () => {
    for (const n of [9, 10]) {
      const block = skillBlockOf(recipeOf(weekNo(n), 'skill_session')!)!;
      const obstacles = block.drills.filter((drill) => drill.cardId === 'S11_racket_obstacles');
      expect(obstacles.map((drill) => drill.scoreLabel)).toEqual([
        'Chutes — obstacles, série 1, à plat 1', 'Chutes — obstacles, série 1, sur les obstacles', 'Chutes — obstacles, série 1, à plat 2',
        'Chutes — obstacles, série 2, à plat 1', 'Chutes — obstacles, série 2, sur les obstacles', 'Chutes — obstacles, série 2, à plat 2'
      ]);
      expect(new Set(block.drills.map((drill) => drill.cardId)).size).toBe(2); // R-WS-25: two cards
    }
  });
});

// ---------- 11. memory length ----------

// CHANGE_REQUEST_018 — the slot is the game card: 4 min, or 10 min with M4
// after the card in weeks 9 and 10 (it was 6 min of M4).
describe('CR-013 v3 / CR-018 — engine chain memory is 4 min in W5-W8 and 10 min in W9-W10', () => {
  it('the slot, and the session grows with it', () => {
    for (const n of [5, 6, 7, 8]) expect(blockOfKind(recipeOf(weekNo(n), 'chain_session')!, 'memory')!.title, `week ${n}`).toMatch(/— 4 min$/);
    expect(blockOfKind(recipeOf(weekNo(9), 'chain_session')!, 'memory')!.title).toBe('Mémoire · ORDRE — 10 min');
    expect(blockOfKind(recipeOf(weekNo(10), 'chain_session')!, 'memory')!.title).toBe('Mémoire · RÈGLES — 10 min');
  });
});

// ---------- 12. texts ----------

describe('CR-013 v3 — no text predicts an official time; no text says the race is on a Saturday', () => {
  it('across every generated session', () => {
    for (const text of allTexts()) {
      expect(text).not.toMatch(/6:15|6’15|temps officiel|chrono officiel|prédi/i);
      if (/11 oct/i.test(text)) expect(text).not.toMatch(/samedi/i);
    }
  });
});

// ---------- the screens ----------

describe('CR-013 v3 — the screens', () => {
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    localStorage.clear();
  });

  async function openSession(today: string, title: string) {
    localStorage.clear();
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(`${today}T12:00:00Z`));
    render(createElement(CoachConcoursApp));
    await screen.findByText(/Séances/);
    const matches = await screen.findAllByText(title);
    const card = matches.map((node) => node.closest('button.card')).find((node): node is HTMLButtonElement => node !== null)!;
    fireEvent.click(card);
    await screen.findByText('Ton programme');
  }

  it('Thu 8 Oct reads « à bloc », and its Retour asks for the best jump and the last round', async () => {
    await openSession('2026-10-05', 'Enchaînement moteur');
    expect(screen.getByText(/Intensité : à bloc/)).toBeTruthy();
    fireEvent.click(screen.getByText('Retour'));
    expect(await screen.findByLabelText('Meilleur saut du bloc (cm)')).toBeTruthy();
    expect(screen.getByLabelText('Dernier tour terminé')).toBeTruthy();
    expect(screen.queryByText(/tail A/i)).toBeNull();
  });

  it('Wed 7 Oct Retour: ten restart boxes for the skipping block', async () => {
    await openSession('2026-10-05', 'Séance compétence');
    fireEvent.click(screen.getByText('Retour'));
    expect(await screen.findByLabelText('Reprises — partie A, tour 6 (variante pièce)')).toBeTruthy();
    expect(screen.getAllByLabelText(/^Reprises — partie [AB]/)).toHaveLength(10);
  });

  it('Tue 3 Nov (hill sprints) asks for the sprints done, with no pace box', async () => {
    await openSession('2026-11-02', 'Côtes — sprints en montée');
    fireEvent.click(screen.getByText('Retour'));
    expect(await screen.findByLabelText('Sprints faits')).toBeTruthy();
    expect(screen.queryByLabelText(/^Rép 1/)).toBeNull();
    expect(screen.queryByLabelText('Répétitions faites')).toBeNull();
  });
});
