// CHANGE_REQUEST_018 section B — which game card each police session of
// weeks 5 to 11 carries (rules/memory_modules.md v3, R-MM-01 to R-MM-06).
//
// Kept apart from `memoryGame.ts` on purpose: `sessionShapes.ts` reads this
// file while `recipes.ts` builds every recipe at module load, so it must not
// import anything that leads back to the recipes (the game module reads the
// planner and the session shapes, which would close that loop).
import type { DrillRef } from './types';

export type MemoryCard = 'plan' | 'order' | 'missing' | 'rules';
export const MEMORY_CYCLE: Record<number, { skill: MemoryCard; chain: MemoryCard | null;
  video: boolean; m4: boolean }> = {
  5:  { skill: 'plan',    chain: 'order', video: true,  m4: false },
  6:  { skill: 'missing', chain: 'rules', video: false, m4: false },
  7:  { skill: 'plan',    chain: 'order', video: true,  m4: false },
  8:  { skill: 'missing', chain: 'rules', video: false, m4: false },
  9:  { skill: 'plan',    chain: 'order', video: true,  m4: true  },
  10: { skill: 'missing', chain: 'rules', video: false, m4: true  },
  11: { skill: 'plan',    chain: null,    video: true,  m4: true  }, // the taper session, Wed 18 Nov
};

export const MEMORY_CARDS: readonly MemoryCard[] = ['plan', 'order', 'missing', 'rules'];

/** The first week whose memory blocks are game cards (weeks 3 and 4 stay as live). */
export const MEMORY_GAME_FROM_WEEK = 5;

// Section C — the maximum of each card's score.
export const MEMORY_CARD_MAX: Readonly<Record<MemoryCard, number>> = { plan: 11, order: 11, missing: 3, rules: 10 };

// The game screens' own titles (MOCKUP_CR018), used in the block title.
export const MEMORY_CARD_LABEL: Readonly<Record<MemoryCard, string>> = {
  plan: 'PLAN', order: 'ORDRE', missing: 'QUI MANQUE ?', rules: 'RÈGLES'
};

// The MÉMOIRE home's card titles and lines (MOCKUP_CR018, screen 0).
export const MEMORY_CARD_HOME: Readonly<Record<MemoryCard, { title: string; line: string }>> = {
  plan: { title: 'PLAN DU PARCOURS', line: 'Replace les 11 postes dans la salle' },
  order: { title: 'ORDRE', line: 'Remets les 11 postes dans l’ordre' },
  missing: { title: 'QUI MANQUE ?', line: '10 postes affichés, trouve l’absent' },
  rules: { title: 'RÈGLES', line: 'Une image, tu dis correct ou faux' }
};

// Section C — the two extra lines of the block, word for word.
export const MEMORY_VIDEO_LINE = 'Regarde la vidéo officielle en entier (3 min 49)';
export const MEMORY_M4_LINE = 'Visualisation yeux fermés · 6 min · tout le parcours, sans aide';

// Section C — 4 min, or 10 with M4 (the card plus 6 min eyes closed). R-MM-01
// caps the block at 12.
export const MEMORY_BLOCK_MAX_MIN = 12;
export function memoryBlockMinutes(m4: boolean): number {
  return m4 ? 10 : 4;
}

const SCORE_LABEL: Readonly<Record<MemoryCard, string>> = {
  plan: 'PLAN · cases justes sur 11',
  order: 'ORDRE · places justes sur 11',
  missing: 'QUI MANQUE ? · bonnes réponses sur 3',
  rules: 'RÈGLES · bonnes réponses sur 10'
};

/**
 * The scored drill of a game block: one number, the card's score, stored as a
 * `DrillScore` with the measure `memory_card` (section C, replacing
 * `recall_errors` from week 5). One memory block per session, so the id is
 * unique inside the session.
 */
export function memoryCardDrill(card: MemoryCard): DrillRef {
  return {
    cardId: `memory_game_${card}`, stationId: 0, label: MEMORY_CARD_HOME[card].title,
    drillId: `memory:${card}`, measure: 'memory_card', scoreLabel: SCORE_LABEL[card]
  };
}

/** The card a `memory_card` drill id belongs to (`memory:plan` → plan). */
export function memoryCardOfDrill(drillId: string): MemoryCard | null {
  return MEMORY_CARDS.find((card) => memoryCardDrill(card).drillId === drillId) ?? null;
}

export function memoryCycleOf(weekNumber: number): (typeof MEMORY_CYCLE)[number] | null {
  return MEMORY_CYCLE[weekNumber] ?? null;
}

/** The card of one police session, or null when the week or shape carries none. */
export function memoryCardFor(weekNumber: number, shape: 'skill_session' | 'chain_session'): MemoryCard | null {
  const cycle = memoryCycleOf(weekNumber);
  if (!cycle) return null;
  return shape === 'skill_session' ? cycle.skill : cycle.chain;
}
