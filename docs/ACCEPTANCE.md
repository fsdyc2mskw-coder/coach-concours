# Critères d'acceptation du produit minimum viable

## A. Installation et démarrage

- [ ] Un clone propre fonctionne avec `npm install` puis `npm run dev`.
- [ ] `npm run validate:schemas`, `npm run typecheck`, `npm run test` et `npm run build` réussissent.
- [ ] Le build GitHub Pages s'ouvre sans erreur de ressource.
- [ ] L'application peut être ajoutée à l'écran d'accueil d'un iPhone 14 Pro.

## B. Premier plan

- [ ] Sans données existantes, l'onboarding s'affiche.
- [ ] En mode authentification obligatoire, le plan ne peut pas être créé sans Google.
- [ ] Une course inférieure à 5 km ou supérieure à 30 km est refusée.
- [ ] Un objectif valide produit un plan de 1 à 24 semaines.
- [ ] Un plan créé en milieu de semaine ne contient aucune séance antérieure à sa date de départ.
- [ ] Une progression générale produit un cycle de huit semaines.
- [ ] Pour une course, la date de fin correspond exactement à la course et aucune séance n'est postérieure.
- [ ] La séance du jour ou la prochaine séance est visible sur le tableau de bord.

## C. Plan et séances

- [ ] Chaque semaine affiche distance et dénivelé cibles cohérents avec ses séances actives.
- [ ] Une séance présente durée, distance, dénivelé, allure, segments et justification.
- [ ] Une séance future ordinaire peut être déplacée vers une date du plan.
- [ ] La course objectif ne peut pas être déplacée depuis le calendrier.
- [ ] Le déplacement persiste après rechargement.
- [ ] Une séance peut être marquée annulée.
- [ ] Déplacer, terminer ou annuler incrémente la version du plan.

## D. Réalisation

- [ ] L'utilisateur peut saisir distance, durée, dénivelé, fréquence cardiaque facultative, effort 1–5 et commentaire.
- [ ] La séance passe à terminée et référence l'activité créée.
- [ ] L'activité apparaît dans l'historique.
- [ ] Le ressenti apparaît dans l'export Claude.
- [ ] Les données persistent après fermeture et réouverture.

## E. Google Drive

- [ ] La connexion Google fonctionne depuis l'origine déployée.
- [ ] Le dossier et les sous-dossiers sont créés une seule fois, même lors de demandes rapprochées.
- [ ] Les fichiers de contexte sont mis à jour sans duplication.
- [ ] `plan-update.schema.json` est disponible dans le dossier Claude.
- [ ] Une proposition Claude réelle n'est pas écrasée par une synchronisation ordinaire.
- [ ] Chaque ressenti est archivé en JSON et Markdown sans duplication.
- [ ] Une expiration de jeton produit une erreur claire sans perte locale.
- [ ] Une reconnexion permet de reprendre la synchronisation.
- [ ] Le jeton n'apparaît pas dans IndexedDB, localStorage, les fichiers ou les feedbacks.

## F. Claude

- [ ] Le contexte Markdown est lisible et le JSON contient les identifiants exacts, dont `goalWorkoutId`.
- [ ] L'exemple d'adaptation valide peut être prévisualisé.
- [ ] Un JSON mal formé est refusé.
- [ ] Une mauvaise version ou un mauvais plan est refusé.
- [ ] Une adaptation ciblant une séance passée, traitée ou la course objectif est refusée.
- [ ] Une séance ajoutée le jour de la course est refusée.
- [ ] Une plage d'allure inversée est refusée.
- [ ] Les avertissements de distance et de dénivelé sont affichés.
- [ ] Une adaptation acceptée incrémente la version du plan.
- [ ] Une adaptation devenue obsolète après sa prévisualisation est refusée au moment de l'application.
- [ ] Le mode automatique sûr ne peut appliquer une adaptation avec avertissement.

## G. Feedback produit

- [ ] Le bouton Feedback existe sur tous les écrans applicatifs.
- [ ] Les blocs fonctionnels de l'écran peuvent être sélectionnés comme contexte du retour.
- [ ] Le texte est obligatoire.
- [ ] Une capture peut être créée, reprise ou omise.
- [ ] Le retour contient version, route, fonction, dimensions, navigateur, état réseau et dernière erreur.
- [ ] Le feedback reste en attente hors ligne puis se synchronise.
- [ ] Drive reçoit JSON, Markdown et capture séparée.

## H. Garmin

- [ ] Le mode démonstration importe des activités normalisées.
- [ ] L'absence de pont officiel n'empêche pas l'usage local.
- [ ] Aucun identifiant Garmin n'est demandé par la webapp.
- [ ] Un pont configuré peut renvoyer des activités conformes au contrat ; une réponse invalide est refusée.

## I. Mobile et accessibilité

- [ ] Aucun défilement horizontal à 393 × 852 pixels CSS.
- [ ] La navigation et le bouton Feedback respectent la zone sûre inférieure.
- [ ] Les actions principales ont une cible tactile suffisante.
- [ ] Le clavier ne masque pas définitivement le bouton de soumission.
- [ ] Les erreurs sont annoncées et lisibles sans dépendre uniquement de la couleur.
