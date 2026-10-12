// CHANGE_REQUEST_013 v5 — weeks 6 to 11 of `season_plan.md` v4: the content
// of week 6 as data (`WEEK_6_FINAL_2026-10-12_v2.md`, app texts in French),
// the Tuesdays of section C, the named gaps of weeks 7 to 11, the week 10
// rematch, the GAP of the enchaînement and the checks of the v4 weeks.
//
// Weeks 3, 4 and 5 are not built here: they keep the v3 engine of
// `sessionShapes.ts`, untouched (their results are stored by session id).
//
// Nothing here is a sporting decision: every number is the change request's
// or the locked week file's, and a session with no data yet is a named gap
// "Contenu à construire (semaine n)" (R-SP-03), never a copy of week 6.
import { cardRef } from '../data/exerciseCards';
import type { RunIntervalsRow } from '../data/runIntervalsProgression';
import { MEMORY_BLOCK_MAX_MIN, memoryBlockMinutes, memoryCardFor, memoryCycleOf } from './memoryCycle';
import { recipeById, recipes, runIntervalsMainBlock, runIntervalsRepsById } from './recipes';
import {
  PLACEHOLDER_LINE,
  SEASON_PLAN_V4,
  WEEK_DAYS,
  blockOfKind,
  drillsOf,
  drillsOfBlock,
  isV4PoliceKind,
  memoryBlockOf,
  memoryGameBlock,
  memoryModulesOf,
  memoryShapeOf,
  placeholderBlock,
  type V4SessionKind,
  type V4Slot,
  type WeekDay
} from './sessionShapes';
import type {
  CardioBlock,
  DrillRef,
  DrillScore,
  ExerciseBlock,
  LowLungSpec,
  PlannedSession,
  SessionRecipe,
  SkillBlock,
  SkillTestSpec,
  StormSpec,
  TestMoment,
  TrainingWeek
} from './types';

// ---------- the kinds ----------

type ContentKind = Exclude<V4SessionKind, 'crossfit_class' | 'run_intervals' | 'police_event'>;

// Section A: the display names, in French.
export const V4_KIND_TITLE: Readonly<Record<ContentKind, string>> = {
  skill_park: 'Compétences au parc',
  enchainement: 'Enchaînement',
  travel_speed: 'Voyage · Vitesse (T1)',
  travel_mini_ench: 'Voyage · Mini-enchaînement (T2)',
  travel_skill_kit: 'Voyage · Kit compétences (T3)',
  trail_day: 'Trail',
  easy_run: 'Footing facile'
};

// Section A: the intensity of each kind. The enchaînement is hard in the data
// and reads "à bloc" on screen.
export const V4_KIND_LOAD: Readonly<Record<V4SessionKind, PlannedSession['load']>> = {
  crossfit_class: 'hard',
  run_intervals: 'hard',
  police_event: 'event',
  skill_park: 'moderate',
  enchainement: 'hard',
  travel_speed: 'hard',
  travel_mini_ench: 'hard',
  travel_skill_kit: 'low',
  trail_day: 'moderate',
  easy_run: 'low'
};

export const TO_BUILD_PREFIX = 'Contenu à construire';
export function toBuildLabel(weekNumber: number): string {
  return `${TO_BUILD_PREFIX} (semaine ${weekNumber})`;
}

// Section E.
export const REMATCH_LINE = 'Revanche : battre tes scores de la semaine 6';
export const REMATCH_SOURCE_SESSION_ID = '2026-10-16:enchainement';

// Section C, MUST: the safety line of the low-lung sprints, word for word.
export const LOW_LUNG_SAFETY_LINE = 'jamais d\'hyperventilation avant · stop si vertige · loin de la circulation';

// R-SP-09: a warm-up is one line. Priming is named when used.
export const WARMUP_LINE = 'Échauffement ~5 min';

// ---------- drills ----------

function drill(cardId: string, drillId: string, measure: DrillRef['measure'], scoreLabel: string): DrillRef {
  return { ...cardRef(cardId), drillId, measure, scoreLabel };
}

// Section D: the GAP skills. The same two skills fresh, after storm 1 and
// after storm 2 (R-SP-11, decision D4: skipping is not tested).
export type GapSkill = 'hoops' | 'bench_ball';
const GAP_SKILLS: ReadonlyArray<{ skill: GapSkill; cardId: string; measure: DrillRef['measure']; label: string; unit: string }> = [
  { skill: 'hoops', cardId: 'S08_chain_out', measure: 'errors', label: 'Cerceaux', unit: 'erreurs' },
  { skill: 'bench_ball', cardId: 'S09_bench_walk_with_ball', measure: 'touchdowns', label: 'Banc avec balle', unit: 'touchers' }
];
const MOMENT_LABEL: Readonly<Record<TestMoment, string>> = { fresh: 'à froid', tired1: 'fatigué 1', tired2: 'fatigué 2' };

