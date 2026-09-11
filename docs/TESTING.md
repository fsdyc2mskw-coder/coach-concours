# Stratégie de test

## Commandes de référence

```bash
npm run validate:schemas
npm run typecheck
npm run test
npm run build
```

`package-lock.json` a été généré le 10 août 2026 avec les dépendances réelles. La commande `npm run check` réussit intégralement : validation du dépôt et des schémas, TypeScript strict, 29 tests Vitest dans 8 fichiers et build Vite de production.

Le détail des contrôles déjà effectués se trouve dans [`../VALIDATION_REPORT.md`](../VALIDATION_REPORT.md).

## Niveaux

### Validation des schémas

`scripts/validate-schemas.mjs` vérifie que chaque fichier `schemas/*.json` est un document JSON valide et contient les champs de base attendus. La validation du livrable contrôle aussi les métaschémas et les exemples. Les tests de domaine valident ensuite le comportement Zod et les règles sémantiques.

### Tests unitaires du domaine

Vitest couvre en priorité :

- durée et génération d'un plan ;
- démarrage en milieu de semaine sans séance passée ;
- date exacte de course et protection de la course objectif ;
- historique récent ;
- déplacement, achèvement et annulation avec versionnement ;
- application d'une adaptation ;
- refus d'une version incompatible ou d'une séance déjà traitée ;
- refus des opérations contradictoires et des plages d'allure inversées ;
- réattribution des identifiants de segments externes ;
- avertissements de distance, dénivelé, qualité et sortie longue ;
- exports JSON et Markdown ;
- protocole Drive, archivage des feedbacks, synchronisation du schéma et préservation d'une proposition Claude réelle.

Toute correction d'un défaut métier doit commencer par un test qui échoue.

### Tests de composants

À compléter pendant M0 :

- onboarding ;
- affichage d'une séance ;
- formulaire de clôture ;
- aperçu puis invalidation d'une adaptation devenue obsolète ;
- feedback sans capture ;
- erreurs Google.

Utiliser Testing Library et tester les comportements visibles plutôt que les détails internes.

### Test navigateur

À ajouter avec Playwright après le premier build stable :

1. charger la démonstration ;
2. vérifier qu'aucune séance ne précède la date de création ;
3. ouvrir la séance du jour ;
4. la terminer avec un ressenti ;
5. vérifier l'activité et le changement de version ;
6. exporter le contexte ;
7. importer un exemple d'adaptation ;
8. modifier localement le plan et vérifier que l'ancien aperçu est refusé ;
9. appliquer une adaptation à jour ;
10. soumettre un feedback produit avec contexte de fonctionnalité ;
11. recharger et vérifier la persistance.

### Tests manuels iPhone

Sur iPhone 14 Pro :

- Safari en portrait ;
- ajout à l'écran d'accueil ;
- lancement plein écran ;
- utilisation hors ligne après premier chargement ;
- clavier sur chaque formulaire ;
- zones sûres ;
- rotation involontaire ;
- capture de feedback ;
- connexion Google ;
- reconnexion après expiration ;
- reprise après mise à jour.

## Données de test

Utiliser uniquement des données fictives ou anonymisées dans le dépôt. Aucun export Garmin réel, e-mail personnel, identifiant Drive ou capture personnelle ne doit être commité.

## Propriétés à préserver

Pour le moteur de plan :

- aucune distance ou durée négative ;
- toutes les séances restent dans la période ;
- aucune séance ne précède `startDate` ;
- les semaines sont ordonnées ;
- tous les identifiants de séance d'une semaine existent ;
- la course se trouve à la bonne date et correspond à `goalWorkoutId` ;
- les objectifs hebdomadaires correspondent aux séances actives ;
- une adaptation invalide ne modifie jamais le plan d'origine ;
- une adaptation obsolète ne peut pas remplacer un état local plus récent.

## Critère d'intégration continue

Une demande de fusion est bloquée si l'une des étapes échoue. Le déploiement GitHub Pages dépend du même ensemble de contrôles.
