# ADR 0003 — Google Drive comme protocole de fichiers

- Statut : accepté
- Date : 2026-08-10

## Contexte

L'utilisateur veut que Claude lise les activités, ressentis et feedbacks depuis Google Drive et renvoie des adaptations. Il ne veut pas d'appel direct à Claude depuis l'app.

## Décision

Utiliser Google Drive comme canal d'échange : contexte courant en JSON et Markdown, adaptation en JSON versionné, feedbacks append-only. Demander le périmètre OAuth `drive.file`.

## Raisons

- fichiers inspectables et modifiables par l'utilisateur ;
- absence de clé Anthropic dans le frontend ;
- format indépendant d'un fournisseur d'intelligence artificielle ;
- sauvegarde lisible ;
- accès Drive limité aux fichiers applicatifs.

## Conséquences

La synchronisation n'est pas temps réel. Les capacités d'écriture de Claude peuvent varier ; un import manuel du même JSON reste nécessaire. Le contrôle de concurrence repose sur l'identifiant et la version du plan.
