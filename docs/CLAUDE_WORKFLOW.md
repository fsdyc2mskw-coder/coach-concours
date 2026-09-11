# Boucle Claude

## Principe

Claude n'est pas intégré par une interface de programmation d'application dans Trail Coach. Il est utilisé séparément par l'utilisateur et lit le contexte depuis Google Drive ou depuis les fichiers exportés manuellement.

L'app ne demande donc aucune clé Anthropic, n'engendre aucun coût d'interface de programmation d'application et conserve une frontière claire entre données, analyse et exécution.

## Fichiers d'entrée

Claude lit en priorité :

1. `Trail Coach/context/latest-context.md` pour la vue d'ensemble ;
2. `Trail Coach/context/latest-context.json` pour les identifiants, valeurs exactes, séances récentes et séances futures ;
3. `Trail Coach/claude/README.md` pour les règles du fichier de sortie ;
4. `plan-update.schema.json`, rendu accessible avec le prompt, pour la structure exacte.

Le prompt de référence se trouve dans [`../claude/COACH_PROMPT.md`](../claude/COACH_PROMPT.md).

## Sortie obligatoire

Claude produit un seul objet JSON conforme à `schemas/plan-update.schema.json`.

Champs de liaison indispensables :

- `basePlanId` doit reprendre exactement l'identifiant du plan courant ;
- `basePlanVersion` doit reprendre exactement la version courante ;
- chaque `workoutId` doit provenir du contexte ;
- `goalWorkoutId`, lorsqu'il existe, ne doit jamais être ciblé ;
- `generatedAt` est un instant ISO 8601 ;
- `operations` peut être vide lorsque les données ne justifient aucune adaptation.

Claude ne doit pas renvoyer l'état complet de l'app et ne doit jamais inventer un identifiant de séance ciblée. Pour une nouvelle séance ou de nouveaux segments, les identifiants de segments fournis ne sont que temporaires : l'app les remplace à l'application.

## Deux chemins de retour

### Chemin A — écriture Drive

Lorsque les capacités du connecteur Google Drive actives dans le compte permettent de modifier le fichier :

1. Claude remplace le contenu de `Trail Coach/claude/plan-update.json` ;
2. l'utilisateur ouvre Réglages ;
3. il choisit **Lire depuis Drive** ;
4. l'app valide et affiche l'aperçu ;
5. l'utilisateur applique ou refuse.

### Chemin B — import contrôlé

Lorsque Claude peut seulement lire Drive ou ne peut pas remplacer le fichier :

1. Claude affiche uniquement le JSON ;
2. l'utilisateur le copie dans la zone d'import ou l'enregistre comme fichier `.json` ;
3. l'app utilise le même validateur et le même aperçu.

Le chemin B est une solution de secours officielle du produit, pas un format différent.

## Règles d'analyse demandées à Claude

Claude doit :

- analyser les activités réalisées, les séances planifiées et le ressenti ;
- distinguer une séance isolée difficile d'une tendance ;
- ne modifier que les séances futures ;
- préserver l'objectif principal, sa date et la course identifiée par `goalWorkoutId` ;
- ne rien ajouter le jour de la course ;
- limiter le nombre de changements ;
- expliquer chaque opération dans `reason` ;
- garder `minSecPerKm` inférieur ou égal à `maxSecPerKm` ;
- utiliser zéro opération en cas d'incertitude ;
- éviter tout diagnostic médical ;
- signaler dans `summary` lorsqu'une douleur décrite exige une décision humaine plutôt qu'une adaptation automatique.

## Validation dans l'app

L'aperçu échoue immédiatement si :

- le JSON est invalide ;
- le schéma n'est pas respecté ;
- le plan ou la version ne correspondent pas ;
- une séance ciblée n'existe pas, n'est plus planifiée ou est passée ;
- plusieurs opérations ciblent la même séance ;
- une date sort de la période du plan ;
- une plage d'allure est inversée ;
- la course objectif est ciblée ;
- une nouvelle séance est ajoutée le jour de la course.

Les avertissements de charge sont détaillés dans [`TRAINING_ENGINE.md`](./TRAINING_ENGINE.md).

## Concurrence et versions

Le fichier d'adaptation est optimiste : il vise une version précise. Déplacer, terminer ou ignorer une séance incrémente cette version. Si le plan a changé depuis l'analyse ou même depuis l'ouverture de l'aperçu, l'app revalide l'objet au moment de l'application et le refuse. Il faut resynchroniser le contexte et demander une nouvelle proposition.

## Synchronisation du fichier d'adaptation

La synchronisation normale ne remplace pas une proposition Claude existante. Elle actualise `plan-update.json` uniquement lorsque le fichier contient encore le modèle vide généré par l'application. Après application ou abandon explicite, le bouton de réinitialisation recrée un modèle vide avec la nouvelle version de base.

## Confidentialité

Le contexte contient des données d'entraînement et des commentaires personnels. Le dossier Drive ne doit être partagé qu'avec les outils et personnes choisis par l'utilisateur.

## Références Anthropic

- Connecteur Google Drive : https://support.anthropic.com/en/articles/10166901-using-the-google-drive-integration
- Connecteurs : https://support.anthropic.com/en/articles/11175166-about-custom-connectors-using-remote-mcp

Les capacités exactes de lecture ou d'écriture dépendent du produit Claude, du plan et du connecteur disponibles au moment de l'utilisation ; le chemin d'import manuel reste donc nécessaire.
