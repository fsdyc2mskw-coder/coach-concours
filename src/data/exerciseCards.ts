// CHANGE_REQUEST_013 — the cards the blocks are built from, transcribed from
// `02_Training_brain/exercise_cards/00_INDEX.md`, one entry per line of that
// index, in the index's own order. Nothing here is invented: `stationId`,
// `role`, `state` and `what` are the index's own four columns.
//
// CHANGE_REQUEST_013 v2 — the index of 23 September 2026. Q1 of
// APP_REPORT_013 is answered: the "fresh only" idea is withdrawn, every atom
// may be used in a cardio block (R-WS-29 v6), so the `freshOnly` field is
// gone. Added: S00_broad_jumps (role P, the power slot), S01_hill_sprints
// (role C) and S09_balance_ladder (role A, station 9). S10_block_switch_fresh
// is `both` since its v2 card (also used tired, in cardio).
//
// CHANGE_REQUEST_013 v5 — the index of 12 October 2026: five new cards (the
// park and the Tuesday) and three blocks (role D is a storm block). The blocks
// are cards too, so a block of the park weeks names its own card id.
//
// CHANGE_REQUEST_013 v6 — the index of 19 October 2026: the cards of week 7
// (the Luc Léger test, the backups B and C of the obstacle and the bench, the
// racket in balance and the 5 min racket course, the skipping EMOM 8) and the
// blocks ROUMI and BORDEAUX 10. Only the cards week 7 uses are added.
import type { CardRef } from '../coach/types';

export interface ExerciseCard {
  id: string;
  stationId: number;
  role: 'A' | 'C' | 'D' | 'P' | 'X';
  state: 'fresh' | 'fatigued' | 'both';
  label: string;
  what: string;
}

