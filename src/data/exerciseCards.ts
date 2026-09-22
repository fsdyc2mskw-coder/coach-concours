// CHANGE_REQUEST_013 — the cards the blocks are built from, transcribed from
// `02_Training_brain/exercise_cards/00_INDEX.md` (22 September 2026), one
// entry per line of that index, in the index's own order. Nothing here is
// invented: `stationId`, `role`, `state` and `what` are the index's own four
// columns.
//
// `freshOnly` is the flag R-WS-29 excludes from a cardio block ("any card
// flagged fresh only"). No card in the index carries such a flag, and the
// index's `state` column cannot be it: both locked week-3 sessions put
// `state: 'fresh'` cards in their cardio blocks (slalom and wall bars in the
// skill session, carioca in the chain session), and the locked session files
// win over the change-request prose. So `freshOnly` is its own field, false
// everywhere until Cowork says which cards carry it — see APP_REPORT_013.md.
import type { CardRef } from '../coach/types';

export interface ExerciseCard {
  id: string;
  stationId: number;
  role: 'A' | 'C' | 'X';
  state: 'fresh' | 'fatigued' | 'both';
  freshOnly: boolean;
  label: string;
  what: string;
}

export const exerciseCards: ExerciseCard[] = [
  { id: 'S00_air_squats', stationId: 0, role: 'X', state: 'both', freshOnly: false, label: 'Air squats', what: '30 s ou 16 répétitions, atome de conditionnement' },
  { id: 'S00_jumping_jacks', stationId: 0, role: 'X', state: 'both', freshOnly: false, label: 'Jumping jacks', what: '30 s ou 30 répétitions, atome de conditionnement' },
  { id: 'S00_jump_squats', stationId: 0, role: 'X', state: 'both', freshOnly: false, label: 'Jump squats', what: '20 s ou 10 répétitions, atome de conditionnement' },
  { id: 'S00_half_burpees', stationId: 0, role: 'X', state: 'both', freshOnly: false, label: 'Demi-burpees', what: '20 s ou 8 répétitions, sans poitrine au sol' },
  { id: 'S00_high_knees', stationId: 0, role: 'X', state: 'both', freshOnly: false, label: 'Montées de genoux', what: '30 s ou 40 appuis, atome de conditionnement' },
  { id: 'S01_slalom_18m', stationId: 1, role: 'A', state: 'fresh', freshOnly: false, label: 'Slalom 18 m', what: 'aller tout droit 18 m, slalom au retour, 10 × 25 s, 1 min de récupération' },
  { id: 'S01_carioca_footwork', stationId: 1, role: 'A', state: 'fresh', freshOnly: false, label: 'Carioca', what: 'pas croisés latéraux, parcours de 18 m, 10 × 20 s de récupération' },
  { id: 'S01_uphill_intervals', stationId: 1, role: 'C', state: 'fresh', freshOnly: false, label: 'Intervalles en côte', what: 'course en montée 1 min, descente en trottinant, 6 à 8 répétitions, 45 s de récupération' },
  { id: 'S03_ladder_climb_jump_finish', stationId: 3, role: 'A', state: 'fresh', freshOnly: false, label: 'Espaliers, monter et sauter', what: 'monter, descente normale, sauter les 3 derniers barreaux, 5 tours' },
  { id: 'S03_ladder_one_hand_object', stationId: 3, role: 'A', state: 'fresh', freshOnly: false, label: 'Espaliers, une main, objet', what: 'une main grimpe, ballon dans l’autre, même descente, 3 tours' },
  { id: 'S08_hand_then_chain', stationId: 8, role: 'A', state: 'fresh', freshOnly: false, label: 'Main gauche seule, puis enchaînement', what: 'main gauche seule, puis un enchaînement de dribble sur 3 cerceaux (à confirmer)' },
  { id: 'S08_chain_out', stationId: 8, role: 'A', state: 'fresh', freshOnly: false, label: '5 cerceaux, ballon dans les bras', what: '5 cerceaux, pieds selon la couleur, ballon tenu dans les bras (à confirmer)' },
  { id: 'S08_return_dribble_same_side', stationId: 8, role: 'A', state: 'fresh', freshOnly: false, label: 'Retour, dribble côté pied d’appui', what: 'trajet retour, dribble du côté du pied de réception (à confirmer)' },
  { id: 'S10_block_switch_fresh', stationId: 10, role: 'A', state: 'fresh', freshOnly: false, label: 'Corde, changement de bloc', what: '10 pieds joints, 5 à droite, 5 à gauche, ordre au hasard' },
  { id: 'S10_single_foot_after_legs', stationId: 10, role: 'C', state: 'fatigued', freshOnly: false, label: 'Corde à cloche-pied après les jambes', what: 'corde à cloche-pied après un travail de jambes' },
  { id: 'S11_racket_obstacles', stationId: 11, role: 'A', state: 'fresh', freshOnly: false, label: 'Raquette par-dessus les obstacles', what: '45 s à plat, 30 s d’obstacles, 45 s à plat' },
  { id: 'S11_racket_on_board', stationId: 11, role: 'A', state: 'fresh', freshOnly: false, label: 'Raquette sur la planche d’équilibre', what: 'balle sur la raquette, debout sur la planche d’équilibre' },
  { id: 'S11_racket_after_intervals', stationId: 11, role: 'C', state: 'fatigued', freshOnly: false, label: 'Raquette après un bloc dur', what: 'la même série que ci-dessus, après un bloc dur' }
];

export const cardById: Record<string, ExerciseCard> = exerciseCards.reduce<Record<string, ExerciseCard>>((result, card) => {
  result[card.id] = card;
  return result;
}, {});

// A `CardRef` for a card id, so a block never repeats the station number or
// the label the index already holds.
export function cardRef(cardId: string): CardRef {
  const card = cardById[cardId];
  if (!card) throw new Error(`Unknown exercise card: ${cardId}`);
  return { cardId: card.id, stationId: card.stationId, label: card.label };
}

export function isFreshOnly(cardId: string): boolean {
  return cardById[cardId]?.freshOnly ?? false;
}
