// CHANGE_REQUEST_013 v2 — the season table, week 4 content, and the answers
// to APP_REPORT_013.
//
// One describe block per item of the change request's own "Tests that must
// pass" list, in its order. The reference for week 4 is
// `handoffs/WEEK_4_PLAN_2026-09-28.md`; for every other number,
// `handoffs/rules/season_plan.md` v2 (THE TABLE).
//
// CHANGE_REQUEST_013 v3 — weeks 3 and 4 are unchanged and their assertions
// stay as written. Every assertion on weeks 5 to 11 is re-pointed to
// season_plan.md v3; the v3 table itself and the new behaviour are tested in
// `cr013v3.test.ts`.
//
// CHANGE_REQUEST_013 v5 — weeks 6 to 11 left the v3 table (SEASON_PLAN keeps
// weeks 3 to 5; weeks 6 to 11 are SEASON_PLAN_V4, tested in cr013v5.test.ts).
// Every loop below that ran to week 11 now stops at week 5; the assertions
// that only described the v3 weeks 6 to 11 are removed, with a note.
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createElement } from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import CoachConcoursApp from '../CoachConcoursApp';
import { generatePlan, validateV4PoliceSessions, validateWeek } from '../coach/planner';
import { recipeById } from '../coach/recipes';
import {
  PLACEHOLDER_LINE,
  SEASON_PLAN,
  blockSequence,
  buildChainSessionRecipe,
  buildSkillSessionRecipe,
  cardioBlockOf,
  chainBlockOf,
  drillsOfBlock,
  freshReferenceOf,
  isSessionShape,
  memoryBlockOf,
  memoryModulesOf,
  skillBlockOf,
  skillStationOf,
  tailBOf
} from '../coach/sessionShapes';
import { cardById } from '../data/exerciseCards';
import { runIntervalsProgression } from '../data/runIntervalsProgression';
import type { SessionRecipe, TrainingWeek } from '../coach/types';

const weeks = generatePlan();
const weekStarting = (date: string) => weeks.find((week) => week.startDate === date)!;
const WEEK_STARTS: Record<number, string> = {
  3: '2026-09-21', 4: '2026-09-28', 5: '2026-10-05', 6: '2026-10-12', 7: '2026-10-19',
  8: '2026-10-26', 9: '2026-11-02', 10: '2026-11-09', 11: '2026-11-16'
};
const weekNo = (n: number): TrainingWeek => weekStarting(WEEK_STARTS[n]!);
const recipeOf = (week: TrainingWeek, kind: string): SessionRecipe | undefined => {
  const session = week.sessions.find((item) => item.kind === kind);
  return session ? recipeById[session.recipeId] : undefined;
};
const policeRecipes = (week: TrainingWeek) => week.sessions.filter((item) => isSessionShape(item.kind)).map((item) => recipeById[item.recipeId]!);

// ---------- 1. the table ----------

describe('CR-013 v2 — SEASON_PLAN build weeks (the full v3 table is in cr013v3.test.ts)', () => {
  it('only week 3 carries the baseline, and the build week of weeks 3 to 5 is 4 (R-SP-04)', () => {
    expect(Object.values(SEASON_PLAN).filter((row) => row.baseline).map((row) => row.week)).toEqual([3]);
    expect(Object.values(SEASON_PLAN).filter((row) => row.buildWeek).map((row) => row.week)).toEqual([4]);
  });
});

// ---------- 2. week 3 unchanged ----------

