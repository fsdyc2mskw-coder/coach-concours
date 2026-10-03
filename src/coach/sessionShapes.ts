// CHANGE_REQUEST_013 — the two named session shapes as app data, and the
// readers the rules in `planner.ts` check them through.
//
// CHANGE_REQUEST_013 v2 — the season table. `SEASON_PLAN` is a typed
// transcription of `rules/season_plan.md` v2 (THE TABLE, 23 September 2026),
// and replaces `SKILL_FOCUS_BY_WEEK`, `WEEK3_CARDIO_MIN`,
// `CARDIO_MIN_FROM_WEEK_4` and `cardioDurationForWeek`. Every number a week
// needs is read from it (R-SP-01); nothing is invented when a cell is empty.
//
// The block content is data, written once and reused (R-SP-05):
//   SKILL_BLOCKS[station]  8 = week 3's locked skill block, 11 = the week 4
//                          racket block (handoffs/WEEK_4_PLAN_2026-09-28.md)
//   CHAIN_BLOCKS[kind]     locked = week 3, chain_A = the week 4 chain
//   TAILS[skill]           racket = week 3's tails, balance = S09_balance_ladder
//   CARDIO_BY_WEEK[week]   3 = locked, 4 = the two week 4 blocks
// Anything not written yet is a placeholder (R-SP-03): a named gap, never a
// copy of another week.
//
// Week 3 is the two locked Drive sessions of 22 September 2026
// (`03_Weekly_plans/WEEK_3_SKILL_SESSION_2026-09-22.md` and
// `WEEK_3_CHAIN_SESSION_2026-09-22.md`), transcribed block for block into
// French, the app's own language. It must not change (R-WS-15): every string
// the week 3 sessions render is the same as before v2.
import { cardRef } from '../data/exerciseCards';
import {
  MEMORY_CARD_HOME,
  MEMORY_CARD_LABEL,
  MEMORY_GAME_FROM_WEEK,
  memoryBlockMinutes,
  memoryCardDrill,
  memoryCardFor,
  memoryCycleOf
} from './memoryCycle';
import type {
  BlockKind,
  CardRef,
  CardioBlock,
  CardioFormat,
  ChainBlock,
  DrillRef,
  ExerciseBlock,
  FreshReferenceSpec,
  MemoryBlockSpec,
  MemoryModule,
  MemoryPrompt,
  PowerEmomSpec,
  SessionRecipe,
  SessionShape,
  SkillBlock,
  TailB,
  TailMinute
} from './types';

// ---------- A. the season table ----------

// CHANGE_REQUEST_013 v3 — `season_plan.md` v3 (2 October 2026): `W8_WORST`
// is gone (weeks 9 and 10 are the racket, decided 24 September), week 8 shows
// both options until the athlete confirms one (R-SP-02), the travel chain T
// and the ghost from week 9.
export type FocusStation = 1 | 8 | 10 | 11 | 'SLALOM_OR_RACKET' | 'LIGHT';
export type ChainKind = 'locked' | 'chain_A' | 'chain_B' | 'travel_T' | 'ghost' | 'ghost_walk';
export type TailSkill = 'racket' | 'balance' | 'none';
export type Phase = 'combine' | 'trail' | 'reset' | 'travel' | 'peak' | 'taper';

export interface SeasonWeek {
  week: number;              // 3..11
  phase: Phase;
  load: 1 | 2 | 3 | 4 | 5;   // the week bar
  focus: FocusStation;
  cardioMin: number;         // R-WS-32
  powerJumps: 0 | 3 | 5;     // R-WS-41, S00_broad_jumps
  memory: 'LOCKED' | 'M1' | 'M2' | 'M3' | 'M4';
  chain: ChainKind;
  ghostStations?: [number, number];
  tails: TailSkill;
  runKm: [number, number] | 'RACE' | null;
  runDay: 'SAT' | 'SUN';     // the weekend run's day
  hillSprints: 0 | 6;
  hillSprintsDay: 'TUE' | 'SAT' | null;
  crossfitPlus: string | null; // ISO date of the extra Saturday class (R-SP-07)
  travel: boolean;           // W7-W8: no Monday CrossFit, treadmill intervals
  baseline: boolean;         // only week 3 (CR-017)
  buildWeek: boolean;        // R-SP-04
}

export const SEASON_PLAN: Readonly<Record<number, SeasonWeek>> = {
  3: { week: 3, phase: 'combine', load: 3, focus: 8, cardioMin: 10, powerJumps: 0, memory: 'LOCKED', chain: 'locked', tails: 'racket', runKm: [8, 9], runDay: 'SUN', hillSprints: 0, hillSprintsDay: null, crossfitPlus: null, travel: false, baseline: true, buildWeek: false },
  4: { week: 4, phase: 'combine', load: 4, focus: 11, cardioMin: 12, powerJumps: 3, memory: 'M1', chain: 'chain_A', tails: 'balance', runKm: [10, 11], runDay: 'SAT', hillSprints: 0, hillSprintsDay: null, crossfitPlus: null, travel: false, baseline: false, buildWeek: true },
  5: { week: 5, phase: 'trail', load: 2, focus: 10, cardioMin: 10, powerJumps: 3, memory: 'M2', chain: 'chain_B', tails: 'balance', runKm: 'RACE', runDay: 'SUN', hillSprints: 0, hillSprintsDay: null, crossfitPlus: null, travel: false, baseline: false, buildWeek: false },
  6: { week: 6, phase: 'reset', load: 3, focus: 8, cardioMin: 12, powerJumps: 3, memory: 'M2', chain: 'chain_B', tails: 'balance', runKm: [7, 7], runDay: 'SUN', hillSprints: 0, hillSprintsDay: null, crossfitPlus: '2026-10-17', travel: false, baseline: false, buildWeek: true },
  7: { week: 7, phase: 'travel', load: 3, focus: 10, cardioMin: 13, powerJumps: 5, memory: 'M3', chain: 'travel_T', tails: 'racket', runKm: [7, 8], runDay: 'SAT', hillSprints: 0, hillSprintsDay: null, crossfitPlus: null, travel: true, baseline: false, buildWeek: true },
  8: { week: 8, phase: 'travel', load: 4, focus: 'SLALOM_OR_RACKET', cardioMin: 15, powerJumps: 5, memory: 'M3', chain: 'travel_T', tails: 'racket', runKm: [7, 8], runDay: 'SAT', hillSprints: 0, hillSprintsDay: null, crossfitPlus: null, travel: true, baseline: false, buildWeek: true },
  9: { week: 9, phase: 'peak', load: 5, focus: 11, cardioMin: 15, powerJumps: 5, memory: 'M4', chain: 'ghost', ghostStations: [1, 11], tails: 'balance', runKm: [7, 8], runDay: 'SUN', hillSprints: 6, hillSprintsDay: 'TUE', crossfitPlus: '2026-11-07', travel: false, baseline: false, buildWeek: true },
  10: { week: 10, phase: 'peak', load: 3, focus: 11, cardioMin: 12, powerJumps: 5, memory: 'M4', chain: 'ghost', ghostStations: [1, 11], tails: 'balance', runKm: [7, 7], runDay: 'SAT', hillSprints: 6, hillSprintsDay: 'SAT', crossfitPlus: null, travel: false, baseline: false, buildWeek: false },
  11: { week: 11, phase: 'taper', load: 1, focus: 'LIGHT', cardioMin: 6, powerJumps: 0, memory: 'M4', chain: 'ghost_walk', tails: 'none', runKm: null, runDay: 'SAT', hillSprints: 0, hillSprintsDay: null, crossfitPlus: null, travel: false, baseline: false, buildWeek: false }
};

// The week from which the chain session is the ENGINE chain (weekly_shape.md
// v7, "lock week 5"). Weeks 3 and 4 keep their own chain session, untouched.
export const ENGINE_CHAIN_FROM_WEEK = 5;

// R-WS-30: FOUR atoms at most in one cardio block (DECISIONS_APP_REPORT_013v3,
// answer 5, 2 October: the rule of three is withdrawn, and with it the
// week 5 exception list).
export const MAX_CARDIO_ATOMS = 4;

/** The table row of a week, or null for weeks 1 and 2, which the table does not cover. */
export function seasonWeek(weekNumber: number): SeasonWeek | null {
  return SEASON_PLAN[weekNumber] ?? null;
}

/**
 * The week's skill station as a number, or null when the table does not name
 * one yet ('SLALOM_OR_RACKET', confirmed by the athlete at the week 8 build,
 * R-SP-02) or names none ('LIGHT', the taper).
 */
export function focusStationOf(weekNumber: number): number | null {
  const focus = seasonWeek(weekNumber)?.focus;
  return typeof focus === 'number' ? focus : null;
}

