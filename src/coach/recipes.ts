import type { SessionRecipe } from './types';

export const recipes: Record<string, SessionRecipe> = {
  crossfit: {
    id: 'crossfit-coached-v1', version: 1, kind: 'crossfit_class', title: 'CrossFit coaché',
    purpose: "Suivre le cours encadré du lundi. Le contenu est défini sur place par le coach et reste distinct de la séance personnelle en salle.",
    durationMin: null, equipment: ['Matériel prévu par le coach du cours.'], warmup: null, blocks: [], cooldown: null,
    // CHANGE_REQUEST_001 — R-WS-12, module B (rules / prohibited-actions recall).
    // Grounded in the official rule for station 3 (docs/police-v1/examples/police-stations.json).
    memory: { id: 'memory-crossfit-station3-rule', prompt: 'Au poste 3 (espaliers), quel geste est interdit en descente ?', answer: 'La « bascule » est interdite. La descente peut être normale en avant, en arrière, ou par saut.' }
  },
  coordination: {
    // CHANGE_REQUEST_001 — re-tagged from `police_balance_coordination` (removed
    // kind) to `police_technique`; reused as Tuesday's fresh-skill session
    // (cockpit decision, 13 Sep). Content and id unchanged.
    id: 'coordination-balance-v2', version: 2, kind: 'police_technique', title: 'Coordination & équilibre',
    purpose: 'Installer les automatismes des postes 8 à 11 avec précision et sans finisher intense.', durationMin: 40,
    equipment: ['Ballon de basket', 'repères colorés', 'corde à sauter', 'raquette et balle', 'appui stable'],
    warmup: '6 min : marche douce 2 min, mobilité des chevilles et épaules 2 min, puis pas lents avec arrêt stable 2 min.',
    blocks: [
      { title: 'Couleurs et ballon — 10 min', faire: 'Jaune : pieds joints sans dribble. Bleu : pied droit et main droite. Rouge : pied gauche et main gauche. Faire 4 × 45 s lentement, récupération 45 s. Commencer sans ballon et ajouter le dribble seulement après une séquence propre.', stationMappings: [8], approximation: true },
      { title: 'Équilibre et transfert — 8 min', faire: 'Près d’un appui stable, faire 3 × 20 s par jambe avec une portée avant puis latérale. Récupération 30 s. Ajouter 4 transferts d’un objet léger avec les deux pieds stables. Garder les yeux ouverts.', stationMappings: [9], approximation: true },
      { title: 'Corde : bon pied — 8 min', faire: 'Annoncer le motif et le pied de départ. Faire 4 × 20 s à rythme facile, récupération 40 s. Réinitialiser avant chaque bloc et reprendre seulement le bloc erroné.', stationMappings: [10], approximation: true }
    ],
    cooldown: '5 min : marche lente, mobilité douce des chevilles et relâchement des épaules.',
    memory: { id: 'memory-s8-blue', prompt: 'Au poste 8, quelle action correspond au bleu ?', answer: 'Pied droit et dribble de la main droite. Jaune : pieds joints sans dribble ; rouge : pied gauche et main gauche.' }
  },
  room: {
    // CHANGE_REQUEST_001 — re-tagged from `room_explosive_intervals` (removed
    // kind) to `police_integration`: its "micro-circuit police" block already
    // links stations 1, 2, 4, 5, 6 and 7 into one sequence (role D in
    // TRAINING_ENGINE.md). Content and id unchanged.
    id: 'room-explosive-v2', version: 2, kind: 'police_integration', title: 'Explosivité en salle',
    purpose: 'Répéter des efforts explosifs courts tout en gardant des appuis précis, des réceptions stables et un franchissement confiant.', durationMin: 40,
    equipment: ['Échelle d’agilité', 'repères au sol', 'ballon', 'box basse et stable si adaptée', 'équipement personnel confirmé'],
    warmup: '10 min : 4 min de marche active ou trot facile, 3 min de mobilité chevilles/hanches, puis 3 min de passages lents dans l’échelle et d’approches contrôlées.',
    blocks: [
      { title: 'Progression obstacle — 8 min', faire: 'Faire 3 approches avec arrêt contrôlé, puis 3 franchissements d’une limite au sol. Passer à un obstacle bas stable seulement si le geste reste confiant. Revenir au sol dès que l’hésitation perturbe le mouvement.', stationMappings: [2], approximation: true },
      { title: 'Micro-circuit police — 4 tours', faire: '10 s d’échelle, 10 s de franchissement contrôlé, puis 10–20 s de navette, poussée, tirage, traînage ou porté relié à un poste. Récupérer 120 s en marchant. Arrêter après deux répétitions consécutives plus lentes, instables ou techniquement incorrectes.', stationMappings: [1, 2, 4, 5, 6, 7], approximation: true }
    ],
    cooldown: '8 min : marche lente 5 min puis mobilité douce 3 min. Noter l’hésitation à la box et la qualité des appuis.',
    memory: { id: 'memory-s2-count', prompt: 'Au poste 2, combien de passages aller et retour faut-il mémoriser ?', answer: '5 allers avec le ballon et 4 retours à vide. Le travail proposé reste une approximation tant que l’obstacle officiel n’est pas vérifié.' }
  },
  outdoor: {
    // CHANGE_REQUEST_001 — re-tagged from `outdoor_explosive_intervals` (removed
    // kind) to `police_strength_transitions`: it is the hard conditioning
    // block of role C (power → conditioning → fatigue precision) in
    // TRAINING_ENGINE.md. Not used by the weekly generator by default in this
    // change request (see planner.ts); kept in the library as the floating
    // running-interval block CR-002 wires into every police session.
    id: 'outdoor-explosive-v2', version: 2, kind: 'police_strength_transitions', title: 'Intervalles en extérieur',
    purpose: 'Développer les accélérations répétées tout en préservant la posture, les appuis et le freinage.', durationMin: 35,
    equipment: ['Chaussures de course', 'chronomètre', 'terrain plat dégagé avec zone de ralentissement'],
    warmup: '12 min : 8 min de marche ou trot facile, 2 min de mobilité dynamique, puis 2 accélérations progressives de 10 s.',
    blocks: [{ title: '6 × 20 s vite / 80 s facile', faire: 'Courir vite mais sous la vitesse de sprint maximal pendant 20 s, puis marcher ou trottiner 80 s. Rester grand et ralentir progressivement. Écourter si la posture ou les appuis se dégradent.', stationMappings: [] }],
    cooldown: '10 min de marche ou trot très facile, sans cible de fréquence cardiaque.',
    // CHANGE_REQUEST_001 — R-WS-12, module C (fatigued recall). Reuses the
    // 5→6 alternation fact already established in the `technique` recipe below.
    memory: { id: 'memory-strength-s5-s6-fatigued', prompt: 'Sous fatigue, quel est l’ordre d’alternance à retenir entre les postes 5 et 6 ?', answer: '5 → 6 → 5 → 6 : pousser, trier et placer, tirer en retour, puis retirer et rapporter les objets.' }
  },
  // CHANGE_REQUEST_001 — kind unchanged (already `police_technique`); the
  // weekly generator uses `coordination` for the Tuesday technique slot from
  // 14 Sep on, so this recipe is now a library/bank entry, not scheduled by
  // default. Left in place for manual reuse.
  technique: {
    id: 'police-technique-v2', version: 2, kind: 'police_technique', title: 'Technique du circuit',
    purpose: 'Construire la confiance à l’obstacle et relier des gestes propres pour les postes de coordination, équilibre et précision.', durationMin: 45,
    equipment: ['Repères colorés', 'ballon de basket', 'raquette et balle', 'appui stable'],
    warmup: '6 min : marche active 2 min, mobilité douce 2 min, puis pas lents et arrêts stables 2 min.',
    blocks: [
      { title: 'Confiance obstacle — 10 min', faire: 'Faire 3 approches et arrêts à une ligne. Traverser un rectangle au sol avec le ballon, le poser puis revenir à vide : 5 allers et 4 retours, lentement. Passer à un obstacle bas seulement s’il est adapté et stable.', stationMappings: [2], approximation: true },
      { title: 'Coordination et précision — 14 min', faire: 'Faire 4 × 30 s de repères colorés, 4 × 30 s de marche tandem avec demi-tour, puis 4 × 30 s de balle centrée sur la raquette. Récupérer 30 s entre les passages.', details: 'Après une chute, reprendre au point de chute.', stationMappings: [8, 9, 11], approximation: true },
      { title: 'Relier les gestes — 8 min', faire: 'Faire 3 passages lents : courte séquence colorée, marche en ligne avec arrêt stable, puis quelques pas avec raquette et balle. Récupérer 60 s.', details: 'Cette liaison est une approximation du circuit.', stationMappings: [8, 9, 11], approximation: true }
    ],
    cooldown: '6 min : marche lente puis mobilité douce. Retenir un geste réussi et un point à reprendre.',
    memory: { id: 'memory-s5-s6', prompt: 'Quel est l’ordre d’alternance à retenir entre les postes 5 et 6 ?', answer: '5 → 6 → 5 → 6 : pousser, trier et placer, tirer en retour, puis retirer et rapporter les objets.' }
  },
  trailEvent: {
    id: 'trail-event-2026-10-11', version: 1, kind: 'trail_event', title: 'Trail — événement',
    purpose: 'Participer au trail prévu. Cet événement remplace l’unique course de la semaine.', durationMin: null,
    equipment: ['Équipement prévu pour l’événement'], warmup: null, blocks: [], cooldown: null
  },
  // CHANGE_REQUEST_001 — new recipe: the ordinary weekend run (R-WS-03/04/05),
  // distinct from `trailEvent` (the fixed 11 Oct race, R-WS-06). Run-only, no
  // police/balance/conditioning finisher (R-WS-04). Distance and D+ stay text
  // guidance for now — see APP_REPORT_001.md for the open question on
  // automatic week-to-week progression.
  trailMaintenance: {
    id: 'trail-maintenance-v1', version: 1, kind: 'trail_maintenance', title: 'Trail — sortie de maintien',
    purpose: 'Course de maintien, majoritairement facile, allure conversationnelle. Progresse de 7-8 km vers 12 km sans jamais dépasser 12 km / 450 m D+ par génération automatique (R-WS-05). Course uniquement : aucun travail police, équilibre ou conditioning attaché (R-WS-04).',
    durationMin: null,
    equipment: ['Chaussures de trail'],
    warmup: null,
    blocks: [{ title: 'Sortie facile', faire: 'Allure conversationnelle, majoritairement facile. Distance et dénivelé à confirmer selon la forme et la phase (7-8 km au départ, jusqu’à 12 km / 450 m D+ maximum).', stationMappings: [] }],
    cooldown: null
  },
  policeEvent: {
    id: 'police-event-2026-11-20', version: 1, kind: 'police_event', title: 'Concours de police',
    purpose: 'Jour du concours : exécuter le circuit proprement et avec confiance.', durationMin: null,
    equipment: ['Équipement demandé par l’organisation'], warmup: null, blocks: [], cooldown: null
  },
  // CHANGE_REQUEST_003 — Week 1 (7-13 Sep 2026) as trained/finalised, WEEK_1_FINAL v3.
  // Free text only, no exercise-card ids yet (CR-003 explicitly allows this).
  // Kind values corrected to their real SessionKind by CHANGE_REQUEST_001 (see
  // each recipe below); CR-003's original substitution is recorded in
  // APP_REPORT_003.md for history.
  week1Thu10Sep: {
    // CHANGE_REQUEST_001 — kind corrected to `police_strength_transitions` to
    // match handoffs/WEEK_1_FINAL_2026-09-07_to_13.md v3 verbatim ("Type:
    // `police_strength_transitions`"). Content, id and dates unchanged
    // (Week 1 stays frozen, R-WS-15).
    id: 'week1-thu-2026-09-10-as-trained', version: 1, kind: 'police_strength_transitions',
    title: 'Séance police, telle qu’entraînée (jeudi 10 sept.)',
    purpose: "Séance principale police modifiée sur le moment pour rester réaliste : jambes lourdes après lundi/mardi, box 20 pouces disponible, pas de rameur ni de kettlebell.",
    durationMin: 37,
    equipment: ['Corde à sauter', 'box en bois 20 pouces', 'raquette et balle'],
    warmup: null,
    blocks: [
      { title: 'Échauffement corde à sauter — 10 min', faire: '40 sauts pieds joints, puis 20 sauts sur chaque jambe = 1 tour (≈ 50 s). 4 tours.', stationMappings: [] },
      { title: 'Box jump, frais — 10 min', faire: 'Box en bois 20 pouces (≈ 0,51 m). Sauts vers une hauteur proche de la hanche, sans élan. Puis sauts en regardant au loin, pas la box.', stationMappings: [2], approximation: true },
      { title: 'Conditioning EMOM — 10 min', faire: 'Chaque minute : 10 burpees. Reste de la minute : équilibre sur un pied, en alternant le pied chaque minute.', details: 'Remplace l’EMOM prévu (burpees / rameur / kettlebell).', stationMappings: [9, 10, 11], approximation: true },
      { title: 'Raquette et balle, facile — 3 min', faire: 'Jeu d’équilibre facile avec la raquette et la balle, sol plat, pendant la récupération après l’EMOM.', noter: 'Aucun comptage de chutes n’a été enregistré : pas de référence fatiguée pour la semaine 1.', stationMappings: [11], approximation: true },
      { title: 'Corde EMOM — 4 min', faire: 'Chaque minute : 40 sauts libres, puis jeu de jambes en alternance pour le reste de la minute.', stationMappings: [] }
    ],
    cooldown: null
  },
  week1Fri11Sep: {
    id: 'week1-fri-2026-09-11-v3', version: 3, kind: 'police_technique',
    title: 'Technique police + AMRAP (version 3)',
    purpose: 'Confiance au poste 2, mémoire du circuit sans explication, référence précision fraîche, puis un seul bloc HIIT explosivité/stamina avant le retour au calme.',
    durationMin: 40,
    equipment: ['Échelle d’agilité', '5 balles de tennis', 'boîte de récupération', 'raquette et balle', 'repères colorés'],
    warmup: '5 min : marche, cercles de chevilles, cercles de hanches, rotations d’épaules, pas chassés contrôlés, 20 s de petits sauts au-dessus d’une ligne avant/arrière puis 20 s latéralement.',
    blocks: [
      { title: 'Mémoire du circuit — 4 min', short: 'mémoire', faire: 'Yeux fermés, visualiser la salle et parcourir le circuit mentalement, poste 1 à 11. Réciter les 11 postes dans l’ordre, à voix haute. Choisir 3 postes : dire l’action, la condition de fin, et le poste suivant.', details: 'Ne jamais demander d’explication.', stationMappings: [] },
      { title: 'Poste 2, franchissement à la balle de tennis — 8 min', short: 'poste 2', regle: 'Règle officielle (S1) : franchir l’obstacle avec une balle de tennis en main, la déposer dans la boîte rouge de l’autre côté, revenir sans balle ; 5 passages aller, 4 retour.', faire: '2 tours complets à allure marchée, puis 1 tour à allure trottinée, toujours propre. 60–90 s de récupération entre les tours.', stationMappings: [2], approximation: true },
      { title: 'Référence précision raquette-balle, fraîche — 5 min', short: 'raquette', faire: '3 × 1 min de marche avec la balle en équilibre au centre de la raquette, raquette tenue par le manche, main fermée. 30 s de récupération entre les tours.', details: 'Si la balle tombe, la ramasser et reprendre où elle est tombée.', noter: 'Référence autonome de la semaine 1 (pas de valeur fatiguée jeudi).', stationMappings: [11] },
      { title: 'AMRAP 10 min', short: 'AMRAP', faire: 'Autant de tours que possible en 10 minutes : 60 sauts à la corde, échelle aller-retour ×2, 10 jump squats (départ accroupi, saut le plus haut possible, réception accroupie, amortie avec tout le corps).', details: 'Arrêter le tour en cours si la descente d’échelle ou une réception devient imprécise. Pas de bascule sur l’échelle.', stationMappings: [2, 3], approximation: true },
      { title: 'Poste 8, couleurs sous fatigue — 5 min', short: 'poste 8', faire: 'Jaune : pieds joints. Bleu : pied droit et dire « main droite ». Rouge : pied gauche et dire « main gauche ». 3 × 45 s, 30 s de récupération.', stationMappings: [8], approximation: true }
    ],
    cooldown: '2 min de marche facile en repassant le circuit poste 1 à 11 dans la tête.',
    memory: { id: 'memory-week1-fri-circuit', prompt: 'Récite les 11 postes du circuit dans l’ordre, sans les expliquer.', answer: 'Visualise puis récite de mémoire ; vérifie ensuite avec la source officielle. Aucune explication n’est demandée, seulement la restitution.' }
  },
  week1Tue8Sep: {
    id: 'week1-tue-2026-09-08-as-trained', version: 1, kind: 'running_intervals_exception',
    title: 'Intervalles course (exception documentée)',
    purpose: 'Séance de course déjà réalisée le mardi, en exception documentée. Ne compte pas comme la course de la semaine (samedi).',
    durationMin: 47,
    equipment: ['Chaussures de course', 'chronomètre'],
    warmup: null,
    blocks: [
      { title: 'Échauffement course facile — 20 min', faire: 'Footing facile, allure conversationnelle.', stationMappings: [] },
      { title: '2 × 6 min à 6:00 min/km', faire: 'Deux intervalles de 6 minutes à 6:00 min/km.', noter: 'Récupération entre les deux non enregistrée.', stationMappings: [] },
      { title: 'Course facile — 15 min', faire: 'Footing facile pour terminer la séance.', stationMappings: [] }
    ],
    cooldown: null
  },
  week1Sat12Sep: {
    // CHANGE_REQUEST_001 — kind corrected to `trail_maintenance` to match
    // handoffs/WEEK_1_FINAL_2026-09-07_to_13.md v3 verbatim ("Saturday 12
    // September — Trail run (`trail_maintenance`)"). Content, id and dates
    // unchanged (Week 1 stays frozen, R-WS-15).
    id: 'week1-sat-2026-09-12-trail', version: 1, kind: 'trail_maintenance',
    title: 'Sortie trail de maintien (samedi 12 sept.)',
    purpose: 'Course facile de maintien. Course uniquement : pas de travail police, pas d’équilibre, pas de finisher de conditioning, pas d’intervalles.',
    durationMin: null,
    equipment: ['Chaussures de trail'],
    warmup: null,
    blocks: [
      { title: 'Sortie facile — ≈ 8 km, ≈ 150 m D+', faire: 'Allure conversationnelle, majoritairement facile.', stationMappings: [] }
    ],
    cooldown: null
  }
};

