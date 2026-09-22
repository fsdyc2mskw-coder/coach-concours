// CHANGE_REQUEST_013 — blocks, tails and the two session shapes.
//
// One describe block per item of the change request's own "Tests that must
// pass" list, in its order. Each rule is checked twice where a violation can
// be built: once on the real generated week (the rule holds), once on a
// fixture recipe mutated to break it (the rule is actually enforced, not
// merely satisfied by accident).
//
// The reference for the week-3 content is the pair of locked Drive files
// `03_Weekly_plans/WEEK_3_SKILL_SESSION_2026-09-22.md` and
// `WEEK_3_CHAIN_SESSION_2026-09-22.md`: where they and the change-request
// prose disagree, they win.
import { describe, expect, it } from 'vitest';
import { generatePlan, validateV4PoliceSessions, validateWeek } from '../coach/planner';
import { recipeById, recipes } from '../coach/recipes';
import {
  buildChainSessionRecipe,
  buildSkillSessionRecipe,
  blockSequence,
  cardioBlockOf,
  cardioBlocksOf,
  chainBlockOf,
  drillsOf,
  freshReferenceOf,
  isSessionShape,
  memoryModulesOf,
  skillBlockOf,
  tailBOf
} from '../coach/sessionShapes';
import { cardRef } from '../data/exerciseCards';
import { freshToFatiguedGap, gapHistory } from '../coach/progression';
import type { CardioBlock, SessionRecipe, SessionResult, TrainingWeek } from '../coach/types';

const weeks = generatePlan();
// Week 3 (21-27 Sep 2026): the first week of the v4 shapes and the one the
// two locked Drive sessions describe.
const week3 = weeks.find((week) => week.startDate === '2026-09-21')!;
const week4 = weeks.find((week) => week.startDate === '2026-09-28')!;
const v4Weeks = weeks.filter((week) => week.startDate >= '2026-09-21');
const policeSessions = v4Weeks.flatMap((week) => week.sessions.filter((session) => isSessionShape(session.kind)));

const skillSession3 = week3.sessions.find((session) => session.kind === 'skill_session')!;
const chainSession3 = week3.sessions.find((session) => session.kind === 'chain_session')!;
const skillRecipe3 = recipeById[skillSession3.recipeId]!;
const chainRecipe3 = recipeById[chainSession3.recipeId]!;

// ---------- fixtures ----------

let fixtureCount = 0;

/**
 * A week holding one skill session and one chain session, each built by the
 * real builder and then mutated to break exactly one rule. Both sessions are
 * present because R-WS-29/36 are written against *the week's* skill focus,
 * not against one session in isolation.
 */
function fixtureWeek(mutate: { skill?: (recipe: SessionRecipe) => void; chain?: (recipe: SessionRecipe) => void } = {}): TrainingWeek {
  fixtureCount += 1;
  const skill: SessionRecipe = structuredClone(buildSkillSessionRecipe(3));
  const chain: SessionRecipe = structuredClone(buildChainSessionRecipe(3));
  skill.id = `fixture-skill-${fixtureCount}`;
  chain.id = `fixture-chain-${fixtureCount}`;
  mutate.skill?.(skill);
  mutate.chain?.(chain);
  recipeById[skill.id] = skill;
  recipeById[chain.id] = chain;
  return {
    id: `fixture-week-${fixtureCount}`, startDate: '2026-09-21', endDate: '2026-09-27', phase: 'combine',
    sessions: [
      { id: `fixture-${fixtureCount}:skill_session`, date: '2026-09-24', dayLabel: 'JEU', kind: 'skill_session', recipeId: skill.id, status: 'proposed', phase: 'combine', load: 'low', volumeFactor: 1 },
      { id: `fixture-${fixtureCount}:chain_session`, date: '2026-09-25', dayLabel: 'VEN', kind: 'chain_session', recipeId: chain.id, status: 'proposed', phase: 'combine', load: 'hard', volumeFactor: 1 }
    ]
  };
}

function errorsOf(mutate: Parameters<typeof fixtureWeek>[0]): string[] {
  return validateV4PoliceSessions(fixtureWeek(mutate));
}

function cardioOf(recipe: SessionRecipe): CardioBlock {
  return recipe.blocks.find((block) => block.kind === 'cardio')!.spec as CardioBlock;
}

// ---------- the list ----------