// ---------- D. placeholders (R-SP-03) ----------

export const PLACEHOLDER_LINE = 'À construire dans Cowork.';

/**
 * A named gap: the right `kind`, no drills, no score boxes, the label in the
 * title and the one line "À construire dans Cowork". It never copies content
 * from another week, and it counts as the block for the validators (R-SP-06).
 */
export function placeholderBlock(kind: BlockKind, label: string, minutes?: number, stationMappings: number[] = []): ExerciseBlock {
  return {
    title: minutes ? `${label} — ${minutes} min` : label,
    short: label,
    kind,
    placeholder: true,
    faire: PLACEHOLDER_LINE,
    stationMappings
  };
}

export function isPlaceholder(block: ExerciseBlock): boolean {
  return block.placeholder === true;
}

// ---------- B. content as data ----------

const FRESH_REFERENCE_BLOCK_ID = 'chain-fresh-reference';

function drill(cardId: string, drillId: string, measure: DrillRef['measure'], scoreLabel: string): DrillRef {
  return { ...cardRef(cardId), drillId, measure, scoreLabel };
}

interface SkillBlockContent {
  title: string;
  short: string;
  drills: DrillRef[];
  durationMin: number;
  faire: string;
  regle?: string;
  details?: string;
  noter: string;
  equipment: string[];
}

// CHANGE_REQUEST_013 v3 — Q8: the racket block scores ONE ROW PER SET, the
// obstacle drops flat 1 · obstacles · flat 2 for set 1 and again for set 2.
// Week 4 is past and locked (its plan wins for week 4, which must not
// change): it keeps the three boxes it was trained with.
const WEEK4_RACKET_DRILLS: DrillRef[] = [
  drill('S11_racket_on_board', 'skill:S11_racket_on_board:drops', 'drops', 'Chutes par 30 s — raquette sur la planche'),
  drill('S11_racket_on_board', 'skill:S11_racket_on_board:touchdowns', 'touchdowns', 'Touchers de la planche — raquette sur la planche'),
  drill('S11_racket_obstacles', 'skill:S11_racket_obstacles:flat_1', 'drops', 'Chutes — obstacles, à plat 1'),
  drill('S11_racket_obstacles', 'skill:S11_racket_obstacles:obstacles', 'drops', 'Chutes — obstacles, sur les obstacles'),
  drill('S11_racket_obstacles', 'skill:S11_racket_obstacles:flat_2', 'drops', 'Chutes — obstacles, à plat 2')
];
const WEEK4_RACKET_NOTER = 'Planche : chutes par 30 s et touchers de la planche. Obstacles : chutes à plat 1, sur les obstacles, à plat 2.';

function racketSetDrills(set: 1 | 2): DrillRef[] {
  return [
    drill('S11_racket_obstacles', `skill:S11_racket_obstacles:set${set}:flat_1`, 'drops', `Chutes — obstacles, série ${set}, à plat 1`),
    drill('S11_racket_obstacles', `skill:S11_racket_obstacles:set${set}:obstacles`, 'drops', `Chutes — obstacles, série ${set}, sur les obstacles`),
    drill('S11_racket_obstacles', `skill:S11_racket_obstacles:set${set}:flat_2`, 'drops', `Chutes — obstacles, série ${set}, à plat 2`)
  ];
}

// The week 5 skipping block (WEEK_5_FINAL_2026-10-05.md, Wed 7 Oct, block 3),
// card S10_block_switch_fresh v3. Part A scores one box per round, part B one
// box per card.
const SKIPPING_ROUNDS_A = [1, 2, 3, 4, 5, 6] as const;
const SKIPPING_CARDS_B = [1, 2, 3, 4] as const;

// R-SP-05: one entry per station, reused every week that station is the
// focus. 1 arrives later as a data-only version of this request; 10 is the
// week 5 block, reused unchanged in week 7.
export const SKILL_BLOCKS: Readonly<Record<number, SkillBlockContent>> = {
  8: {
    title: 'Cerceaux et ballon — 18 min', short: 'poste 8',
    drills: [
      drill('S08_hand_then_chain', 'skill:S08_hand_then_chain', 'balls_lost', 'Balles perdues — main gauche seule'),
      drill('S08_chain_out', 'skill:S08_chain_out', 'foot_errors', 'Erreurs de pied par passage — 5 cerceaux')
    ],
    durationMin: 18,
    faire: 'Main gauche seule, 8 min : 10 m aller-retour en dribblant de la main gauche uniquement, 6 longueurs normales puis 2 longueurs basses, regard devant, jamais sur le ballon. Marcher 1 min. Puis 5 cerceaux, ballon tenu dans les bras, 9 min : jaune les deux pieds, bleu le pied droit, rouge le pied gauche, 4 passages, 30 à 60 s entre les passages, regard sur le PROCHAIN cerceau.',
    details: 'Passer à 7 cerceaux après 2 passages propres.',
    noter: 'Balles perdues sur le premier exercice ; erreurs de pied par passage sur le second.',
    equipment: ['Ballon de basket', 'cerceaux']
  },
  10: {
    title: 'Corde à sauter — 18 min', short: 'poste 10',
    drills: [
      ...SKIPPING_ROUNDS_A.map((round) => drill('S10_block_switch_fresh', `skill:S10_block_switch_fresh:a${round}`, 'restarts',
        `Reprises — partie A, tour ${round}${round === 6 ? ' (variante pièce)' : ''}`)),
      ...SKIPPING_CARDS_B.map((card) => drill('S10_block_switch_fresh', `skill:S10_block_switch_fresh:b${card}`, 'restarts', `Reprises — partie B, carte ${card}`))
    ],
    durationMin: 18,
    faire: 'Carte à hauteur des yeux : 5 DROIT · 5 GAUCHE · 10 JOINTS. Partie A : 6 × 45 s, 30 à 45 s de repos ; tour 6 = variante pièce (gauche d’abord). Partie B : 4 cartes seules, 1 min de repos, UN essai chacune.',
    regle: 'Stop : deux reprises au même changement → régresser comme le dit la carte.',
    details: 'Lire la carte à voix haute avant chaque tour. Une erreur : rester immobile 2 s, respirer, reprendre le bloc en cours, pas toute la carte.',
    noter: 'Reprises par tour (partie A) · par carte (partie B) · où était l’erreur.',
    equipment: ['Corde à sauter', 'la carte sur papier, à hauteur des yeux', 'une pièce']
  },
  11: {
    title: 'Raquette — 18 min', short: 'poste 11',
    drills: [
      drill('S11_racket_on_board', 'skill:S11_racket_on_board:drops', 'drops', 'Chutes par 30 s — raquette sur la planche'),
      drill('S11_racket_on_board', 'skill:S11_racket_on_board:touchdowns', 'touchdowns', 'Touchers de la planche — raquette sur la planche'),
      ...racketSetDrills(1),
      ...racketSetDrills(2)
    ],
    durationMin: 18,
    faire: 'Raquette sur la planche d’équilibre, 7 min : mise en place, main au mur → raquette sans balle → balle sur la raquette, main lâche le mur ; puis 3 × 30 s, 30 s de repos. Marcher 1 min. Puis raquette par-dessus les obstacles, 10 min : 45 s à plat · 10 s · 30 s d’obstacles · 10 s · 45 s à plat, 2 séries, 90 s de repos.',
    details: 'Regard : les yeux sur la balle, chaque obstacle regardé UNE fois.',
    noter: 'Planche : chutes par 30 s et touchers de la planche. Obstacles, une ligne par série : chutes à plat 1, sur les obstacles, à plat 2.',
    equipment: ['Raquette et balle', 'planche d’équilibre', '3 obstacles de 15 à 20 cm']
  }
};

interface TailContent {
  freshReference: { drills: DrillRef[]; faire: string; noter: string };
  tailA: { drill: DrillRef; seconds: number; faire: string; noter: string };
  tailB: { minutes: TailMinute[]; stopRule: string; faire: string; noter: string };
  stationId: number;
  equipment: string[];
}