describe('CR-013 v2 — week 3 still reproduces the two locked sessions block for block', () => {
  const skill = recipeOf(weekNo(3), 'skill_session')!;
  const chain = recipeOf(weekNo(3), 'chain_session')!;

  it('SKILL: warm-up 6 · mémoire 6 (M1+M2) · cerceaux 18 · AMRAP 10 · calme 5, no power slot, no recall drill', () => {
    expect(skill.id).toBe('skill-session-v1-week-3');
    expect(skill.warmup).toBe('6 min : trot facile, chevilles, poignets, épaules.');
    expect(skill.blocks.map((block) => block.title)).toEqual(['Mémoire — 6 min', 'Cerceaux et ballon — 18 min', 'Cardio AMRAP — 10 min']);
    expect(memoryModulesOf(skill)).toEqual(['M1', 'M2']);
    expect(memoryBlockOf(skill)!.drills).toBeUndefined();
    expect(skillBlockOf(skill)!.drills.map((drill) => drill.cardId)).toEqual(['S08_hand_then_chain', 'S08_chain_out']);
    expect(cardioBlockOf(skill)!.atoms.map((atom) => atom.cardId)).toEqual(['S01_slalom_18m', 'S03_ladder_climb_jump_finish', 'S00_half_burpees']);
    expect(skill.blocks[2]!.faire).toBe('Autant de tours que possible en 10 minutes : slalom 18 m, un aller-retour ; espaliers, 3 passages, monter et sauter ; 8 demi-burpees.');
    expect(skill.durationMin).toBe(45);
  });

  it('CHAIN: warm-up 6 · référence 3 · mémoire 4 (M3) · enchaînement 12 · EMOM 10 · tail B 5 · calme 5, racket tails', () => {
    expect(chain.id).toBe('chain-session-v1-week-3');
    expect(chain.warmup).toBe('6 min : trot facile, chevilles, épaules, quelques accélérations à la fin.');
    expect(chain.blocks.map((block) => block.title)).toEqual(['Référence fraîche — 3 min', 'Mémoire — 4 min', 'Enchaînement, modéré — 12 min', 'Cardio EMOM — 10 min', 'Tail B — 5 min']);
    expect(chain.blocks[2]!.faire).toBe('3 tours, 90 s de récupération entre les tours. Slalom 18 m, aller tout droit, slalom au retour. Puis la marche jusqu’aux espaliers. Puis espaliers, 3 passages, monter et sauter. Puis TAIL A : raquette et balle sur la planche d’équilibre, 30 s.');
    expect(chain.blocks[2]!.noter).toBe('Temps par tour · cônes touchés · chutes sur la planche.');
    expect(chain.blocks[3]!.faire).toBe('Minute 1 : carioca, 18 m aller-retour. Minute 2 : 10 jump squats. Minute 3 : 40 appuis en montées de genoux. Puis les trois mêmes à nouveau, jusqu’à la minute 10.');
    expect(chainBlockOf(chain)!.tailA!.cardId).toBe('S11_racket_on_board');
    expect(tailBOf(chain)!.minutes.map((minute) => minute.drill.cardId)).toEqual(['S11_racket_on_board', 'S11_racket_obstacles', 'S11_racket_on_board', 'S11_racket_obstacles']);
    expect(chain.durationMin).toBe(45);
  });

  it('the week 3 skill session keeps its locked load', () => {
    expect(weekNo(3).sessions.find((item) => item.kind === 'skill_session')!.load).toBe('low');
  });
});

// ---------- 3. week 4 = the plan file ----------

