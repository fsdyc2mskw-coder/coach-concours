# Catalogue SuisseMobile officiel

## Objectif

Remplacer le petit catalogue saisi manuellement par une copie locale des itinéraires pédestres officiels fournis par l’API OpenData de Suisse Tourisme / SuisseMobile.

## Principes

- La clé API reste uniquement dans `.env.local` et n’entre jamais dans le bundle web.
- Un script de synchronisation récupère les fiches officielles en français par lots de 50.
- L’application utilise ensuite un fichier JSON local, y compris hors ligne.
- Les suggestions classent les parcours existants par proximité avec la distance et le D+ de la séance. Aucun tracé n’est généré.

## Étapes

- [x] Vérifier l’API, les filtres SuisseMobile et la pagination.
- [x] Ajouter le script de synchronisation et le catalogue généré.
- [x] Brancher le moteur de suggestions sur le catalogue complet.
- [x] Adapter l’interface, les tests et la documentation.
- [x] Exécuter la validation complète et vérifier l’écran mobile.