export const TAILS: Readonly<Record<Exclude<TailSkill, 'none'>, TailContent>> = {
  racket: {
    stationId: 11,
    freshReference: {
      drills: [
        drill('S11_racket_on_board', 'fresh:S11_racket_on_board', 'drops', 'Chutes — planche, à froid'),
        drill('S11_racket_obstacles', 'fresh:S11_racket_obstacles', 'drops', 'Chutes — obstacles, à froid')
      ],
      faire: '1 min de raquette et balle sur la planche d’équilibre. 1 min de raquette par-dessus les 3 obstacles.',
      noter: 'Chutes sur chacun. C’est le nombre auquel la tail B est comparée, pris le même jour pour que la comparaison soit réelle.'
    },
    tailA: {
      drill: drill('S11_racket_on_board', 'tail_a:S11_racket_on_board', 'drops', 'Chutes sur la planche — tail A'),
      seconds: 30,
      faire: 'TAIL A : raquette et balle sur la planche d’équilibre, 30 s.',
      noter: 'chutes sur la planche'
    },
    tailB: {
      minutes: [
        { minute: 1, drill: drill('S11_racket_on_board', 'tail_b:1', 'drops', 'Chutes — min 1, planche, pieds écartés'), label: 'planche, pieds écartés' },
        { minute: 2, drill: drill('S11_racket_obstacles', 'tail_b:2', 'drops', 'Chutes — min 2, obstacles'), label: 'raquette par-dessus les 3 obstacles' },
        { minute: 3, drill: drill('S11_racket_on_board', 'tail_b:3', 'drops', 'Chutes — min 3, planche, pieds serrés'), label: 'planche, pieds plus serrés' },
        { minute: 4, drill: drill('S11_racket_obstacles', 'tail_b:4', 'drops', 'Chutes — min 4, obstacles'), label: 'raquette par-dessus les 3 obstacles' }
      ],
      stopRule: 'STOP si la prise s’ouvre. Deux minutes comptent quand même.',
      faire: '4 × 1 min, 20 s entre les minutes. Min 1 : planche, pieds écartés. Min 2 : raquette par-dessus les 3 obstacles. Min 3 : planche, pieds plus serrés. Min 4 : raquette par-dessus les 3 obstacles.',
      noter: 'Chutes par minute, face à la référence fraîche du début de séance.'
    },
    equipment: ['planche d’équilibre', 'raquette et balle', '3 obstacles de 15 à 20 cm']
  },
  // S09_balance_ladder, locked 23 September: fresh reference = its min 2 and
  // min 4; tail A = its min 3, 30 s, switch leg each round; tail B = its four
  // minutes, 20 s between. One number per minute, "touchdowns + drops".
  balance: {
    stationId: 9,
    freshReference: {
      drills: [
        drill('S09_balance_ladder', 'fresh:S09_balance_ladder:min2', 'balance_faults', 'Touchers + chutes — une jambe, yeux fermés, à froid'),
        drill('S09_balance_ladder', 'fresh:S09_balance_ladder:min4', 'balance_faults', 'Touchers + chutes — planche, deux pieds, à froid')
      ],
      faire: '1 min : une jambe, yeux fermés, près d’un mur (30 s chaque jambe). 1 min : deux pieds sur la planche d’équilibre, ballon autour de la taille.',
      noter: 'Touchers + chutes de balle sur chacune. C’est le nombre auquel la tail B est comparée, pris le même jour pour que la comparaison soit réelle.'
    },
    tailA: {
      drill: drill('S09_balance_ladder', 'tail_a:S09_balance_ladder', 'touchdowns', 'Touchers — tail A'),
      seconds: 30,
      faire: 'TAIL A : une jambe, ballon autour de la taille, 30 s (changer de jambe à chaque tour).',
      noter: 'touchers en tail A'
    },
    tailB: {
      minutes: [
        { minute: 1, drill: drill('S09_balance_ladder', 'tail_b:1', 'balance_faults', 'Touchers + chutes — min 1, une jambe, yeux ouverts'), label: 'une jambe, yeux ouverts' },
        { minute: 2, drill: drill('S09_balance_ladder', 'tail_b:2', 'balance_faults', 'Touchers + chutes — min 2, une jambe, yeux fermés'), label: 'une jambe, yeux fermés, près d’un mur' },
        { minute: 3, drill: drill('S09_balance_ladder', 'tail_b:3', 'balance_faults', 'Touchers + chutes — min 3, une jambe, ballon'), label: 'une jambe, ballon autour de la taille' },
        { minute: 4, drill: drill('S09_balance_ladder', 'tail_b:4', 'balance_faults', 'Touchers + chutes — min 4, planche, ballon'), label: 'deux pieds sur la planche d’équilibre, ballon autour de la taille' }
      ],
      stopRule: 'STOP si vertige ou 3 touchers dans une minute. Une tail raccourcie compte quand même.',
      faire: '4 × 1 min, 20 s entre les minutes. Min 1 : une jambe, yeux ouverts. Min 2 : une jambe, yeux fermés, près d’un mur. Min 3 : une jambe, ballon autour de la taille. Min 4 : deux pieds sur la planche d’équilibre, ballon autour de la taille.',
      noter: 'Touchers + chutes de balle par minute, face à la référence fraîche du début de séance.'
    },
    equipment: ['Ballon de basket', 'planche d’équilibre', 'un mur']
  }
};

interface ChainBlockContent {
  rounds: number;
  stations: number[];
  transitionNote: string;
  roundScores: DrillRef[];
  restS: number;
  durationMin: number;
  title: string;
  faire: string;           // the rounds; tail A's own line is appended from TAILS (weeks 3-4)
  noter: string;           // the round scores; tail A's own score is appended from TAILS (weeks 3-4)
  equipment: string[];
  intensity: ChainBlock['intensity'];
}

export const CHAIN_BLOCKS: Readonly<Partial<Record<ChainKind, ChainBlockContent>>> = {
  locked: {
    rounds: 3, stations: [1, 3], restS: 90, durationMin: 12,
    title: 'Enchaînement, modéré — 12 min',
    transitionNote: 'La marche entre le slalom et les espaliers : épaules basses, respirer, arriver prête. C’EST cette partie qui est entraînée.',
    roundScores: [
      drill('S01_slalom_18m', 'chain:round_time', 'round_time_s', 'Temps par tour (s)'),
      drill('S01_slalom_18m', 'chain:cones_touched', 'cones_touched', 'Cônes touchés')
    ],
    faire: '3 tours, 90 s de récupération entre les tours. Slalom 18 m, aller tout droit, slalom au retour. Puis la marche jusqu’aux espaliers. Puis espaliers, 3 passages, monter et sauter.',
    noter: 'Temps par tour · cônes touchés',
    equipment: ['Cônes', 'échelle extérieure'],
    intensity: 'moderate'
  },
  // Season plan note (a): slalom → wall bars → hoops (5, ball in the arms).
  chain_A: {
    rounds: 3, stations: [1, 3, 8], restS: 90, durationMin: 12,
    title: 'Enchaînement A, modéré — 12 min',
    transitionNote: 'Les marches SONT l’entraînement : épaules basses, respirer, arriver prête.',
    roundScores: [
      drill('S01_slalom_18m', 'chain:round_time', 'round_time_s', 'Temps par tour (s)'),
      drill('S01_slalom_18m', 'chain:cones_touched', 'cones_touched', 'Cônes touchés'),
      drill('S08_chain_out', 'chain:hoop_foot_errors', 'foot_errors', 'Erreurs de pied aux cerceaux')
    ],
    faire: '3 tours, 90 s de récupération entre les tours. Slalom 18 m. Marcher. Espaliers, 3 passages. Marcher. 5 cerceaux, ballon dans les bras, un passage.',
    noter: 'Temps par tour · cônes touchés · erreurs de pied aux cerceaux',
    equipment: ['Cônes', 'échelle extérieure', 'cerceaux', 'Ballon de basket'],
    intensity: 'moderate'
  },
  // CHANGE_REQUEST_013 v3 — chain B, the finish of the test (WEEK_5_FINAL,
  // Thu 8 Oct, block 5). Hard, no tail A (engine chain, R-WS-34). Week 6
  // reuses it unchanged until a week 6 data drop.
  chain_B: {
    rounds: 4, stations: [1, 10, 11], restS: 60, durationMin: 11,
    title: 'Enchaînement B, la fin du test — 11 min',
    transitionNote: 'Les 5 m de footing entre les postes font partie du tour : arriver prête au poste suivant.',
    roundScores: [
      drill('S01_slalom_18m', 'chain:round_time', 'round_time_s', 'Temps par tour (s)'),
      drill('S10_block_switch_fresh', 'chain:rope_restarts', 'restarts', 'Reprises de corde'),
      drill('S11_racket_obstacles', 'chain:racket_drops', 'drops', 'Chutes de raquette'),
      drill('S01_slalom_18m', 'chain:cones_touched', 'cones_touched', 'Cônes touchés')
    ],
    faire: '4 tours, 60 s de repos, aussi vite que propre : slalom 18 m aller-retour → 5 m de footing → UNE carte corde (5 D · 5 G · 10 J) → 5 m de footing → raquette au-dessus des 3 obstacles, un passage.',
    noter: 'Temps par tour · reprises de corde · chutes de raquette · cônes touchés',
    equipment: ['Cônes', 'corde à sauter', 'raquette et balle', '3 obstacles de 15 à 20 cm'],
    intensity: 'hard'
  }
};