describe('CR-013 v2 — week 4 reproduces WEEK_4_PLAN_2026-09-28.md block for block', () => {
  const week = weekNo(4);
  const skillSession = week.sessions.find((item) => item.kind === 'skill_session')!;
  const chainSession = week.sessions.find((item) => item.kind === 'chain_session')!;
  const skill = recipeById[skillSession.recipeId]!;
  const chain = recipeById[chainSession.recipeId]!;

  it('the week: Mon CrossFit · Tue intervals · Thu skill · Fri chain · Sat 10-11 km, and it validates clean', () => {
    expect(week.sessions.map((item) => [item.date, item.kind])).toEqual([
      ['2026-09-28', 'crossfit_class'],
      ['2026-09-29', 'run_intervals'],
      ['2026-10-01', 'skill_session'],
      ['2026-10-02', 'chain_session'],
      ['2026-10-03', 'trail_maintenance']
    ]);
    expect(validateWeek(week)).toEqual([]);
  });

  it('Thu 1 Oct, SKILL SESSION, racket, ~49 min, moderate', () => {
    expect(skillSession.load).toBe('moderate');
    expect(skill.durationMin).toBe(49);
    expect(skill.warmup).toBe('8 min : trot facile, chevilles, poignets, épaules ; puis 3 sauts en longueur, réception tenue, retour en marchant.');
    expect(blockSequence(skill)).toEqual(['warmup', 'memory', 'skill_block', 'cardio', 'cooldown']);
    expect(skill.blocks.map((block) => block.title)).toEqual(['Mémoire, M1 — 6 min', 'Raquette — 18 min', 'Cardio AMRAP — 12 min']);

    // 2 MEMORY, M1, 6 min, last 2 min recall check, SCORE: errors
    expect(memoryModulesOf(skill)).toEqual(['M1']);
    expect(memoryBlockOf(skill)!.drills!.map((drill) => [drill.measure, drill.scoreLabel])).toEqual([['recall_errors', 'Erreurs de rappel sur 33']]);
    expect(skill.blocks[0]!.faire).toContain('Les 2 dernières minutes : contrôle de rappel, 33 éléments');

    // 3 SKILL BLOCK, racket, 18 min: board 7 min then obstacles 10 min
    const block = skillBlockOf(skill)!;
    expect(block.stationId).toBe(11);
    expect(block.durationMin).toBe(18);
    expect(block.drills.map((drill) => [drill.cardId, drill.measure])).toEqual([
      ['S11_racket_on_board', 'drops'],
      ['S11_racket_on_board', 'touchdowns'],
      ['S11_racket_obstacles', 'drops'],
      ['S11_racket_obstacles', 'drops'],
      ['S11_racket_obstacles', 'drops']
    ]);
    expect(skill.blocks[1]!.faire).toContain('3 × 30 s, 30 s de repos');
    expect(skill.blocks[1]!.faire).toContain('45 s à plat · 10 s · 30 s d’obstacles · 10 s · 45 s à plat, 2 séries, 90 s de repos');

    // 4 CARDIO, AMRAP 12: slalom · wall bars · skipping, no target
    const cardio = cardioBlockOf(skill)!;
    expect(cardio.format).toBe('amrap');
    expect(cardio.durationMin).toBe(12);
    expect(cardio.atoms.map((atom) => atom.cardId)).toEqual(['S01_slalom_18m', 'S03_ladder_climb_jump_finish', 'S10_block_switch_fresh']);
    expect(cardio.target).toBeNull();
    expect(skill.blocks[2]!.noter).toBe('Aucune cible. Noter seulement : les tours faits, et le score d’effort.');
    expect(skill.cooldown).toMatch(/^5 min/);
  });

  it('Fri 2 Oct, CHAIN SESSION, chain A, ~49 min, hard', () => {
    expect(chainSession.load).toBe('hard');
    expect(chain.durationMin).toBe(49);
    expect(chain.warmup).toMatch(/^8 min : .* ; puis 3 sauts en longueur, réception tenue, retour en marchant\.$/);
    expect(blockSequence(chain)).toEqual(['warmup', 'fresh_reference', 'memory', 'chain_block', 'cardio', 'tail_b', 'cooldown']);
    expect(chain.blocks.map((block) => block.title)).toEqual(['Référence fraîche — 3 min', 'Mémoire, M1 — 4 min', 'Enchaînement A, modéré — 12 min', 'Cardio EMOM — 12 min', 'Tail B — 5 min']);

    // 2 FRESH REFERENCE, balance ladder: min 2 and min 4
    expect(freshReferenceOf(chain)!.drills.map((drill) => [drill.cardId, drill.measure])).toEqual([
      ['S09_balance_ladder', 'balance_faults'],
      ['S09_balance_ladder', 'balance_faults']
    ]);
    // 3 MEMORY, M1, 4 min, no score
    expect(memoryModulesOf(chain)).toEqual(['M1']);
    expect(memoryBlockOf(chain)!.drills).toBeUndefined();

    // 4 CHAIN A: 3 rounds, 90 s, slalom → wall bars → 5 hoops, tail A 30 s balance
    const block = chainBlockOf(chain)!;
    expect(block.rounds).toBe(3);
    expect(block.restS).toBe(90);
    expect(block.stations).toEqual([1, 3, 8]);
    expect(block.durationMin).toBe(12);
    expect(block.intensity).toBe('moderate');
    expect(block.tailA!.cardId).toBe('S09_balance_ladder');
    expect(block.tailASeconds).toBe(30);
    expect(drillsOfBlock(chain.blocks[2]!).map((drill) => drill.measure)).toEqual(['round_time_s', 'cones_touched', 'foot_errors', 'touchdowns']);
    expect(chain.blocks[2]!.faire).toContain('changer de jambe à chaque tour');

    // 5 CARDIO, EMOM 12: carioca · skipping · 8 half burpees
    const cardio = cardioBlockOf(chain)!;
    expect(cardio.format).toBe('emom');
    expect(cardio.durationMin).toBe(12);
    expect(cardio.atoms.map((atom) => atom.cardId)).toEqual(['S01_carioca_footwork', 'S10_block_switch_fresh', 'S00_half_burpees']);
    expect(chain.blocks[3]!.noter).toBe('Aucune cible. Noter seulement : les 12 minutes tenues ou non, et le score d’effort.');

    // 6 TAIL B, balance ladder, 4 × 1 min, 20 s between, stop rule
    const tail = tailBOf(chain)!;
    expect(tail.minutes.map((minute) => minute.label)).toEqual([
      'une jambe, yeux ouverts',
      'une jambe, yeux fermés, près d’un mur',
      'une jambe, ballon autour de la taille',
      'deux pieds sur la planche d’équilibre, ballon autour de la taille'
    ]);
    expect(tail.stopRule).toContain('vertige ou 3 touchers dans une minute');
    expect(chain.blocks[4]!.faire).toMatch(/^4 × 1 min, 20 s entre les minutes\./);
  });

  it('Sat 3 Oct: 10-11 km easy, about 250 m D+, no hill sprints', () => {
    const run = recipeOf(week, 'trail_maintenance')!;
    expect(run.blocks.map((block) => block.title)).toEqual(['Sortie facile — 10 à 11 km, environ 250 m D+']);
    expect(run.blocks[0]!.faire).toContain('Pas de vitesse, pas de sprint final');
  });
});

