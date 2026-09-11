# État réel du dépôt

## Spécification Coach Concours mise à jour le 7 septembre 2026

La logique cible documentée compte cinq jours : CrossFit le lundi, une séance explosive
personnelle prescrite dans la salle CrossFit un autre jour, une séance d'intervalles
explosifs dehors, une séance ateliers/circuit et une séance équilibre/coordination.
L'explosivité sous fréquence cardiaque élevée est une faiblesse prioritaire. L'échelle
d'agilité et la grande box sont confirmées disponibles. Cette décision est spécifiée mais
son implémentation V2 reste à réaliser.

Date : 11 août 2026.

## Implémenté

- structure React 19, TypeScript et Vite ;
- manifeste d'application web progressive et icônes ;
- routeur à fragments compatible GitHub Pages ;
- état global et persistance IndexedDB ;
- profil, objectif et données de démonstration ;
- génération de plan de 1 à 24 semaines, y compris en milieu de semaine ;
- course objectif identifiée et protégée ;
- tableau de bord, plan, séance, activités et réglages ;
- renforcement à domicile, au poids du corps et sans matériel ;
- aide pratique pour construire le dénivelé via un profil altimétrique ou des répétitions de côte ;
- 1 065 itinéraires pédestres officiels SuisseMobile synchronisés localement, dont 650 départs actuellement vérifiés par la géométrie officielle, classés selon la séance, avec Lausanne par défaut et filtre régional ;
- page Parcours classée par distance au point de départ, avec localisation à la demande, filtres de longueur et affichage progressif ;
- clôture de séance, versionnement et ressenti ;
- import manuel et démonstration Garmin ;
- export Claude JSON et Markdown avec historique récent et séances futures ;
- schéma et moteur d'adaptation avec validation sémantique ;
- garde-fous distance, dénivelé, qualité et sortie longue ;
- revalidation de l'adaptation au moment de l'application ;
- client Google Identity et Drive avec file de synchronisation ;
- schéma d'adaptation synchronisé dans Drive ;
- archivage individuel des feedbacks d'entraînement ;
- préservation d'une proposition Claude réelle ;
- feedback produit avec capture et contexte de fonctionnalité ;
- contrat Garmin avec validation de réponse ;
- tests unitaires du domaine ;
- schémas JSON et exemples ;
- documentation, contrôles de dépôt et workflows GitHub.

## Validé dans Codex le 11 août 2026

- installation réelle des dépendances et génération de `package-lock.json` ;
- validation structurelle du dépôt et des trois schémas JSON ;
- compilation TypeScript stricte avec les déclarations réelles ;
- 43 tests Vitest réussis dans 13 fichiers, dont le catalogue officiel SuisseMobile, le classement géographique, la persistance immédiate, la protection complète du jour de course, la page Parcours, l'onboarding, la clôture d'une séance, l'import d'une adaptation et la revalidation d'un aperçu devenu obsolète ;
- build Vite de production et génération du service worker de l'application web progressive ;
- parcours de démonstration vérifié dans le build de production à 393 × 852 pixels CSS sur onboarding, tableau de bord, plan, clôture d'une séance, activités, réglages et feedback ;
- séance du jour enregistrée avec distance, durée, dénivelé, fréquence cardiaque, effort et commentaire ; activité et ressenti créés, progression hebdomadaire actualisée ;
- persistance locale vérifiée après rechargement ;
- absence de défilement horizontal et d'erreur ou avertissement dans la console pendant ce parcours ;
- cible tactile du bouton Feedback portée et vérifiée à 44 pixels de haut.
- validation HTML native désactivée sur les trois formulaires métier afin que les erreurs contrôlées par l'application restent explicites et en français.
- catalogue SuisseMobile de 1 065 itinéraires synchronisé en français, fiche officielle vérifiée et affichage sans débordement à 393 × 852 pixels CSS.
- page Parcours vérifiée à 393 × 852 pixels CSS avec filtre de longueur, passage de 20 à 40 résultats et aucune erreur navigateur ;
- les parcours sans géométrie officielle disponible sont affichés avec une distance inconnue plutôt qu'une proximité inventée.

La commande de référence `npm run check` réussit intégralement.

## Validé auparavant dans l'environnement de génération

- documents JSON et métaschémas des trois schémas ;
- exemples d'adaptation ;
- compilation TypeScript stricte du domaine pur ;
- compilation TypeScript stricte de l'ensemble avec déclarations simulées ;
- scénarios d'exécution du moteur, des adaptations et du protocole Drive ;
- protection de la course objectif ;
- refus des adaptations obsolètes et des plages d'allure inversées ;
- avertissements de distance et de dénivelé ;
- archivage Drive et préservation d'une proposition Claude ;
- intégrité structurelle du dépôt.

Les commandes, résultats et limites exactes sont consignés dans [`../VALIDATION_REPORT.md`](../VALIDATION_REPORT.md).

## Encore à valider

- installation et comportement hors ligne depuis l'écran d'accueil d'un iPhone 14 Pro réel ;
- build et déploiement via le workflow GitHub Pages ;
- intégrations réelles nécessitant les comptes externes ci-dessous.

## Bloqué par des comptes externes

- client OAuth Google réel ;
- test de synchronisation sur un Drive réel ;
- test du connecteur Claude ;
- approbation et identifiants Garmin ;
- test physique iPhone 14 Pro ;
- paramètres GitHub Pages du futur dépôt.

## Risques prioritaires à vérifier

1. Comportement de Google Identity Services sur GitHub Pages et Safari iOS.
2. Quota IndexedDB pour les captures.
3. Fiabilité de la capture Document Object Model sur Safari iOS.
4. Capacités d'écriture du connecteur Google Drive disponible dans Claude.
5. Qualité réelle du moteur d'entraînement après plusieurs semaines d'usage.