// CHANGE_REQUEST_013 v3 — the POWER EMOM of the engine chain session, one
// entry per week that has it written (R-SP-03: a later week without an entry
// shows a named gap, never this week's content).
interface PowerEmomContent { atoms: string[]; durationMin: number; faire: string; noter: string; drills: DrillRef[]; stations: number[] }

export const POWER_EMOM_BY_WEEK: Readonly<Record<number, PowerEmomContent>> = {
  5: {
    atoms: ['S00_broad_jumps', 'S01_slalom_18m', 'S00_jump_squats'],
    durationMin: 6,
    faire: 'EMOM 6. Minutes impaires : 2 sauts en longueur + slalom 18 m aller simple, pleine vitesse, retour en marchant. Minutes paires : 6 jump squats.',
    noter: 'Meilleur saut du bloc (mètre ruban), et l’effort.',
    drills: [{ ...cardRef('S00_broad_jumps'), drillId: 'power:best_jump', measure: 'best_jump_cm', scoreLabel: 'Meilleur saut du bloc (cm)' }],
    stations: [1]
  }
};

// The placeholder label of a chain kind with no content yet (R-SP-03,
// R-WS-42: the ghost circuit is shown as "Circuit fantôme : à venir").
function chainPlaceholderLabel(season: SeasonWeek): string {
  if (season.chain === 'chain_B') return 'Enchaînement B';
  if (season.chain === 'travel_T') return 'Enchaînement voyage : à construire';
  const stations = season.ghostStations ? `, postes ${season.ghostStations[0]} à ${season.ghostStations[1]}` : '';
  return `Circuit fantôme : à venir${stations}`;
}

interface CardioAtom { cardId: string; text: string }
interface CardioContent {
  format: CardioFormat;
  atoms: CardioAtom[];
  equipment: string[];
  // CHANGE_REQUEST_013 v3 — a week written block for block (week 5) carries
  // its own words; the generic text is kept for reused entries.
  title?: string;
  faire?: string;
  regle?: string;
  noter?: string;
  valueLabel?: string;
  finisher?: CardioAtom;
}
interface CardioWeek { skill: CardioContent; chain: CardioContent }

export const CARDIO_BY_WEEK: Readonly<Record<number, CardioWeek>> = {
  3: {
    skill: {
      format: 'amrap',
      atoms: [
        { cardId: 'S01_slalom_18m', text: 'slalom 18 m, un aller-retour' },
        { cardId: 'S03_ladder_climb_jump_finish', text: 'espaliers, 3 passages, monter et sauter' },
        { cardId: 'S00_half_burpees', text: '8 demi-burpees' }
      ],
      equipment: ['cônes', 'échelle extérieure', 'sol plat']
    },
    chain: {
      format: 'emom',
      atoms: [
        { cardId: 'S01_carioca_footwork', text: 'carioca, 18 m aller-retour' },
        { cardId: 'S00_jump_squats', text: '10 jump squats' },
        { cardId: 'S00_high_knees', text: '40 appuis en montées de genoux' }
      ],
      equipment: []
    }
  },
  4: {
    skill: {
      format: 'amrap',
      atoms: [
        { cardId: 'S01_slalom_18m', text: 'slalom 18 m, un aller-retour' },
        { cardId: 'S03_ladder_climb_jump_finish', text: 'espaliers, 3 passages, monter et sauter' },
        { cardId: 'S10_block_switch_fresh', text: 'corde : 10 pieds joints · 5 pied droit · 5 pied gauche (une faute = on recommence le bloc)' }
      ],
      equipment: ['cônes', 'échelle extérieure', 'corde à sauter']
    },
    chain: {
      format: 'emom',
      atoms: [
        { cardId: 'S01_carioca_footwork', text: 'carioca, 18 m aller-retour' },
        { cardId: 'S10_block_switch_fresh', text: 'corde : 10 pieds joints · 5 pied droit · 5 pied gauche' },
        { cardId: 'S00_half_burpees', text: '8 demi-burpees' }
      ],
      equipment: ['corde à sauter']
    }
  },
  // CHANGE_REQUEST_013 v3 — WEEK_5_FINAL_2026-10-05.md. The skill session's
  // "Quatre coins" has four atoms (R-WS-30 allows four since answer 5 of
  // 2 October); its one-minute finisher is not an atom. The engine chain's
  // "La montée" has no jump on purpose (race in 72 h).
  5: {
    skill: {
      format: 'amrap',
      title: 'Cardio, « Quatre coins » 30/15 — 10 min',
      atoms: [
        { cardId: 'S08_chain_out', text: 'cerceaux, ligne de 5 cerceaux, pieds selon la couleur, aller et retour sans arrêt (ballon dans les bras si c’est propre, sinon les pieds seulement)' },
        { cardId: 'S03_ladder_one_hand_object', text: 'espaliers, montée à UNE main, ballon dans l’autre' },
        { cardId: 'S00_jumping_jacks', text: 'jumping jacks, 30 s' },
        { cardId: 'S00_air_squats', text: '25 air squats (le coin se termine quand les 25 sont faits ou quand les 30 s sont finies)' }
      ],
      finisher: { cardId: 'S00_high_knees', text: 'montées de genoux, 1 min sans arrêt' },
      faire: '4 postes, 30 s de travail, 15 s pour passer au suivant, 3 tours (9 min) + 1 min de finisher. A : cerceaux, ligne de 5 cerceaux, pieds selon la couleur, aller et retour sans arrêt (ballon dans les bras si c’est propre, sinon les pieds seulement). B : espaliers, montée à UNE main, ballon dans l’autre. C : jumping jacks, 30 s. D : 25 air squats (le coin se termine quand les 25 sont faits ou quand les 30 s sont finies). Finisher (minute 10) : montées de genoux, 1 min sans arrêt.',
      noter: 'Aucune cible. Noter : jumping jacks par tour, squats faits par tour, erreurs aux cerceaux (dans « Ce que tu as fait »), et le score d’effort.',
      valueLabel: 'Tours faits (sur 3)',
      equipment: ['cerceaux', 'Ballon de basket', 'échelle extérieure']
    },
    chain: {
      format: 'amrap',
      title: 'Cardio, « La montée », croissant — 10 min',
      atoms: [
        { cardId: 'S03_ladder_climb_jump_finish', text: '1 passage aux espaliers (monter, sauter les 3 derniers barreaux)' },
        { cardId: 'S00_air_squats', text: 'air squats 4 · 8 · 12 · 16 · 20… (+4)' },
        { cardId: 'S00_high_knees', text: 'montées de genoux 20 · 30 · 40 · 50 · 60… (+10)' }
      ],
      faire: 'À la limite. Chaque tour grandit ; continuer jusqu’à la fin des 10 min. Chaque tour : 1 passage aux espaliers (monter, sauter les 3 derniers barreaux) + air squats 4 · 8 · 12 · 16 · 20… (+4) + montées de genoux 20 · 30 · 40 · 50 · 60… (+10).',
      regle: 'Repos courts mais jamais nuls. Douleur à la poitrine ou vertige : arrêter le bloc, marcher, la séance compte quand même. « La montée » n’a AUCUN saut, exprès (course dans 72 h).',
      noter: 'Aucune cible. Noter : le dernier tour terminé + les répétitions faites dans le suivant (dans « Ce que tu as fait »), et le score d’effort.',
      valueLabel: 'Dernier tour terminé',
      equipment: ['échelle extérieure']
    }
  }
};

export const ATOMS_TO_REPLACE = 'atomes à remplacer';

// CHANGE_REQUEST_013 v3 — in the travel weeks the hotel gym has no ladder
// (season_plan.md v3, "Travel weeks"): a reused atom on the wall bars
// (station 3) is removed, and the session text never names them. The hoops
// travel with the athlete (answer 4 of 2 October): their atoms stay, and so
// do they in the equipment lists.
const TRAVEL_MISSING_STATIONS: readonly number[] = [3];
const TRAVEL_MISSING_EQUIPMENT = /échelle|espalier/i;

export type RemovalReason = 'focus' | 'travel';
export interface RemovedAtom { atom: CardRef; reason: RemovalReason }

/**
 * The cardio content of a week and shape. A week with no entry reuses the
 * latest earlier entry (decision 9: a safety net only, cardio is written
 * fresh at each week build) and removes, listing each as "atome à
 * remplacer":
 *   - every atom of the week's focus station (R-WS-29),
 *   - in a travel week, every atom on the wall bars.
 * A reused entry keeps its four atoms otherwise (answer 5 of 2 October).
 * The gap reads "atomes à remplacer" instead of being silently filled
 * (R-SP-03).
 */