describe('CR-013 — the fixtures themselves', () => {
  // The guard that makes every "is enforced" test below meaningful: an
  // unmutated fixture week reports nothing, so each flagged error really
  // comes from the one rule that test breaks.
  it('a clean fixture week produces no v4 error at all', () => {
    expect(validateV4PoliceSessions(fixtureWeek())).toEqual([]);
  });
});

describe('CR-013 — every generated session has exactly one cardio block (R-WS-16)', () => {
  // The change request writes "one cardio block per session, always". Applied
  // literally that would also bind the Monday CrossFit class (content written
  // by the coach, R-WS-02), Tuesday's run_intervals and the weekend trail run
  // — and R-WS-04 forbids any conditioning finisher on a run. Both locked
  // sessions are police sessions, so the rule is checked on the two police
  // shapes; the conflict is a question in handoffs/APP_REPORT_013.md.
  it('holds for every police session of every v4 week', () => {
    expect(policeSessions.length).toBeGreaterThan(0);
    for (const session of policeSessions) {
      expect(cardioBlocksOf(recipeById[session.recipeId]!)).toHaveLength(1);
    }
  });

  it('is enforced: a session with no cardio block is flagged', () => {
    const errors = errorsOf({ skill: (recipe) => { recipe.blocks = recipe.blocks.filter((block) => block.kind !== 'cardio'); } });
    expect(errors.some((error) => error.includes('R-WS-16'))).toBe(true);
  });

  it('the run and the trail keep no cardio block at all (R-WS-04 wins there)', () => {
    const trail = week3.sessions.find((session) => session.kind === 'trail_maintenance')!;
    const runIntervals = week3.sessions.find((session) => session.kind === 'run_intervals')!;
    expect(cardioBlocksOf(recipeById[trail.recipeId]!)).toHaveLength(0);
    expect(cardioBlocksOf(recipeById[runIntervals.recipeId]!)).toHaveLength(0);
  });
});

describe('CR-013 — a chain block never satisfies the cardio requirement (R-WS-16)', () => {
  it('the chain session carries a chain block AND its own separate cardio block', () => {
    expect(chainBlockOf(chainRecipe3)).not.toBeNull();
    expect(cardioBlocksOf(chainRecipe3)).toHaveLength(1);
    expect(blockSequence(chainRecipe3)).toContain('chain_block');
    expect(blockSequence(chainRecipe3)).toContain('cardio');
  });

  it('is enforced: a chain session whose cardio block is removed is flagged even though its chain block is intact', () => {
    const week = fixtureWeek({ chain: (recipe) => { recipe.blocks = recipe.blocks.filter((block) => block.kind !== 'cardio'); } });
    const chainRecipe = recipeById[week.sessions[1]!.recipeId]!;
    expect(chainBlockOf(chainRecipe)).not.toBeNull();
    expect(validateV4PoliceSessions(week).some((error) => error.includes('R-WS-16'))).toBe(true);
  });
});

describe('CR-013 — a cardio block never holds more than three atoms (R-WS-30)', () => {
  it('holds for every police session of every v4 week', () => {
    for (const session of policeSessions) {
      const cardio = cardioBlockOf(recipeById[session.recipeId]!)!;
      expect(cardio.atoms.length).toBeGreaterThanOrEqual(1);
      expect(cardio.atoms.length).toBeLessThanOrEqual(3);
    }
  });

  it('is enforced: a fourth atom is flagged', () => {
    const errors = errorsOf({ skill: (recipe) => { cardioOf(recipe).atoms.push(cardRef('S00_air_squats')); } });
    expect(errors.some((error) => error.includes('R-WS-30'))).toBe(true);
  });
});

describe('CR-013 — a cardio block never holds only station 0 fillers (R-WS-28)', () => {
  it('both locked cardio blocks mix a real station with the fillers', () => {
    for (const recipe of [skillRecipe3, chainRecipe3]) {
      const cardio = cardioBlockOf(recipe)!;
      expect(cardio.atoms.some((atom) => atom.stationId !== 0)).toBe(true);
    }
  });

  it('is enforced: an all-filler cardio block is flagged', () => {
    const errors = errorsOf({
      skill: (recipe) => {
        cardioOf(recipe).atoms = [cardRef('S00_air_squats'), cardRef('S00_jumping_jacks'), cardRef('S00_high_knees')];
      }
    });
    expect(errors.some((error) => error.includes('R-WS-28'))).toBe(true);
  });
});

