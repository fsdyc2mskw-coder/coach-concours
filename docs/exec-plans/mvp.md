# Plan d'exécution — Stabiliser le produit minimum viable

## But

Transformer le dépôt initial généré en application reproductible, testée et déployée sur GitHub Pages, sans ajouter de nouvelle fonction métier.

## Contexte

Le code, les tests et les documents existent. Des contrôles structurels, des compilations TypeScript avec stubs et des scénarios d'exécution du domaine ont réussi ; voir `../../VALIDATION_REPORT.md`. Le miroir npm de l'environnement de génération ne fournit toutefois pas toutes les dépendances. L'installation réelle, Vitest, le build Vite et le test navigateur restent donc à réaliser.

## Étapes

### 1. Reproductibilité

- Exécuter `npm install` avec Node.js 20 ou ultérieur.
- Examiner les versions réellement résolues.
- Générer et commiter `package-lock.json`.
- Ne pas mettre à jour vers des versions majeures différentes sans besoin.

### 2. Contrôles statiques

- Exécuter `npm run validate:schemas`.
- Exécuter `npm run typecheck`.
- Corriger les erreurs sans affaiblir le mode strict.
- Vérifier qu'aucune correction ne contourne Zod ou ne remplace un type par `any`.

### 3. Tests

- Exécuter `npm run test`.
- Corriger les tests ou le code selon le comportement spécifié.
- Ajouter au minimum des tests de composants pour onboarding, clôture de séance, import d'adaptation et refus d'un aperçu devenu obsolète.

### 4. Build

- Exécuter `npm run build`.
- Ouvrir `dist/` via `npm run preview`.
- Vérifier les chemins relatifs, le manifeste et le service worker.

### 5. Parcours mobile

À 393 × 852 pixels CSS :

- charger la démonstration ;
- parcourir les semaines ;
- déplacer une séance ;
- clôturer une séance ;
- vérifier l'activité et le ressenti ;
- exporter le contexte ;
- vérifier que `plan-update.schema.json` est créé dans Drive ;
- importer `public/sample/claude-plan-update.json` après l'avoir adapté à l'identifiant réel du plan ;
- enregistrer un feedback avec capture ;
- recharger la page.

### 6. Déploiement

- créer le dépôt GitHub ;
- activer GitHub Pages avec GitHub Actions ;
- définir la variable `VITE_GOOGLE_CLIENT_ID` lorsqu'elle existe ;
- pousser sur `main` ;
- vérifier l'URL publique et l'ajout à l'écran d'accueil.

## Validation

Le plan est terminé lorsque toutes les cases M0 de `PLANS.md` sont cochées, que `docs/STATUS.md` ne mentionne plus de compilation non vérifiée et que le workflow d'intégration continue est vert.

## Journal de décisions

Codex doit ajouter ici, pendant l'exécution, les problèmes constatés, leur cause et la correction retenue. Ne pas écrire de résultat avant de l'avoir observé.

- 10 août 2026 : dépendances installées, `package-lock.json` généré et `npm run check` réussi avec 29 tests dans 8 fichiers.
- 10 août 2026 : parcours de démonstration vérifié à 393 × 852 pixels CSS. Aucun défilement horizontal ni message de console observé ; la persistance locale fonctionne après rechargement.
- 10 août 2026 : le bouton Feedback mesurait 40 pixels de haut. Sa hauteur minimale a été portée à 44 pixels puis vérifiée dans le navigateur.
- 10 août 2026 : ajout du test critique qui prévisualise une adaptation, modifie localement le plan puis confirme que l'application refuse la proposition obsolète.
- 10 août 2026 : onboarding, clôture de séance et application d'une adaptation sont couverts par des tests d'interface. Une séance du jour a aussi été clôturée dans le build de production ; l'activité, le ressenti, la progression et la persistance ont été vérifiés.
- Restent à réaliser : déploiement GitHub Pages, intégrations externes et test sur iPhone physique.
