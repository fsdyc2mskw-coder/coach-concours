# Architecture

## Résumé

Trail Coach est une application statique React et TypeScript. Le navigateur conserve l'état courant dans IndexedDB. Google Drive est un canal de synchronisation et d'échange de fichiers ; il n'est pas la base de données primaire. Claude fonctionne hors de l'application. Garmin est une source future accessible par un pont serveur approuvé.

```text
┌──────────────────────── iPhone / navigateur ────────────────────────┐
│                                                                     │
│  React UI  →  AppContext  →  Domaine pur                            │
│                         ↘                                           │
│                   IndexedDB local                                   │
│                         ↘                                           │
│             Google Identity + Drive API                             │
└──────────────────────────────┬──────────────────────────────────────┘
                               │ JSON + Markdown
                               ▼
                         Google Drive
                          ↙          ↘
                    Claude externe   feedback produit

Garmin Connect → pont serveur approuvé → contrat Garmin → AppContext
```

## Couches

### `src/domain`

Contient les types et règles métier :

- génération de plan ;
- sélection des séances et activités ;
- construction des exports ;
- validation et application des adaptations.

Cette couche ne doit dépendre ni de React, ni du Document Object Model, ni d'un fournisseur externe.

### `src/app`

Contient :

- le contexte React et les commandes applicatives ;
- l'initialisation de l'état ;
- le routeur à fragments ;
- la version et le traitement global des erreurs.

`AppContext` orchestre les appels. Il revalide une adaptation immédiatement avant application et sérialise les synchronisations Drive. Il ne doit pas contenir les algorithmes métier complexes.

### `src/infrastructure`

Contient les adaptateurs :

- IndexedDB et localStorage ;
- Google Identity Services ;
- Google Drive API ;
- capture d'écran ;
- fournisseur Garmin de démonstration et pont officiel futur.

### `src/screens` et `src/components`

Contiennent l'interface. Les écrans utilisent `useApp()` et ne font pas directement de requête Google Drive.

## État local

`AppState` est la racine persistée. Il est versionné par `schemaVersion`. Une future modification incompatible doit introduire une migration explicite avant d'incrémenter cette version.

Les captures d'écran peuvent être volumineuses. IndexedDB les accepte ; le secours localStorage les retire volontairement pour limiter les erreurs de quota.

## Plan et concurrence optimiste

Le plan possède un identifiant et une version. Toute modification pertinente incrémente la version : déplacement, achèvement, annulation ou adaptation. Une course possède en plus `goalWorkoutId`, utilisé par le domaine pour empêcher son déplacement ou son remplacement par une adaptation externe.

`PlanUpdate` reprend l'identifiant et la version de base. L'aperçu ne réserve pas le plan : l'objet est donc revalidé au clic d'application. Une modification locale intervenue entre-temps rend l'adaptation obsolète au lieu d'être écrasée.

## Routage

Le routage utilise le fragment de l'adresse :

```text
#/dashboard
#/plan
#/activities
#/settings
#/session/<workoutId>
```

Ce choix permet le déploiement sur GitHub Pages sans réécriture côté serveur et reste compatible avec une encapsulation Capacitor.

## Synchronisation Drive

Une synchronisation :

1. entre dans une file locale afin d'éviter deux écritures concurrentes ;
2. garantit l'existence des dossiers ;
3. écrase `latest-context.json` et `latest-context.md` ;
4. synchronise `plan-update.schema.json` dans le dossier Claude ;
5. crée `plan-update.json` s'il n'existe pas et actualise uniquement son modèle vide ;
6. préserve tout contenu réel ou non reconnu déjà écrit par Claude ;
7. archive les ressentis d'entraînement en JSON et Markdown ;
8. téléverse les feedbacks produit en attente et leurs captures ;
9. marque chaque élément comme synchronisé seulement après la réussite de son écriture ;
10. mémorise les identifiants de fichiers pour éviter les doublons.

Le jeton OAuth reste uniquement dans la mémoire du processus JavaScript. L'utilisateur doit se reconnecter après expiration ou rechargement complet.

## Protocole d'adaptation

`PlanUpdate` est une commande versionnée, non un remplacement complet arbitraire du plan. Les opérations disponibles sont :

- déplacer une séance ;
- remplacer une séance ;
- annuler une séance ;
- ajouter une séance.

Avant application :

- Zod valide la structure ;
- `basePlanId` doit correspondre ;
- `basePlanVersion` doit correspondre ;
- chaque séance ciblée doit exister, être encore planifiée et ne recevoir qu'une opération ;
- la séance doit être future et rester dans la période du plan ;
- la course objectif ne peut pas être ciblée et son jour reste réservé ;
- les plages d'allure doivent être ordonnées ;
- les identifiants de segments externes sont remplacés ;
- les garde-fous calculent les avertissements de distance, dénivelé et structure de semaine.

Une adaptation sans opération conserve la même instance et la même version du plan.

## Frontière Garmin

Le frontend ne connaît qu'un contrat `GarminProvider`. L'implémentation future appelle un pont serveur. Ce pont devra :

- détenir les secrets et jetons Garmin ;
- recevoir les notifications ou interroger l'API conformément au contrat officiel ;
- normaliser les activités ;
- authentifier la requête de l'utilisateur ;
- exposer uniquement les données nécessaires à l'app.

Le frontend valide la réponse du pont avant de l'intégrer à l'état local.

## Hébergement

GitHub Pages sert les fichiers statiques de `dist/`. GitHub Actions effectue l'installation, les contrôles et le déploiement. Aucun backend n'est déployé dans ce jalon.

## Évolution iOS

Capacitor ne doit être ajouté qu'après stabilisation de la webapp. La logique métier et React restent partagés. Les plugins natifs ne doivent pas devenir une dépendance du domaine.