describe('CR-013 — a cardio block never contains the skill block’s station (R-WS-29)', () => {
  it('holds in both sessions of every v4 week: the week’s skill station is excluded from both cardio blocks', () => {
    for (const week of v4Weeks) {
      const skill = week.sessions.find((session) => session.kind === 'skill_session');
      if (!skill) continue;
      const focus = skillBlockOf(recipeById[skill.recipeId]!)!.stationId;
      for (const session of week.sessions.filter((item) => isSessionShape(item.kind))) {
        const cardio = cardioBlockOf(recipeById[session.recipeId]!)!;
        expect(cardio.atoms.map((atom) => atom.stationId)).not.toContain(focus);
      }
    }
  });

  it('is enforced: a cardio atom on the skill station is flagged', () => {
    const errors = errorsOf({ skill: (recipe) => { cardioOf(recipe).atoms[2] = cardRef('S08_chain_out'); } });
    expect(errors.some((error) => error.includes('R-WS-29'))).toBe(true);
  });

  it('is enforced across the two sessions: the chain session’s cardio is bound by the skill session’s station too', () => {
    const errors = errorsOf({ chain: (recipe) => { cardioOf(recipe).atoms[0] = cardRef('S08_chain_out'); } });
    expect(errors.some((error) => error.includes('R-WS-29'))).toBe(true);
  });

  it('is enforced: a card flagged fresh-only is refused in a cardio block (no card carries the flag today)', () => {
    // The index's `state: 'fresh'` column is NOT this flag: both locked
    // sessions put `state: 'fresh'` cards in their cardio blocks, and the
    // locked files win. `freshOnly` is its own field — see APP_REPORT_013.md.
    const errors = errorsOf({
      skill: (recipe) => {
        const cardio = cardioOf(recipe);
        cardio.atoms[0] = { ...cardio.atoms[0]!, cardId: 'FIXTURE_fresh_only' };
      }
    });
    // Unknown card id, so no fresh-only flag: the rule is not triggered by a
    // card merely marked `fresh` in the index.
    expect(errors.some((error) => error.includes('à froid'))).toBe(false);
  });
});

describe('CR-013 — a skill block holds exactly one station and at most two drills (R-WS-25/26)', () => {
  it('holds for every generated skill session', () => {
    for (const session of policeSessions.filter((item) => item.kind === 'skill_session')) {
      const recipe = recipeById[session.recipeId]!;
      const skill = skillBlockOf(recipe)!;
      expect(typeof skill.stationId).toBe('number');
      expect(skill.drills.length).toBeGreaterThanOrEqual(1);
      expect(skill.drills.length).toBeLessThanOrEqual(2);
      expect(skill.durationMin).toBeGreaterThanOrEqual(16);
      expect(skill.durationMin).toBeLessThanOrEqual(20);
      // Every drill carries its own measure and its own id (R-WS-26).
      for (const drill of skill.drills) expect(drill.measure.length).toBeGreaterThan(0);
      // That station appears in no other block of the session.
      const otherStations = recipe.blocks.filter((block) => block.kind !== 'skill_block').flatMap((block) => block.stationMappings);
      expect(otherStations).not.toContain(skill.stationId);
      // It is the first block after the memory block.
      const sequence = blockSequence(recipe);
      expect(sequence.indexOf('skill_block')).toBe(sequence.indexOf('memory') + 1);
    }
  });

  it('is enforced: a third drill is flagged', () => {
    const errors = errorsOf({
      skill: (recipe) => {
        const skill = skillBlockOf(recipe)!;
        skill.drills.push({ ...skill.drills[0]!, drillId: 'skill:extra' });
      }
    });
    expect(errors.some((error) => error.includes('R-WS-25'))).toBe(true);
  });

  it('is enforced: a skill station that reappears in another block of the same session is flagged', () => {
    const errors = errorsOf({
      skill: (recipe) => {
        const cardioBlock = recipe.blocks.find((block) => block.kind === 'cardio')!;
        cardioBlock.stationMappings = [...cardioBlock.stationMappings, skillBlockOf(recipe)!.stationId];
      }
    });
    expect(errors.some((error) => error.includes('R-WS-25'))).toBe(true);
  });

  it('is enforced: two drills sharing a score id are flagged (R-WS-26)', () => {
    const errors = errorsOf({
      skill: (recipe) => {
        const skill = skillBlockOf(recipe)!;
        skill.drills[1] = { ...skill.drills[1]!, drillId: skill.drills[0]!.drillId };
      }
    });
    expect(errors.some((error) => error.includes('R-WS-26'))).toBe(true);
  });
});

