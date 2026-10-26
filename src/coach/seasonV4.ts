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
  CircuitSpec,
  DrillRef,
  DrillScore,
  ExerciseBlock,
  LowLungSpec,
  LucLegerSpec,
  PlannedSession,
  SessionRecipe,
  SkillBlock,
  SkillTestSpec,
  StormSpec,
  StrengthSpec,
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

// CHANGE_REQUEST_013 v7 — the week 9 Monday (season_plan v5), a named gap.
export const WEEK9_MONDAY_TITLE = 'Avant le vol · optionnel';

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
// CHANGE_REQUEST_013 v7 — Q4 of APP_REPORT_013_v5, word for word.
export const TUESDAY_WARMUP_LINE = 'Échauffement ~10 min (footing)';

// ---------- drills ----------

function drill(cardId: string, drillId: string, measure: DrillRef['measure'], scoreLabel: string): DrillRef {
  return { ...cardRef(cardId), drillId, measure, scoreLabel };
}

// Section D: the GAP skills. The same two skills fresh, after storm 1 and
// after storm 2 (R-SP-11, decision D4: skipping is not tested).
// CHANGE_REQUEST_013 v6 — the week 7 tests are bench with ball and racket
// (WEEK_7_FINAL v3, Thursday), so racket joins the list; each enchaînement
// names the skills its tests carry. The racket pass uses the card
// S11_racket_course_5min (state both: fresh and tired; see APP_REPORT_013_v6).
export type GapSkill = 'hoops' | 'bench_ball' | 'racket';
const GAP_SKILLS: ReadonlyArray<{ skill: GapSkill; cardId: string; measure: DrillRef['measure']; label: string; unit: string }> = [
  { skill: 'hoops', cardId: 'S08_chain_out', measure: 'errors', label: 'Cerceaux', unit: 'erreurs' },
  { skill: 'bench_ball', cardId: 'S09_bench_walk_with_ball', measure: 'touchdowns', label: 'Banc avec balle', unit: 'touchers' },
  { skill: 'racket', cardId: 'S11_racket_course_5min', measure: 'drops', label: 'Raquette', unit: 'balles tombées' }
];
const STORM_TEST_SKILLS: readonly GapSkill[] = ['hoops', 'bench_ball'];
const CIRCUIT_TEST_SKILLS: readonly GapSkill[] = ['bench_ball', 'racket'];
const MOMENT_LABEL: Readonly<Record<TestMoment, string>> = { fresh: 'à froid', tired1: 'fatigué 1', tired2: 'fatigué 2' };

function testDrills(moment: TestMoment, skills: readonly GapSkill[] = STORM_TEST_SKILLS, momentLabel = MOMENT_LABEL[moment]): DrillRef[] {
  return GAP_SKILLS.filter((item) => skills.includes(item.skill))
    .map((item) => drill(item.cardId, `${moment}:${item.skill}`, item.measure, `${item.label} — ${item.unit}, ${momentLabel}`));
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
  return [memoryGameBlock(weekNumber, 'skill_session'), obstacle, bench, racket, hoops, will10Block()];
}

function will10Block(details: string | null = 'Si c’est trop facile : squats sautés à la place des squats.'): ExerciseBlock {
  const cardioSpec: CardioBlock = {
    kind: 'cardio', format: 'amrap', atoms: [cardRef('BLK_will_10')], durationMin: 10, target: null,
    drills: [drill('BLK_will_10', 'cardio:will10_rounds', 'rounds', 'Tours faits — WILL 10')]
  };
  return {
    title: 'Cardio, WILL 10 (Cross Ops) — 10 min', short: 'cardio', kind: 'cardio', spec: cardioSpec,
    faire: 'AMRAP 10 min : 3 burpees · 10 pompes · 10 squats.',
    ...(details ? { details } : {}),
    noter: 'Aucune cible. Noter : les tours faits, et le score d’effort.',
    stationMappings: [], approximation: true
  };
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

function enchainementBlocks(weekNumber: number, rematch = false): ExerciseBlock[] {
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
    // CHANGE_REQUEST_013 v7 — Q3: the rematch keeps the 4 min card, no M4.
    rematch ? memoryGameBlock(weekNumber, 'chain_session', false) : memoryGameBlock(weekNumber, 'chain_session'),
    stormBlock(1),
    testBlock('tired1'),
    { title: 'Repos — 3 min', short: 'repos', kind: 'rest', faire: 'Marcher, longues expirations.', stationMappings: [] },
    stormBlock(2),
    testBlock('tired2')
  ];
}

const ENCHAINEMENT_COOLDOWN = '5 min : marcher, mollets, hanches, 5 respirations lentes avec une longue expiration.';

