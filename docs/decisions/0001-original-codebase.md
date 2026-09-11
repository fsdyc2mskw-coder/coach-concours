# ADR 0001 — Code de base original

- Statut : accepté
- Date : 2026-08-10

## Contexte

Plusieurs applications open source présentent des fonctions utiles : calendrier, plan, analyse de charge ou adaptation. Leurs architectures, niveaux de maturité et licences diffèrent.

## Décision

Créer un code de base original et unique. Reprendre des idées fonctionnelles générales, mais ne pas fusionner les dépôts et ne pas copier leur code.

## Raisons

- réduire la complexité ;
- éviter les conflits de modèles de données ;
- conserver une licence MIT simple ;
- maîtriser la cible mobile et le périmètre personnel ;
- éviter qu'une dépendance à une licence copyleft forte s'étende au produit sans décision explicite.

## Conséquences

Le développement initial demande davantage de code, mais chaque composant répond précisément au besoin. Toute future réutilisation de code tiers exige une nouvelle décision, une vérification de licence et une attribution.