export const exerciseCards: ExerciseCard[] = [
  { id: 'S00_air_squats', stationId: 0, role: 'X', state: 'both', label: 'Air squats', what: '30 s ou 16 répétitions, atome de conditionnement' },
  { id: 'S00_jumping_jacks', stationId: 0, role: 'X', state: 'both', label: 'Jumping jacks', what: '30 s ou 30 répétitions, atome de conditionnement' },
  { id: 'S00_jump_squats', stationId: 0, role: 'X', state: 'both', label: 'Jump squats', what: '20 s ou 10 répétitions, atome de conditionnement' },
  { id: 'S00_half_burpees', stationId: 0, role: 'X', state: 'both', label: 'Demi-burpees', what: '20 s ou 8 répétitions, sans poitrine au sol' },
  { id: 'S00_high_knees', stationId: 0, role: 'X', state: 'both', label: 'Montées de genoux', what: '30 s ou 40 appuis, atome de conditionnement' },
  { id: 'S00_full_burpee', stationId: 0, role: 'C', state: 'both', label: 'Burpee complet', what: 'poitrine au sol, 6 à 15 par tour (Cross Ops p 45)' },
  { id: 'S00_bar_row', stationId: 0, role: 'C', state: 'both', label: 'Tirage sous une barre', what: 'sous une barre du parc, 6 à 12 ; remplace les espaliers et la corde' },
  { id: 'S00_luc_leger_test', stationId: 0, role: 'C', state: 'fresh', label: 'Test Luc Léger', what: 'navette 20 m continue et progressive, jusqu’au bout (S7 mercredi, une fois)' },
  { id: 'S00_low_lung_sprint', stationId: 0, role: 'C', state: 'fresh', label: 'Sprint poumons vides', what: '6 × 30 m après une expiration complète, le mardi' },
  { id: 'S00_broad_jumps', stationId: 0, role: 'P', state: 'fresh', label: 'Sauts en longueur', what: '3 ou 5 sauts, à la fin de chaque échauffement police' },
  { id: 'S01_slalom_18m', stationId: 1, role: 'A', state: 'fresh', label: 'Slalom 18 m', what: 'aller tout droit 18 m, slalom au retour, 10 × 25 s, 1 min de récupération' },
  { id: 'S01_carioca_footwork', stationId: 1, role: 'A', state: 'fresh', label: 'Carioca', what: 'pas croisés latéraux, parcours de 18 m, 10 × 20 s de récupération' },
  { id: 'S01_uphill_intervals', stationId: 1, role: 'C', state: 'fresh', label: 'Intervalles en côte', what: 'course en montée 1 min, descente en trottinant, 6 à 8 répétitions, 45 s de récupération' },
  { id: 'S01_hill_sprints', stationId: 1, role: 'C', state: 'fresh', label: 'Sprints en côte', what: '8 à 10 s en montée, retour en marchant, fin de la sortie du week-end, S7 à S10' },
  { id: 'S02_obstacle_wall_official', stationId: 2, role: 'A', state: 'both', label: 'Obstacle, mur du parc', what: 'mur à hauteur d’examen environ : marche → élan → rythme officiel × 3 à 5' },
  { id: 'S02_obstacle_backup_stairs', stationId: 2, role: 'C', state: 'both', label: 'Obstacle, backup B : escaliers', what: 'sauter 2 à 3 marches = 1 franchissement' },
  { id: 'S02_obstacle_backup_burpee_jump', stationId: 2, role: 'C', state: 'both', label: 'Obstacle, backup C : burpee + squat sauté', what: '1 burpee + 1 squat sauté = 1 franchissement' },
  { id: 'S03_ladder_climb_jump_finish', stationId: 3, role: 'A', state: 'fresh', label: 'Espaliers, monter et sauter', what: 'monter, descente normale, sauter les 3 derniers barreaux, 5 tours' },
  { id: 'S03_ladder_one_hand_object', stationId: 3, role: 'A', state: 'fresh', label: 'Espaliers, une main, objet', what: 'une main grimpe, ballon dans l’autre, même descente, 3 tours' },
  { id: 'S08_hand_then_chain', stationId: 8, role: 'A', state: 'fresh', label: 'Main gauche seule, puis enchaînement', what: 'main gauche seule, puis un enchaînement de dribble sur 3 cerceaux' },
  { id: 'S08_chain_out', stationId: 8, role: 'A', state: 'fresh', label: '5 cerceaux, ballon dans les bras', what: '5 cerceaux, pieds selon la couleur, ballon tenu dans les bras' },
  { id: 'S08_return_dribble_same_side', stationId: 8, role: 'A', state: 'fresh', label: 'Retour, dribble côté pied d’appui', what: 'trajet retour, dribble du côté du pied de réception' },
  { id: 'S09_balance_ladder', stationId: 9, role: 'A', state: 'both', label: 'Échelle d’équilibre', what: '4 × 1 min, une jambe → yeux fermés → ballon → planche ; les tails des semaines raquette' },
  { id: 'S09_bench_walk_with_ball', stationId: 9, role: 'A', state: 'both', label: 'Équilibre sur banc avec balle', what: 'muret du parc, échange de balles officiel' },
  { id: 'S09_bench_backup_rope_line', stationId: 9, role: 'A', state: 'both', label: 'Banc, backup B : la corde au sol', what: 'la corde posée au sol, échange et demi-tour' },
  { id: 'S09_bench_backup_one_leg_ball', stationId: 9, role: 'A', state: 'both', label: 'Banc, backup C : sur une jambe', what: 'sur une jambe, balle autour de la taille' },
  { id: 'S10_block_switch_fresh', stationId: 10, role: 'A', state: 'both', label: 'Corde, changement de bloc', what: '10 pieds joints, 5 à droite, 5 à gauche, ordre au hasard ; aussi en cardio' },
  { id: 'S10_skipping_emom_8', stationId: 10, role: 'A', state: 'both', label: 'Corde, EMOM 8', what: 'EMOM 8, une carte par minute, minutes propres' },
  { id: 'S10_single_foot_after_legs', stationId: 10, role: 'C', state: 'fatigued', label: 'Corde à cloche-pied après les jambes', what: 'corde à cloche-pied après un travail de jambes (non confirmée, inutilisable)' },
  { id: 'S11_racket_obstacles', stationId: 11, role: 'A', state: 'fresh', label: 'Raquette par-dessus les obstacles', what: '45 s à plat, 30 s d’obstacles, 45 s à plat' },
  { id: 'S11_racket_on_board', stationId: 11, role: 'A', state: 'fresh', label: 'Raquette sur la planche d’équilibre', what: 'balle sur la raquette, debout sur la planche d’équilibre' },
  { id: 'S11_racket_after_intervals', stationId: 11, role: 'C', state: 'fatigued', label: 'Raquette après un bloc dur', what: 'la même série que ci-dessus, après un bloc dur' },
  { id: 'S11_racket_balance_wall', stationId: 11, role: 'A', state: 'fresh', label: 'Raquette en équilibre', what: 'autour d’obstacles, puis le long d’un muret plat' },
  { id: 'S11_racket_course_5min', stationId: 11, role: 'A', state: 'both', label: 'Parcours raquette 5 min', what: '5 min de parcours continu, balles tombées comptées' },
  // Blocks (several atoms in one format).
  { id: 'BLK_will_10', stationId: 0, role: 'C', state: 'both', label: 'WILL 10', what: 'Cross Ops WILL 10, AMRAP 10 : 3 burpees · 10 pompes · 10 squats' },
  { id: 'BLK_roumi', stationId: 0, role: 'C', state: 'fatigued', label: 'ROUMI', what: 'Cross Ops ROUMI p 14, 10 tours chrono' },
  { id: 'BLK_acheron_park', stationId: 0, role: 'D', state: 'fatigued', label: 'ACHERON PARK', what: 'tempête, AMRAP 7 en échelle : slalom · obstacle · burpees 2-4-6-8…' },
  { id: 'BLK_death_by_obstacle', stationId: 2, role: 'D', state: 'fatigued', label: 'DEATH BY OBSTACLE', what: 'tempête, minute n = n franchissements + n burpees + n tirages, 7 min' },
  { id: 'BLK_bordeaux_10', stationId: 0, role: 'D', state: 'fatigued', label: 'BORDEAUX 10', what: 'la simulation du test, 2 tours chrono, cap 10' }
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
