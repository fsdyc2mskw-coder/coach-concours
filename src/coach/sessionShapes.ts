// CHANGE_REQUEST_013 sections A, B and E — the two named session shapes as
// app data, and the readers the rules in `planner.ts` check them through.
//
// The content below is the two locked Drive sessions of 22 September 2026
// (`03_Weekly_plans/WEEK_3_SKILL_SESSION_2026-09-22.md` and
// `WEEK_3_CHAIN_SESSION_2026-09-22.md`), transcribed block for block into
// French, the app's own language. Those two files are the reference: where
// the change-request prose and a locked file disagree, the locked file wins.
//
// Nothing here is invented. In particular the doses (8 min / 1 min / 9 min,
// AMRAP 10, 3 rounds × 90 s, EMOM 10, 4 × 1 min with 20 s) are the locked
// files' own numbers, and the cardio length is 10 min for week 3 exactly as
// section E requires.
//
// What is NOT in any input file, and therefore is not guessed here: which
// station the skill block trains in weeks 4 to 11, with which drills and
// which score measures. `SKILL_FOCUS_BY_WEEK` is the single place a rotation
// table would land; until Cowork writes one, every week repeats week 3's
// locked content — see the questions in handoffs/APP_REPORT_013.md.
import { cardRef } from '../data/exerciseCards';
import type {
  BlockKind,
  CardioBlock,
  ChainBlock,
  DrillRef,
  ExerciseBlock,
  FreshReferenceSpec,
  MemoryBlockSpec,
  MemoryModule,
  SessionRecipe,
  SessionShape,
  SkillBlock,
  TailB
} from './types';

// R-WS-32: "Duration 12 to 15 min … Week 3 is locked at 10 min, the last week
// at the old length." 12 is the floor of the band the rule states; no input
// file gives a week-by-week cardio progression, so no rise is invented
// (R-WS-33 is raised as a question in the APP_REPORT instead).
export const WEEK3_CARDIO_MIN = 10;
export const CARDIO_MIN_FROM_WEEK_4 = 12;

export function cardioDurationForWeek(weekNumber: number): number {
  return weekNumber <= 3 ? WEEK3_CARDIO_MIN : CARDIO_MIN_FROM_WEEK_4;
}

// R-WS-27 ("one station per week, rotated") is a soft rule and no input file
// says which station in which week. Week 3's own focus is locked at station 8.
export const SKILL_FOCUS_BY_WEEK: Record<number, number> = { 3: 8 };
export function skillFocusStation(weekNumber: number): number {
  return SKILL_FOCUS_BY_WEEK[weekNumber] ?? SKILL_FOCUS_BY_WEEK[3]!;
}

const FRESH_REFERENCE_BLOCK_ID = 'chain-fresh-reference';

function drill(cardId: string, drillId: string, measure: DrillRef['measure'], scoreLabel: string): DrillRef {
  return { ...cardRef(cardId), drillId, measure, scoreLabel };
}

// ---------- the skill session ----------

function skillSessionBlocks(weekNumber: number): ExerciseBlock[] {
  const memory: MemoryBlockSpec = { kind: 'memory', modules: ['M1', 'M2'] };
  const skill: SkillBlock = {
    kind: 'skill_block',
    stationId: skillFocusStation(weekNumber),
    drills: [
      drill('S08_hand_then_chain', 'skill:S08_hand_then_chain', 'balls_lost', 'Balles perdues — main gauche seule'),
      drill('S08_chain_out', 'skill:S08_chain_out', 'foot_errors', 'Erreurs de pied par passage — 5 cerceaux')
    ],
    durationMin: 18
  };
  const cardio: CardioBlock = {
    kind: 'cardio',
    format: 'amrap',
    atoms: [cardRef('S01_slalom_18m'), cardRef('S03_ladder_climb_jump_finish'), cardRef('S00_half_burpees')],
    durationMin: cardioDurationForWeek(weekNumber),
    target: null
  };

  return [
    {
      title: 'Mémoire — 6 min', short: 'mémoire', kind: 'memory', spec: memory,
      faire: 'Les 11 postes dans l’ordre, à voix haute. Puis la ligne des couleurs des cerceaux : départ vert, puis jaune, bleu, rouge, jaune, rouge, bleu, rouge, jaune, jaune, rouge, bleu.',
      stationMappings: []
    },
    {
      title: 'Cerceaux et ballon — 18 min', short: 'poste 8', kind: 'skill_block', spec: skill,
      faire: 'Main gauche seule, 8 min : 10 m aller-retour en dribblant de la main gauche uniquement, 6 longueurs normales puis 2 longueurs basses, regard devant, jamais sur le ballon. Marcher 1 min. Puis 5 cerceaux, ballon tenu dans les bras, 9 min : jaune les deux pieds, bleu le pied droit, rouge le pied gauche, 4 passages, 30 à 60 s entre les passages, regard sur le PROCHAIN cerceau.',
      details: 'Passer à 7 cerceaux après 2 passages propres.',
      noter: 'Balles perdues sur le premier exercice ; erreurs de pied par passage sur le second.',
      stationMappings: [skill.stationId], approximation: true
    },
    {
      title: `Cardio AMRAP — ${cardio.durationMin} min`, short: 'cardio', kind: 'cardio', spec: cardio,
      faire: `Autant de tours que possible en ${cardio.durationMin} minutes : slalom 18 m, un aller-retour ; espaliers, 3 passages, monter et sauter ; 8 demi-burpees.`,
      noter: 'Aucune cible. Noter seulement : les tours faits, et le score d’effort.',
      stationMappings: [1, 3], approximation: true
    }
  ];
}