export function cardioContentFor(weekNumber: number, shape: 'skill' | 'chain'): { content: CardioContent; removed: CardRef[]; removals: RemovedAtom[]; reused: boolean } {
  let source = weekNumber;
  while (source >= 3 && !CARDIO_BY_WEEK[source]) source -= 1;
  const content = CARDIO_BY_WEEK[Math.max(source, 3)]![shape];
  if (source === weekNumber) return { content, removed: [], removals: [], reused: false };
  const focus = focusStationOf(weekNumber);
  const travel = seasonWeek(weekNumber)?.travel === true;
  const removals: RemovedAtom[] = [];
  for (const item of content.atoms) {
    const atom = cardRef(item.cardId);
    if (atom.stationId === focus) removals.push({ atom, reason: 'focus' });
    else if (travel && TRAVEL_MISSING_STATIONS.includes(atom.stationId)) removals.push({ atom, reason: 'travel' });
  }
  return { content, removed: removals.map((item) => item.atom), removals, reused: true };
}

function cardioEquipment(weekNumber: number, shape: 'skill' | 'chain'): string[] {
  const { content } = cardioContentFor(weekNumber, shape);
  return seasonWeek(weekNumber)?.travel ? content.equipment.filter((item) => !TRAVEL_MISSING_EQUIPMENT.test(item)) : content.equipment;
}

function removalText(removals: RemovedAtom[]): string {
  const named = removals.filter((item) => item.reason === 'focus')
    .map(({ atom }) => `${atom.label} (poste ${atom.stationId}, travaillé en compétence cette semaine)`);
  const travelCount = removals.filter((item) => item.reason === 'travel').length;
  const travel = travelCount ? [`${travelCount === 1 ? 'un atome' : `${travelCount} atomes`} sans le matériel de l’hôtel`] : [];
  return `${ATOMS_TO_REPLACE.charAt(0).toUpperCase()}${ATOMS_TO_REPLACE.slice(1)} dans Cowork : ${[...named, ...travel].join(', ')}.`;
}

function cardioBlock(weekNumber: number, shape: 'skill' | 'chain', durationMin: number): ExerciseBlock {
  const { content, removals, reused } = cardioContentFor(weekNumber, shape);
  const removedIds = new Set(removals.map((item) => item.atom.cardId));
  const kept = content.atoms.filter((atom) => !removedIds.has(atom.cardId));
  const spec: CardioBlock = {
    kind: 'cardio',
    format: content.format,
    atoms: kept.map((atom) => cardRef(atom.cardId)),
    durationMin,
    target: null,
    ...(removals.length ? { toReplace: removals.map((item) => item.atom) } : {}),
    ...(content.finisher ? { finisher: cardRef(content.finisher.cardId) } : {}),
    ...(content.valueLabel && !reused ? { valueLabel: content.valueLabel } : {})
  };
  const slot = (atom: CardioAtom) => {
    const removal = removals.find((item) => item.atom.cardId === atom.cardId);
    if (!removal) return atom.text;
    return removal.reason === 'travel' ? 'atome à remplacer (matériel absent à l’hôtel)' : `atome à remplacer (${removal.atom.label.toLowerCase()} retiré)`;
  };
  const generatedFaire = content.format === 'emom'
    ? `${content.atoms.map((atom, index) => `Minute ${index + 1} : ${slot(atom)}.`).join(' ')} Puis les ${content.atoms.length === 3 ? 'trois' : content.atoms.length} mêmes à nouveau, jusqu’à la minute ${durationMin}.`
    : `Autant de tours que possible en ${durationMin} minutes : ${kept.map((atom) => atom.text).join(' ; ')}.`;
  const generatedNoter = content.format === 'emom'
    ? `Aucune cible. Noter seulement : les ${durationMin} minutes tenues ou non, et le score d’effort.`
    : 'Aucune cible. Noter seulement : les tours faits, et le score d’effort.';
  const stations = [...new Set(spec.atoms.map((atom) => atom.stationId).filter((station) => station !== 0))];
  const regle = [removals.length ? removalText(removals) : null, !reused ? content.regle ?? null : null].filter((line): line is string => line !== null);
  return {
    title: !reused && content.title ? content.title : `Cardio ${content.format === 'emom' ? 'EMOM' : 'AMRAP'} — ${durationMin} min`, short: 'cardio', kind: 'cardio', spec,
    faire: !reused && content.faire ? content.faire : generatedFaire,
    ...(regle.length ? { regle: regle.join(' ') } : {}),
    noter: !reused && content.noter ? content.noter : generatedNoter,
    stationMappings: stations, approximation: true
  };
}

// ---------- C. the generator ----------

const MEMORY_TEXT: Record<Exclude<MemoryModule, 'M5'>, string> = {
  M1: 'Les 11 postes dans l’ordre, et l’action à chaque poste, à voix haute.',
  M2: 'Pour chaque poste : quand il compte comme réussi, et ce qui le fait échouer.',
  M3: 'Les transitions : où aller ensuite, de quel côté tourner, et l’alternance 5 → 6 → 5 → 6.',
  M4: 'Le circuit entier, yeux fermés, à l’allure du test : action, réussite, transition, poste suivant, sans aide.'
};

// R-MM-04 (v2): the weekly recall check, scored as errors out of 33. Week 4
// only: from week 5 CR-018's game card replaces it (memory_modules.md v3).
export const RECALL_CHECK_DRILL: DrillRef = {
  cardId: 'memory_recall_check', stationId: 0, label: 'Contrôle de rappel',
  drillId: 'memory:recall_errors', measure: 'recall_errors', scoreLabel: 'Erreurs de rappel sur 33'
};

function memoryBlock(module: Exclude<MemoryModule, 'M5'>, minutes: number, withRecallCheck: boolean, text: string = MEMORY_TEXT[module]): ExerciseBlock {
  const spec: MemoryBlockSpec = { kind: 'memory', modules: [module], ...(withRecallCheck ? { drills: [RECALL_CHECK_DRILL] } : {}) };
  return {
    title: `Mémoire, ${module} — ${minutes} min`, short: 'mémoire', kind: 'memory', spec,
    faire: withRecallCheck
      ? `${text} Les 2 dernières minutes : contrôle de rappel, 33 éléments (les 11 postes × ordre, action, réussite), dits à voix haute sans aide, puis vérifiés sur la fiche officielle.`
      : text,
    ...(withRecallCheck ? { noter: 'Erreurs de rappel sur 33 : éléments oubliés ou faux. But : 0.' } : {}),
    stationMappings: []
  };
}

// CHANGE_REQUEST_018 section C — from week 5 the memory block holds ONE game
// card of the 2-week cycle (R-MM-01/R-MM-03), opened with [Jouer] and scored by
// the game itself (R-MM-04). 4 min, or 10 with M4 after the card (R-MM-06).
// The video reminder is not written here: see `withMemoryVideo()`.
function isMemoryGameWeek(weekNumber: number): boolean {
  return weekNumber >= MEMORY_GAME_FROM_WEEK && memoryCycleOf(weekNumber) !== null;
}

function memoryGameBlock(weekNumber: number, shape: SessionShape): ExerciseBlock {
  const cycle = memoryCycleOf(weekNumber)!;
  const card = memoryCardFor(weekNumber, shape)!;
  const spec: MemoryBlockSpec = { kind: 'memory', modules: cycle.m4 ? ['M4'] : [], drills: [memoryCardDrill(card)], game: { card, m4: cycle.m4 } };
  return {
    title: `Mémoire · ${MEMORY_CARD_LABEL[card]} — ${memoryBlockMinutes(cycle.m4)} min`, short: 'mémoire', kind: 'memory', spec,
    faire: `${MEMORY_CARD_HOME[card].title} · ${MEMORY_CARD_HOME[card].line}.`,
    stationMappings: []
  };
}

function memoryPrompt(shape: SessionShape, module: Exclude<MemoryModule, 'M5'>): MemoryPrompt {
  return {
    id: `memory-${shape}-${module}`, module,
    prompt: MEMORY_TEXT[module],
    answer: 'Réciter de mémoire, puis vérifier avec la fiche officielle. Aucune explication n’est demandée, seulement la restitution.'
  };
}

// R-WS-41: the power slot closes both police warm-ups when the table gives
// jumps. The warm-up grows by about 2 min for 3 jumps, about 3 min for 5
// (season_plan.md, the "power" column).
const POWER_SLOT_MIN: Record<SeasonWeek['powerJumps'], number> = { 0: 0, 3: 2, 5: 3 };

