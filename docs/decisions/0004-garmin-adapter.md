# ADR 0004 — Garmin derrière un adaptateur et un pont officiel

- Statut : accepté
- Date : 2026-08-10

## Contexte

La synchronisation automatique Garmin est souhaitée, mais le programme officiel exige une intégration approuvée et la conservation de secrets côté serveur. La première version est une webapp statique personnelle.

## Décision

Définir un contrat fournisseur dans le frontend, fournir un mode démonstration et réserver l'intégration réelle à un pont serveur officiel futur. Refuser les bibliothèques demandant les identifiants Garmin de l'utilisateur.

## Raisons

- sécurité des identifiants ;
- conformité au programme officiel ;
- frontend utilisable avant approbation ;
- remplacement facile du fournisseur ;
- tests déterministes.

## Conséquences

La synchronisation automatique réelle n'est pas disponible au premier jalon. La saisie manuelle et la démonstration permettent de valider le produit avant d'investir dans un backend.