function testDrills(moment: TestMoment): DrillRef[] {
  return GAP_SKILLS.map((item) => drill(item.cardId, `${moment}:${item.skill}`, item.measure, `${item.label} — ${item.unit}, ${MOMENT_LABEL[moment]}`));
}

// ---------- week 6, Wednesday 14 October: Compétences au parc ----------

const PARK_EQUIPMENT_WED = ['Cerceaux (vert + 5)', 'Ballon de basket', 'Raquette et 2 balles de ping-pong', '5 balles de tennis', 'Une casquette (la « boîte rouge »)', 'Minuteur du téléphone', 'Eau'];
const PARK_EQUIPMENT_FRI = ['Cerceaux (vert + 5)', 'Ballon de basket', '5 balles de tennis', 'Une casquette (la « boîte rouge »)', 'Minuteur du téléphone', 'Eau'];

function skillBlock(stationId: number, durationMin: number, drills: DrillRef[], block: Omit<ExerciseBlock, 'kind' | 'spec' | 'stationMappings'>): ExerciseBlock {
  const spec: SkillBlock = { kind: 'skill_block', stationId, drills, durationMin };
  return { ...block, kind: 'skill_block', spec, stationMappings: [stationId], approximation: true };
}

function week6SkillParkBlocks(weekNumber: number): ExerciseBlock[] {
  const obstacle = skillBlock(2, 16, [
    drill('S02_obstacle_wall_official', 'skill:obstacle_rounds', 'rounds_done', 'Tours officiels faits (0 à 5) — obstacle'),
    drill('S02_obstacle_wall_official', 'skill:obstacle_hesitations', 'hesitations', 'Hésitations — obstacle')
  ], {
    title: 'Obstacle, ton mur — 16 min', short: 'obstacle',
    faire: '4 franchissements depuis la marche · 4 avec 5 m d’élan · puis RYTHME OFFICIEL × 5 : chaque tour = 5 allers avec une balle de tennis déposée dans la « boîte rouge » (une casquette), 4 retours sans balle ; environ 1 min de repos entre les tours.',
    regle: 'Stop : quand les franchissements deviennent brouillons, finir les tours là. Un bloc raccourci compte quand même.',
    details: 'Le regard sur le haut du mur · les deux mains fermes · réception sur les deux pieds, genoux souples · expirer par-dessus.',
    noter: 'Tours faits (0 à 5) · hésitations.'
  });
  const bench = skillBlock(9, 7, [
    drill('S09_bench_walk_with_ball', 'skill:bench_touchdowns', 'touchdowns', 'Touchers au sol — banc avec balle')
  ], {
    title: 'Équilibre sur banc avec balle — 7 min', short: 'banc',
    faire: '3 traversées, le regard 2 à 3 m devant · 2 traversées balle en main · 1 traversée façon officielle : balle A au départ, balle B au bout ; les deux pieds sur le muret, prendre A, traverser, échanger A contre B, revenir, poser B, une dernière traversée sans balle. Ne jamais s’appuyer sur une balle.',
    regle: 'Muret sec seulement. Si ça vacille : descendre exprès.',
    noter: 'Touchers (but : 0).'
  });
  const racket = skillBlock(11, 6, [
    drill('S11_racket_obstacles', 'skill:racket_pass1', 'drops', 'Chutes — raquette, passage 1, à plat'),
    drill('S11_racket_obstacles', 'skill:racket_pass2', 'drops', 'Chutes — raquette, passage 2, souches basses'),
    drill('S11_racket_obstacles', 'skill:racket_pass3', 'drops', 'Chutes — raquette, passage 3, rangée de souches')
  ], {
    title: 'Raquette — 6 min', short: 'raquette',
    faire: 'Passage 1 : à plat, 10 m · passage 2 : par-dessus les souches basses · passage 3 : par-dessus une rangée de souches, seulement si le passage 2 = 0 chute.',
    details: 'Les yeux sur la balle, chaque obstacle regardé une fois, le poing fermé.',
    noter: 'Chutes par passage (3 cases).'
  });
  const hoops = skillBlock(8, 6, [
    drill('S08_chain_out', 'skill:hoops_foot_errors', 'foot_errors', 'Erreurs de pied — cerceaux'),
    drill('S08_return_dribble_same_side', 'skill:hoops_hand_errors', 'hand_errors', 'Erreurs de main — cerceaux')
  ], {
    title: 'Cerceaux avec ballon — 6 min', short: 'cerceaux',
    faire: 'Départ vert + 5 cerceaux qui se touchent (jaune, bleu, rouge, jaune, rouge) · aller ballon dans les bras, retour en dribble · 5 à 6 passages.',
    noter: 'Erreurs de pied · erreurs de main.'
  });
  const cardioSpec: CardioBlock = {
    kind: 'cardio', format: 'amrap', atoms: [cardRef('BLK_will_10')], durationMin: 10, target: null,
    drills: [drill('BLK_will_10', 'cardio:will10_rounds', 'rounds', 'Tours faits — WILL 10')]
  };
  const cardio: ExerciseBlock = {
    title: 'Cardio, WILL 10 (Cross Ops) — 10 min', short: 'cardio', kind: 'cardio', spec: cardioSpec,
    faire: 'AMRAP 10 min : 3 burpees · 10 pompes · 10 squats.',
    details: 'Si c’est trop facile : squats sautés à la place des squats.',
    noter: 'Aucune cible. Noter : les tours faits, et le score d’effort.',
    stationMappings: [], approximation: true
  };
  return [memoryGameBlock(weekNumber, 'skill_session'), obstacle, bench, racket, hoops, cardio];
}