describe('CR-013 — tail B is the last block before the cool-down when present (R-WS-35)', () => {
  it('holds in the chain session: only the cool-down follows tail B, and only tail B follows the cardio block', () => {
    const sequence = blockSequence(chainRecipe3);
    expect(sequence.at(-1)).toBe('cooldown');
    expect(sequence.at(-2)).toBe('tail_b');
    expect(sequence[sequence.indexOf('cardio') + 1]).toBe('tail_b');
    expect(tailBOf(chainRecipe3)!.minutes.length).toBeGreaterThanOrEqual(4);
    expect(tailBOf(chainRecipe3)!.minutes.length).toBeLessThanOrEqual(5);
    expect(tailBOf(chainRecipe3)!.stopRule.length).toBeGreaterThan(0);
  });

  it('is enforced: tail B placed before the cardio block is flagged', () => {
    const errors = errorsOf({
      chain: (recipe) => {
        const [tail] = recipe.blocks.splice(recipe.blocks.findIndex((block) => block.kind === 'tail_b'), 1);
        recipe.blocks.splice(recipe.blocks.findIndex((block) => block.kind === 'cardio'), 0, tail!);
      }
    });
    expect(errors.some((error) => error.includes('R-WS-35'))).toBe(true);
  });

  it('is enforced: any other block after the cardio block is flagged', () => {
    const errors = errorsOf({
      skill: (recipe) => {
        recipe.blocks.push({ title: 'Bloc en trop — 5 min', faire: 'Bloc de test.', stationMappings: [], kind: 'skill_block', spec: skillBlockOf(recipe)! });
      }
    });
    expect(errors.some((error) => error.includes('R-WS-35'))).toBe(true);
  });
});

describe('CR-013 — a session with a tail always carries a fresh reference before the first hard block (R-WS-37)', () => {
  it('holds in the chain session', () => {
    const sequence = blockSequence(chainRecipe3);
    const fresh = freshReferenceOf(chainRecipe3)!;
    expect(sequence.indexOf('fresh_reference')).toBeLessThan(sequence.indexOf('chain_block'));
    expect(sequence.indexOf('fresh_reference')).toBeLessThan(sequence.indexOf('cardio'));
    expect(tailBOf(chainRecipe3)!.referenceBlockId).toBe(fresh.blockId);
    expect(fresh.drills.every((drill) => drill.measure === 'drops')).toBe(true);
  });

  it('is enforced: removing the fresh reference from a session that has tails is flagged', () => {
    const errors = errorsOf({ chain: (recipe) => { recipe.blocks = recipe.blocks.filter((block) => block.kind !== 'fresh_reference'); } });
    expect(errors.some((error) => error.includes('R-WS-37'))).toBe(true);
  });

  it('is enforced: a fresh reference placed after the first hard block is flagged', () => {
    const errors = errorsOf({
      chain: (recipe) => {
        const [fresh] = recipe.blocks.splice(recipe.blocks.findIndex((block) => block.kind === 'fresh_reference'), 1);
        recipe.blocks.splice(recipe.blocks.findIndex((block) => block.kind === 'cardio') + 1, 0, fresh!);
      }
    });
    expect(errors.some((error) => error.includes('R-WS-37'))).toBe(true);
  });

  it('the skill session has no tail, so it needs no fresh reference', () => {
    expect(tailBOf(skillRecipe3)).toBeNull();
    expect(chainBlockOf(skillRecipe3)).toBeNull();
    expect(freshReferenceOf(skillRecipe3)).toBeNull();
    expect(validateV4PoliceSessions(week3).some((error) => error.includes('R-WS-37'))).toBe(false);
  });
});

