# Modèle de données

## Conventions

| Donnée | Unité ou format |
|---|---|
| Date métier | `YYYY-MM-DD` dans le fuseau Europe/Zurich |
| Instant de journalisation | ISO 8601 en temps universel coordonné |
| Distance d'activité | mètre |
| Distance planifiée | kilomètre |
| Durée d'activité | seconde |
| Durée planifiée | minute |
| Allure | seconde par kilomètre |
| Dénivelé positif | mètre |
| Fréquence cardiaque | battement par minute |
| Ressenti d'effort | entier de 1 à 5 |

Les suffixes des propriétés rendent l'unité explicite : `distanceM`, `plannedDistanceKm`, `durationSec`, `plannedDurationMin`, `averageHeartRateBpm`.

## Racine `AppState`

`AppState` porte `schemaVersion: 1` et contient :

- `profile` ;
- `goal` ;
- `plan` ;
- `activities` ;
- `sessionFeedback` ;
- `appFeedback` ;
- `settings` ;
- états de synchronisation Drive et Garmin ;
- dernière erreur technique.

## Entités

### `AthleteProfile`

Profil unique `id: "me"`. Les paramètres initiaux sont modifiables seulement par régénération dans le premier produit minimum viable.

### `TrainingGoal`

Un seul objectif actif. `kind` vaut `race` ou `progression`. Les champs de course sont facultatifs dans le type, mais l'interface les exige pour `race`.

### `TrainingPlan`

Plan versionné contenant :

- identifiant stable du plan ;
- version entière incrémentée à chaque changement pertinent, y compris déplacement, fin, annulation et adaptation ;
- version de l'algorithme ;
- identifiant de l'objectif ;
- `goalWorkoutId` facultatif, présent pour identifier et protéger la course objectif ;
- dates de début et de fin ;
- semaines ;
- séances triées par date.

Une régénération crée un nouvel identifiant et repart à la version 1. Pour un plan de course, `endDate` est la date exacte de course.

### `PlannedWorkout`

Une séance possède :

- date et type ;
- texte de présentation et justification ;
- durée, distance et dénivelé prévus ;
- cible d'allure ;
- segments ;
- statut ;
- source `rules` ou `claude` ;
- lien facultatif vers l'activité réalisée.

Les identifiants de segments provenant d'un fichier externe sont remplacés au moment de l'application afin de rester sous le contrôle de l'application.

### `Activity`

Activité réelle normalisée depuis Garmin, une saisie manuelle ou les données de démonstration. `externalId` sert à la déduplication lorsqu'il existe.

### `SessionFeedback`

Associe la séance, l'activité éventuelle, l'effort de 1 à 5 et le commentaire. Chaque ressenti synchronisé est aussi archivé individuellement sur Drive en JSON et Markdown.

### `AppFeedback`

Retour sur le produit. La capture est conservée comme Data URL localement et téléversée séparément sur Drive.

## Synchronisation

`syncStatus` vaut :

- `local` ;
- `pending` ;
- `synced` ;
- `error`.

Le code actuel crée les nouveaux feedbacks en `pending` et les marque `synced` après une synchronisation Drive réussie. Les écritures Drive sont sérialisées dans une file locale afin d'éviter les créations concurrentes.

## Export Claude

Le contexte exporté contient :

- profil et objectif ;
- identifiant, version et version d'algorithme du plan ;
- `goalWorkoutId` lorsqu'une course existe ;
- séances du plan réalisées ou manquées pendant les 14 derniers jours ;
- séances futures planifiées pendant les 28 prochains jours ;
- activités des 42 derniers jours ;
- ressentis des 42 derniers jours ;
- feedbacks produit sans image incorporée.

Le Markdown est lisible. Le JSON est la source exacte des identifiants et valeurs.

## Contrats externes

Les schémas JSON se trouvent dans `schemas/` :

- `app-export.schema.json` ;
- `feedback.schema.json` ;
- `plan-update.schema.json`.

Le format critique est `PlanUpdate`. Il contient :

```json
{
  "schemaVersion": "1.0",
  "updateId": "adaptation-unique",
  "basePlanId": "plan-cible",
  "basePlanVersion": 1,
  "generatedAt": "2026-08-10T16:00:00.000Z",
  "summary": "Résumé lisible",
  "operations": []
}
```

L'application refuse une adaptation visant un autre plan ou une autre version. Le schéma valide la structure ; le domaine ajoute les règles sémantiques telles que l'ordre des bornes d'allure, les dates futures et la protection de la course objectif.

## Migrations

Lors d'un changement incompatible de `AppState` :

1. ajouter le nouveau type ;
2. écrire une fonction de migration de chaque version précédente ;
3. tester la migration ;
4. incrémenter `schemaVersion` ;
5. documenter le comportement en cas d'échec.

Un champ facultatif compatible, tel que `goalWorkoutId`, ne nécessite pas à lui seul une nouvelle version de la racine.