// ---------- 4. cardio doses ----------

describe('CR-013 v2 — both police cardio blocks of each week last cardioMin; build weeks never decrease (R-WS-32/33)', () => {
  it('every police cardio block lasts the week’s cardioMin', () => {
    for (let n = 3; n <= 5; n += 1) {
      for (const recipe of policeRecipes(weekNo(n))) {
        expect(cardioBlockOf(recipe)!.durationMin).toBe(SEASON_PLAN[n]!.cardioMin);
      }
    }
  });

  it('build weeks never decrease', () => {
    const doses = Object.values(SEASON_PLAN).filter((row) => row.buildWeek).map((row) => row.cardioMin);
    expect(doses).toEqual([12]);
    for (let index = 1; index < doses.length; index += 1) expect(doses[index]!).toBeGreaterThanOrEqual(doses[index - 1]!);
  });

  it('is enforced: a cardio block off the table’s dose is flagged', () => {
    const skill = structuredClone(buildSkillSessionRecipe(4));
    const chain = structuredClone(buildChainSessionRecipe(4));
    skill.id = 'v2-fixture-skill-dose';
    chain.id = 'v2-fixture-chain-dose';
    (skill.blocks.find((block) => block.kind === 'cardio')!.spec as { durationMin: number }).durationMin = 15;
    recipeById[skill.id] = skill;
    recipeById[chain.id] = chain;
    const fixture: TrainingWeek = {
      id: 'v2-fixture', startDate: '2026-09-28', endDate: '2026-10-04', phase: 'combine',
      sessions: [
        { id: 'v2-fixture:skill', date: '2026-10-01', dayLabel: 'JEU', kind: 'skill_session', recipeId: skill.id, status: 'proposed', phase: 'combine', load: 'moderate', volumeFactor: 1 },
        { id: 'v2-fixture:chain', date: '2026-10-02', dayLabel: 'VEN', kind: 'chain_session', recipeId: chain.id, status: 'proposed', phase: 'combine', load: 'hard', volumeFactor: 1 }
      ]
    };
    expect(validateV4PoliceSessions(fixture).some((error) => error.includes('R-WS-32'))).toBe(true);
  });
});

// ---------- 5. skill station ----------

describe('CR-013 v2 — the skill block station equals focus (v5: weeks 4 and 5)', () => {
  it('every week whose focus is a station: the station is the focus column', () => {
    for (const n of [4, 5]) {
      expect(skillStationOf(recipeOf(weekNo(n), 'skill_session')!)).toBe(SEASON_PLAN[n]!.focus);
    }
  });

  // CHANGE_REQUEST_013 v5 — « station 8 (week 6) reuses the week 3 block »:
  // gone, week 6 is the park week (WEEK_6_FINAL_2026-10-12_v2).
});

// ---------- 6. cardio atoms vs focus ----------