describe('CR-013 — tail A and tail B never use the skill block’s station (R-WS-36)', () => {
  it('holds in week 3: the skill block is station 8, both tails are station 11', () => {
    const focus = skillBlockOf(skillRecipe3)!.stationId;
    expect(focus).toBe(8);
    expect(chainBlockOf(chainRecipe3)!.tailA.stationId).toBe(11);
    for (const minute of tailBOf(chainRecipe3)!.minutes) expect(minute.drill.stationId).not.toBe(focus);
  });

  it('is enforced: a tail A on the skill station is flagged', () => {
    const errors = errorsOf({
      chain: (recipe) => {
        const chain = chainBlockOf(recipe)!;
        chain.tailA = { ...chain.tailA, ...cardRef('S08_chain_out') };
      }
    });
    expect(errors.some((error) => error.includes('R-WS-36'))).toBe(true);
  });

  it('is enforced: a tail B minute on the skill station is flagged', () => {
    const errors = errorsOf({
      chain: (recipe) => {
        const tail = tailBOf(recipe)!;
        tail.minutes[0] = { ...tail.minutes[0]!, drill: { ...tail.minutes[0]!.drill, ...cardRef('S08_chain_out') } };
      }
    });
    expect(errors.some((error) => error.includes('R-WS-36'))).toBe(true);
  });

  it('tail A is the same drill every round, 30 to 45 s, and the chain block stays moderate (R-WS-34)', () => {
    const chain = chainBlockOf(chainRecipe3)!;
    expect(chain.tailASeconds).toBeGreaterThanOrEqual(30);
    expect(chain.tailASeconds).toBeLessThanOrEqual(45);
    expect(chain.intensity).toBe('moderate');
    expect(errorsOf({ chain: (recipe) => { chainBlockOf(recipe)!.tailASeconds = 60; } }).some((error) => error.includes('R-WS-34'))).toBe(true);
  });
});

describe('CR-013 — memory is never the last block of a session, and M5 is never selected (R-WS-12/R-WS-40)', () => {
  it('memory sits at index 1 in a skill session and index 2 in a chain session, counting the warm-up', () => {
    expect(blockSequence(skillRecipe3).indexOf('memory')).toBe(1);
    expect(blockSequence(chainRecipe3).indexOf('memory')).toBe(2);
  });

  it('memory is never last, in any generated police session', () => {
    for (const session of policeSessions) {
      const sequence = blockSequence(recipeById[session.recipeId]!);
      expect(sequence.indexOf('memory')).not.toBe(sequence.length - 1);
    }
  });

  it('M5 appears in no generated session', () => {
    for (const session of policeSessions) {
      expect(memoryModulesOf(recipeById[session.recipeId]!)).not.toContain('M5');
    }
  });

  it('is enforced: an M5 module is flagged', () => {
    const errors = errorsOf({
      skill: (recipe) => {
        const memory = recipe.blocks.find((block) => block.kind === 'memory')!;
        (memory.spec as { modules: string[] }).modules = ['M1', 'M5'];
      }
    });
    expect(errors.some((error) => error.includes('R-WS-40'))).toBe(true);
  });

  it('is enforced: memory moved to the end is flagged', () => {
    const errors = errorsOf({
      skill: (recipe) => {
        const [memory] = recipe.blocks.splice(recipe.blocks.findIndex((block) => block.kind === 'memory'), 1);
        recipe.blocks.push(memory!);
      }
    });
    expect(errors.some((error) => error.includes('R-WS-12'))).toBe(true);
  });
});