export function buildSkillSessionRecipe(weekNumber: number): SessionRecipe {
  return {
    id: `skill-session-v1-week-${weekNumber}`, version: 1, kind: 'skill_session',
    title: 'Séance compétence',
    purpose: 'Un seul poste, travaillé frais et sans chrono, deux cartes au maximum, chaque exercice noté. Puis un bloc cardio dont le seul rôle est de construire le cardio, sans cible.',
    durationMin: 45,
    equipment: ['Ballon de basket', 'cerceaux', 'cônes', 'échelle extérieure', 'sol plat'],
    warmup: '6 min : trot facile, chevilles, poignets, épaules.',
    blocks: skillSessionBlocks(weekNumber),
    cooldown: '5 min : marche facile, respiration qui redescend.',
    memory: {
      id: 'memory-skill-session-order', module: 'M1',
      prompt: 'Récite les 11 postes du circuit dans l’ordre, à voix haute.',
      answer: 'Réciter de mémoire, puis vérifier avec la source officielle. Aucune explication n’est demandée, seulement la restitution.'
    }
  };
}

// ---------- the chain session ----------

function chainSessionBlocks(weekNumber: number): ExerciseBlock[] {
  const freshReference: FreshReferenceSpec = {
    kind: 'fresh_reference',
    blockId: FRESH_REFERENCE_BLOCK_ID,
    drills: [
      drill('S11_racket_on_board', 'fresh:S11_racket_on_board', 'drops', 'Chutes — planche, à froid'),
      drill('S11_racket_obstacles', 'fresh:S11_racket_obstacles', 'drops', 'Chutes — obstacles, à froid')
    ]
  };
  const memory: MemoryBlockSpec = { kind: 'memory', modules: ['M3'] };
  const chain: ChainBlock = {
    kind: 'chain_block',
    rounds: 3,
    stations: [1, 3],
    transitionNote: 'La marche entre le slalom et les espaliers : épaules basses, respirer, arriver prête. C’EST cette partie qui est entraînée.',
    tailA: drill('S11_racket_on_board', 'tail_a:S11_racket_on_board', 'drops', 'Chutes sur la planche — tail A'),
    tailASeconds: 30,
    roundScores: [
      drill('S01_slalom_18m', 'chain:round_time', 'round_time_s', 'Temps par tour (s)'),
      drill('S01_slalom_18m', 'chain:cones_touched', 'cones_touched', 'Cônes touchés')
    ],
    restS: 90,
    durationMin: 12,
    intensity: 'moderate'
  };
  const cardio: CardioBlock = {
    kind: 'cardio',
    format: 'emom',
    atoms: [cardRef('S01_carioca_footwork'), cardRef('S00_jump_squats'), cardRef('S00_high_knees')],
    durationMin: cardioDurationForWeek(weekNumber),
    target: null
  };
  const tailB: TailB = {
    kind: 'tail_b',
    minutes: [
      { minute: 1, drill: drill('S11_racket_on_board', 'tail_b:1', 'drops', 'Chutes — min 1, planche, pieds écartés'), label: 'planche, pieds écartés' },
      { minute: 2, drill: drill('S11_racket_obstacles', 'tail_b:2', 'drops', 'Chutes — min 2, obstacles'), label: 'raquette par-dessus les 3 obstacles' },
      { minute: 3, drill: drill('S11_racket_on_board', 'tail_b:3', 'drops', 'Chutes — min 3, planche, pieds serrés'), label: 'planche, pieds plus serrés' },
      { minute: 4, drill: drill('S11_racket_obstacles', 'tail_b:4', 'drops', 'Chutes — min 4, obstacles'), label: 'raquette par-dessus les 3 obstacles' }
    ],
    referenceBlockId: FRESH_REFERENCE_BLOCK_ID,
    stopRule: 'STOP si la prise s’ouvre. Deux minutes comptent quand même.'
  };

  return [
    {
      title: 'Référence fraîche — 3 min', short: 'référence', kind: 'fresh_reference', spec: freshReference,
      faire: '1 min de raquette et balle sur la planche d’équilibre. 1 min de raquette par-dessus les 3 obstacles.',
      noter: 'Chutes sur chacun. C’est le nombre auquel la tail B est comparée, pris le même jour pour que la comparaison soit réelle.',
      stationMappings: [11], approximation: true
    },
    {
      title: 'Mémoire — 4 min', short: 'mémoire', kind: 'memory', spec: memory,
      faire: 'Transitions seulement : ce qui vient après chaque poste, et l’alternance 5 → 6 → 5 → 6.',
      stationMappings: []
    },
    {
      title: 'Enchaînement, modéré — 12 min', short: 'enchaînement', kind: 'chain_block', spec: chain,
      faire: '3 tours, 90 s de récupération entre les tours. Slalom 18 m, aller tout droit, slalom au retour. Puis la marche jusqu’aux espaliers. Puis espaliers, 3 passages, monter et sauter. Puis TAIL A : raquette et balle sur la planche d’équilibre, 30 s.',
      details: chain.transitionNote,
      noter: 'Temps par tour · cônes touchés · chutes sur la planche.',
      stationMappings: [...chain.stations, chain.tailA.stationId], approximation: true
    },
    {
      title: `Cardio EMOM — ${cardio.durationMin} min`, short: 'cardio', kind: 'cardio', spec: cardio,
      faire: `Minute 1 : carioca, 18 m aller-retour. Minute 2 : 10 jump squats. Minute 3 : 40 appuis en montées de genoux. Puis les trois mêmes à nouveau, jusqu’à la minute ${cardio.durationMin}.`,
      noter: `Aucune cible. Noter seulement : les ${cardio.durationMin} minutes tenues ou non, et le score d’effort.`,
      stationMappings: [1], approximation: true
    },
    {
      title: 'Tail B — 5 min', short: 'tail B', kind: 'tail_b', spec: tailB,
      faire: '4 × 1 min, 20 s entre les minutes. Min 1 : planche, pieds écartés. Min 2 : raquette par-dessus les 3 obstacles. Min 3 : planche, pieds plus serrés. Min 4 : raquette par-dessus les 3 obstacles.',
      regle: tailB.stopRule,
      noter: 'Chutes par minute, face à la référence fraîche du début de séance.',
      stationMappings: [11], approximation: true
    }
  ];
}