function buildWeek6SkillPark(): SessionRecipe {
  const blocks = week6SkillParkBlocks(6);
  const cooldown = '4 min : retour au calme.';
  return {
    id: 'skill-park-v1-week-6', version: 1, kind: 'skill_park',
    title: V4_KIND_TITLE.skill_park,
    purpose: 'Apprendre, frais, sans chrono : obstacle, équilibre sur banc avec balle, raquette, cerceaux. Puis un WOD Cross Ops comme cardio, sans cible. Chaque exercice est une approximation du poste officiel.',
    durationMin: totalMinutes(WARMUP_LINE, blocks, cooldown),
    equipment: PARK_EQUIPMENT_WED,
    warmup: WARMUP_LINE,
    blocks,
    cooldown
  };
}

// ---------- week 6, Friday 16 October: the ENCHAÎNEMENT ----------

// Section B, "rules shown" on both storms. The technique cues go with the
// details, so the rule line (cut at 72 characters in the step list) leads with
// the rules themselves.
const STORM_RULES = 'Franchissement brouillon → 2 box jumps sur le bloc bas pour le reste de la tempête · ça vacille sur le banc → descendre exprès · vertige → stop, marcher, ça compte quand même.';
const STORM_CUES = 'Burpees poitrine au sol, expirer en poussant · tirages corps droit, poitrine à la barre.';

function testBlock(moment: TestMoment): ExerciseBlock {
  const spec: SkillTestSpec = { kind: 'skill_test', moment, drills: testDrills(moment) };
  const fresh = moment === 'fresh';
  return {
    title: `${fresh ? 'Test à froid' : `Test fatigué ${moment === 'tired1' ? 1 : 2}`} — 3 min`,
    short: fresh ? 'test à froid' : `test fatigué ${moment === 'tired1' ? 1 : 2}`,
    kind: 'skill_test', spec,
    faire: fresh
      ? 'À vitesse normale. 8 CERCEAUX : 5 cerceaux, aller ballon dans les bras + retour en dribble, 1 passage. 9 ÉQUILIBRE SUR BANC AVEC BALLE : 1 traversée façon officielle, avec l’échange des balles.'
      : 'Dans les 30 s après la tempête : 8 CERCEAUX, 1 passage · 9 ÉQUILIBRE SUR BANC AVEC BALLE, 1 traversée façon officielle.',
    noter: fresh
      ? 'Cerceaux : erreurs · banc : touchers. C’est la référence du jour : l’écart est calculé, jamais tapé.'
      : 'Cerceaux : erreurs · banc : touchers. L’écart avec le test à froid est calculé.',
    stationMappings: [8, 9], approximation: true
  };
}

