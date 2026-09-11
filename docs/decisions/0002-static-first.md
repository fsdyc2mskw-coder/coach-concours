# ADR 0002 — Webapp statique avant application iOS

- Statut : accepté
- Date : 2026-08-10

## Contexte

La cible d'usage est un iPhone 14 Pro. Une application native immédiate augmenterait le coût de développement, de signature et de distribution avant validation du produit.

## Décision

Développer d'abord une application web progressive React, l'héberger sur GitHub Pages et la tester depuis Safari et l'écran d'accueil. Ajouter Capacitor seulement après stabilisation.

## Raisons

- boucle de modification et déploiement courte ;
- partage maximal du code ;
- hébergement statique simple ;
- installation sans App Store pendant le prototypage ;
- compatibilité future avec Capacitor.

## Conséquences

Certaines intégrations natives et les tâches de fond sont limitées au début. Le routage, les chemins d'actifs et le stockage doivent rester compatibles avec GitHub Pages et un conteneur local.