export function buildChainSessionRecipe(weekNumber: number): SessionRecipe {
  return {
    id: `chain-session-v1-week-${weekNumber}`, version: 1, kind: 'chain_session',
    title: 'Séance enchaînement',
    purpose: 'Deux postes reliés, avec la transition entre eux entraînée et enregistrée. Une référence fraîche au début, le seul bloc dur de la journée au milieu, et la mesure sous fatigue à la fin.',
    durationMin: 45,
    equipment: ['Cônes', 'échelle extérieure', 'planche d’équilibre', 'raquette et balle', '3 obstacles de 15 à 20 cm'],
    warmup: '6 min : trot facile, chevilles, épaules, quelques accélérations à la fin.',
    blocks: chainSessionBlocks(weekNumber),
    cooldown: '5 min : marche facile.',
    memory: {
      id: 'memory-chain-session-transitions', module: 'M3',
      prompt: 'Quel est l’ordre d’alternance à retenir entre les postes 5 et 6 ?',
      answer: '5 → 6 → 5 → 6 : pousser, trier et placer, tirer en retour, puis retirer et rapporter les objets.'
    }
  };
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

function specOf<Spec extends { kind: BlockKind }>(recipe: SessionRecipe, kind: Spec['kind']): Spec | null {
  const block = recipe.blocks.find((item) => item.kind === kind);
  return (block?.spec as Spec | undefined) ?? null;
}

export function memoryBlockOf(recipe: SessionRecipe): MemoryBlockSpec | null { return specOf<MemoryBlockSpec>(recipe, 'memory'); }
export function freshReferenceOf(recipe: SessionRecipe): FreshReferenceSpec | null { return specOf<FreshReferenceSpec>(recipe, 'fresh_reference'); }
export function skillBlockOf(recipe: SessionRecipe): SkillBlock | null { return specOf<SkillBlock>(recipe, 'skill_block'); }
export function chainBlockOf(recipe: SessionRecipe): ChainBlock | null { return specOf<ChainBlock>(recipe, 'chain_block'); }
export function tailBOf(recipe: SessionRecipe): TailB | null { return specOf<TailB>(recipe, 'tail_b'); }

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
  const drills: DrillRef[] = [];
  for (const block of recipe.blocks) {
    const spec = block.spec;
    if (!spec) continue;
    if (spec.kind === 'fresh_reference' || spec.kind === 'skill_block') drills.push(...spec.drills);
    else if (spec.kind === 'chain_block') drills.push(...spec.roundScores, spec.tailA);
    else if (spec.kind === 'tail_b') drills.push(...spec.minutes.map((minute) => minute.drill));
  }
  return drills;
}

/** The drills of one block, for the per-block Retour groups. */
export function drillsOfBlock(block: ExerciseBlock): DrillRef[] {
  const spec = block.spec;
  if (!spec) return [];
  if (spec.kind === 'fresh_reference' || spec.kind === 'skill_block') return spec.drills;
  if (spec.kind === 'chain_block') return [...spec.roundScores, spec.tailA];
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
