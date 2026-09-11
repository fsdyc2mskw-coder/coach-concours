# Coach Concours — état de l’implémentation du 8 septembre 2026

## Source sportive appliquée

Cette version utilise les documents `docs/police-v1` mis à jour le 7 septembre comme
source sportive. Elle ne reprend pas les anciens types `police_strength`,
`police_integration` ou `trail_maintenance` du paquet préparé antérieurement.

La semaine ordinaire contient exactement :

1. le CrossFit coaché du lundi, dont le contenu n’est pas inventé ;
2. une séance personnelle d’explosivité dans la salle de CrossFit ;
3. une seule course, sous forme d’intervalles explosifs en extérieur ;
4. une séance technique police ;
5. une séance coordination et équilibre.

Les séances en salle, technique et coordination contiennent chacune un seul jeu mémoire.
Les exercices de substitution sont signalés comme approximations et ne produisent aucune
équivalence avec le circuit officiel.

## Boucle utilisateur disponible

- consultation de toutes les semaines du 7 septembre au 20 novembre 2026 ;
- détails structurés : but, matériel, échauffement, blocs, récupération et postes ciblés ;
- réponse révélable aux jeux mémoire ;
- retour `terminée`, `partielle` ou `passée`, effort 1–5 et note facultative ;
- qualité du mouvement et hésitation à la box pour les séances explosives ;
- signaux de chevauchement du CrossFit coaché ;
- adaptation déterministe du volume et des régressions de qualité ;
- événement trail du 11 octobre en remplacement de la course ;
- concours de police fixé au 20 novembre, sans séance après cette date.

## Stockage et migration

L’application utilise `coach-concours-db` et la clé de secours
`coach-concours-state-v2`. Elle ne supprime ni ne modifie `trail-coach-db`. Lors de la
première ouverture, l’ancienne enveloppe est lue si elle existe et copiée dans la section
de migration du nouvel état.

La synchronisation Google Drive utilise le périmètre OAuth `drive.file`, conserve le
jeton seulement en mémoire et écrit l’état complet dans :

`Coach Concours/Données application/coach-concours-state-v2.json`

Les sauvegardes manuelles horodatées vont dans `Coach Concours/Sauvegardes`.
IndexedDB sert de cache hors connexion et de file d’attente quand Drive n’est pas connecté.

## Contrôles exécutés

- TypeScript strict : réussi ;
- 16 tests ciblés du nouveau domaine et du schéma : réussis ;
- build Vite/PWA de production : réussi ;
- ouverture mobile, expansion d’une séance et révélation mémoire : vérifiées ;
- saisie d’un retour, nouvelle ouverture et restauration du compteur : vérifiées ;
- retour de contrôle ensuite retiré : état final à 0 séance terminée.

## Contrôle restant

La connexion OAuth et l’écriture réelle depuis l’écran de l’app n’ont pas été exécutées,
car `VITE_GOOGLE_CLIENT_ID` n’est pas configuré dans la copie locale. Le code et le
dossier cible sont prêts ; le paquet source est conservé séparément dans Google Drive.