describe('CR-013 v2 — no cardio atom belongs to the week’s focus station; W7 shows "atomes à remplacer"', () => {
  it('no police cardio atom is on the focus station, weeks 3 to 5', () => {
    for (let n = 3; n <= 5; n += 1) {
      const focus = SEASON_PLAN[n]!.focus;
      if (typeof focus !== 'number') continue;
      for (const recipe of policeRecipes(weekNo(n))) {
        expect(cardioBlockOf(recipe)!.atoms.map((atom) => atom.stationId)).not.toContain(focus);
      }
    }
  });

  it('week 4 has its own entry, so nothing is flagged there', () => {
    for (const recipe of policeRecipes(weekNo(4))) expect(cardioBlockOf(recipe)!.toReplace).toBeUndefined();
  });
});

// ---------- 7. skipping in cardio ----------

describe('CR-013 v2 — a skipping atom may appear in a cardio block (no freshOnly exclusion left)', () => {
  it('week 4 puts skipping in both cardio blocks and validates clean', () => {
    for (const recipe of policeRecipes(weekNo(4))) {
      expect(cardioBlockOf(recipe)!.atoms.map((atom) => atom.cardId)).toContain('S10_block_switch_fresh');
    }
    expect(validateV4PoliceSessions(weekNo(4))).toEqual([]);
  });

  it('the card list has no freshOnly field and carries the three new cards', () => {
    for (const card of Object.values(cardById)) expect('freshOnly' in card).toBe(false);
    expect(cardById.S00_broad_jumps).toMatchObject({ role: 'P', stationId: 0 });
    expect(cardById.S01_hill_sprints).toMatchObject({ role: 'C', stationId: 1 });
    expect(cardById.S09_balance_ladder).toMatchObject({ role: 'A', stationId: 9 });
  });
});

// ---------- 8. tails ----------

describe('CR-013 v2 — tails never use the focus station; weeks 4-5 use S09_balance_ladder', () => {
  it('no tail A or tail B drill sits on the week’s focus station', () => {
    for (let n = 3; n <= 5; n += 1) {
      const chain = recipeOf(weekNo(n), 'chain_session')!;
      const focus = SEASON_PLAN[n]!.focus;
      const tailStations = [
        ...(tailBOf(chain)?.minutes.map((minute) => minute.drill.stationId) ?? []),
        ...(chainBlockOf(chain)?.tailA ? [chainBlockOf(chain)!.tailA!.stationId] : [])
      ];
      if (typeof focus === 'number') expect(tailStations).not.toContain(focus);
    }
  });

  it('weeks 4 and 5: the fresh reference and tail B are the balance ladder', () => {
    for (const n of [4, 5]) {
      const chain = recipeOf(weekNo(n), 'chain_session')!;
      expect(freshReferenceOf(chain)!.drills.every((drill) => drill.cardId === 'S09_balance_ladder')).toBe(true);
      expect(tailBOf(chain)!.minutes.every((minute) => minute.drill.cardId === 'S09_balance_ladder')).toBe(true);
    }
  });

  // CHANGE_REQUEST_013 v5 — « weeks 7 and 8: the racket tails »: gone, weeks 7
  // and 8 are the travel kit, still to build.
});

// ---------- 9. placeholders ----------

describe('CR-013 v2 — every placeholder has no score box and no week 3 text (R-SP-03)', () => {
  const week3Texts = new Set(
    [...policeRecipes(weekNo(3))].flatMap((recipe) => recipe.blocks.flatMap((block) => [block.faire, block.details, block.noter].filter(Boolean) as string[]))
  );
  // CHANGE_REQUEST_013 v5 — every session of weeks 4 to 11, not only the two
  // v3 shapes: from week 7 the named gaps sit in the v4 kinds.
  const placeholders = [4, 5, 6, 7, 8, 9, 10, 11].flatMap((n) => weekNo(n).sessions.flatMap((session) => recipeById[session.recipeId]!.blocks.filter((block) => block.placeholder)));

  // CHANGE_REQUEST_013 v6 — week 7 has its content: no placeholder left there.
  it('there are placeholders to check: « Contenu à construire (semaine n) », weeks 8 to 11 (v6)', () => {
    const titles = new Set(placeholders.map((block) => block.title));
    // CHANGE_REQUEST_013 v7 — week 8 has its content: weeks 9 to 11.
    for (const n of [9, 10, 11]) expect(titles).toContain(`Contenu à construire (semaine ${n})`);
    expect(titles).not.toContain('Contenu à construire (semaine 7)');
    expect(titles).not.toContain('Contenu à construire (semaine 8)');
  });

  it('each one: no spec, no drill, only "À construire dans Cowork", nothing from week 3', () => {
    for (const block of placeholders) {
      expect(block.spec).toBeUndefined();
      expect(drillsOfBlock(block)).toEqual([]);
      expect(block.faire).toBe(PLACEHOLDER_LINE);
      expect(block.noter).toBeUndefined();
      expect(block.details).toBeUndefined();
      expect(week3Texts.has(block.faire)).toBe(false);
    }
  });

  it('a week with placeholders still validates clean: the placeholder counts as the block (R-SP-06)', () => {
    for (const n of [5, 6, 7, 8, 9, 10, 11]) expect(validateWeek(weekNo(n))).toEqual([]);
  });
});

