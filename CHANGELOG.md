# Journal des changements

Les changements notables sont documentés ici.

## Non publié

### Ajouté

- Nouvelle logique Coach Concours : CrossFit le lundi, une séance explosive personnelle
  prescrite dans la salle un autre jour, une séance d'intervalles dehors, une séance
  ateliers/circuit et une séance équilibre/coordination.
- Référentiel d'exercices explosifs avec échelle d'agilité, grande box, accélérations,
  récupération, qualité du mouvement et suivi facultatif de la fréquence cardiaque.

- Synchronisation de la base officielle de 1 065 itinéraires pédestres SuisseMobile, stockée localement pour rester rapide et disponible hors ligne.
- Suggestions classées par distance et D+ depuis les parcours officiels, avec filtre régional et Lausanne par défaut.
- Page Parcours dédiée : tri des 1 065 itinéraires par proximité avec la position actuelle, Lausanne comme point de secours, filtres de longueur et affichage progressif par lots de 20.
- Verrouillage reproductible des dépendances avec `package-lock.json`.
- Test d'intégration du contexte applicatif couvrant le refus d'une adaptation devenue obsolète après sa prévisualisation.
- Tests d'interface couvrant l'onboarding, la clôture d'une séance et l'import puis l'application d'une adaptation JSON.

### Corrigé

- Les distances affichées depuis l’utilisateur reposent maintenant sur le vrai point de départ fourni par la géométrie officielle ; les parcours non encore géolocalisés indiquent « Distance inconnue » au lieu d’utiliser un point générique.
- La course objectif ne peut plus être écrasée par un déplacement, un remplacement ou une modification manuelle d’une autre séance.
- Chaque modification est immédiatement sauvegardée dans le secours local avant l’écriture IndexedDB, et le chargement choisit la copie la plus récente.
- Un échec de lecture du stockage ne laisse plus l’application bloquée sur son écran de chargement.
- La navigation remet chaque page en haut, le compteur hebdomadaire inclut correctement les séances ignorées et la connexion Drive reste désactivée tant qu’aucun client Google n’est configuré.
- Une ancienne copie de secours locale gagne désormais les égalités d’horodatage, et une erreur de chargement protège les données existantes au lieu de sauvegarder un état vide.
- « Toute la Suisse » inclut aussi les parcours sans géométrie encore disponible, et une session Drive expirée revient à l’état déconnecté pour permettre la reconnexion.
- Les suggestions de trails n’inventent plus de boucles : elles proviennent uniquement du catalogue officiel SuisseMobile.
- Cible tactile du bouton Feedback portée à 44 pixels sur mobile.
- Validation des formulaires confiée aux règles françaises de l'application, sans interception silencieuse par les messages natifs du navigateur.
- Annonce du résultat d'ajout manuel d'une activité aux technologies d'assistance.
- Séances de renforcement reformulées pour être réalisables à domicile, au poids du corps et sans matériel.
- Ajout d'une aide dans les séances avec dénivelé : lecture du profil altimétrique, exemple de répétitions de côte et priorité donnée à la durée et à l'effort plutôt qu'à un D+ exact.

### Validé

- Contrôle complet du dépôt, 43 tests Vitest dans 13 fichiers et build de production réussis avec les dépendances réelles.
- 650 départs officiels géolocalisés sans coordonnée invalide ; les 415 autres restent consultables sans faux calcul de proximité et seront complétés par les prochaines synchronisations.
- Catalogue officiel et filtre régional vérifiés dans le build à 393 × 852 pixels CSS ; ouverture de la fiche SuisseMobile conforme.
- Page Parcours vérifiée à 393 × 852 pixels CSS : navigation, filtre de longueur, chargement progressif et absence de débordement ou d’erreur navigateur.
- Parcours de démonstration complet vérifié dans le build de production à 393 × 852 pixels CSS, jusqu'à la création de l'activité et du ressenti, sans défilement horizontal ni erreur navigateur.

## [0.1.0] — 2026-08-10

### Ajouté

- Squelette React, TypeScript et Vite mobile-first.
- Application web progressive avec manifeste et icônes.
- Profil personnel et objectif unique trail court ou progression générale.
- Moteur déterministe avec phases base, construction, pic et allègement.
- Tableau de bord, plan hebdomadaire, détail de séance, activités et réglages.
- Saisie d'une activité et d'un ressenti effort 1–5.
- Stockage local IndexedDB avec secours localStorage sans captures.
- Export JSON et Markdown pour Claude, avec séances récentes et quatre semaines à venir.
- Protocole d'adaptation versionné, validation Zod et avertissements de sécurité.
- Protection de la course objectif contre le déplacement manuel et les adaptations externes.
- Garde-fous sur la distance, le dénivelé positif, les séances de qualité et la sortie longue.
- Validation sémantique des plages d'allure et réattribution locale des identifiants de segments externes.
- Connexion Google OAuth et synchronisation Google Drive avec `drive.file`.
- Archivage individuel des ressentis d'entraînement en JSON et Markdown.
- Préservation d'une proposition Claude réelle lors des synchronisations ; seul le modèle vide est actualisé.
- Feedback produit par écran ou bloc fonctionnel avec capture et contexte technique.
- Adaptateurs Garmin de démonstration et pont officiel futur, avec validation de la réponse du pont.
- Schémas JSON, exemples, tests unitaires, documentation Codex et workflows GitHub.

### Corrigé

- Aucune séance n'est générée avant la date de départ lorsque le plan commence en milieu de semaine.
- La date de fin d'un plan de course correspond exactement à la course et aucune séance n'est créée après celle-ci.
- Terminer ou ignorer une séance incrémente la version du plan afin d'invalider les adaptations Claude obsolètes.
- Une adaptation prévisualisée est revalidée au moment exact de son application pour éviter d'écraser une modification locale plus récente.
- Les synchronisations Drive sont mises en file afin d'éviter les créations concurrentes de dossiers ou de fichiers.
- Le chargeur Google Identity peut expirer proprement et être relancé après un échec.