function stormBlock(storm: 1 | 2): ExerciseBlock {
  const acheron = storm === 1;
  const spec: StormSpec = acheron
    ? {
      kind: 'storm', storm, card: cardRef('BLK_acheron_park'), durationMin: 7,
      atoms: ['S01_slalom_18m', 'S02_obstacle_wall_official', 'S00_full_burpee'].map(cardRef),
      drills: [
        drill('BLK_acheron_park', 'storm1:acheron_lap', 'last_lap', 'Dernier tour atteint — ACHERON PARK'),
        drill('BLK_acheron_park', 'storm1:acheron_burpees', 'burpees_in_lap', 'Burpees faits dans ce tour — ACHERON PARK'),
        drill('BLK_acheron_park', 'storm1:box_jumps_used', 'box_jumps_used', 'Box jumps utilisés — tempête 1')
      ]
    }
    : {
      kind: 'storm', storm, card: cardRef('BLK_death_by_obstacle'), durationMin: 7,
      atoms: ['S02_obstacle_wall_official', 'S00_full_burpee', 'S00_bar_row'].map(cardRef),
      drills: [
        drill('BLK_death_by_obstacle', 'storm2:death_minute', 'highest_minute', 'Plus haute minute terminée — DEATH BY OBSTACLE'),
        drill('BLK_death_by_obstacle', 'storm2:box_jumps_used', 'box_jumps_used', 'Box jumps utilisés — tempête 2')
      ]
    };
  return acheron
    ? {
      title: 'Tempête 1 · « ACHERON PARK » — 7 min', short: 'tempête 1', kind: 'storm', spec,
      faire: 'AMRAP 7 en échelle. Chaque tour : slalom d’environ 15 m (aller tout droit, slalom au retour) · obstacle aller et retour · burpees qui montent : tour 1 = 2, tour 2 = 4, tour 3 = 6, tour 4 = 8, tour 5 = 10…',
      regle: STORM_RULES,
      details: `Tour 1 à environ 80 %, puis monter. ${STORM_CUES}`,
      noter: 'Dernier tour atteint + burpees faits dans ce tour · box jumps utilisés ou non.',
      stationMappings: [1, 2], approximation: true
    }
    : {
      title: 'Tempête 2 · « DEATH BY OBSTACLE » — 7 min', short: 'tempête 2', kind: 'storm', spec,
      faire: 'Chaque minute, pendant 7 min. Minute n = n franchissements de l’obstacle + n burpees + n tirages sous la barre ; le reste de la minute est du repos. La première minute non terminée est la « mort » : à partir de là, répéter le dernier niveau terminé jusqu’à la fin des 7 min.',
      regle: STORM_RULES,
      details: STORM_CUES,
      noter: 'La plus haute minute terminée · box jumps utilisés ou non.',
      stationMappings: [2], approximation: true
    };
}

function enchainementBlocks(weekNumber: number): ExerciseBlock[] {
  return [
    {
      title: 'Mise en place — 3 min', short: 'mise en place', kind: 'setup',
      faire: 'Tout dans environ 20 m : le couloir de slalom (environ 15 m de piquets, départ marqué) · ton mur · le banc (le muret, balle A au départ, balle B au bout) · la ligne de cerceaux sur le plat · un coin pour les burpees · une barre entre la hanche et la poitrine pour les tirages.',
      stationMappings: []
    },
    {
      title: `${WARMUP_LINE} + priming`, short: 'échauffement', kind: 'warmup',
      faire: `${WARMUP_LINE} · priming : 2 × 10 s de sprint à plat · 3 sauts en longueur.`,
      stationMappings: []
    },
    testBlock('fresh'),
    memoryGameBlock(weekNumber, 'chain_session'),
    stormBlock(1),
    testBlock('tired1'),
    { title: 'Repos — 3 min', short: 'repos', kind: 'rest', faire: 'Marcher, longues expirations.', stationMappings: [] },
    stormBlock(2),
    testBlock('tired2')
  ];
}

const ENCHAINEMENT_COOLDOWN = '5 min : marcher, mollets, hanches, 5 respirations lentes avec une longue expiration.';

function buildEnchainement(weekNumber: number, rematch: boolean): SessionRecipe {
  const blocks = enchainementBlocks(weekNumber);
  return {
    id: `enchainement-v1-week-${weekNumber}`, version: 1, kind: 'enchainement',
    title: V4_KIND_TITLE.enchainement,
    purpose: 'À bloc. Test à froid → tempête → test fatigué → repos → tempête → test fatigué. Deux compétences seulement : cerceaux et équilibre sur banc avec balle. L’écart est calculé, jamais tapé. Chaque exercice est une approximation du poste officiel.',
    durationMin: totalMinutes(null, blocks, ENCHAINEMENT_COOLDOWN),
    equipment: PARK_EQUIPMENT_FRI,
    warmup: null,
    blocks,
    cooldown: ENCHAINEMENT_COOLDOWN,
    ...(rematch ? { notice: REMATCH_LINE, rematchOf: REMATCH_SOURCE_SESSION_ID } : {})
  };
}

// ---------- section C: the Tuesdays ----------

