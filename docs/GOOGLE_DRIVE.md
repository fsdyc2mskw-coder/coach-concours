# Google Drive et identité Google

## Objectif

Utiliser un seul compte Google pour :

- identifier l'utilisateur ;
- créer le dossier `Trail Coach` ;
- synchroniser le contexte JSON et Markdown ;
- archiver chaque ressenti d'entraînement ;
- stocker les feedbacks produit et captures ;
- échanger un fichier d'adaptation avec Claude.

Il n'existe pas de compte propre à Trail Coach.

## Modèle OAuth retenu

La webapp emploie **Google Identity Services** avec le modèle de jeton pour application navigateur. Elle demande :

```text
openid email profile https://www.googleapis.com/auth/drive.file
```

Le périmètre `drive.file` permet à l'application d'accéder aux fichiers qu'elle crée ou que l'utilisateur ouvre avec elle, plutôt qu'à l'ensemble de Drive.

Le jeton d'accès :

- reste dans une variable en mémoire ;
- n'est pas persistant après un rechargement complet ;
- n'est jamais exporté dans les feedbacks ;
- n'est jamais écrit dans IndexedDB ou localStorage ;
- doit être renouvelé par une nouvelle autorisation lorsque la session expire.

## Création du client Google

Les intitulés exacts de la console peuvent évoluer. Suivre la documentation Google actuelle, avec ces paramètres fonctionnels :

1. Créer ou choisir un projet Google Cloud.
2. Activer **Google Drive API**.
3. Configurer l'écran de consentement OAuth.
4. Ajouter le compte personnel comme utilisateur de test si l'application reste en mode test.
5. Créer un client OAuth de type **Web application**.
6. Ajouter les origines JavaScript autorisées, sans chemin :
   - `http://localhost:5173` pour Vite ;
   - l'origine GitHub Pages, par exemple `https://UTILISATEUR.github.io` ;
   - l'origine du domaine personnalisé s'il existe.
7. Copier uniquement l'identifiant client dans `VITE_GOOGLE_CLIENT_ID`.

Ne jamais placer le client secret dans le frontend. Le flux utilisé n'en a pas besoin.

## Variables

Localement :

```dotenv
VITE_GOOGLE_CLIENT_ID=000000000000-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com
VITE_REQUIRE_GOOGLE_AUTH=false
```

Pour le déploiement personnel, `VITE_REQUIRE_GOOGLE_AUTH=true` impose la connexion avant de générer un plan.

Dans GitHub, `VITE_GOOGLE_CLIENT_ID` est une **variable Actions**, non un secret cryptographique. Il est public dans le JavaScript généré, conformément au modèle des clients OAuth navigateur.

## Arborescence créée

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
│   ├── 2026-08-10_app-feedback-….json
│   └── 2026-08-10_app-feedback-….md
├── training-feedback/
│   ├── 2026-08-10_session-feedback-….json
│   └── 2026-08-10_session-feedback-….md
└── screenshots/
    └── 2026-08-10_app-feedback-….jpg
```

Les identifiants Drive sont mémorisés dans `DriveFileRegistry` pour réutiliser les mêmes fichiers et dossiers. Les demandes de synchronisation sont exécutées dans une file locale afin d'éviter deux créations concurrentes.

## Synchronisation

### Écriture du contexte

`latest-context.json` est destiné à la précision machine. `latest-context.md` est destiné à la lecture humaine et à Claude.

Ces deux fichiers représentent un instantané courant. Ils sont écrasés à chaque synchronisation réussie.

### Ressentis de séance

Ils sont inclus dans le contexte courant et archivés individuellement dans `training-feedback/` en JSON et Markdown, avec les données disponibles de la séance et de l'activité liées. Ils ne sont marqués synchronisés qu'après la création réussie de ces fichiers.

### Feedback produit

Chaque feedback est append-only sous la forme de deux fichiers : JSON et Markdown. Une capture éventuelle est téléversée séparément et référencée par nom.

### Adaptation

`plan-update.schema.json` est synchronisé depuis le contrat du dépôt afin que Claude dispose de la structure exacte dans Drive. `plan-update.json` est créé une seule fois. Tant qu'il contient encore le modèle vide généré par l'app, sa version de base est actualisée lors des synchronisations. Dès qu'il contient une proposition réelle, un contenu non reconnu ou un JSON invalide, la synchronisation le préserve pour ne pas détruire le travail de Claude. Après application, l'app tente de le réinitialiser avec la nouvelle version ; un bouton permet aussi de le faire manuellement.

## Erreurs attendues

- identifiant client absent ;
- origine JavaScript non autorisée ;
- compte non déclaré comme testeur ;
- fenêtre d'autorisation fermée ;
- jeton expiré ;
- périmètre refusé ;
- Drive API non activée ;
- fichier supprimé manuellement ;
- quota ou réseau indisponible.

L'app doit conserver les données en `pending` lorsqu'une synchronisation échoue.

## Limites du modèle statique

Une webapp statique ne peut pas stocker en sécurité un jeton de rafraîchissement ou un client secret. La reconnexion périodique est donc un compromis assumé pour le produit minimum viable. Un backend ne sera envisagé que si l'usage quotidien démontre que cette reconnexion est réellement bloquante.

## Références officielles

- Modèle de jeton OAuth navigateur : https://developers.google.com/identity/oauth2/web/guides/use-token-model
- Chargement de Google Identity Services : https://developers.google.com/identity/oauth2/web/guides/load-3p-authorization-library
- Périmètres Google Drive : https://developers.google.com/workspace/drive/api/guides/api-specific-auth
- Téléversement Drive : https://developers.google.com/workspace/drive/api/guides/manage-uploads
- Fichiers et dossiers Drive : https://developers.google.com/workspace/drive/api/guides/about-files