export const recipeById = Object.values(recipes).reduce<Record<string, SessionRecipe>>((result, recipe) => {
  result[recipe.id] = recipe;
  return result;
}, {});

// CHANGE_REQUEST_009 section B — day header flow strip. One node for the
// warmup, one per exercise block, one for the cooldown; each carries a
// minutes value pulled from its own text ("… — 8 min", "8 min : …") so the
// strip never needs a separate duration field to stay in sync with the text.
export interface FlowNode {
  label: string;
  minutes: number | null;
}

function minutesFromText(text: string): number | null {
  const match = text.match(/(\d+)\s*min/);
  return match ? Number(match[1]) : null;
}

function defaultShortLabel(title: string): string {
  return title.split(' ').slice(0, 2).join(' ').replace(/[,.;:]+$/, '');
}

export function flowStrip(recipe: SessionRecipe): FlowNode[] {
  const nodes: FlowNode[] = [];
  if (recipe.warmup) {
    nodes.push({ label: 'échauffement', minutes: minutesFromText(recipe.warmup) });
  }
  for (const block of recipe.blocks) {
    nodes.push({ label: block.short ?? defaultShortLabel(block.title), minutes: minutesFromText(block.title) });
  }
  if (recipe.cooldown) {
    nodes.push({ label: 'calme', minutes: minutesFromText(recipe.cooldown) });
  }
  return nodes;
}
