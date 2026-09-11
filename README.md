# Trail Coach

Application personnelle, mobile-first, pour générer et adapter un plan d'entraînement de trail court. La première cible est une **application web progressive** installable sur un iPhone 14 Pro depuis Safari. Le même frontend pourra ensuite être encapsulé avec Capacitor pour former une application iOS.

Les fiches de séance proposent des itinéraires pédestres existants issus du catalogue officiel SuisseMobile, classés selon la distance et le dénivelé. Le catalogue est embarqué localement : aucune clé API n’est envoyée au navigateur et les suggestions restent disponibles hors ligne. Voir [`docs/SWISSMOBILE.md`](docs/SWISSMOBILE.md) pour l’actualisation.

L’onglet **Parcours** donne accès au catalogue complet, trié depuis Lausanne ou depuis la position actuelle du téléphone. La position reste en mémoire uniquement le temps d’afficher la page et n’est ni enregistrée ni transmise.

Le dépôt contient une première version fonctionnelle, les contrats de données, les tests, les instructions pour Codex et les workflows GitHub.

## Parcours couvert

1. Créer un profil et un objectif de progression ou de course de 5 à 30 km.
2. Générer un plan à partir du volume et de l'allure de référence, puis de l'historique d'activités lorsqu'il existe.
3. Consulter la séance du jour et les semaines du plan. La première semaine partielle ne contient aucune séance antérieure à la création.
4. Déplacer une séance future, sauf la course objectif.
5. Enregistrer une activité, une note d'effort de 1 à 5 et un commentaire.
6. Synchroniser le contexte en JSON et Markdown sur Google Drive.
7. Faire analyser ces fichiers par Claude hors de l'application.
8. Importer ou relire sur Drive un fichier `plan-update.json`, afficher les avertissements, puis appliquer l'adaptation.
9. Envoyer un feedback produit depuis chaque écran ou bloc fonctionnel avec une capture et le contexte technique.

## Décisions essentielles

- **Un seul code de base original.** Les idées utiles d'autres produits peuvent inspirer le produit, mais les dépôts ne sont pas fusionnés et aucun code tiers n'a été copié.
- **Local-first.** Le plan reste lisible et modifiable sans réseau après le premier chargement.
- **Claude externe.** Aucune clé Anthropic et aucun appel à Claude ne se trouvent dans le navigateur.
- **Google Drive minimal.** Le frontend demande le périmètre OAuth `drive.file`, qui limite l'accès aux fichiers créés ou ouverts par l'application.
- **Garmin isolé.** L'API officielle Garmin Connect nécessite une intégration approuvée côté serveur. Le frontend expose donc un adaptateur et conserve un mode de démonstration.
- **Validation avant adaptation.** Toute modification de plan doit respecter le schéma, l'identifiant et la version du plan. La course objectif est protégée ; les hausses de distance ou de dénivelé et les structures agressives déclenchent des avertissements.

## Démarrage local

Prérequis : Node.js 20 ou version ultérieure et npm.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Puis ouvrir l'adresse indiquée par Vite. Pour charger un jeu de données sans service externe, utiliser **Charger une démonstration complète** sur l'écran initial.

## Contrôles

```bash
npm run check
```

La commande enchaîne la validation du dépôt, les schémas, TypeScript, les tests et la construction de production.

Le premier passage dans Codex doit générer et commiter `package-lock.json`. Le prompt prêt à l'emploi se trouve dans [`CODEX_START_HERE.md`](./CODEX_START_HERE.md). Les contrôles déjà exécutés et leurs limites sont consignés dans [`VALIDATION_REPORT.md`](./VALIDATION_REPORT.md).

## Variables d'environnement

Copier `.env.example` vers `.env.local`.

| Variable | Exposition | Rôle |
|---|---|---|
| `VITE_GOOGLE_CLIENT_ID` | Publique | Identifiant OAuth Google pour application web |
| `VITE_REQUIRE_GOOGLE_AUTH` | Publique | Exige la connexion Google avant la création du plan |
| `VITE_GARMIN_BRIDGE_URL` | Publique | URL du pont serveur Garmin approuvé |
| `VITE_APP_VERSION` | Publique | Version affichée dans les feedbacks |