// ---------- 10. power slot ----------

describe('CR-013 v2 — the power slot appears in both police warm-ups exactly when powerJumps > 0', () => {
  it('weeks 3 to 5', () => {
    for (let n = 3; n <= 5; n += 1) {
      const jumps = SEASON_PLAN[n]!.powerJumps;
      for (const recipe of policeRecipes(weekNo(n))) {
        if (jumps > 0) expect(recipe.warmup).toContain(`puis ${jumps} sauts en longueur, réception tenue, retour en marchant`);
        else expect(recipe.warmup).not.toContain('sauts en longueur');
      }
    }
  });

  it('the power slot is never scored (v3: only the power EMOM block scores its best jump)', () => {
    for (let n = 4; n <= 5; n += 1) {
      for (const recipe of policeRecipes(weekNo(n))) {
        const outsideEmom = recipe.blocks.filter((block) => block.kind !== 'power_emom').flatMap(drillsOfBlock);
        expect(outsideEmom.some((drill) => drill.cardId === 'S00_broad_jumps')).toBe(false);
      }
    }
  });
});

// ---------- 11. recall check ----------

// CHANGE_REQUEST_018 — from week 5 memory_modules.md v3 replaces the recall
// check and the weekly module with one game card per police session; those
// weeks are covered by cr018.test.ts. Week 4 is unchanged and stays here.
describe('CR-013 v2 — the skill memory block carries a recall_errors drill in week 4 (R-MM-04 v2)', () => {
  it('week 4, and never in the chain session; week 5 scores the game card instead', () => {
    const skill = recipeOf(weekNo(4), 'skill_session')!;
    expect(memoryBlockOf(skill)!.drills!.map((drill) => drill.measure)).toEqual(['recall_errors']);
    expect(memoryBlockOf(recipeOf(weekNo(4), 'chain_session')!)!.drills).toBeUndefined();
    for (let n = 5; n <= 5; n += 1) {
      for (const recipe of policeRecipes(weekNo(n))) expect(memoryBlockOf(recipe)!.drills!.map((drill) => drill.measure)).toEqual(['memory_card']);
    }
  });

  it('both police sessions use the week’s module in week 4 (R-MM-05 v2)', () => {
    for (const recipe of policeRecipes(weekNo(4))) expect(memoryModulesOf(recipe)).toEqual([SEASON_PLAN[4]!.memory]);
  });
});

// ---------- 12. skill load ----------

describe('CR-013 v2 — the skill session load is moderate (Q3)', () => {
  it('weeks 4 and 5 (v5: the skill_park of weeks 6 to 11 is moderate too, cr013v5.test.ts)', () => {
    for (let n = 4; n <= 5; n += 1) {
      expect(weekNo(n).sessions.find((item) => item.kind === 'skill_session')!.load).toBe('moderate');
    }
  });
});

// ---------- 13. week 11 ----------

// CHANGE_REQUEST_013 v5 — removed: the v3 taper session. Week 11 is Mon
// CrossFit · Tue intervals · Wed « Compétences au parc » (offload, to build) ·
// Fri 20 the police test (cr013v5.test.ts).

// ---------- 14. weekend runs ----------

