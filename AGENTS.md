# Instructions pour l'agent codeur — Coach Concours

Ce fichier s'applique à tout le dépôt. `CLAUDE.md`, à la racine, porte les règles
opérationnelles courtes que l'agent lit à chaque exécution (ordre de lecture,
palier de la requête, branche/PR, jamais de fusion). En cas de désaccord entre
les deux, `CLAUDE.md` prévaut pour le déroulement du travail ; ce fichier
prévaut pour les invariants produit ci-dessous.

CHANGE_REQUEST_001 — renommé de « Trail Coach » à Coach Concours : ce dépôt ne
contient plus l'ancienne application de planification trail générique
(`src/domain`, `src/app`, `src/screens`, `src/components`, l'ancien
`src/infrastructure/storage.ts` et `driveSync.ts`), supprimée comme code mort.

## Mission

Construire et maintenir **Coach Concours**, une application personnelle de
préparation physique au concours de la police cantonale vaudoise (échéance :
20 novembre 2026), d'abord comme webapp mobile installable, publiée sur
GitHub Pages. Le produit est destiné à une seule personne : ni espace
communautaire, ni abonnement, ni administration multi-utilisateur.

## Invariants produit

1. Interface en français, mobile-first, utilisable à une main.
2. Le plan hebdomadaire suit `weekly_shape.md` et `TRAINING_ENGINE.md` (le
   « cerveau d'entraînement », dans Google Drive, mirroré sous `handoffs/`) :
   1 CrossFit coaché + 3 séances police (`police_technique`,
   `police_strength_transitions`, `police_integration`, ou
   `police_mock_test` une fois le gate salle-exacte franchi) + 1 course de
   maintien le week-end (`trail_maintenance`) + 2 jours vides. Un bloc
   d'intervalles de course est flottant à l'intérieur d'une séance police ; il
   ne compte jamais comme une course ni ne crée de sixième jour.
3. La semaine 1 (7-13 septembre 2026) est gelée telle qu'approuvée
   (`handoffs/WEEK_1_FINAL_2026-09-07_to_13.md` v3) : ne jamais la régénérer.
4. Aucune séance n'est générée après le 20 novembre 2026.
5. Les 11 postes officiels (noms, ordre, règles) viennent d'une seule source
   de données qui reflète le PDF officiel (`docs/police-v1/examples/police-stations.json`) ;
   ne jamais inventer un fait sur un poste.
6. Toute séance générée référence un id de recette existant (`src/coach/recipes.ts`) ;
   pas de texte libre inventé par le moteur.
7. Décisions sportives : jamais devinées par l'agent codeur. Une question
   sportive rencontrée en codant va dans l'`APP_REPORT`, pas dans une décision.
8. Données locales dans IndexedDB (repli localStorage) ; Google Drive sert à
   la synchronisation, jamais de secret dans le dépôt ou le frontend.
9. Code original. Ne pas copier de code depuis d'autres applications open
   source sans décision de licence explicite et attribution documentée.
10. Aucun nom de personne, e-mail, nom d'hôte ou chemin de dossier personnel
    dans le dépôt (voir `.github/workflows/deploy.yml`, étape
    `no-personal-names`). La personne qui s'entraîne est « l'athlète » ;
    toute autre personne est désignée par son rôle.

## Ordre de lecture avant modification

1. `CLAUDE.md` (racine du dépôt).
2. `handoffs/00_COCKPIT.md` section 9, puis `handoffs/00_AGENT_ROUTING.md`.
3. Le `CHANGE_REQUEST_nnn` nommé dans la tâche et les fichiers qu'il liste
   sous « Inputs ». Rien d'autre, sauf si le CR y renvoie explicitement.
4. Les tests du domaine concerné (`src/__tests__/`).

## Commandes obligatoires

```bash
pnpm install --frozen-lockfile
pnpm run validate:schemas
pnpm run typecheck
pnpm run test
pnpm run build
```

Ce sont exactement les étapes de `.github/workflows/deploy.yml` (après
`no-personal-names`) ; c'est ce que la CI vérifie sur chaque pull request.
`pnpm run check` inclut en plus `validate:repository`, qui reste utile en
local mais n'est volontairement pas dans la CI.

## Interdictions

- Ne pas appeler directement l'API Anthropic depuis le navigateur.
- Ne pas ajouter de clé privée ou de client secret à une variable `VITE_*` :
  ces variables sont publiques dans le bundle.
- Ne pas fusionner une pull request : l'athlète presse Merge sur GitHub
  (deuxième porte). L'agent codeur ouvre la PR et s'arrête là.
- Ne pas régénérer la semaine 1, ni une séance après le 20 novembre 2026.
- Ne pas ajouter de collecte analytique, publicité ou pisteur.
- Ne pas introduire de backend tant qu'une exigence ne le rend pas nécessaire.

## Définition de terminé

Une tâche est terminée lorsque :

- le parcours mobile reste utilisable à 393 × 852 pixels CSS ;
- les commandes de la section « Commandes obligatoires » passent ;
- aucun secret n'est commité ;
- `handoffs/APP_REPORT_nnn.md` est écrit dans la même pull request, avec le
  hash de commit final ;
- toute question sportive rencontrée est écrite dans l'`APP_REPORT`, pas
  décidée par l'agent.
