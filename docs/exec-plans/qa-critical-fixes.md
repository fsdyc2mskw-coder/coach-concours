# Corrections critiques après audit

Statut : terminé le 11 août 2026.

## Objectif

Éliminer les résultats trompeurs et les risques de perte d’état avant le prochain test utilisateur, sans ajouter d’architecture inutile.

## Réalisé

- remplacement des coordonnées génériques par les points issus des géométries officielles SuisseMobile ;
- affichage explicite d’une distance inconnue lorsque la géométrie n’est pas encore disponible ;
- protection du jour de course pour les ajouts, déplacements, remplacements et déplacements manuels ;
- sauvegarde locale immédiate, écriture IndexedDB ordonnée et sélection de la copie la plus récente au chargement ;
- sortie de secours si le chargement du stockage échoue ;
- blocage de toute réécriture et écran explicite si les données locales ne peuvent pas être chargées ;
- retour à l’état déconnecté lorsque la session Google expire ;
- retour en haut lors d’un changement de page, correction du compteur hebdomadaire et désactivation de Drive sans configuration ;
- tests de régression et validation du build de production.

## Résultat vérifié

- 1 065 itinéraires officiels, dont 650 départs géolocalisés et aucune coordonnée géolocalisée invalide ;
- 43 tests réussis dans 13 fichiers ;
- contrôle du dépôt, schémas, TypeScript et build de production réussis.