interface TuesdaySetV4 {
  reps: number;
  minutes: number;
  paceSec: number;
  jogSec: number;
  purpose: string;
  rule?: string;
  warmup?: string;
  cooldown?: string;
  walkBeforeLowLungMin?: number;
  lowLungHold?: string;
}

export const TUESDAY_SETS_V4: Readonly<Record<number, TuesdaySetV4>> = {
  // Decision D9: 5:10 /km, jog 2 min (replaces 5:25, jog 3). WEEK_6_FINAL wins
  // for the warm-up, the walk and the cool-down.
  6: {
    reps: 5, minutes: 4, paceSec: 310, jogSec: 120, purpose: 'semaine au parc, allure 5:10',
    rule: 'La répétition 5 pas plus lente que la répétition 1 + 5 s.',
    warmup: '12 min : 10 min de footing facile + 3 accélérations de 15 s.',
    cooldown: '8 min : footing de retour au calme.',
    walkBeforeLowLungMin: 4, lowLungHold: '10 à 15 m'
  },
  // The v4 values, to be reviewed at the week 10 build.
  10: { reps: 4, minutes: 3, paceSec: 315, jogSec: 120, purpose: 'semaine de charge' },
  // Taper: no low-lung sprints.
  11: { reps: 4, minutes: 1, paceSec: 300, jogSec: 120, purpose: 'affûtage : concours vendredi 20 nov.' }
};

const LOW_LUNG = { reps: 6, metres: 30 } as const;

function buildTuesdayV4(weekNumber: number, slot: V4Slot): SessionRecipe {
  const set = TUESDAY_SETS_V4[weekNumber]!;
  const row: RunIntervalsRow = { week: weekNumber, reps: set.reps, minutes: set.minutes, paceSec: set.paceSec, jogSec: set.jogSec, purpose: set.purpose };
  const main: ExerciseBlock = { ...runIntervalsMainBlock(row), ...(set.rule ? { regle: set.rule } : {}) };
  const blocks: ExerciseBlock[] = [main];
  if (slot.lowLung) {
    if (set.walkBeforeLowLungMin) {
      blocks.push({ title: `Marche — ${set.walkBeforeLowLungMin} min`, short: 'marche', kind: 'rest', faire: 'Marcher.', stationMappings: [] });
    }
    const spec: LowLungSpec = {
      kind: 'low_lung', reps: LOW_LUNG.reps, metres: LOW_LUNG.metres,
      drills: [drill('S00_low_lung_sprint', 'intervals:low_lung_metres', 'metres_held', 'Mètres tenus sans respirer')]
    };
    blocks.push({
      title: `Sprints poumons vides, ${LOW_LUNG.reps} × ${LOW_LUNG.metres} m — 6 min`, short: 'poumons vides', kind: 'low_lung', spec,
      faire: `Expirer à fond, sprinter ${LOW_LUNG.metres} m sans inspirer, respirer quand il le faut${set.lowLungHold ? ` (cette semaine : tenir ${set.lowLungHold})` : ''}, retour en marchant 30 s. ${LOW_LUNG.reps} fois.`,
      regle: LOW_LUNG_SAFETY_LINE,
      noter: 'Mètres tenus sans respirer : un seul nombre.',
      stationMappings: [], approximation: true
    });
  }
  const warmup = set.warmup ?? '15 min facile, puis 3 × 20 s d’accélérations progressives.';
  const cooldown = set.cooldown ?? '10 min facile.';
  const mainMin = set.reps * set.minutes + (set.reps - 1) * (set.jogSec / 60);
  const recipe: SessionRecipe = {
    id: `run-intervals-v2-week-${weekNumber}`, version: 2, kind: 'run_intervals',
    title: 'Intervalles course',
    purpose: `Plat · vitesse. Semaine ${weekNumber} : ${set.purpose}.${slot.lowLung ? ' Puis les sprints poumons vides, un bloc à part après le bloc principal.' : ''}`,
    durationMin: Math.ceil(minutesOf(warmup) + mainMin + blocks.slice(1).reduce((total, block) => total + minutesOf(block.title), 0) + minutesOf(cooldown)),
    equipment: ['Chaussures de course', 'chronomètre ou montre avec tour auto 1 km'],
    warmup,
    blocks,
    cooldown
  };
  runIntervalsRepsById[recipe.id] = set.reps;
  return recipe;
}

// ---------- the named gaps, weeks 7 to 11 ----------

