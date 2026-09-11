# Moteur d'entraînement

## Statut

Le moteur actuel est une **heuristique initiale**, déterministe et testable. Il n'est pas présenté comme un protocole scientifiquement validé, une prescription médicale ou un substitut à un entraîneur qualifié.

Son objectif est de créer une structure cohérente que l'utilisateur et Claude peuvent ensuite ajuster. La version actuelle est `rules-0.3.1`.

## Entrées

- profil ;
- objectif ;
- activités récentes ;
- date de départ.

### Profil utilisé

- volume hebdomadaire de référence ;
- allure facile de référence ;
- nombre cible de séances de course ;
- nombre cible de séances de renforcement.

### Objectif utilisé

Pour une course : date, distance de 5 à 30 km et dénivelé positif. Pour une progression générale : cycle fixe de huit semaines.

### Historique

Le moteur observe jusqu'aux 28 derniers jours :

- distance totale ;
- dénivelé positif total ;
- médiane des allures plausibles ;
- nombre de courses.

En l'absence d'historique, il utilise les valeurs provisoires du profil.

## Durée et limites du plan

- course : nombre de semaines calendaires entre le lundi de la semaine de départ et la course, limité entre 1 et 24 ;
- progression générale : 8 semaines ;
- si le plan commence en milieu de semaine, toutes les séances antérieures à la date de départ sont supprimées ;
- pour une course, `endDate` correspond exactement à la date de course et aucune séance n'est placée après ;
- la course reçoit un `goalWorkoutId` stable dans le plan.

## Phases

- **Base** : développement régulier, côtes et seuil alternés.
- **Construction** : intensité plus spécifique et augmentation graduelle.
- **Pic** : volume et dénivelé proches du maximum du cycle.
- **Allègement** : réduction sur les deux dernières semaines.

Toutes les quatre semaines hors allègement, une semaine de charge réduite est appliquée.

## Semaine type

Le moteur génère actuellement cinq éléments :

- mardi : séance de qualité ;
- mercredi : renforcement ;
- jeudi : endurance facile ;
- samedi : soutien ou récupération ;
- dimanche : sortie longue ou randonnée-course.

Le calendrier est une proposition. L'utilisateur peut déplacer les séances futures, sauf la course objectif. Le volume et le dénivelé cibles de la semaine sont recalculés après un déplacement ou une annulation.

## Intensité

L'allure est la prescription principale. Chaque cible contient :

- borne rapide en secondes par kilomètre ;
- borne lente en secondes par kilomètre ;
- ressenti d'effort de secours de 1 à 5 ;
- note de terrain facultative.

La relation obligatoire est `minSecPerKm <= maxSecPerKm`. Une adaptation externe contenant une plage inversée est refusée avant application.

Sur une pente ou un terrain technique, l'allure absolue perd de sa pertinence ; la note de terrain et le ressenti deviennent la référence de secours.

## Volume et dénivelé

Le volume de départ est borné pour éviter les valeurs aberrantes. Le pic dépend à la fois de l'historique et de la distance de course. Le dénivelé suit une progression distincte et est réduit pendant les semaines de récupération et d'allègement.

Le dénivelé indiqué sur une séance est une cible approximative, pas une obligation exacte. L'interface explique comment utiliser le profil altimétrique d'une carte ou répéter une côte proche. La durée et l'effort prévu restent prioritaires : l'utilisateur ne doit pas rallonger inutilement la sortie uniquement pour atteindre le chiffre de D+.

Les séances de renforcement sont conçues pour être réalisées à domicile, au poids du corps et sans matériel. Elles utilisent des mouvements simples pour les jambes, les chevilles et le tronc, sans séries à l'échec.

Les formules sont visibles dans `src/domain/planEngine.ts`. Toute modification doit conserver un test déterministe avec date injectée.

## Garde-fous des adaptations Claude

Une adaptation peut être appliquée manuellement même avec avertissement, mais le mode automatique sûr exige zéro avertissement.

Avertissements actuels :

- plus de 10 opérations en une adaptation ;
- hausse de distance hebdomadaire supérieure à 15 % par rapport au plan courant ;
- hausse de dénivelé positif hebdomadaire supérieure à 20 % par rapport au plan courant ;
- augmentation au-delà de deux séances de qualité dans une semaine ;
- augmentation de la part de sortie longue au-delà de 50 % du volume hebdomadaire.

Les deux derniers avertissements comparent l'état proposé au plan courant. Une caractéristique déjà présente dans le plan initial, notamment la course objectif qui peut représenter une part élevée de la dernière semaine, ne bloque donc pas à elle seule une adaptation sans rapport.

Refus bloquants avant avertissement :

- mauvais identifiant ou mauvaise version de plan ;
- séance inexistante, passée, terminée ou ignorée ;
- plusieurs opérations sur la même séance ;
- date hors de la période ;
- plage d'allure inversée ;
- modification, déplacement ou annulation de la course objectif ;
- ajout d'une autre séance le jour de la course.

Les identifiants de segments fournis par un fichier externe sont remplacés par des identifiants locaux afin d'éviter les collisions.

Une adaptation déjà prévisualisée est revalidée contre le plan courant au moment exact de l'application. Tout déplacement, achèvement ou abandon intervenu entre les deux rend la proposition obsolète.

Les avertissements ne constituent pas une garantie contre la blessure. Ils servent à bloquer des modifications manifestement agressives ou incohérentes.

## Version du plan

La version du plan est incrémentée après :

- déplacement ;
- achèvement d'une séance ;
- annulation d'une séance ;
- adaptation Claude non vide.

Cette version optimiste empêche une adaptation produite sur un état ancien d'écraser les changements plus récents.

## Données encore non utilisées

La fréquence cardiaque est stockée mais n'influence pas encore le moteur initial. Le ressenti est exporté pour Claude mais ne déclenche pas encore une règle locale automatique. Ces choix sont intentionnels pour garder le premier moteur simple et observable.

## Évolutions possibles après validation

- calibration par historique Garmin plus robuste ;
- charge combinée durée–dénivelé–intensité ;
- détection de séances manquées ;
- semaine adaptative locale ;
- disponibilité et durée maximale par jour ;
- profils de terrain ;
- export de séance structurée vers une montre.

Chaque évolution doit être testée avec des scénarios réels anonymisés et rester explicable dans l'interface.
