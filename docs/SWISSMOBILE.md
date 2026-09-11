# Itinéraires SuisseMobile

L’application embarque une copie locale des itinéraires pédestres officiels SuisseMobile. Elle peut donc afficher et classer les parcours sans réseau et ne génère jamais elle-même un tracé.

## Actualiser le catalogue

1. Renseigner `MYSWITZERLAND_API_KEY` dans `.env.local`.
2. Lancer `npm run sync:swiss-trails` pour actualiser le catalogue et ses géométries.
3. Valider l’application avec `npm run check`.

Le script interroge l’API OpenData de Switzerland Tourism en français, filtre l’origine `schweiz-mobil` et le type `hike`, récupère le premier point de la géométrie officielle de chaque itinéraire, puis écrit `src/data/swiss-trails.generated.json`. La clé n’est ni copiée dans ce fichier ni exposée au frontend.

Les géométries déjà obtenues sont conservées dans un cache local ignoré par Git. Si le quota de l’API interrompt une synchronisation, `npm run sync:swiss-trails:resume` reprend uniquement les géométries manquantes. Le catalogue actuel contient 650 départs vérifiés sur 1 065 ; les 415 autres restent visibles avec « Distance inconnue » et ne participent pas au classement de proximité tant que leur géométrie n’a pas été obtenue.

Le catalogue conserve uniquement les informations utiles aux suggestions : nom, départ et arrivée, coordonnées officielles lorsqu’elles existent, distance, D+, D−, durée, difficulté, saison, résumé, avertissement et lien vers la fiche SuisseMobile.

Source : SuisseMobile via Switzerland Tourism OpenData. Licence des données : CC BY-SA 4.0.
