# Sécurité et confidentialité

## Données traitées

- objectif sportif ;
- plan d'entraînement ;
- activités ;
- fréquence cardiaque moyenne facultative ;
- ressenti et commentaires ;
- feedback produit ;
- captures d'écran ;
- adresse e-mail et nom du compte Google.

Ces données sont personnelles et peuvent révéler des habitudes, dates et performances.

## Modèle de menace initial

### Actifs à protéger

- données locales ;
- fichiers Drive ;
- jeton OAuth en mémoire ;
- futurs jetons Garmin côté serveur ;
- captures et commentaires.

### Adversaires considérés

- tiers ayant accès au dépôt public ;
- script injecté dans le navigateur ;
- personne ayant accès au compte Google ou au téléphone ;
- dépendance compromise ;
- fichier d'adaptation malveillant ou obsolète.

### Hors modèle initial

Le produit minimum viable n'offre pas de protection contre un appareil déjà compromis ou un compte Google contrôlé par un tiers.

## Mesures présentes

- aucun secret dans le dépôt ;
- jeton Google non persisté ;
- périmètre Drive limité à `drive.file` ;
- contenu externe validé par Zod ;
- liaison stricte à l'identifiant et à la version du plan ;
- stockage local sans service analytique ;
- code source original ;
- dépendances limitées ;
- refus d'un accès Garmin non officiel ;
- captures excluant la fenêtre de feedback elle-même.

## Risques connus

### XSS

Une attaque par script injecté pourrait lire le jeton Google en mémoire et les données locales. Mesures futures : politique de sécurité du contenu stricte, revue des dépendances, aucune injection HTML non contrôlée et hébergement HTTPS.

**XSS** signifie Cross-Site Scripting, soit injection de script dans une page.

### OAuth dans un frontend statique

Le client OAuth est public par nature. Les origines autorisées doivent être strictes. Aucun client secret ne doit être ajouté.

### Captures

Une capture peut contenir des données personnelles affichées à l'écran. L'utilisateur doit pouvoir désactiver la capture automatique et voir l'aperçu avant l'enregistrement.

### Fichiers Drive partagés

Le périmètre applicatif ne remplace pas les règles de partage de Drive. L'utilisateur doit contrôler les personnes et connecteurs autorisés sur le dossier.

### Adaptation externe

Le schéma protège la structure, pas la qualité sportive. Les avertissements et l'aperçu manuel restent obligatoires par défaut.

### Dépendances

Le fichier de verrouillage doit être commité. Les mises à jour doivent être examinées, testées et non appliquées automatiquement en production sans contrôle.

## Règles de journalisation

Ne jamais journaliser :

- jeton d'accès ;
- en-tête Authorization ;
- client secret ;
- mot de passe Garmin ;
- contenu complet d'une activité dans une erreur distante ;
- Data URL d'une capture.

## Sauvegarde et suppression

- La réinitialisation locale ne supprime pas les fichiers Drive.
- La suppression Drive doit être manuelle dans le produit initial.
- Avant une migration risquée, proposer un export JSON et Markdown.
- Une future fonction « supprimer mon compte » devra effacer les fichiers créés et révoquer les accès.

## Politique de sécurité du contenu future

Avant publication durable, ajouter des en-têtes ou balises limitant au minimum les sources à :

- application elle-même ;
- comptes Google Identity Services ;
- API Google Drive et OpenID ;
- pont Garmin explicitement configuré ;
- images `data:` uniquement lorsque nécessaires aux captures.

GitHub Pages limite le contrôle des en-têtes HTTP ; une balise `Content-Security-Policy` peut être étudiée, puis remplacée par des en-têtes sur un hébergement plus configurable si nécessaire.
