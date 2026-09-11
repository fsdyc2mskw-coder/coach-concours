import type { SessionRecipe } from './types';

export const recipes: Record<string, SessionRecipe> = {
  crossfit: {
    id: 'crossfit-coached-v1', version: 1, kind: 'crossfit_class', title: 'CrossFit coaché',
    purpose: "Suivre le cours encadré du lundi. Le contenu est défini sur place par le coach et reste distinct de la séance personnelle en salle.",
    durationMin: null, equipment: ['Matériel prévu par le coach du cours.'], warmup: null, blocks: [], cooldown: null
  },
  coordination: {
    id: 'coordination-balance-v2', version: 2, kind: 'police_balance_coordination', title: 'Coordination & équilibre',
    purpose: 'Installer les automatismes des postes 8 à 11 avec précision et sans finisher intense.', durationMin: 40,
    equipment: ['Ballon de basket', 'repères colorés', 'corde à sauter', 'raquette et balle', 'appui stable'],
    warmup: '6 min : marche douce 2 min, mobilité des chevilles et épaules 2 min, puis pas lents avec arrêt stable 2 min.',
    blocks: [
      { title: 'Couleurs et ballon — 10 min', prescription: 'Jaune : pieds joints sans dribble. Bleu : pied droit et main droite. Rouge : pied gauche et main gauche. Faire 4 × 45 s lentement, récupération 45 s. Commencer sans ballon et ajouter le dribble seulement après une séquence propre.', stationMappings: [8], approximation: true },
      { title: 'Équilibre et transfert — 8 min', prescription: 'Près d’un appui stable, faire 3 × 20 s par jambe avec une portée avant puis latérale. Récupération 30 s. Ajouter 4 transferts d’un objet léger avec les deux pieds stables. Garder les yeux ouverts.', stationMappings: [9], approximation: true },
      { title: 'Corde : bon pied — 8 min', prescription: 'Annoncer le motif et le pied de départ. Faire 4 × 20 s à rythme facile, récupération 40 s. Réinitialiser avant chaque bloc et reprendre seulement le bloc erroné.', stationMappings: [10], approximation: true }
    ],
    cooldown: '5 min : marche lente, mobilité douce des chevilles et relâchement des épaules.',
    memory: { id: 'memory-s8-blue', prompt: 'Au poste 8, quelle action correspond au bleu ?', answer: 'Pied droit et dribble de la main droite. Jaune : pieds joints sans dribble ; rouge : pied gauche et main gauche.' }
  },
  room: {
    id: 'room-explosive-v2', version: 2, kind: 'room_explosive_intervals', title: 'Explosivité en salle',
    purpose: 'Répéter des efforts explosifs courts tout en gardant des appuis précis, des réceptions stables et un franchissement confiant.', durationMin: 40,
    equipment: ['Échelle d’agilité', 'repères au sol', 'ballon', 'box basse et stable si adaptée', 'équipement personnel confirmé'],
    warmup: '10 min : 4 min de marche active ou trot facile, 3 min de mobilité chevilles/hanches, puis 3 min de passages lents dans l’échelle et d’approches contrôlées.',
    blocks: [
      { title: 'Progression obstacle — 8 min', prescription: 'Faire 3 approches avec arrêt contrôlé, puis 3 franchissements d’une limite au sol. Passer à un obstacle bas stable seulement si le geste reste confiant. Revenir au sol dès que l’hésitation perturbe le mouvement.', stationMappings: [2], approximation: true },
      { title: 'Micro-circuit police — 4 tours', prescription: '10 s d’échelle, 10 s de franchissement contrôlé, puis 10–20 s de navette, poussée, tirage, traînage ou porté relié à un poste. Récupérer 120 s en marchant. Arrêter après deux répétitions consécutives plus lentes, instables ou techniquement incorrectes.', stationMappings: [1, 2, 4, 5, 6, 7], approximation: true }
    ],
    cooldown: '8 min : marche lente 5 min puis mobilité douce 3 min. Noter l’hésitation à la box et la qualité des appuis.',
    memory: { id: 'memory-s2-count', prompt: 'Au poste 2, combien de passages aller et retour faut-il mémoriser ?', answer: '5 allers avec le ballon et 4 retours à vide. Le travail proposé reste une approximation tant que l’obstacle officiel n’est pas vérifié.' }
  },
  outdoor: {
    id: 'outdoor-explosive-v2', version: 2, kind: 'outdoor_explosive_intervals', title: 'Intervalles en extérieur',
    purpose: 'Développer les accélérations répétées tout en préservant la posture, les appuis et le freinage.', durationMin: 35,
    equipment: ['Chaussures de course', 'chronomètre', 'terrain plat dégagé avec zone de ralentissement'],
    warmup: '12 min : 8 min de marche ou trot facile, 2 min de mobilité dynamique, puis 2 accélérations progressives de 10 s.',
    blocks: [{ title: '6 × 20 s vite / 80 s facile', prescription: 'Courir vite mais sous la vitesse de sprint maximal pendant 20 s, puis marcher ou trottiner 80 s. Rester grand et ralentir progressivement. Écourter si la posture ou les appuis se dégradent.', stationMappings: [] }],
    cooldown: '10 min de marche ou trot très facile, sans cible de fréquence cardiaque.'
  },
  technique: {
    id: 'police-technique-v2', version: 2, kind: 'police_technique', title: 'Technique du circuit',
    purpose: 'Construire la confiance à l’obstacle et relier des gestes propres pour les postes de coordination, équilibre et précision.', durationMin: 45,
    equipment: ['Repères colorés', 'ballon de basket', 'raquette et balle', 'appui stable'],
    warmup: '6 min : marche active 2 min, mobilité douce 2 min, puis pas lents et arrêts stables 2 min.',
    blocks: [
      { title: 'Confiance obstacle — 10 min', prescription: 'Faire 3 approches et arrêts à une ligne. Traverser un rectangle au sol avec le ballon, le poser puis revenir à vide : 5 allers et 4 retours, lentement. Passer à un obstacle bas seulement s’il est adapté et stable.', stationMappings: [2], approximation: true },
      { title: 'Coordination et précision — 14 min', prescription: 'Faire 4 × 30 s de repères colorés, 4 × 30 s de marche tandem avec demi-tour, puis 4 × 30 s de balle centrée sur la raquette. Récupérer 30 s entre les passages. Après une chute, reprendre au point de chute.', stationMappings: [8, 9, 11], approximation: true },
      { title: 'Relier les gestes — 8 min', prescription: 'Faire 3 passages lents : courte séquence colorée, marche en ligne avec arrêt stable, puis quelques pas avec raquette et balle. Récupérer 60 s. Cette liaison est une approximation du circuit.', stationMappings: [8, 9, 11], approximation: true }
    ],
    cooldown: '6 min : marche lente puis mobilité douce. Retenir un geste réussi et un point à reprendre.',
    memory: { id: 'memory-s5-s6', prompt: 'Quel est l’ordre d’alternance à retenir entre les postes 5 et 6 ?', answer: '5 → 6 → 5 → 6 : pousser, trier et placer, tirer en retour, puis retirer et rapporter les objets.' }
  },
  trailEvent: {
    id: 'trail-event-2026-10-11', version: 1, kind: 'trail_event', title: 'Trail — événement',
    purpose: 'Participer au trail prévu. Cet événement remplace l’unique course de la semaine.', durationMin: null,
    equipment: ['Équipement prévu pour l’événement'], warmup: null, blocks: [], cooldown: null
  },
  policeEvent: {
    id: 'police-event-2026-11-20', version: 1, kind: 'police_event', title: 'Concours de police',
    purpose: 'Jour du concours : exécuter le circuit proprement et avec confiance.', durationMin: null,
    equipment: ['Équipement demandé par l’organisation'], warmup: null, blocks: [], cooldown: null
  },
  // CHANGE_REQUEST_003 — Week 1 (7-13 Sep 2026) as trained/finalised, WEEK_1_FINAL v3.
  // `police_strength_transitions` and `trail_maintenance` are not yet real SessionKind
  // values (that is CR-001); substituted below with the closest existing kind and noted
  // in APP_REPORT_003. Free text only, no exercise-card ids yet (CR-003 explicitly allows this).
  week1Thu10Sep: {
    id: 'week1-thu-2026-09-10-as-trained', version: 1, kind: 'room_explosive_intervals',
    title: 'Séance police, telle qu’entraînée (jeudi 10 sept.)',
    purpose: "Séance principale police modifiée sur le moment pour rester réaliste : jambes lourdes après lundi/mardi, box 20 pouces disponible, pas de rameur ni de kettlebell.",
    durationMin: 37,
    equipment: ['Corde à sauter', 'box en bois 20 pouces', 'raquette et balle'],
    warmup: null,
    blocks: [
      { title: 'Échauffement corde à sauter — 10 min', prescription: '40 sauts pieds joints, puis 20 sauts sur chaque jambe = 1 tour (≈ 50 s). 4 tours.', stationMappings: [] },
      { title: 'Box jump, frais — 10 min', prescription: 'Box en bois 20 pouces (≈ 0,51 m). Sauts vers une hauteur proche de la hanche, sans élan. Puis sauts en regardant au loin, pas la box.', stationMappings: [2], approximation: true },
      { title: 'Conditioning EMOM — 10 min', prescription: 'Chaque minute : 10 burpees. Reste de la minute : équilibre sur un pied, en alternant le pied chaque minute. Remplace l’EMOM prévu (burpees / rameur / kettlebell).', stationMappings: [9, 10, 11], approximation: true },
      { title: 'Raquette et balle, facile — 3 min', prescription: 'Jeu d’équilibre facile avec la raquette et la balle, sol plat, pendant la récupération après l’EMOM. Aucun comptage de chutes n’a été enregistré : pas de référence fatiguée pour la semaine 1.', stationMappings: [11], approximation: true },
      { title: 'Corde EMOM — 4 min', prescription: 'Chaque minute : 40 sauts libres, puis jeu de jambes en alternance pour le reste de la minute.', stationMappings: [] }
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
      { title: 'Mémoire du circuit — 4 min', prescription: 'Yeux fermés, visualiser la salle et parcourir le circuit mentalement, poste 1 à 11. Réciter les 11 postes dans l’ordre, à voix haute. Choisir 3 postes : dire l’action, la condition de fin, et le poste suivant. Ne jamais demander d’explication.', stationMappings: [] },
      { title: 'Poste 2, franchissement à la balle de tennis — 8 min', prescription: 'Règle officielle (S1) : franchir l’obstacle avec une balle de tennis en main, la déposer dans la boîte rouge de l’autre côté, revenir sans balle ; 5 passages aller, 4 retour. 2 tours complets à allure marchée, puis 1 tour à allure trottinée, toujours propre. 60–90 s de récupération entre les tours.', stationMappings: [2], approximation: true },
      { title: 'Référence précision raquette-balle, fraîche — 5 min', prescription: '3 × 1 min de marche avec la balle en équilibre au centre de la raquette, raquette tenue par le manche, main fermée. 30 s de récupération entre les tours. Si la balle tombe, la ramasser et reprendre où elle est tombée. Référence autonome de la semaine 1 (pas de valeur fatiguée jeudi).', stationMappings: [11] },
      { title: 'AMRAP 10 min', prescription: 'Autant de tours que possible en 10 minutes : 60 sauts à la corde, échelle aller-retour ×2, 10 jump squats (départ accroupi, saut le plus haut possible, réception accroupie, amortie avec tout le corps). Arrêter le tour en cours si la descente d’échelle ou une réception devient imprécise. Pas de bascule sur l’échelle.', stationMappings: [2, 3], approximation: true },
      { title: 'Poste 8, couleurs sous fatigue — 5 min', prescription: 'Jaune : pieds joints. Bleu : pied droit et dire « main droite ». Rouge : pied gauche et dire « main gauche ». 3 × 45 s, 30 s de récupération.', stationMappings: [8], approximation: true }
    ],
    cooldown: '2 min de marche facile en repassant le circuit poste 1 à 11 dans la tête.',
    memory: { id: 'memory-week1-fri-circuit', prompt: 'Récite les 11 postes du circuit dans l’ordre, sans les expliquer.', answer: 'Visualise puis récite de mémoire ; vérifie ensuite avec la source officielle. Aucune explication n’est demandée, seulement la restitution.' }
  },
  week1Sat12Sep: {
    id: 'week1-sat-2026-09-12-trail', version: 1, kind: 'trail_event',
    title: 'Sortie trail de maintien (samedi 12 sept.)',
    purpose: 'Course facile de maintien. Course uniquement : pas de travail police, pas d’équilibre, pas de finisher de conditioning, pas d’intervalles.',
    durationMin: null,
    equipment: ['Chaussures de trail'],
    warmup: null,
    blocks: [
      { title: 'Sortie facile — ≈ 8 km, ≈ 150 m D+', prescription: 'Allure conversationnelle, majoritairement facile.', stationMappings: [] }
    ],
    cooldown: null
  }
};

export const recipeById = Object.values(recipes).reduce<Record<string, SessionRecipe>>((result, recipe) => {
  result[recipe.id] = recipe;
  return result;
}, {});