function buildEnchainement(weekNumber: number, rematch: boolean): SessionRecipe {
  const blocks = enchainementBlocks(weekNumber, rematch);
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
  // CHANGE_REQUEST_013 v7 — Q4: R-SP-09 covers the Tuesday run too (weeks 10
  // and 11; week 6 keeps its locked line).
  const warmup = set.warmup ?? TUESDAY_WARMUP_LINE;
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

// ---------- CHANGE_REQUEST_013 v6: week 7, Bordeaux ----------
//
// `WEEK_7_FINAL_2026-10-19_v3.md`, block for block, app texts in French as
// the change request's section B writes them. The durations are the FINAL
// file's own "about n min" for each day, never a sum computed here. No week 7
// police session carries a memory block: the FINAL file has no memory slot,
// and the change request says not to invent one (question in APP_REPORT_013_v6).

export const WEEK7_NO_MEMORY_SLOT = 7;

const WEEK7_BAG = ['Corde', 'Raquette et 2 balles de ping-pong', 'Cerceaux (vert + 11) et ballon de basket', '5 balles de tennis et une casquette', 'Plots ou chaussures', 'Mètre ruban', 'Minuteur du téléphone et application bip', 'Eau'];

// R-SP-14: the backups, shown on the Tuesday and Thursday cards.
export const BACKUP_OBSTACLE = 'Obstacle : A mur ou banc à hauteur de poitrine · B escaliers, sauter 2-3 marches · C 1 burpee + 1 squat jump.';
export const BACKUP_BENCH = 'Banc : A bordure ou muret plat · B la corde posée au sol · C sur une jambe, balle autour de la taille.';
export const BACKUP_ROWS = 'Tirages sans barre : pompes, même nombre.';
export const BACKUP_LUC_LEGER = 'Sans ligne de 20 m : déplacer le test à un jour qui en a une ; jamais une distance plus courte.';
export const AFTER_MAX_TEST_LINE = 'Après un test maximal, des allures plus lentes sont normales, pas un échec.';
export const WEEK7_THURSDAY_NOTICE = 'Au-dessus de la limite habituelle : signalé, tu décides (R-SP-13).';

/** The backup letters of the log (R-SP-14), stored as A = 1, B = 2, C = 3. */
export const BACKUP_LETTERS = ['A', 'B', 'C'] as const;

function buildWeek7Monday(): SessionRecipe {
  return {
    ...recipes.crossfit!,
    id: 'crossfit-coached-v1-week-7',
    title: 'Cours CrossFit',
    notice: 'Adapter les sauts (trail de 20 km samedi).'
  };
}

function benchWithBallDrills(): DrillRef[] {
  return [
    drill('S09_bench_walk_with_ball', 'skill:bench_ball_falls', 'touchdowns', 'Chutes + touchers — banc avec balle'),
    drill('S09_bench_walk_with_ball', 'skill:bench_ball_turn', 'turn_done', 'Demi-tour réussi — banc avec balle')
  ];
}

function buildWeek7Tuesday(): SessionRecipe {
  const bench = skillBlock(9, 10, benchWithBallDrills(), {
    title: 'Équilibre sur banc avec balle — 10 min', short: 'banc',
    faire: 'Muret plat ou bordure : marches, demi-tours, échanges officiels.',
    regle: 'Ça vacille : descendre exprès.',
    details: BACKUP_BENCH,
    noter: 'Chutes + touchers · demi-tour réussi (oui / non).'
  });
  const racket = skillBlock(11, 10, [
    drill('S11_racket_balance_wall', 'skill:racket_balance_drops', 'drops', 'Balles tombées — raquette en équilibre')
  ], {
    title: 'Raquette en équilibre — 10 min', short: 'raquette',
    faire: 'Autour de 5-6 obstacles, puis le long du muret plat.',
    noter: 'Balles tombées par passage.'
  });
  return {
    id: 'skill-park-v2-week-7-tue', version: 2, kind: 'skill_park',
    title: 'Compétences courtes · parc',
    purpose: 'Le banc avec balle, frais et calme, sur un muret plat ; la raquette en équilibre ; puis WILL 10 comme cardio, sans cible. Chaque exercice est une approximation du poste officiel.',
    durationMin: 40,
    equipment: WEEK7_BAG,
    warmup: `${WARMUP_LINE} · repérer pour jeudi : muret plat (banc), mur ou banc à hauteur de poitrine (obstacle), barre hanches-poitrine (tirages) ; pour mercredi : une ligne plate de 20 m.`,
    blocks: [bench, racket, will10Block(null)],
    cooldown: null
  };
}

// Section D, COMPUTED (R-TB-03): the speed of the last fully completed stage
// of the Léger protocol (stage 1 at 8.5 km/h, +0.5 km/h per stage), from the
// stage reached. Never typed, never stored, it changes nothing (R-TB-05).
export function lucLegerVmaKmh(stageReached: number | undefined): number | undefined {
  if (stageReached === undefined || !Number.isInteger(stageReached) || stageReached < 1) return undefined;
  return 8.0 + 0.5 * (stageReached - 1);
}

export function lucLegerVmaOf(scores: ReadonlyArray<Pick<DrillScore, 'drillId' | 'value'>> | undefined): { vma: number; stage: number; leg?: number } | null {
  const stage = scores?.find((score) => score.drillId === 'test:luc_leger_stage')?.value;
  const leg = scores?.find((score) => score.drillId === 'test:luc_leger_leg')?.value;
  const vma = lucLegerVmaKmh(stage);
  if (vma === undefined || stage === undefined) return null;
  return { vma, stage, ...(leg !== undefined ? { leg } : {}) };
}

const WEEK7_WEDNESDAY_ID = 'run-intervals-v3-week-7-luc-leger';

// The intervals of week 7: 4 reps required, a 5th optional (never missed).
export const WEEK7_INTERVALS = { reps: 4, optionalReps: 1, minutes: 4, paceSec: 310, jogSec: 120 } as const;

/** Reps short of the required count. An optional rep is never counted as missed. */
export function missedReps(recipe: SessionRecipe, repsDone: number): number {
  const required = recipe.id === WEEK7_WEDNESDAY_ID ? WEEK7_INTERVALS.reps : (runIntervalsRepsById[recipe.id] ?? 0);
  return Math.max(0, required - repsDone);
}

function buildWeek7Wednesday(): SessionRecipe {
  const spec: LucLegerSpec = {
    kind: 'luc_leger', card: cardRef('S00_luc_leger_test'),
    drills: [
      drill('S00_luc_leger_test', 'test:luc_leger_stage', 'stage', 'Palier atteint — test Luc Léger'),
      drill('S00_luc_leger_test', 'test:luc_leger_leg', 'leg', 'Navette — test Luc Léger')
    ]
  };
  const test: ExerciseBlock = {
    title: 'Test Luc Léger — à frais, en premier', short: 'Luc Léger', kind: 'luc_leger', spec,
    faire: '20 m mesurés, application bip au protocole Léger (palier 1 à 8,5 km/h, +0,5 km/h par minute). Continu, atteindre la ligne à chaque bip, sans pause. Fin au DEUXIÈME bip manqué de suite.',
    regle: BACKUP_LUC_LEGER,
    noter: 'Palier atteint · navette · effort. La VMA est calculée, jamais tapée.',
    stationMappings: [], approximation: true
  };
  const recovery: ExerciseBlock = {
    title: 'Récupération — 10 min', short: 'récupération', kind: 'rest',
    faire: 'Marche 3 min, footing facile 7 min.', stationMappings: []
  };
  const row: RunIntervalsRow = { week: 7, reps: WEEK7_INTERVALS.reps, minutes: WEEK7_INTERVALS.minutes, paceSec: WEEK7_INTERVALS.paceSec, jogSec: WEEK7_INTERVALS.jogSec, purpose: 'après le test Luc Léger, allure 5:10' };
  const base = runIntervalsMainBlock(row);
  const main: ExerciseBlock = {
    ...base,
    faire: `${base.faire} · 5e répétition seulement si la 4e est à 5:15 ou plus vite ET effort ressenti 4 ou moins.`,
    regle: AFTER_MAX_TEST_LINE,
    noter: '4 allures + 1 optionnelle · effort.'
  };
  const recipe: SessionRecipe = {
    id: WEEK7_WEDNESDAY_ID, version: 3, kind: 'run_intervals',
    title: 'Test Luc Léger + fractionné',
    purpose: 'Le test Luc Léger à frais, une fois, pour une VMA à jour (test_battery v3). Puis le fractionné. Aucune cible.',
    durationMin: 70,
    equipment: ['Chaussures de course', 'Mètre ruban', 'Plots ou chaussures', 'Application bip (protocole Léger)', 'Chronomètre ou montre avec tour auto 1 km'],
    warmup: 'Échauffement ~10 min, footing + 2-3 accélérations.',
    blocks: [test, recovery, main],
    cooldown: 'Retour au calme.'
  };
  runIntervalsRepsById[recipe.id] = WEEK7_INTERVALS.reps + WEEK7_INTERVALS.optionalReps;
  return recipe;
}

/** The skill-test block of the circuit enchaînement (R-SP-15). */
function circuitTestBlock(moment: 'fresh' | 'tired1'): ExerciseBlock {
  const fresh = moment === 'fresh';
  const spec: SkillTestSpec = { kind: 'skill_test', moment, drills: testDrills(moment, CIRCUIT_TEST_SKILLS, fresh ? 'à froid' : 'fatigué') };
  return {
    title: fresh ? 'Test à froid' : 'Test fatigué — dans les 30 s',
    short: fresh ? 'test à froid' : 'test fatigué',
    kind: 'skill_test', spec,
    faire: fresh
      ? 'Banc avec balle : 1 échange officiel · raquette : 1 passage.'
      : 'Dans les 30 s après le circuit : banc avec balle, 1 échange · raquette, 1 passage.',
    noter: fresh
      ? 'Banc : chutes + touchers · raquette : balles tombées. C’est la référence du jour : l’écart est calculé, jamais tapé.'
      : 'Banc : chutes + touchers · raquette : balles tombées. L’écart avec le test à froid est calculé.',
    stationMappings: [9, 11], approximation: true
  };
}

export const CIRCUIT_TIME_DRILL = 'ench:bordeaux10_time_s';
export const CIRCUIT_STATION_DRILL = 'ench:bordeaux10_station_at_cap';

// Section C: the stations of one lap, in order. The station reached at the cap
// is typed as a number: lap 1 = 1 to 6, lap 2 = 7 to 12.
export const BORDEAUX10_STATIONS = ['sprint 20 m', 'slalom ~15 m', 'obstacle × 9', '10 tirages', '8 burpees', '45 s de corde'] as const;

function bordeaux10Block(): ExerciseBlock {
  const spec: CircuitSpec = {
    kind: 'circuit', card: cardRef('BLK_bordeaux_10'), laps: 2, capMin: 10,
    // The atoms that are cards; the 20 m sprint and the 45 s rope have no card
    // of their own and live in the block card BLK_bordeaux_10.
    atoms: ['S01_slalom_18m', 'S02_obstacle_wall_official', 'S00_bar_row', 'S00_full_burpee'].map(cardRef),
    drills: [
      drill('BLK_bordeaux_10', CIRCUIT_TIME_DRILL, 'time_s', 'Temps total — BORDEAUX 10'),
      drill('BLK_bordeaux_10', CIRCUIT_STATION_DRILL, 'station_at_cap', 'OU station atteinte à 10:00 (tour 1 : 1-6, tour 2 : 7-12)'),
      drill('BLK_bordeaux_10', 'ench:backup', 'backup', 'Backup utilisé')
    ]
  };
  return {
    title: 'BORDEAUX 10 · 2 tours chrono · cap 10:00', short: 'BORDEAUX 10', kind: 'circuit', spec,
    faire: 'Un tour, dans l’ordre : sprint 20 m · slalom ~15 m (aller droit, retour en slalom) · obstacle, rythme officiel : 5 passages aller (une balle de tennis dans la casquette à chaque fois), 4 retour sans balle (9 passages) · 10 tirages à la barre · 8 burpees complets · 45 s de corde.',
    regle: 'Burpees poitrine au sol · tirages corps gainé · passage bâclé → backup C pour la suite du circuit · ça vacille sur le banc → descendre exprès · vertige → stop, ça compte.',
    details: `${BACKUP_OBSTACLE} ${BACKUP_ROWS}`,
    noter: 'Le temps total, OU la station atteinte à 10:00 · effort · backup utilisé (A, B, C).',
    stationMappings: [1, 2, 3, 10], approximation: true
  };
}

function roumiBlock(): ExerciseBlock {
  // ROUMI is for time: it has no fixed duration, so `durationMin` is 0 and the
  // title carries no minutes (nothing is summed from it).
  const spec: CardioBlock = {
    kind: 'cardio', format: 'for_time', atoms: [cardRef('BLK_roumi')], durationMin: 0, target: null,
    drills: [drill('BLK_roumi', 'cardio:roumi_time_s', 'time_s', 'Temps — ROUMI')]
  };
  return {
    title: 'ROUMI (Cross Ops p 14) · 10 tours chrono', short: 'ROUMI', kind: 'cardio', spec,
    faire: '10 tours chrono : 10 squats · 5 burpees · 10 squat jumps.',
    noter: 'Aucune cible. Noter : le temps, et le score d’effort.',
    stationMappings: [], approximation: true
  };
}

function buildWeek7Thursday(): SessionRecipe {
  return {
    id: 'enchainement-v2-week-7', version: 2, kind: 'enchainement',
    title: 'Enchaînement · BORDEAUX 10',
    purpose: 'À bloc. Test à froid → UN circuit chrono → test fatigué dans les 30 s → ROUMI. Le circuit est une approximation du test, avec des remplaçants.',
    durationMin: 55,
    equipment: WEEK7_BAG,
    warmup: null,
    blocks: [
      { title: `${WARMUP_LINE} + priming`, short: 'échauffement', kind: 'warmup', faire: `${WARMUP_LINE} · priming : 2 × 10 s de sprint.`, stationMappings: [] },
      { ...circuitTestBlock('fresh'), details: BACKUP_BENCH },
      bordeaux10Block(),
      circuitTestBlock('tired1'),
      { title: 'Repos — 3 min', short: 'repos', kind: 'rest', faire: 'Marcher, longues expirations.', stationMappings: [] },
      roumiBlock()
    ],
    cooldown: 'Retour au calme.',
    notice: WEEK7_THURSDAY_NOTICE
  };
}

function buildWeek7Friday(): SessionRecipe {
  const hoops = skillBlock(8, 0, [
    drill('S08_chain_out', 'skill:hoops11_foot', 'foot_errors', 'Erreurs de pied — cerceaux (les 11)'),
    drill('S08_return_dribble_same_side', 'skill:hoops11_hand', 'hand_errors', 'Erreurs de main — cerceaux (les 11)')
  ], {
    title: 'Cerceaux : les 11 · 4 passages', short: 'cerceaux',
    faire: 'Les 11 cerceaux, aller ballon dans les bras, retour en dribble · 4 passages.',
    noter: 'Erreurs de pied · erreurs de main.'
  });
  const racket = skillBlock(11, 5, [
    drill('S11_racket_course_5min', 'skill:racket_course_drops', 'drops', 'Balles tombées (total) — parcours raquette')
  ], {
    title: 'Parcours raquette — 5 min', short: 'raquette',
    faire: '5 min continu, plat + obstacles.',
    noter: 'Balles tombées (total).'
  });
  const skipping = skillBlock(10, 8, [
    drill('S10_skipping_emom_8', 'skill:skipping_emom8_clean', 'clean_minutes', 'Minutes propres (sur 8) — corde EMOM')
  ], {
    title: 'Corde EMOM — 8 min', short: 'corde',
    faire: 'Chaque minute : 5 pied droit · 5 pied gauche · 10 pieds joints, repos le reste.',
    noter: 'Minutes propres (sur 8).'
  });
  const bench = skillBlock(9, 5, benchWithBallDrills(), {
    title: 'Banc avec balle — 5 min', short: 'banc',
    faire: '5 min, demi-tours compris.',
    regle: 'Ça vacille : descendre exprès.',
    noter: 'Chutes + touchers · demi-tour réussi (oui / non).'
  });
  return {
    id: 'skill-park-v2-week-7-fri', version: 2, kind: 'skill_park',
    title: 'Compétences chrono',
    purpose: 'Les compétences sous le chrono, sans cible : cerceaux, raquette, corde, banc avec balle. Vol de nuit. Chaque exercice est une approximation du poste officiel.',
    durationMin: 35,
    equipment: WEEK7_BAG,
    warmup: null,
    blocks: [hoops, racket, skipping, bench],
    cooldown: null
  };
}

// ---------- CHANGE_REQUEST_013 v7: week 8, Kingston ----------
//
// `WEEK_8_FINAL_2026-10-26.md`, block for block, app texts in French as the
// change request's section B writes them; the card texts are the cards' own
// (S09_kingston_balance_ladder, S10_rope_mix_15). The durations are the FINAL
// file's "about n min" for each day. No week 8 session carries a memory block:
// the FINAL file has no memory slot and none is invented (KEEP section A,
// question in APP_REPORT_013_v7). Every run of 400 m or 800 m is outdoors and
// shows its distance only: no pace, no target (R-TL-12).

/** The weeks whose locked file has no memory slot (the cycle itself is unchanged). */
export const NO_MEMORY_SLOT_WEEKS: readonly number[] = [WEEK7_NO_MEMORY_SLOT, 8];

const WEEK8_KIT = ['Tapis de yoga', '1 balle de tennis', 'Corde', 'Cerceaux', 'Raquette', 'Minuteur du téléphone', 'Eau'];
const WEEK8_GYM = ['Haltères (2 × 10 kg)', ...WEEK8_KIT];

export const WEEK8_TUESDAY_NOTICE = 'Au-dessus de la limite habituelle : signalé, tu décides (R-SP-13).';
export const WEEK8_NO_TEST_LINE = 'Pas de test à froid ni de test fatigué cette semaine (ta décision, semaine 8 seulement).';

// Section B, the card S09_kingston_balance_ladder, word for word.
export const KINGSTON_LADDER_FAIRE = 'Tapis de yoga plié en quatre · 1 balle de tennis · un mur. 1 min de travail, 30 s de repos. Debout bien droit, genou souple, regard sur un point fixe. Le pied libre ne touche pas la jambe d’appui. '
  + '1 Jambe droite sur le tapis. Passe la balle autour de la taille, d’une main à l’autre, sans arrêt. 1 min · '
  + '2 Jambe gauche sur le tapis. Pareil. 1 min · '
  + '3 Yeux fermés, au sol (pas sur le tapis), une main près du mur. 30 s jambe droite, puis 30 s gauche · '
  + '4 Jambe droite sur le tapis, à 1 m du mur. Lance la balle par en dessous contre le mur, rattrape-la d’une main. 1 min · '
  + '5 Jambe gauche sur le tapis. Pareil. 1 min · '
  + '6 Refais 1 et 2. 2 min';
export const KINGSTON_LADDER_NOTER = 'Compte : touchers (le pied libre touche le sol) + balles tombées. But : 0.';
export const KINGSTON_LADDER_STOP = 'Stop si vertige, 3 touchers en une minute (ça compte), ou douleur à la cheville.';
export const KINGSTON_LADDER_TIRED = 'Version fatiguée (5 min, après le cardio) : étapes 1 et 2 seulement, 30 s par jambe, 3 tours, repos 20 s.';

// Section B, the card S10_rope_mix_15, word for word.
export const ROPE_MIX_FAIRE = 'Partie A · Tabata, 8 min : 20 s de corde, 10 s de repos, 16 tours (la suite de 8 tours, deux fois) : '
  + 'tours 1-2 pieds joints · 3-4 côté à côté (20 cm) · 5-6 avant-arrière (20 cm) · tour 7 pied gauche seul · tour 8 pied droit seul · tours 9-16 pareil. '
  + 'Repos 1 min. '
  + 'Partie B · échelle de cartes, 6 min : 1 min pour chaque carte, 30 s de repos ; une erreur fait recommencer le bloc en cours : '
  + '1 5 droit · 5 gauche · 10 joints · 2 8 droit · 8 gauche · 10 joints · 3 10 droit · 10 gauche · 10 joints · 4 15 droit · 15 gauche · 15 joints';
export const ROPE_MIX_NOTER = 'Scores : ratés sur les tours à un pied (7, 8, 15, 16) · cartes propres sur 4';

function kingstonLadderBlock(): ExerciseBlock {
  return skillBlock(9, 12, [
    drill('S09_kingston_balance_ladder', 'balance:ladder_touchdowns', 'touchdowns', 'Touchers — échelle d’équilibre'),
    drill('S09_kingston_balance_ladder', 'balance:ladder_drops', 'drops', 'Balles tombées — échelle d’équilibre')
  ], {
    title: 'Échelle d’équilibre Kingston — 12 min', short: 'équilibre',
    faire: KINGSTON_LADDER_FAIRE,
    regle: KINGSTON_LADDER_STOP,
    details: KINGSTON_LADDER_TIRED,
    noter: KINGSTON_LADDER_NOTER
  });
}

function tiredBalanceBlock(): ExerciseBlock {
  return skillBlock(9, 5, [
    drill('S09_kingston_balance_ladder', 'balance:tired_touchdowns', 'touchdowns', 'Touchers — équilibre fatigué')
  ], {
    title: 'Équilibre fatigué — 5 min', short: 'équilibre fatigué',
    faire: 'Échelle d’équilibre, étapes 1 et 2 seulement : 30 s par jambe, 3 tours, repos 20 s.',
    regle: KINGSTON_LADDER_STOP,
    noter: 'Touchers.'
  });
}

/** A Cross Ops WOD as the cardio block: atoms that are cards, no target. */
function crossOpsBlock(title: string, short: string, format: CardioBlock['format'], durationMin: number, atomIds: string[], faire: string, drills: DrillRef[], noter: string): ExerciseBlock {
  const spec: CardioBlock = { kind: 'cardio', format, atoms: atomIds.map(cardRef), durationMin, target: null, drills };
  return { title, short, kind: 'cardio', spec, faire, noter, stationMappings: [], approximation: true };
}

function buildWeek8Monday(): SessionRecipe {
  return {
    id: 'easy-run-v1-week-8-mon', version: 1, kind: 'easy_run',
    title: 'Facile · journée de terrain',
    purpose: 'Journée légère : l’échelle d’équilibre, puis un footing facile.',
    durationMin: 45,
    equipment: ['Tapis de yoga', '1 balle de tennis', 'Chaussures de course'],
    warmup: null,
    blocks: [
      kingstonLadderBlock(),
      { title: 'Footing facile — 30 min', short: 'footing', faire: '30 min, 8,5 km/h ou plus lent.', noter: 'Effort.', stationMappings: [] }
    ],
    cooldown: null
  };
}

function buildWeek8Tuesday(): SessionRecipe {
  const rope = skillBlock(10, 15, [
    drill('S10_rope_mix_15', 'rope:onefoot_misses', 'misses', 'Ratés sur les tours à un pied (7, 8, 15, 16) — corde'),
    drill('S10_rope_mix_15', 'rope:clean_cards', 'clean_cards', 'Cartes propres sur 4 — corde')
  ], {
    title: 'Corde mix 15 — 15 min', short: 'corde',
    faire: ROPE_MIX_FAIRE,
    regle: 'Stop si douleur au mollet ou au tendon d’Achille.',
    noter: ROPE_MIX_NOTER
  });
  const cardioRunB = crossOpsBlock(
    'CARDIO RUN B (Cross Ops p 14) · max de tours en 30 min', 'CARDIO RUN B', 'amrap', 30, ['S00_full_burpee'],
    'Max de tours en 30 min : 800 m de course en extérieur · 20 burpees.',
    [
      drill('S00_full_burpee', 'cardio:cardiorunb_rounds', 'rounds', 'Tours faits — CARDIO RUN B'),
      drill('S00_full_burpee', 'cardio:cardiorunb_metres', 'metres', 'Mètres du tour entamé — CARDIO RUN B')
    ],
    'Aucune cible. Noter : les tours + les mètres du tour entamé, et le score d’effort.'
  );
  return {
    id: 'skill-park-v3-week-8-tue', version: 3, kind: 'skill_park',
    title: 'Compétences + cardio',
    purpose: 'L’échelle d’équilibre et la corde, frais ; puis CARDIO RUN B comme cardio, sans cible. Chaque exercice est une approximation du poste officiel.',
    durationMin: 60,
    equipment: WEEK8_KIT,
    warmup: WARMUP_LINE,
    blocks: [kingstonLadderBlock(), rope, cardioRunB],
    cooldown: null,
    notice: WEEK8_TUESDAY_NOTICE
  };
}

function buildWeek8Wednesday(): SessionRecipe {
  const spec: StrengthSpec = {
    kind: 'strength', card: cardRef('S00_dumbbell_thruster'), sets: 5, reps: 8, restS: 90,
    drills: [
      drill('S00_dumbbell_thruster', 'strength:thruster_kg', 'load_kg', 'Charge (kg) — thrusters'),
      drill('S00_dumbbell_thruster', 'strength:thruster_reps', 'reps_done', 'Répétitions faites — thrusters')
    ]
  };
  const thrusters: ExerciseBlock = {
    title: 'Thrusters haltères 5 × 8 — 12 min', short: 'thrusters', kind: 'strength', spec,
    faire: '5 × 8, 2 × 10 kg, repos 90 s. Un haltère dans chaque main aux épaules : squat sous la parallèle, remonter et pousser les deux haltères bras tendus en un seul mouvement.',
    regle: 'Stop si le dos s’arrondit, ou si la poussée devient une cambrure.',
    noter: 'Charge (kg) · répétitions faites · effort.',
    stationMappings: [], approximation: true
  };
  const eagle = crossOpsBlock(
    'EAGLE (Cross Ops p 14) · max de tours en 20 min', 'EAGLE', 'amrap', 20, ['S00_jump_squats', 'S00_full_burpee'],
    'Max de tours en 20 min : 400 m de course en extérieur · 10 squat jumps · 10 burpees.',
    [drill('S00_full_burpee', 'cardio:eagle_rounds', 'rounds', 'Tours faits — EAGLE')],
    'Aucune cible. Noter : les tours, et le score d’effort.'
  );
  return {
    id: 'skill-park-v3-week-8-wed', version: 3, kind: 'skill_park',
    title: 'Force + EAGLE',
    purpose: 'Salle de l’hôtel : les thrusters, puis EAGLE comme cardio, sans cible, puis l’équilibre fatigué. Chaque exercice est une approximation du poste officiel.',
    durationMin: 50,
    equipment: WEEK8_GYM,
    warmup: WARMUP_LINE,
    blocks: [thrusters, eagle, tiredBalanceBlock()],
    cooldown: null
  };
}

const WEEK8_THURSDAY_ID = 'run-intervals-v3-week-8-treadmill';
export const WEEK8_INTERVALS = { reps: 5, minutes: 3, paceSec: 300, jogSec: 120 } as const;

function buildWeek8Thursday(): SessionRecipe {
  const row: RunIntervalsRow = { week: 8, reps: WEEK8_INTERVALS.reps, minutes: WEEK8_INTERVALS.minutes, paceSec: WEEK8_INTERVALS.paceSec, jogSec: WEEK8_INTERVALS.jogSec, purpose: 'allures des intervalles de la semaine 7', treadmill: true };
  const main: ExerciseBlock = {
    ...runIntervalsMainBlock(row),
    faire: '5 × 3 min à 12,0 km/h (5:00 /km), pente 1 %, 2 min de footing à 8 km/h entre.',
    noter: '5 allures · effort.'
  };
  const recipe: SessionRecipe = {
    id: WEEK8_THURSDAY_ID, version: 3, kind: 'run_intervals',
    title: 'Fractionné · tapis',
    purpose: 'Sur tapis, salle de l’hôtel. Puis l’équilibre fatigué. Aucune cible.',
    durationMin: 55,
    equipment: ['Chaussures de course', 'Tapis de course', 'Tapis de yoga', '1 balle de tennis'],
    warmup: 'Échauffement ~15 min à 8,5 km/h + 3 × 20 s à 13 km/h.',
    blocks: [main, tiredBalanceBlock()],
    cooldown: 'Retour au calme 10 min facile.'
  };
  runIntervalsRepsById[recipe.id] = WEEK8_INTERVALS.reps;
  return recipe;
}

export const KINGSTON10_LAPS_DRILL = 'ench:kingston10_laps';
export const KINGSTON10_STATION_DRILL = 'ench:kingston10_station';

// Section B: the six stations of one lap, in the order of the test.
export const KINGSTON10_STATIONS = [
  '1 navette 4 × 20 m',
  '2 cinq fois : 1 burpee (poitrine au sol) + 1 squat jump',
  '3 10 pompes, poitrine au sol',
  '4 cerceaux, les 11, aller, pieds selon la couleur (erreur : retour au cerceau 1)',
  '5 sur une jambe sur le tapis plié, balle autour de la taille : 10 s droite + 10 s gauche (un toucher : on recommence cette jambe)',
  '6 carte de corde : 5 pied droit · 5 pied gauche · 10 pieds joints (erreur : on recommence le bloc)'
] as const;

function kingston10Block(): ExerciseBlock {
  const spec: CircuitSpec = {
    kind: 'circuit', card: cardRef('BLK_kingston_10'), laps: null, capMin: 10, score: 'laps_and_station',
    // The atoms that are cards; the shuttle and the hoops pass live in the
    // block card BLK_kingston_10.
    atoms: ['S00_full_burpee', 'S00_jump_squats', 'S00_push_up', 'S09_kingston_balance_ladder', 'S10_rope_mix_15'].map(cardRef),
    drills: [
      drill('BLK_kingston_10', KINGSTON10_LAPS_DRILL, 'laps', 'Tours complets — KINGSTON 10'),
      drill('BLK_kingston_10', KINGSTON10_STATION_DRILL, 'station_reached', 'ET station atteinte à 10:00 (1 à 6) — KINGSTON 10')
    ]
  };
  return {
    title: 'KINGSTON 10 · max de tours en 10 min', short: 'KINGSTON 10', kind: 'circuit', spec,
    faire: `Un tour, dans l’ordre de l’épreuve : ${KINGSTON10_STATIONS.join(' · ')}.`,
    regle: 'Pas de repos prévu · vertige → stop, ça compte · sans cerceaux : station 4 = 10 sauts de corde sur une jambe (5 par jambe).',
    noter: 'Tours complets + station atteinte à 10:00 · effort.',
    stationMappings: [1, 8, 9, 10], approximation: true
  };
}

function maxBlock(): ExerciseBlock {
  // MAX is for time: no fixed duration, so `durationMin` is 0 and the title
  // carries no minutes. The sit-ups have no card of their own (question in
  // APP_REPORT_013_v7); the atoms listed are the ones that are cards.
  return crossOpsBlock(
    'MAX (Cross Ops p 17) · 10 tours chrono', 'MAX', 'for_time', 0, ['S00_push_up', 'S00_air_squats'],
    '10 tours chrono : 10 abdos · 10 pompes · 15 squats.',
    [drill('S00_push_up', 'cardio:max_time_s', 'time_s', 'Temps — MAX')],
    'Aucune cible. Noter : le temps, et le score d’effort.'
  );
}

function buildWeek8Friday(): SessionRecipe {
  return {
    id: 'enchainement-v3-week-8', version: 3, kind: 'enchainement',
    title: 'Enchaînement · KINGSTON 10',
    purpose: 'À bloc, au parc. UN circuit : max de tours en 10 min, puis MAX. Pas de test à froid ni de test fatigué cette semaine. Le circuit est une approximation du test.',
    durationMin: 35,
    equipment: WEEK8_KIT,
    warmup: null,
    blocks: [
      { title: `${WARMUP_LINE} + priming`, short: 'échauffement', kind: 'warmup', faire: `${WARMUP_LINE} · priming : 2 × 10 s de sprint.`, stationMappings: [] },
      kingston10Block(),
      maxBlock(),
      { title: 'Marche — 5 min', short: 'marche', kind: 'rest', faire: 'Marcher.', stationMappings: [] }
    ],
    cooldown: null,
    notice: WEEK8_NO_TEST_LINE,
    noGapTests: true
  };
}

function buildWeek8Saturday(): SessionRecipe {
  const russian = crossOpsBlock(
    'RUSSIAN (Cross Ops p 17) · max de tours en 20 min', 'RUSSIAN', 'amrap', 20, ['S00_push_up', 'S00_jump_squats', 'S00_full_burpee'],
    'Max de tours en 20 min : 10 pompes (pour 10 tractions) · 10 squat jumps (pour 10 box jumps) · 10 burpees · 10 squat jumps · 400 m en extérieur.',
    [drill('S00_full_burpee', 'cardio:russian_rounds', 'rounds', 'Tours faits — RUSSIAN')],
    'Aucune cible. Noter : les tours, et le score d’effort.'
  );
  return {
    id: 'skill-park-v3-week-8-sat', version: 3, kind: 'skill_park',
    title: 'RUSSIAN',
    purpose: 'L’échelle d’équilibre, frais ; puis RUSSIAN comme cardio, sans cible, puis l’équilibre fatigué. Sans salle. Chaque exercice est une approximation du poste officiel.',
    durationMin: 45,
    equipment: WEEK8_KIT,
    warmup: WARMUP_LINE,
    blocks: [kingstonLadderBlock(), russian, tiredBalanceBlock()],
    cooldown: null
  };
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
  // CHANGE_REQUEST_013 v6 — week 7, block for block.
  if (weekNumber === 7) {
    if (slot.kind === 'crossfit_class') return buildWeek7Monday();
    if (slot.kind === 'run_intervals') return buildWeek7Wednesday();
    if (slot.kind === 'enchainement') return buildWeek7Thursday();
    if (slot.kind === 'skill_park') return day === 'FRI' ? buildWeek7Friday() : buildWeek7Tuesday();
  }
  // CHANGE_REQUEST_013 v7 — week 8, block for block.
  if (weekNumber === 8) {
    if (slot.kind === 'easy_run') return buildWeek8Monday();
    if (slot.kind === 'run_intervals') return buildWeek8Thursday();
    if (slot.kind === 'enchainement') return buildWeek8Friday();
    if (slot.kind === 'skill_park') return day === 'WED' ? buildWeek8Wednesday() : day === 'SAT' ? buildWeek8Saturday() : buildWeek8Tuesday();
  }
  // CHANGE_REQUEST_013 v7 — season_plan v5: the week 9 Monday, optional, a
  // named gap ("challenging if before the flight").
  if (weekNumber === 9 && day === 'MON') return { ...buildToBuild(9, slot.kind as Exclude<ContentKind, 'trail_day'>, slot, '-mon'), title: WEEK9_MONDAY_TITLE };
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
      // CHANGE_REQUEST_013 v7 — a cell may carry its own load (week 8).
      phase: phaseFor(date), load: slot.load ?? V4_KIND_LOAD[slot.kind], volumeFactor: 1
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

/** CHANGE_REQUEST_013 v6 — an enchaînement of the R-SP-15 shape (one circuit). */
export function isCircuitEnchainement(recipe: SessionRecipe): boolean {
  return recipe.blocks.some((block) => block.kind === 'circuit');
}

/** CHANGE_REQUEST_013 v6 — the week 7 Wednesday (Luc Léger test, then 4 + 1 optional reps). */
export function isWeek7Wednesday(recipe: SessionRecipe): boolean {
  return recipe.id === WEEK7_WEDNESDAY_ID;
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
      // CHANGE_REQUEST_013 v6 — week 7 Wednesday: the Luc Léger test block
      // first, fresh, then the recovery, then the interval set.
      const lucLeger = kinds.includes('luc_leger');
      const allowedLucLeger = kinds.join() === 'luc_leger,rest,main';
      // CHANGE_REQUEST_013 v7 — week 8 Thursday: the main set, then the tired
      // balance (WEEK_8_FINAL), before the cool-down.
      const tiredBalance = kinds.join() === 'main,skill_block'
        && drillsOfBlock(recipe.blocks[1]!).every((item) => item.drillId === 'balance:tired_touchdowns');
      if (lucLeger ? !allowedLucLeger : !(allowed || tiredBalance)) errors.push(`${label} : ${lucLeger ? 'le test Luc Léger vient en premier, puis la récupération, puis le fractionné (test_battery v3).' : 'le mardi garde échauffement + bloc principal + (sprints poumons vides) + retour au calme (R-WS-19).'}`);
      else if (!recipe.warmup || !recipe.cooldown) errors.push(`${label} : le mardi garde échauffement + bloc principal + (sprints poumons vides) + retour au calme (R-WS-19).`);
      if (lucLeger && weekNumber !== 7) errors.push(`${label} : un seul test Luc Léger, en semaine 7 (R-TB-01).`);
      if (lowLung && lowLung.regle !== LOW_LUNG_SAFETY_LINE) errors.push(`${label} : les sprints poumons vides portent la ligne de sécurité.`);
      const slot = Object.values(plan.days).find((item) => item?.kind === 'run_intervals');
      if (Boolean(lowLung) !== Boolean(slot?.lowLung)) errors.push(`${label} : sprints poumons vides en semaines 6 et 10 seulement (section C).`);
    }

    if (!isV4PoliceKind(session.kind)) continue;

    // R-MM-03/04/06 (CR-018, KEEP): one game card per police session.
    const shape = memoryShapeOf(session.kind)!;
    // CHANGE_REQUEST_013 v6 — week 7: the FINAL file has no memory slot and
    // none is invented (KEEP section A); the cycle itself is unchanged.
    // CHANGE_REQUEST_013 v7 — week 8 likewise (WEEK_8_FINAL has no memory slot).
    const noSlot = NO_MEMORY_SLOT_WEEKS.includes(weekNumber);
    const cycle = noSlot ? null : memoryCycleOf(weekNumber);
    if (noSlot && memoryBlockOf(recipe)) errors.push(`${label} : la semaine ${weekNumber} n’a pas de bloc mémoire (WEEK_${weekNumber}_FINAL).`);
    if (cycle) {
      const expectedCard = memoryCardFor(weekNumber, shape);
      const memory = memoryBlockOf(recipe);
      // CHANGE_REQUEST_013 v7 — Q3: the rematch keeps the 4 min card, no M4.
      const m4 = recipe.rematchOf ? false : cycle.m4;
      if (!memory?.game || memory.game.card !== expectedCard) errors.push(`${label} : le bloc mémoire porte la carte ${expectedCard} du cycle (R-MM-03).`);
      if (!(memory?.drills ?? []).some((item) => item.measure === 'memory_card')) errors.push(`${label} : le bloc mémoire note le score de sa carte (R-MM-04).`);
      if (memoryModulesOf(recipe).includes('M4') !== m4) errors.push(`${label} : M4 suit la carte en semaines 9 à 11 seulement, sauf la revanche (R-MM-06, Q3).`);
      const minutes = minutesOf(blockOfKind(recipe, 'memory')?.title ?? null);
      if (minutes !== memoryBlockMinutes(m4) || minutes > MEMORY_BLOCK_MAX_MIN) errors.push(`${label} : le bloc mémoire dure ${memoryBlockMinutes(m4)} min (R-MM-01).`);
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

    if (session.kind === 'enchainement' && recipe.blocks.some((block) => block.kind === 'circuit')) {
      // CHANGE_REQUEST_013 v6 — R-SP-15: warm-up + priming · fresh test · ONE
      // circuit (for time, with a cap) · fatigue test right after · a Cross Ops
      // block. The Cross Ops block is never a second hard block to flag (R-SP-08).
      const kinds = recipe.blocks.map((block) => block.kind);
      const circuitAt = kinds.indexOf('circuit');
      const tests = recipe.blocks.map((block) => (block.spec?.kind === 'skill_test' ? block.spec.moment : null)).filter(Boolean);
      if (kinds.filter((kind) => kind === 'circuit').length !== 1) errors.push(`${label} : un seul circuit (R-SP-15).`);
      if (kinds.includes('storm')) errors.push(`${label} : pas de tempête avec le circuit (R-SP-15).`);
      if (recipe.noGapTests) {
        // CHANGE_REQUEST_013 v7 — week 8 only (the athlete's decision): no
        // fresh test, no fatigue test, a Cross Ops block after the circuit.
        if (weekNumber !== 8) errors.push(`${label} : un enchaînement sans test, en semaine 8 seulement (R-SP-15).`);
        if (tests.length > 0) errors.push(`${label} : pas de test à froid ni de test fatigué cette semaine (WEEK_8_FINAL).`);
        if (!kinds.slice(circuitAt + 1).includes('cardio')) errors.push(`${label} : un bloc Cross Ops après le circuit (R-SP-15).`);
      } else {
        if (tests.join() !== 'fresh,tired1' || kinds[circuitAt - 1] !== 'skill_test' || kinds[circuitAt + 1] !== 'skill_test') {
          errors.push(`${label} : test à froid → circuit → test fatigué dans les 30 s (R-SP-15).`);
        }
        if (!kinds.slice(circuitAt + 2).includes('cardio')) errors.push(`${label} : un bloc Cross Ops après le test fatigué (R-SP-15).`);
      }
      for (const block of recipe.blocks) {
        const spec = block.spec;
        if (spec?.kind === 'circuit' && (spec.capMin < 8 || spec.capMin > 10)) errors.push(`${label} : le circuit dure 8 à 10 min (R-SP-15).`);
        // CHANGE_REQUEST_013 v7 — the two score shapes of a circuit.
        if (spec?.kind === 'circuit') {
          const measures = spec.drills.map((item) => item.measure).filter((measure) => measure !== 'backup').join();
          const expected = spec.score === 'laps_and_station' ? 'laps,station_reached' : 'time_s,station_at_cap';
          if (measures !== expected) errors.push(`${label} : le circuit se note ${spec.score === 'laps_and_station' ? 'tours ET station' : 'temps OU station'} (section C).`);
          if ((spec.score === 'laps_and_station') !== (spec.laps === null)) errors.push(`${label} : un circuit en max de tours n’a pas de nombre de tours fixé.`);
        }
        if (spec?.kind === 'skill_test' && !spec.drills.some((item) => item.drillId.endsWith(':bench_ball'))) {
          errors.push(`${label} : le test porte le banc avec balle (R-SP-15).`);
        }
      }
    } else if (session.kind === 'enchainement') {
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