function buildTrailDay(weekNumber: number, slot: V4Slot): SessionRecipe {
  // R-SP-10: the label only, no distance, no detail.
  return {
    id: `trail-day-v1-week-${weekNumber}${slot.optional ? '-optional' : ''}`, version: 1, kind: 'trail_day',
    title: V4_KIND_TITLE.trail_day,
    purpose: '',
    durationMin: null, equipment: [], warmup: null, blocks: [], cooldown: null,
    ...(slot.optional ? { optional: true } : {})
  };
}

function buildToBuild(weekNumber: number, kind: Exclude<ContentKind, 'trail_day'>, slot: V4Slot, suffix = ''): SessionRecipe {
  const shape = memoryShapeOf(kind);
  const blocks: ExerciseBlock[] = [
    ...(shape && memoryCycleOf(weekNumber) ? [memoryGameBlock(weekNumber, shape)] : []),
    placeholderBlock('to_build', toBuildLabel(weekNumber))
  ];
  return {
    id: `${kind.replace(/_/g, '-')}-to-build-week-${weekNumber}${suffix}`, version: 1, kind,
    title: V4_KIND_TITLE[kind],
    purpose: slot.offload ? 'Semaine d’allègement : compétences et mental. Le test est vendredi.' : '',
    durationMin: null, equipment: [], warmup: null, blocks, cooldown: null,
    ...(slot.optional ? { optional: true } : {}),
    ...(slot.offload ? { notice: 'Semaine d’allègement.' } : {})
  };
}

// ---------- the generator ----------

/** The recipe of one cell of the v4 table. */
export function buildV4Recipe(weekNumber: number, day: WeekDay, slot: V4Slot): SessionRecipe {
  switch (slot.kind) {
    case 'crossfit_class': return recipes.crossfit!;
    case 'police_event': return recipes.policeEvent!;
    case 'run_intervals': return buildTuesdayV4(weekNumber, slot);
    case 'trail_day': return buildTrailDay(weekNumber, slot);
    case 'skill_park': return weekNumber === 6 ? buildWeek6SkillPark() : buildToBuild(weekNumber, 'skill_park', slot);
    case 'enchainement':
      if (weekNumber === 6) return buildEnchainement(6, false);
      // Section E: week 10 Friday is the rematch of week 6, unchanged.
      if (weekNumber === 10 && day === 'FRI') return buildEnchainement(10, true);
      return buildToBuild(weekNumber, 'enchainement', slot, day === 'WED' ? '-wed' : '');
    default: return buildToBuild(weekNumber, slot.kind, slot);
  }
}

function addDays(date: string, count: number): string {
  return new Date(Date.parse(`${date}T12:00:00Z`) + count * 86_400_000).toISOString().slice(0, 10);
}

function dayLabel(date: string): string {
  return ['DIM', 'LUN', 'MAR', 'MER', 'JEU', 'VEN', 'SAM'][new Date(`${date}T12:00:00Z`).getUTCDay()] ?? '';
}

/**
 * The sessions of a v4 week, one per cell of the table, ids `${date}:${kind}`
 * like every other week. `volumeFactor` is 1 everywhere: R-SP-08, the hard
 * days are loaded and no dose is cut automatically (the reset and taper
 * factors of the v3 phases do not apply to the v4 table).
 */
export function sessionsForV4Week(weekNumber: number, phaseFor: (date: string) => PlannedSession['phase']): PlannedSession[] {
  const plan = SEASON_PLAN_V4[weekNumber];
  if (!plan) return [];
  const planned: PlannedSession[] = [];
  WEEK_DAYS.forEach((day, offset) => {
    const slot = plan.days[day];
    if (!slot) return;
    const date = addDays(plan.startDate, offset);
    if (date > plan.endDate) return;
    const recipe = buildV4Recipe(weekNumber, day, slot);
    recipeById[recipe.id] = recipe;
    planned.push({
      id: `${date}:${slot.kind}`, date, dayLabel: dayLabel(date), kind: slot.kind, recipeId: recipe.id,
      status: slot.kind === 'crossfit_class' ? 'coached' : slot.kind === 'police_event' ? 'fixed_event' : 'proposed',
      phase: phaseFor(date), load: V4_KIND_LOAD[slot.kind], volumeFactor: 1
    });
  });
  return planned;
}

// ---------- section D: the GAP ----------

export interface GapRow {
  skill: GapSkill;
  label: string;
  unit: string;
  fresh: number;
  tired1?: number;
  tired2?: number;
  /** tired 1 minus fresh: after storm 1. Higher is worse. */
  gap1?: number;
  /** tired 2 minus fresh: after storm 2. */
  gap2?: number;
}