describe('CR-013 v2 — the weekend run: W4 without hill sprints; W5 is the race, Sunday', () => {
  // CHANGE_REQUEST_013 v5 — the weekend runs of weeks 6 to 10 and the W10 hill
  // sprints are gone: the weekend is the trail day, label only (R-SP-10).
  it('W4 has no hill sprint block', () => {
    expect(recipeOf(weekNo(4), 'trail_maintenance')!.blocks.some((block) => block.kind === 'hill_sprints')).toBe(false);
  });

  it('W5: the race replaces the weekend run, on Sunday 11 October', () => {
    const week = weekNo(5);
    expect(week.sessions.some((item) => item.kind === 'trail_maintenance')).toBe(false);
    const race = week.sessions.find((item) => item.kind === 'trail_event')!;
    expect(race.date).toBe('2026-10-11');
    expect(race.dayLabel).toBe('DIM');
  });
});

// ---------- 15. texts ----------

describe('CR-013 v2 — no text says the race is on a Saturday; nothing predicts an official time', () => {
  const allTexts = (): string[] => {
    const texts: string[] = runIntervalsProgression.map((row) => row.purpose);
    for (const week of weeks) {
      for (const session of week.sessions) {
        const recipe = recipeById[session.recipeId];
        if (!recipe) continue;
        texts.push(recipe.title, recipe.purpose, recipe.warmup ?? '', recipe.cooldown ?? '');
        for (const block of recipe.blocks) texts.push(block.title, block.faire, block.regle ?? '', block.noter ?? '', block.details ?? '');
      }
    }
    return texts;
  };

  it('the race is never on a Saturday', () => {
    for (const text of allTexts()) {
      expect(text).not.toMatch(/samedi 11 oct/i);
      if (/11 oct/i.test(text)) expect(text).not.toMatch(/samedi/i);
    }
    expect(runIntervalsProgression.find((row) => row.week === 5)!.purpose).toContain('dimanche 11 oct.');
  });

  it('nothing predicts an official time (R-PC-04)', () => {
    for (const text of allTexts()) {
      expect(text).not.toMatch(/6:15|6’15|temps officiel|chrono officiel|prédi/i);
    }
  });
});

// ---------- the screens ----------

describe('CR-013 v2 — the screens', () => {
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    localStorage.clear();
  });

  async function openWeek(date: string) {
    localStorage.clear();
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(`${date}T12:00:00Z`));
    const view = render(createElement(CoachConcoursApp));
    await screen.findByText(/Séances/);
    return view.container;
  }

  // CHANGE_REQUEST_013 v5 — week 8 is a travel week of SEASON_PLAN_V4: load 2.
  // CHANGE_REQUEST_013 v7 — week 8 is WEEK_8_FINAL, load 4 (season_plan v5).
  it('the week bar reads the table’s load: week 8 shows 4 of 5 squares', async () => {
    const container = await openWeek('2026-10-26');
    const bar = container.querySelector('.weekbar')!;
    expect(bar.getAttribute('aria-label')).toBe('Charge de la semaine : 4 sur 5');
    expect(bar.querySelectorAll('i')).toHaveLength(5);
    expect(bar.querySelectorAll('i.on')).toHaveLength(4);
  });

  it('weeks 1 and 2 are not in the table and show no week bar', async () => {
    const container = await openWeek('2026-09-15');
    expect(container.querySelector('.weekbar')).toBeNull();
  });

  // CHANGE_REQUEST_013 v5 — the week 8 skill session is now the travel kit T3,
  // a named gap that still carries the cycle's card.
  // CHANGE_REQUEST_013 v7 — week 8 has content: the week 9 skill session.
  it('a placeholder session shows "À construire dans Cowork" and no score box but the memory card', async () => {
    await openWeek('2026-11-02');
    const matches = await screen.findAllByText('Compétences au parc');
    const card = matches.map((node) => node.closest('button.card')).find((node): node is HTMLButtonElement => node !== null)!;
    fireEvent.click(card);
    await screen.findByText('Ton programme');
    expect(screen.getAllByText(/À construire dans Cowork/).length).toBeGreaterThan(0);
    fireEvent.click(screen.getByText('Retour'));
    // The Retour tab shows the memory game's score box (CR-018: week 9's skill
    // card is PLAN), and the placeholder brings none.
    expect(await screen.findByLabelText('PLAN · cases justes sur 11')).toBeTruthy();
    const placeholderGroup = screen.queryAllByText(/Contenu à construire \(semaine 9\)/).map((node) => node.closest('.grp')).find(Boolean);
    expect(placeholderGroup?.querySelectorAll('input').length ?? 0).toBe(0);
  });
});