export function powerSlotText(jumps: number): string {
  return `puis ${jumps} sauts en longueur, réception tenue, retour en marchant`;
}

function warmupFor(season: SeasonWeek, base: string): { text: string; minutes: number } {
  const minutes = 6 + POWER_SLOT_MIN[season.powerJumps];
  const text = season.powerJumps > 0 ? `${minutes} min : ${base} ; ${powerSlotText(season.powerJumps)}.` : `${minutes} min : ${base}.`;
  return { text, minutes };
}

function minutesOf(text: string | null): number {
  const match = text?.match(/(\d+)\s*min/);
  return match ? Number(match[1]) : 0;
}

function sessionMinutes(warmup: string, blocks: ExerciseBlock[], cooldown: string): number {
  return minutesOf(warmup) + blocks.reduce((total, block) => total + minutesOf(block.title), 0) + minutesOf(cooldown);
}

function unique(values: string[]): string[] {
  const seen = new Set<string>();
  return values.filter((value) => {
    const key = value.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function skillBlockFor(season: SeasonWeek): ExerciseBlock {
  const station = focusStationOf(season.week);
  const content = station !== null ? SKILL_BLOCKS[station] : undefined;
  if (!content) {
    // R-SP-02: week 8 shows both options until the athlete confirms one.
    const label = station !== null ? `Poste ${station}` : season.focus === 'SLALOM_OR_RACKET' ? 'Slalom ou raquette, à confirmer' : 'Poste à confirmer';
    return placeholderBlock('skill_block', label, 18, station !== null ? [station] : []);
  }
  // Week 4 is past and locked: it keeps the three obstacle boxes it was
  // trained with (Q8 applies from the next racket week).
  const week4Racket = season.week === 4 && station === 11;
  const drills = week4Racket ? WEEK4_RACKET_DRILLS : content.drills;
  const spec: SkillBlock = { kind: 'skill_block', stationId: station!, drills, durationMin: content.durationMin };
  return {
    title: content.title, short: content.short, kind: 'skill_block', spec,
    faire: content.faire,
    ...(content.regle ? { regle: content.regle } : {}),
    ...(content.details ? { details: content.details } : {}),
    noter: week4Racket ? WEEK4_RACKET_NOTER : content.noter,
    stationMappings: [station!], approximation: true
  };
}

// ---------- the skill session ----------

const SKILL_PURPOSE = 'Un seul poste, travaillé frais et sans chrono, deux cartes au maximum, chaque exercice noté. Puis un bloc cardio dont le seul rôle est de construire le cardio, sans cible.';
const SKILL_WARMUP_BASE = 'trot facile, chevilles, poignets, épaules';
const COOLDOWN = '5 min : marche facile, respiration qui redescend.';
// WEEK_5_FINAL, Wed 7 Oct, block 5.
const SKILL_COOLDOWN_BY_WEEK: Readonly<Record<number, string>> = { 5: '5 min : retour au calme, mollets et chevilles.' };

function lockedWeek3SkillBlocks(): ExerciseBlock[] {
  const memory: MemoryBlockSpec = { kind: 'memory', modules: ['M1', 'M2'] };
  return [
    {
      title: 'Mémoire — 6 min', short: 'mémoire', kind: 'memory', spec: memory,
      faire: 'Les 11 postes dans l’ordre, à voix haute. Puis la ligne des couleurs des cerceaux : départ vert, puis jaune, bleu, rouge, jaune, rouge, bleu, rouge, jaune, jaune, rouge, bleu.',
      stationMappings: []
    },
    skillBlockFor(SEASON_PLAN[3]!),
    cardioBlock(3, 'skill', SEASON_PLAN[3]!.cardioMin)
  ];
}

export function buildSkillSessionRecipe(weekNumber: number): SessionRecipe {
  const season = seasonWeek(weekNumber) ?? SEASON_PLAN[3]!;
  if (season.week === 3) {
    return {
      id: 'skill-session-v1-week-3', version: 1, kind: 'skill_session',
      title: 'Séance compétence',
      purpose: SKILL_PURPOSE,
      durationMin: 45,
      equipment: ['Ballon de basket', 'cerceaux', 'cônes', 'échelle extérieure', 'sol plat'],
      warmup: '6 min : trot facile, chevilles, poignets, épaules.',
      blocks: lockedWeek3SkillBlocks(),
      cooldown: COOLDOWN,
      memory: {
        id: 'memory-skill-session-order', module: 'M1',
        prompt: 'Récite les 11 postes du circuit dans l’ordre, à voix haute.',
        answer: 'Réciter de mémoire, puis vérifier avec la source officielle. Aucune explication n’est demandée, seulement la restitution.'
      }
    };
  }
  if (season.week === 11) return buildTaperSessionRecipe();

  const module = season.memory as Exclude<MemoryModule, 'M5'>;
  const warmup = warmupFor(season, SKILL_WARMUP_BASE);
  const game = isMemoryGameWeek(season.week);
  const memory = game ? memoryGameBlock(season.week, 'skill_session') : memoryBlock(module, 6, true);
  const blocks = [memory, skillBlockFor(season), cardioBlock(season.week, 'skill', season.cardioMin)];
  const station = focusStationOf(season.week);
  const cooldown = SKILL_COOLDOWN_BY_WEEK[season.week] ?? COOLDOWN;
  return {
    id: `skill-session-v2-week-${season.week}`, version: 2, kind: 'skill_session',
    title: 'Séance compétence',
    purpose: SKILL_PURPOSE,
    durationMin: sessionMinutes(warmup.text, blocks, cooldown),
    equipment: unique([...(station !== null ? SKILL_BLOCKS[station]?.equipment ?? [] : []), ...cardioEquipment(season.week, 'skill')]),
    warmup: warmup.text,
    blocks,
    cooldown,
    // CHANGE_REQUEST_018 — M1 to M3 are retired as session content from week 5
    // (memory_modules.md v3): a game week carries no recited prompt.
    ...(game ? {} : { memory: memoryPrompt('skill_session', module) })
  };
}

// Week 11: no chain session. The skill session moves to Wednesday 18 November
// and becomes the taper session (season_plan.md, "Week 11"): memory M4 ·
// placeholder "Passage fantôme au pas" 15 min · cardio 6 · no tails.
// CHANGE_REQUEST_018 — its memory block is the PLAN card followed by M4.
export function buildTaperSessionRecipe(): SessionRecipe {
  const season = SEASON_PLAN[11]!;
  const warmup = warmupFor(season, SKILL_WARMUP_BASE);
  const blocks = [
    memoryGameBlock(11, 'skill_session'),
    placeholderBlock('skill_block', 'Passage fantôme au pas', 15),
    cardioBlock(11, 'skill', season.cardioMin)
  ];
  return {
    id: 'taper-session-v2-week-11', version: 2, kind: 'skill_session',
    title: 'Séance d’affûtage',
    purpose: 'Jambes fraîches, technique nette, mémoire répétée. Le test est vendredi.',
    durationMin: sessionMinutes(warmup.text, blocks, COOLDOWN),
    equipment: unique(cardioEquipment(11, 'skill')),
    warmup: warmup.text,
    blocks,
    cooldown: COOLDOWN
  };
}

// ---------- the chain session ----------

const CHAIN_PURPOSE = 'Deux postes reliés, avec la transition entre eux entraînée et enregistrée. Une référence fraîche au début, le seul bloc dur de la journée au milieu, et la mesure sous fatigue à la fin.';
const CHAIN_WARMUP_BASE = 'trot facile, chevilles, épaules, quelques accélérations à la fin';
const CHAIN_COOLDOWN = '5 min : marche facile.';

// CHANGE_REQUEST_013 v3 — the ENGINE chain session, from week 5
// (weekly_shape.md v7): about 49-50 min, hard from the power EMOM to the end
// of the cardio, on purpose (R-WS-04/R-TL-04 do not apply to it).
const ENGINE_PURPOSE = 'Séance moteur, à bloc : cardio, explosivité, endurance. Une référence fraîche au début ; puis dur, exprès, de l’EMOM puissance jusqu’à la fin du cardio ; la tail B mesure sous fatigue à la fin. Repos courts mais jamais nuls ; douleur à la poitrine ou vertige : arrêter le bloc, marcher, la séance compte quand même.';
const ENGINE_COOLDOWN = '4 min : marche facile.';
// WEEK_5_FINAL, Thu 8 Oct, block 1. Later weeks use the generic warm-up
// (6 min + the power slot, so 8 or 9 min).
const ENGINE_WARMUP_BY_WEEK: Readonly<Record<number, string>> = {
  5: `9 min : « La ligne des 18 m ». 3 min de footing facile autour du parcours · 2 min de mobilité : balancés de jambes devant et sur le côté, cercles de hanches, rebonds de chevilles · 2 min sur la ligne de 18 m, un aller chacun, retour en marchant : montées de genoux, talons-fesses, carioca à gauche, carioca à droite · 1 min : 2 accélérations de 20 m (60 % puis 85 %) ; ${powerSlotText(3)}.`
};

export function isEngineChainWeek(weekNumber: number): boolean {
  return weekNumber >= ENGINE_CHAIN_FROM_WEEK;
}

function freshReferenceBlock(tails: TailContent, minutes: number): ExerciseBlock {
  const spec: FreshReferenceSpec = { kind: 'fresh_reference', blockId: FRESH_REFERENCE_BLOCK_ID, drills: tails.freshReference.drills };
  return {
    title: `Référence fraîche — ${minutes} min`, short: 'référence', kind: 'fresh_reference', spec,
    faire: tails.freshReference.faire,
    noter: tails.freshReference.noter,
    stationMappings: [tails.stationId], approximation: true
  };
}

function chainBlockFor(season: SeasonWeek, tails: TailContent): ExerciseBlock {
  const content = CHAIN_BLOCKS[season.chain];
  const engine = isEngineChainWeek(season.week);
  if (!content) return placeholderBlock('chain_block', chainPlaceholderLabel(season), engine ? 11 : 12);
  const spec: ChainBlock = {
    kind: 'chain_block',
    rounds: content.rounds,
    stations: content.stations,
    transitionNote: content.transitionNote,
    // R-WS-34: no tail A in the engine chain.
    ...(engine ? {} : { tailA: tails.tailA.drill, tailASeconds: tails.tailA.seconds }),
    roundScores: content.roundScores,
    restS: content.restS,
    durationMin: content.durationMin,
    intensity: content.intensity
  };
  return {
    title: content.title, short: 'enchaînement', kind: 'chain_block', spec,
    faire: engine ? content.faire : `${content.faire} Puis ${tails.tailA.faire}`,
    details: content.transitionNote,
    noter: engine ? `${content.noter}.` : `${content.noter} · ${tails.tailA.noter}.`,
    stationMappings: engine ? content.stations : [...content.stations, tails.tailA.drill.stationId], approximation: true
  };
}

// The power EMOM of the engine chain. Answers 2 and 3 of 2 October: a home
// week with no entry of its own reuses the latest earlier entry unchanged
// (weeks 6, 9, 10 get the week 5 EMOM, same drill, same best-jump box) until
// CR-019 writes one per week; a travel week keeps the named gap until the
// week 7 build writes the hotel version.
export const POWER_EMOM_HOTEL_PLACEHOLDER = 'Puissance à l’hôtel : à construire';

function powerEmomContentFor(season: SeasonWeek): PowerEmomContent | undefined {
  if (POWER_EMOM_BY_WEEK[season.week]) return POWER_EMOM_BY_WEEK[season.week];
  if (season.travel) return undefined;
  for (let week = season.week - 1; week >= ENGINE_CHAIN_FROM_WEEK; week -= 1) {
    if (POWER_EMOM_BY_WEEK[week]) return POWER_EMOM_BY_WEEK[week];
  }
  return undefined;
}

function powerEmomBlock(season: SeasonWeek): ExerciseBlock {
  const content = powerEmomContentFor(season);
  if (!content) return placeholderBlock('power_emom', season.travel ? POWER_EMOM_HOTEL_PLACEHOLDER : 'Puissance, EMOM 6 : à construire', 6);
  const spec: PowerEmomSpec = { kind: 'power_emom', atoms: content.atoms.map(cardRef), durationMin: content.durationMin, drills: content.drills };
  return {
    title: `Puissance, EMOM ${content.durationMin} — ${content.durationMin} min`, short: 'puissance', kind: 'power_emom', spec,
    faire: content.faire,
    noter: content.noter,
    stationMappings: content.stations, approximation: true
  };
}

function tailBBlock(tails: TailContent, minutes: number): ExerciseBlock {
  const spec: TailB = { kind: 'tail_b', minutes: tails.tailB.minutes, referenceBlockId: FRESH_REFERENCE_BLOCK_ID, stopRule: tails.tailB.stopRule };
  return {
    title: `Tail B — ${minutes} min`, short: 'tail B', kind: 'tail_b', spec,
    faire: tails.tailB.faire,
    regle: tails.tailB.stopRule,
    noter: tails.tailB.noter,
    stationMappings: [tails.stationId], approximation: true
  };
}

function chainSessionBlocks(season: SeasonWeek): ExerciseBlock[] {
  const tails = TAILS[season.tails === 'none' ? 'racket' : season.tails];
  if (isEngineChainWeek(season.week)) {
    // CHANGE_REQUEST_018 — the game card replaces the module from week 5
    // (every engine chain week): 4 min, 10 with M4 (weeks 9 and 10).
    return [
      freshReferenceBlock(tails, 2),
      memoryGameBlock(season.week, 'chain_session'),
      powerEmomBlock(season),
      chainBlockFor(season, tails),
      cardioBlock(season.week, 'chain', season.cardioMin),
      tailBBlock(tails, 4)
    ];
  }
  const memory: ExerciseBlock = season.memory === 'LOCKED'
    ? {
      title: 'Mémoire — 4 min', short: 'mémoire', kind: 'memory', spec: { kind: 'memory', modules: ['M3'] },
      faire: 'Transitions seulement : ce qui vient après chaque poste, et l’alternance 5 → 6 → 5 → 6.',
      stationMappings: []
    }
    : memoryBlock(season.memory, 4, false);
  return [
    freshReferenceBlock(tails, 3),
    memory,
    chainBlockFor(season, tails),
    cardioBlock(season.week, 'chain', season.cardioMin),
    tailBBlock(tails, 5)
  ];
}

export function buildChainSessionRecipe(weekNumber: number): SessionRecipe {
  const season = seasonWeek(weekNumber) ?? SEASON_PLAN[3]!;
  const blocks = chainSessionBlocks(season);
  if (season.week === 3) {
    return {
      id: 'chain-session-v1-week-3', version: 1, kind: 'chain_session',
      title: 'Séance enchaînement',
      purpose: CHAIN_PURPOSE,
      durationMin: 45,
      equipment: ['Cônes', 'échelle extérieure', 'planche d’équilibre', 'raquette et balle', '3 obstacles de 15 à 20 cm'],
      warmup: '6 min : trot facile, chevilles, épaules, quelques accélérations à la fin.',
      blocks,
      cooldown: CHAIN_COOLDOWN,
      memory: {
        id: 'memory-chain-session-transitions', module: 'M3',
        prompt: 'Quel est l’ordre d’alternance à retenir entre les postes 5 et 6 ?',
        answer: '5 → 6 → 5 → 6 : pousser, trier et placer, tirer en retour, puis retirer et rapporter les objets.'
      }
    };
  }
  const module = season.memory as Exclude<MemoryModule, 'M5'>;
  const engine = isEngineChainWeek(season.week);
  const generic = warmupFor(season, CHAIN_WARMUP_BASE).text;
  const warmup = ENGINE_WARMUP_BY_WEEK[season.week] ?? generic;
  const cooldown = engine ? ENGINE_COOLDOWN : CHAIN_COOLDOWN;
  const tails = TAILS[season.tails === 'none' ? 'racket' : season.tails];
  return {
    id: `chain-session-${engine ? 'v3' : 'v2'}-week-${season.week}`, version: engine ? 3 : 2, kind: 'chain_session',
    title: engine ? 'Enchaînement moteur' : 'Séance enchaînement',
    purpose: engine ? ENGINE_PURPOSE : CHAIN_PURPOSE,
    durationMin: sessionMinutes(warmup, blocks, cooldown),
    equipment: unique([...(CHAIN_BLOCKS[season.chain]?.equipment ?? []), ...tails.equipment, ...cardioEquipment(season.week, 'chain')]),
    warmup,
    blocks,
    cooldown,
    ...(isMemoryGameWeek(season.week) ? {} : { memory: memoryPrompt('chain_session', module) })
  };
}

// ---------- the weekend run ----------

/**
 * The weekend run of weeks 4 to 10 except the race week: the distance from
 * the table and, when the table puts the hill sprints on Saturday (week 10),
 * the sprints as the last block (R-WS-43, card S01_hill_sprints), scored by
 * the reps done only. Week 4's text is the week 4 plan's own. In a travel
 * week the run may be on a treadmill (season_plan.md v3).
 */
export function buildWeekendRunRecipe(weekNumber: number): SessionRecipe | null {
  const season = seasonWeek(weekNumber);
  if (!season || season.week === 3 || !Array.isArray(season.runKm)) return null;
  const [low, high] = season.runKm;
  const km = low === high ? `${low} km` : `${low} à ${high} km`;
  const main: ExerciseBlock = season.week === 4
    ? {
      title: `Sortie facile — ${km}, environ 250 m D+`, short: 'sortie',
      faire: 'Assez facile pour parler, en trail si possible. Environ 250 m D+ : une répétition pour la course du 11 octobre (400 m D+). Pas de vitesse, pas de sprint final.',
      stationMappings: []
    }
    : {
      title: `Sortie facile — ${km}`, short: 'sortie',
      faire: season.travel ? 'Allure conversationnelle, majoritairement facile. Dehors ou sur tapis.' : 'Allure conversationnelle, majoritairement facile.',
      stationMappings: []
    };
  const blocks: ExerciseBlock[] = [main];
  if (season.hillSprints > 0 && season.hillSprintsDay === 'SAT') blocks.push(hillSprintsBlock(season.hillSprints, true));
  return {
    id: `trail-maintenance-v2-week-${season.week}`, version: 2, kind: 'trail_maintenance',
    title: 'Trail — sortie de maintien',
    purpose: 'Course de maintien, majoritairement facile, allure conversationnelle. Course uniquement : aucun travail police, équilibre ou conditioning attaché (R-WS-04).',
    durationMin: null,
    equipment: ['Chaussures de trail'],
    warmup: null,
    blocks,
    cooldown: null
  };
}

function hillSprintsBlock(count: number, endOfRun: boolean): ExerciseBlock {
  return {
    title: `Côtes : ${count} sprints de 8 à 10 s, retour en marchant`, short: 'côtes', kind: 'hill_sprints',
    faire: endOfRun
      ? `En fin de sortie, au pied d’une courte pente : ${count} sprints de 8 à 10 s en montée, retour en marchant ; repartir quand la respiration est redevenue facile. Puis 5 min de trot facile.`
      : `Au pied d’une courte pente : ${count} sprints de 8 à 10 s en montée, retour en marchant ; repartir quand la respiration est redevenue facile. Jamais sur un tapis.`,
    regle: 'Stop si la vitesse chute nettement ou au moindre tiraillement au mollet ou à l’ischio. Le nombre n’est pas une cible.',
    noter: 'Seulement le nombre de sprints faits.',
    stationMappings: [], approximation: true
  };
}

/**
 * CHANGE_REQUEST_013 v3 — week 9: the Tuesday session is the hill sprints in
 * place of the run intervals (season_plan.md v3, note i; R-WS-43), inside the
 * fixed Tuesday frame (R-WS-19). It keeps the Tuesday run slot, so it still
 * counts as the week's first run (R-WS-03). Null when the table puts no
 * sprints on Tuesday.
 */
export function buildTuesdayHillSprintsRecipe(weekNumber: number): SessionRecipe | null {
  const season = seasonWeek(weekNumber);
  if (!season || season.hillSprintsDay !== 'TUE' || season.hillSprints === 0) return null;
  return {
    id: `hill-sprints-v1-week-${season.week}`, version: 1, kind: 'run_intervals',
    title: 'Côtes — sprints en montée',
    purpose: `Semaine ${season.week} : ${season.hillSprints} sprints en côte à la place des intervalles (carte S01_hill_sprints). Pas d’intervalles cette semaine.`,
    durationMin: null,
    equipment: ['Chaussures de course', 'une courte pente'],
    warmup: '15 min facile, puis 3 × 20 s d’accélérations progressives.',
    blocks: [hillSprintsBlock(season.hillSprints, false)],
    cooldown: '10 min facile.'
  };
}

export function hasHillSprints(recipe: SessionRecipe): boolean {
  return recipe.blocks.some((block) => block.kind === 'hill_sprints');
}

// ---------- readers, used by the rules and by the screens ----------

export const SESSION_SHAPES: readonly SessionShape[] = ['skill_session', 'chain_session'];

export function isSessionShape(kind: string): kind is SessionShape {
  return (SESSION_SHAPES as readonly string[]).includes(kind);
}

/**
 * The block list the change request's index rules are written against:
 * `warmup` and `cooldown` re-inserted around `recipe.blocks`, so "memory is
 * only ever at index 1 (skill session) or 2 (chain session)" can be checked
 * literally, on the same 0-based sequence the locked files draw.
 */
export function blockSequence(recipe: SessionRecipe): BlockKind[] {
  const middle = recipe.blocks.map((block) => block.kind).filter((kind): kind is BlockKind => kind !== undefined);
  return [
    ...(recipe.warmup ? (['warmup'] as BlockKind[]) : []),
    ...middle,
    ...(recipe.cooldown ? (['cooldown'] as BlockKind[]) : [])
  ];
}

function specOf<Spec extends { kind: string }>(recipe: SessionRecipe, kind: Spec['kind']): Spec | null {
  const block = recipe.blocks.find((item) => item.kind === kind);
  return (block?.spec as Spec | undefined) ?? null;
}

export function memoryBlockOf(recipe: SessionRecipe): MemoryBlockSpec | null { return specOf<MemoryBlockSpec>(recipe, 'memory'); }
export function freshReferenceOf(recipe: SessionRecipe): FreshReferenceSpec | null { return specOf<FreshReferenceSpec>(recipe, 'fresh_reference'); }
export function skillBlockOf(recipe: SessionRecipe): SkillBlock | null { return specOf<SkillBlock>(recipe, 'skill_block'); }
export function chainBlockOf(recipe: SessionRecipe): ChainBlock | null { return specOf<ChainBlock>(recipe, 'chain_block'); }
export function tailBOf(recipe: SessionRecipe): TailB | null { return specOf<TailB>(recipe, 'tail_b'); }
export function powerEmomOf(recipe: SessionRecipe): PowerEmomSpec | null { return specOf<PowerEmomSpec>(recipe, 'power_emom'); }

/** The block of a kind, placeholder or not. */
export function blockOfKind(recipe: SessionRecipe, kind: BlockKind): ExerciseBlock | null {
  return recipe.blocks.find((block) => block.kind === kind) ?? null;
}

/**
 * The station the skill session's skill block trains: the spec's station when
 * the block has content, the placeholder's own station otherwise, null when
 * the table does not name one yet.
 */
export function skillStationOf(recipe: SessionRecipe): number | null {
  const block = blockOfKind(recipe, 'skill_block');
  if (!block) return null;
  if (block.spec?.kind === 'skill_block') return block.spec.stationId;
  return block.stationMappings[0] ?? null;
}

// R-WS-16: a chain block is NOT a cardio block, so this only ever returns
// blocks tagged `cardio`. Returns every one of them, so "exactly one" can be
// asserted by the caller rather than hidden here.
export function cardioBlocksOf(recipe: SessionRecipe): CardioBlock[] {
  return recipe.blocks.filter((block) => block.kind === 'cardio').map((block) => block.spec as CardioBlock);
}

export function cardioBlockOf(recipe: SessionRecipe): CardioBlock | null {
  const blocks = cardioBlocksOf(recipe);
  return blocks.length === 1 ? blocks[0]! : null;
}

/** Every scored drill of a session, in the order the athlete meets them. */
export function drillsOf(recipe: SessionRecipe): DrillRef[] {
  return recipe.blocks.flatMap(drillsOfBlock);
}

/** The drills of one block, for the per-block Retour groups. */
export function drillsOfBlock(block: ExerciseBlock): DrillRef[] {
  const spec = block.spec;
  if (!spec) return [];
  if (spec.kind === 'fresh_reference' || spec.kind === 'skill_block') return spec.drills;
  if (spec.kind === 'memory') return spec.drills ?? [];
  if (spec.kind === 'power_emom') return spec.drills;
  if (spec.kind === 'chain_block') return spec.tailA ? [...spec.roundScores, spec.tailA] : spec.roundScores;
  if (spec.kind === 'tail_b') return spec.minutes.map((minute) => minute.drill);
  return [];
}

/** Every memory module a session exposes (R-WS-12, R-WS-40). */
export function memoryModulesOf(recipe: SessionRecipe): MemoryModule[] {
  const fromBlocks = recipe.blocks.flatMap((block) => (block.spec?.kind === 'memory' ? block.spec.modules : []));
  if (fromBlocks.length > 0) return fromBlocks;
  return recipe.memory?.module ? [recipe.memory.module] : [];
}

/** Every station a session's cardio block touches, R-WS-29's subject. */
export function cardioStationsOf(recipe: SessionRecipe): number[] {
  return cardioBlocksOf(recipe).flatMap((cardio) => cardio.atoms.map((atom) => atom.stationId));
}