/**
 * The GAP of an enchaînement, per skill and per storm: tired minus fresh,
 * computed from the drill scores, never typed and never stored. A skill
 * appears once its fresh test and at least one tired test hold a number.
 */
export function enchainementGap(scores: ReadonlyArray<Pick<DrillScore, 'drillId' | 'value'>> | undefined): GapRow[] {
  const value = (drillId: string) => scores?.find((score) => score.drillId === drillId)?.value;
  const rows: GapRow[] = [];
  for (const item of GAP_SKILLS) {
    const fresh = value(`fresh:${item.skill}`);
    const tired1 = value(`tired1:${item.skill}`);
    const tired2 = value(`tired2:${item.skill}`);
    if (fresh === undefined || (tired1 === undefined && tired2 === undefined)) continue;
    rows.push({
      skill: item.skill, label: item.label, unit: item.unit, fresh,
      ...(tired1 !== undefined ? { tired1, gap1: tired1 - fresh } : {}),
      ...(tired2 !== undefined ? { tired2, gap2: tired2 - fresh } : {})
    });
  }
  return rows;
}

export function hasGapTests(recipe: SessionRecipe): boolean {
  return recipe.blocks.some((block) => block.spec?.kind === 'skill_test');
}

// ---------- the checks of a v4 week ----------

function minutesOf(text: string | null): number {
  const match = text?.match(/(\d+)\s*min/);
  return match ? Number(match[1]) : 0;
}

function totalMinutes(warmup: string | null, blocks: ExerciseBlock[], cooldown: string | null): number {
  return minutesOf(warmup) + blocks.reduce((total, block) => total + minutesOf(block.title), 0) + minutesOf(cooldown);
}

const isOneLine = (text: string) => !/[\n\r]/.test(text);

/**
 * The hard rules of the v4 weeks, as errors. Three hard days in a row are NOT
 * an error here (R-SP-13: accepted as an exception); the week checker flags
 * them on screen and never blocks. Nothing here counts the hard blocks of an
 * enchaînement: it carries two storms on purpose (R-SP-11).
 */