Une variable préfixée `VITE_` est incluse dans le bundle navigateur. Elle ne doit jamais contenir de secret, de mot de passe, de clé privée ou de client secret.

## Configuration Google

Les étapes détaillées figurent dans [`docs/GOOGLE_DRIVE.md`](./docs/GOOGLE_DRIVE.md). En résumé :

1. créer un projet Google Cloud ;
2. activer Google Drive API ;
3. configurer l'écran de consentement ;
4. créer un client OAuth de type **application Web** ;
5. ajouter les origines JavaScript locales et GitHub Pages ;
6. définir `VITE_GOOGLE_CLIENT_ID` localement et comme variable du dépôt GitHub.

Les jetons d'accès sont gardés uniquement en mémoire et doivent être renouvelés par une reconnexion.

## Déploiement GitHub Pages

Le workflow [`.github/workflows/deploy-pages.yml`](./.github/workflows/deploy-pages.yml) construit et publie la branche principale.

Dans GitHub :

1. ouvrir **Settings → Pages** et choisir **GitHub Actions** comme source ;
2. ouvrir **Settings → Secrets and variables → Actions → Variables** ;
3. créer `VITE_GOOGLE_CLIENT_ID` ;
4. créer `VITE_REQUIRE_GOOGLE_AUTH` avec la valeur `true` après validation de la connexion ;
5. pousser sur `main` ou lancer manuellement le workflow.

La navigation utilise un fragment d'URL (`#/dashboard`), ce qui évite les réécritures serveur sur un hébergement statique.

## Échange avec Claude

Lire [`docs/CLAUDE_WORKFLOW.md`](./docs/CLAUDE_WORKFLOW.md) et [`claude/COACH_PROMPT.md`](./claude/COACH_PROMPT.md). L'application crée cette arborescence :

```text
Trail Coach/
├── context/
│   ├── latest-context.json
│   └── latest-context.md
├── claude/
│   ├── README.md
│   ├── plan-update.schema.json
│   └── plan-update.json
├── feedback/
├── training-feedback/
└── screenshots/
```

Si Claude ne peut pas écrire directement dans le fichier Drive avec le connecteur disponible, il doit produire le même JSON, à coller ou importer dans l'écran Réglages. Le protocole ne change pas.

## Garmin

Le dépôt n'utilise pas de bibliothèque Garmin Connect non officielle. Lire [`docs/GARMIN.md`](./docs/GARMIN.md). Le contrat du pont se trouve dans `src/infrastructure/garmin/officialProvider.ts`.

## Organisation

```text
src/domain/          règles métier pures
src/infrastructure/  IndexedDB, Google Drive, identité Google, Garmin
src/app/             état global, routage, données de départ
src/screens/         écrans mobile-first
src/components/      composants d'interface
schemas/             contrats JSON
claude/              prompt et exemple pour l'analyse externe
docs/                spécification, architecture et décisions
.github/workflows/    intégration continue et GitHub Pages
```

## Documentation

Commencer par [`docs/index.md`](./docs/index.md), [`docs/PRODUCT.md`](./docs/PRODUCT.md), [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) et [`docs/STATUS.md`](./docs/STATUS.md).

## Sources techniques officielles

- Codex et fichiers `AGENTS.md` : https://openai.com/index/introducing-codex/
- GitHub Pages : https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages
- Google Identity Services, modèle de jeton : https://developers.google.com/identity/oauth2/web/guides/use-token-model
- Périmètres Google Drive : https://developers.google.com/workspace/drive/api/guides/api-specific-auth
- Garmin Connect Developer Program : https://developer.garmin.com/gc-developer-program/overview/
- Capacitor : https://capacitorjs.com/docs

## Licence

Code original distribué sous licence MIT. Voir [`LICENSE`](./LICENSE) et [`NOTICE.md`](./NOTICE.md).