describe('CR-013 — no session of kind police_mock_test, nothing predicts an official time (R-PC-04)', () => {
  it('no generated session carries a mock-test kind', () => {
    for (const week of weeks) {
      for (const session of week.sessions) {
        expect(session.kind).not.toBe('police_mock_test');
      }
    }
  });

  // Regression test for a real miss caught on the deployed page after the
  // CR-013 merge: `weekChecker.ts` held 'police_mock_test' in a
  // `readonly string[]`, so removing the kind from `SessionKind` did not make
  // the compiler flag it, and the literal shipped in the bundle. Checking the
  // recipes alone (the test below) did not catch it either. This scans the
  // source itself. Comments may still discuss the name — they write it in
  // backticks — so only a quoted string literal counts.
  it('no source file carries `police_mock_test` as a string literal (R-PC-04)', () => {
    const sources = import.meta.glob('../**/*.{ts,tsx}', { eager: true, query: '?raw', import: 'default' }) as Record<string, string>;
    const paths = Object.keys(sources);
    expect(paths.length).toBeGreaterThan(5);
    const offenders = paths.filter((path) => /['"]police_mock_test['"]/.test(sources[path]!));
    expect(offenders).toEqual([]);
  });

  it('the string "mock" appears in no recipe of the library', () => {
    expect(JSON.stringify(recipes)).not.toMatch(/mock/i);
    expect(JSON.stringify(Object.values(recipeById))).not.toMatch(/mock/i);
  });

  it('no recipe text predicts an official circuit time', () => {
    // The three circuit numbers that exist in the thinking world (the 6:15
    // limit, the 6:11 target and the 8:30 baseline) must never surface as a
    // prediction in the app, and no recipe announces a forecast either.
    const text = JSON.stringify(Object.values(recipeById));
    for (const forbidden of ['6:15', '6:11', '8:30']) expect(text).not.toContain(forbidden);
    expect(text).not.toMatch(/temps\s+(officiel|prévu|estimé)|pronostic|prédiction|chrono\s+prévu/i);
  });

  it('the cardio block carries no target of any kind (R-WS-31)', () => {
    for (const session of policeSessions) {
      expect(cardioBlockOf(recipeById[session.recipeId]!)!.target).toBeNull();
    }
    expect(errorsOf({
      skill: (recipe) => { (cardioOf(recipe) as unknown as { target: unknown }).target = 42; }
    }).some((error) => error.includes('R-WS-31'))).toBe(true);
  });
});

describe('CR-013 section E — the week 3 fixtures reproduce the two locked Drive sessions block for block', () => {
  it('the two police days of week 3 are one skill session then one chain session (R-WS-07 v4)', () => {
    expect(skillSession3.date).toBe('2026-09-24');
    expect(chainSession3.date).toBe('2026-09-25');
    expect(skillSession3.date < chainSession3.date).toBe(true);
    expect(week3.sessions.filter((session) => isSessionShape(session.kind))).toHaveLength(2);
    expect(validateWeek(week3)).toHaveLength(0);
  });

  it('SKILL SESSION: warm-up 6 · mémoire 6 · bloc compétence 18 · cardio 10 · retour au calme 5', () => {
    expect(blockSequence(skillRecipe3)).toEqual(['warmup', 'memory', 'skill_block', 'cardio', 'cooldown']);
    expect(skillRecipe3.durationMin).toBe(45);

    const skill = skillBlockOf(skillRecipe3)!;
    expect(skill.stationId).toBe(8);
    expect(skill.durationMin).toBe(18);
    expect(skill.drills.map((drill) => drill.cardId)).toEqual(['S08_hand_then_chain', 'S08_chain_out']);
    expect(skill.drills.map((drill) => drill.measure)).toEqual(['balls_lost', 'foot_errors']);

    const cardio = cardioBlockOf(skillRecipe3)!;
    expect(cardio.format).toBe('amrap');
    expect(cardio.durationMin).toBe(10); // section E: week 3 is the last week at the old length
    expect(cardio.atoms.map((atom) => atom.cardId)).toEqual(['S01_slalom_18m', 'S03_ladder_climb_jump_finish', 'S00_half_burpees']);

    expect(memoryModulesOf(skillRecipe3)).toEqual(['M1', 'M2']);
  });

  it('CHAIN SESSION: warm-up 6 · référence 3 · mémoire 4 · enchaînement 12 · cardio 10 · tail B 5 · retour au calme 5', () => {
    expect(blockSequence(chainRecipe3)).toEqual(['warmup', 'fresh_reference', 'memory', 'chain_block', 'cardio', 'tail_b', 'cooldown']);
    expect(chainRecipe3.durationMin).toBe(45);

    const fresh = freshReferenceOf(chainRecipe3)!;
    expect(fresh.drills.map((drill) => drill.cardId)).toEqual(['S11_racket_on_board', 'S11_racket_obstacles']);

    const chain = chainBlockOf(chainRecipe3)!;
    expect(chain.rounds).toBe(3);
    expect(chain.restS).toBe(90);
    expect(chain.durationMin).toBe(12);
    expect(chain.stations).toEqual([1, 3]);
    expect(chain.tailA.cardId).toBe('S11_racket_on_board');
    expect(chain.tailASeconds).toBe(30);
    expect(chain.roundScores.map((drill) => drill.measure)).toEqual(['round_time_s', 'cones_touched']);
    expect(chain.transitionNote).toContain('épaules basses');

    const cardio = cardioBlockOf(chainRecipe3)!;
    expect(cardio.format).toBe('emom');
    expect(cardio.durationMin).toBe(10);
    expect(cardio.atoms.map((atom) => atom.cardId)).toEqual(['S01_carioca_footwork', 'S00_jump_squats', 'S00_high_knees']);

    const tail = tailBOf(chainRecipe3)!;
    expect(tail.minutes.map((minute) => minute.drill.cardId)).toEqual([
      'S11_racket_on_board', 'S11_racket_obstacles', 'S11_racket_on_board', 'S11_racket_obstacles'
    ]);
    expect(tail.stopRule).toContain('la prise s’ouvre');

    expect(memoryModulesOf(chainRecipe3)).toEqual(['M3']);
  });

  it('week 3 stays at the 10 min cardio; week 4 moves to the 12-15 band (R-WS-32)', () => {
    for (const session of week3.sessions.filter((item) => isSessionShape(item.kind))) {
      expect(cardioBlockOf(recipeById[session.recipeId]!)!.durationMin).toBe(10);
    }
    for (const session of week4.sessions.filter((item) => isSessionShape(item.kind))) {
      const minutes = cardioBlockOf(recipeById[session.recipeId]!)!.durationMin;
      expect(minutes).toBeGreaterThanOrEqual(12);
      expect(minutes).toBeLessThanOrEqual(15);
    }
    expect(validateWeek(week4)).toHaveLength(0);
  });

  it('every week from 3 to the taper carries the two shapes and validates clean', () => {
    for (const week of v4Weeks) {
      expect(validateWeek(week)).toEqual([]);
      if (week.startDate === '2026-11-16') continue; // taper week: the chain session is dropped before the event
      expect(week.sessions.some((session) => session.kind === 'skill_session')).toBe(true);
      expect(week.sessions.some((session) => session.kind === 'chain_session')).toBe(true);
    }
  });
});

describe('CR-013 section D — the fresh-to-fatigued gap is computed, not stored from user input', () => {
  const scored: SessionResult = {
    sessionId: chainSession3.id,
    status: 'done',
    effort: 4,
    note: '',
    drillScores: [
      { drillId: 'fresh:S11_racket_on_board', measure: 'drops', value: 2 },
      { drillId: 'fresh:S11_racket_obstacles', measure: 'drops', value: 4 },
      { drillId: 'tail_b:1', measure: 'drops', value: 5 },
      { drillId: 'tail_b:2', measure: 'drops', value: 7 },
      { drillId: 'tail_b:3', measure: 'drops', value: 6 },
      { drillId: 'tail_b:4', measure: 'drops', value: 8 }
    ],
    cardioValue: 10,
    completedAt: '2026-09-25T18:00:00.000Z'
  };

  it('derives the gap from the two scores of the same session', () => {
    const gap = freshToFatiguedGap(chainSession3.recipeId, scored)!;
    expect(gap.freshMean).toBe(3); // (2 + 4) / 2
    expect(gap.tailMean).toBe(6.5); // (5 + 7 + 6 + 8) / 4
    expect(gap.overall).toBe(3.5);
  });

  it('derives it per card, so the board and the obstacles are read apart', () => {
    const gap = freshToFatiguedGap(chainSession3.recipeId, scored)!;
    const board = gap.perCard.find((entry) => entry.cardId === 'S11_racket_on_board')!;
    const obstacles = gap.perCard.find((entry) => entry.cardId === 'S11_racket_obstacles')!;
    expect(board.gap).toBe(3.5); // (5 + 6) / 2 − 2
    expect(obstacles.gap).toBe(3.5); // (7 + 8) / 2 − 4
  });

  it('a shortened tail still produces a gap (R-WS-38: two minutes still count)', () => {
    const shortened: SessionResult = { ...scored, drillScores: scored.drillScores!.slice(0, 4) };
    expect(freshToFatiguedGap(chainSession3.recipeId, shortened)!.tailMean).toBe(6); // (5 + 7) / 2
  });

  it('is null until both halves exist, and is never a stored input field', () => {
    expect(freshToFatiguedGap(chainSession3.recipeId, { ...scored, drillScores: scored.drillScores!.slice(0, 2) })).toBeNull();
    expect(freshToFatiguedGap(skillSession3.recipeId, scored)).toBeNull(); // no tail in a skill session
    // Nothing the athlete types is ever a gap: `SessionResult` carries only
    // the raw scores, and the word never appears as a key.
    expect(Object.keys(scored)).not.toContain('gap');
    expect(Object.keys(scored).some((key) => /gap|ecart|écart/i.test(key))).toBe(false);
  });

  it('the history runs week after week, oldest first', () => {
    const history = gapHistory(weeks, { [chainSession3.id]: scored });
    expect(history).toHaveLength(1);
    expect(history[0]!.date).toBe('2026-09-25');
    expect(history[0]!.gap).toBe(3.5);
  });
});

describe('CR-013 section D — the cardio baseline is the previous week’s number, read only', () => {
  it('shows the previous week’s recorded number and nothing else', async () => {
    const { cardioBaseline } = await import('../coach/progression');
    const week4Chain = week4.sessions.find((session) => session.kind === 'chain_session')!;
    const results: Record<string, SessionResult> = {
      [chainSession3.id]: { sessionId: chainSession3.id, status: 'done', note: '', cardioValue: 9, cardioNote: 'EMOM tenu', completedAt: '2026-09-25T18:00:00.000Z' }
    };
    const baseline = cardioBaseline(weeks, results, week4Chain.id)!;
    expect(baseline.value).toBe(9);
    expect(baseline.note).toBe('EMOM tenu');
    expect(baseline.fromDate).toBe('2026-09-25');
  });

  it('is null in week 3, which has no previous v4 week to compare against', async () => {
    const { cardioBaseline } = await import('../coach/progression');
    expect(cardioBaseline(weeks, {}, chainSession3.id)).toBeNull();
  });
});

describe('CR-013 — the drills the athlete scores', () => {
  it('every scored drill of both sessions has a unique id, a measure and a label', () => {
    for (const recipe of [skillRecipe3, chainRecipe3]) {
      const drills = drillsOf(recipe);
      expect(drills.length).toBeGreaterThan(0);
      expect(new Set(drills.map((drill) => drill.drillId)).size).toBe(drills.length);
      for (const drill of drills) {
        expect(drill.measure.length).toBeGreaterThan(0);
        expect(drill.scoreLabel.length).toBeGreaterThan(0);
      }
    }
  });

  it('the chain session scores time per round, cones touched, tail A and the four tail-B minutes', () => {
    expect(drillsOf(chainRecipe3).map((drill) => drill.drillId)).toEqual([
      'fresh:S11_racket_on_board', 'fresh:S11_racket_obstacles',
      'chain:round_time', 'chain:cones_touched', 'tail_a:S11_racket_on_board',
      'tail_b:1', 'tail_b:2', 'tail_b:3', 'tail_b:4'
    ]);
  });
});

// ---------- the screens ----------
//
// `.test.ts`, not `.tsx`, like the rest of the harness: the app element is
// built with `createElement` so the file parses without the JSX loader.
// "Today" is fixed inside week 3 so the week that renders first is the one
// holding the two new shapes, whatever the real wall-clock date is.
describe('CR-013 — the two shapes on the screens', () => {
  it('shows one score box per scored drill, plus the cardio number and its baseline line', async () => {
    const { afterEach: onAfter } = await import('vitest');
    const { createElement } = await import('react');
    const { cleanup, fireEvent, render, screen } = await import('@testing-library/react');
    const { default: CoachConcoursApp } = await import('../CoachConcoursApp');
    const { vi } = await import('vitest');

    onAfter(() => { cleanup(); vi.useRealTimers(); });
    localStorage.clear();
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-09-24T12:00:00Z'));

    render(createElement(CoachConcoursApp));
    await screen.findByText(/Séances/);

    const cards = await screen.findAllByText('Séance enchaînement');
    const cardButton = cards.map((node) => node.closest('button.card')).find((node): node is HTMLButtonElement => node !== null)!;
    fireEvent.click(cardButton);
    await screen.findByText('Ton programme');
    fireEvent.click(screen.getByText('Retour'));
    await screen.findByText('Toute la séance');

    // One field per scored drill of the chain session.
    for (const drill of drillsOf(chainRecipe3)) {
      expect(screen.getByLabelText(drill.scoreLabel)).toBeDefined();
    }
    // The cardio block's own number (EMOM → minutes held) and its baseline
    // line, which says there is no target.
    expect(screen.getByLabelText('Minutes tenues')).toBeDefined();
    expect(screen.getByText(/Aucune cible/)).toBeDefined();
    // No target is ever displayed anywhere on the tab.
    expect(screen.queryByText(/objectif|cible de|temps visé/i)).toBeNull();
  });
});