export function validateV4Week(week: TrainingWeek, weekNumber: number): string[] {
  const errors: string[] = [];
  const plan = SEASON_PLAN_V4[weekNumber];
  if (!plan) return [`La semaine ${weekNumber} n’est pas dans SEASON_PLAN v4.`];

  // R-WS-13.
  if (week.sessions.some((session) => session.date > '2026-11-20')) errors.push('Aucune séance ne peut être générée après le 20 novembre 2026.');

  // The table, cell for cell, as a set of kinds: a day move changes the day,
  // never the sessions of the week (CR-014).
  const expected = WEEK_DAYS.flatMap((day) => (plan.days[day] ? [plan.days[day]!.kind] : [])).sort();
  const actual = week.sessions.map((session) => session.kind).sort();
  if (expected.join() !== actual.join()) errors.push(`La semaine ${weekNumber} doit compter les séances de SEASON_PLAN v4 : ${expected.join(', ')}.`);

  for (const session of week.sessions) {
    const recipe = recipeById[session.recipeId];
    if (!recipe) continue;
    const label = `« ${recipe.title} » (${session.date})`;

    // R-SP-09: a warm-up is one line.
    const warmups = [recipe.warmup ?? '', ...recipe.blocks.filter((block) => block.kind === 'warmup').map((block) => block.faire)].filter(Boolean);
    if (warmups.some((text) => !isOneLine(text))) errors.push(`${label} : l’échauffement s’écrit en une ligne (R-SP-09).`);
    if (isV4PoliceKind(session.kind) && warmups.some((text) => !text.startsWith(WARMUP_LINE))) {
      errors.push(`${label} : l’échauffement est « ${WARMUP_LINE} » (R-SP-09).`);
    }

    // R-SP-10: the trail day is a label only.
    if (session.kind === 'trail_day' && (recipe.blocks.length > 0 || recipe.durationMin !== null || /\bkm\b/.test(`${recipe.title} ${recipe.purpose}`))) {
      errors.push(`${label} : le trail n’affiche que son nom, sans distance ni détail (R-SP-10).`);
    }

    // R-WS-26: one score box per drill.
    const drillIds = drillsOf(recipe).map((item) => item.drillId);
    if (new Set(drillIds).size !== drillIds.length) errors.push(`${label} : deux exercices notés partagent le même identifiant de score (R-WS-26).`);

    // Section C: the Tuesday frame.
    if (session.kind === 'run_intervals') {
      const kinds = recipe.blocks.map((block) => block.kind ?? 'main');
      const lowLung = blockOfKind(recipe, 'low_lung');
      const allowed = kinds[0] === 'main' && kinds.slice(1).every((kind) => kind === 'rest' || kind === 'low_lung') && kinds.filter((kind) => kind === 'main').length === 1;
      if (!allowed || !recipe.warmup || !recipe.cooldown) errors.push(`${label} : le mardi garde échauffement + bloc principal + (sprints poumons vides) + retour au calme (R-WS-19).`);
      if (lowLung && lowLung.regle !== LOW_LUNG_SAFETY_LINE) errors.push(`${label} : les sprints poumons vides portent la ligne de sécurité.`);
      const slot = Object.values(plan.days).find((item) => item?.kind === 'run_intervals');
      if (Boolean(lowLung) !== Boolean(slot?.lowLung)) errors.push(`${label} : sprints poumons vides en semaines 6 et 10 seulement (section C).`);
    }

    if (!isV4PoliceKind(session.kind)) continue;

    // R-MM-03/04/06 (CR-018, KEEP): one game card per police session.
    const shape = memoryShapeOf(session.kind)!;
    const cycle = memoryCycleOf(weekNumber);
    if (cycle) {
      const expectedCard = memoryCardFor(weekNumber, shape);
      const memory = memoryBlockOf(recipe);
      if (!memory?.game || memory.game.card !== expectedCard) errors.push(`${label} : le bloc mémoire porte la carte ${expectedCard} du cycle (R-MM-03).`);
      if (!(memory?.drills ?? []).some((item) => item.measure === 'memory_card')) errors.push(`${label} : le bloc mémoire note le score de sa carte (R-MM-04).`);
      if (memoryModulesOf(recipe).includes('M4') !== cycle.m4) errors.push(`${label} : M4 suit la carte en semaines 9 à 11 seulement (R-MM-06).`);
      const minutes = minutesOf(blockOfKind(recipe, 'memory')?.title ?? null);
      if (minutes !== memoryBlockMinutes(cycle.m4) || minutes > MEMORY_BLOCK_MAX_MIN) errors.push(`${label} : le bloc mémoire dure ${memoryBlockMinutes(cycle.m4)} min (R-MM-01).`);
    }

    // R-SP-03: a named gap is the memory card and one "Contenu à construire".
    const toBuild = recipe.blocks.filter((block) => block.kind === 'to_build');
    if (toBuild.length > 0) {
      if (toBuild.length !== 1 || toBuild[0]!.title !== toBuildLabel(weekNumber) || toBuild[0]!.faire !== PLACEHOLDER_LINE || drillsOfBlock(toBuild[0]!).length > 0) {
        errors.push(`${label} : une séance à construire montre « ${toBuildLabel(weekNumber)} » et rien d’autre (R-SP-03).`);
      }
      if (recipe.blocks.some((block) => block.kind !== 'to_build' && block.kind !== 'memory')) {
        errors.push(`${label} : une séance à construire ne copie aucun contenu (R-SP-03).`);
      }
      continue;
    }

    // Every cardio block carries no target (R-WS-31).
    for (const block of recipe.blocks) {
      if (block.spec?.kind === 'cardio' && block.spec.target !== null) errors.push(`${label} : le bloc cardio ne porte aucune cible (R-WS-31).`);
    }

    if (session.kind === 'enchainement') {
      // R-SP-11: two storms of 7 min, each followed by a tired test of the
      // same two skills; fresh test first.
      const order = recipe.blocks
        .map((block) => (block.spec?.kind === 'storm' ? `storm${block.spec.storm}` : block.spec?.kind === 'skill_test' ? block.spec.moment : null))
        .filter((item): item is string => item !== null);
      if (order.join() !== 'fresh,storm1,tired1,storm2,tired2') {
        errors.push(`${label} : test à froid → tempête 1 → test fatigué 1 → tempête 2 → test fatigué 2 (R-SP-11).`);
      }
      for (const block of recipe.blocks) {
        const spec = block.spec;
        if (spec?.kind === 'storm') {
          if (spec.atoms.length < 3 || spec.atoms.length > 4) errors.push(`${label} : une tempête compte 3 ou 4 atomes (R-TL-11).`);
          if (spec.durationMin !== 7) errors.push(`${label} : une tempête dure 7 min (R-SP-11).`);
        }
        if (spec?.kind === 'skill_test' && spec.drills.map((item) => item.drillId.split(':')[1]).join() !== 'hoops,bench_ball') {
          errors.push(`${label} : un test porte deux compétences, cerceaux et banc avec balle (R-SP-11).`);
        }
      }
    }
  }
  return errors;
}
