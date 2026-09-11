# Instructions pour Codex — Trail Coach

Ce fichier s'applique à tout le dépôt. Des fichiers `AGENTS.md` plus précis existent dans `src/domain` et `src/infrastructure`.

## Mission

Construire et maintenir **Trail Coach**, une application personnelle de planification d'entraînement trail, d'abord comme webapp mobile installable sur un iPhone 14 Pro, puis comme application iOS hybride avec Capacitor.

Le produit est destiné à une seule personne. Il n'y a ni espace communautaire, ni abonnement, ni administration multi-utilisateur.

## Invariants produit

1. Interface en français, mobile-first, utilisable à une main.
2. Objectif unique : progression générale ou trail de 5 à 30 km, défini par date, distance et dénivelé positif lorsque c'est une course.
3. Plan initial généré par un moteur de règles déterministe et testable.
4. Adaptations proposées par Claude hors de l'application, au moyen de fichiers JSON et Markdown sur Google Drive.
5. Toute adaptation est validée par schéma, vérifiée sémantiquement, prévisualisée puis revalidée au moment de l'application. Le mode automatique ne peut accepter qu'une adaptation sans avertissement de sécurité.
6. Feedback d'entraînement : effort de 1 à 5 et commentaire libre.
7. Feedback produit disponible sur chaque écran : texte, capture, route, fonction, version et contexte technique.
8. Données locales dans IndexedDB ; Google Drive sert à la synchronisation et à l'échange avec Claude.
9. Aucun secret OAuth, secret Garmin ou jeton durable dans le dépôt ou le frontend.
10. L'intégration Garmin passe uniquement par l'adaptateur prévu. Ne jamais ajouter de scraping de Garmin Connect ni stocker l'identifiant et le mot de passe Garmin dans la webapp.
11. La course objectif identifiée par `goalWorkoutId` ne peut pas être déplacée ou remplacée par une adaptation externe.
12. Code original. Ne pas copier de code depuis d'autres applications open source sans décision de licence explicite et attribution documentée.

## Ordre de lecture avant modification

1. `CODEX_START_HERE.md`
2. `PLANS.md`
3. `docs/PRODUCT.md`
4. `docs/ARCHITECTURE.md`
5. Le document spécialisé correspondant à la tâche
6. Les tests du domaine concerné

## Méthode de travail

- Pour une tâche dépassant une correction locale, créer ou mettre à jour un plan d'exécution dans `docs/exec-plans/`.
- Examiner l'état Git avant toute modification et ne pas écraser de travail non lié.
- Effectuer de petits changements cohérents et maintenir les schémas, exemples, tests et documentation ensemble.
- Conserver TypeScript en mode strict. Éviter `any`, les assertions non justifiées et les erreurs silencieuses.
- Toutes les dates métier sont des chaînes locales `YYYY-MM-DD`. Les instants de journalisation sont des chaînes ISO 8601 en temps universel coordonné.
- Les distances internes d'activité sont en mètres ; les distances de plan sont en kilomètres ; les durées d'activité sont en secondes ; les durées de plan sont en minutes.
- Tout texte visible par l'utilisateur doit être naturel en français de Suisse romande.
- Définir clairement toute nouvelle abréviation dans l'interface ou la documentation.

## Commandes obligatoires

Après installation des dépendances :

```bash
npm run check
```

Cette commande valide la structure du dépôt, les schémas, TypeScript, les tests et le build de production.

Pour un changement de domaine, ajouter ou mettre à jour un test Vitest. Pour une modification d'un format d'échange, mettre à jour simultanément :

- le type TypeScript ;
- le schéma JSON ;
- l'exemple ;
- la documentation Claude ;
- les tests de validation et d'application.

## Interdictions

- Ne pas appeler directement l'API Anthropic depuis le navigateur.
- Ne pas ajouter de clé privée ou de client secret à une variable `VITE_*` : ces variables sont publiques dans le bundle.
- Ne pas rendre l'application dépendante du réseau pour afficher le plan déjà enregistré.
- Ne pas appliquer silencieusement une adaptation incompatible avec l'identifiant ou la version du plan.
- Ne pas présenter le moteur d'entraînement comme médicalement validé ou comme remplaçant un professionnel de santé.
- Ne pas ajouter de collecte analytique, publicité ou pisteur sans décision explicite.
- Ne pas introduire de backend tant qu'une exigence ne le rend pas nécessaire.

## Définition de terminé

Une tâche est terminée lorsque :

- le parcours mobile reste utilisable à 393 × 852 pixels CSS ;
- les états vide, chargement, erreur et hors ligne sont traités ;
- les données existantes ne sont pas perdues sans migration documentée ;
- les commandes de validation passent ;
- aucun secret n'est commité ;
- `docs/STATUS.md`, `PLANS.md` et `CHANGELOG.md` reflètent le changement lorsque celui-ci modifie le produit.
