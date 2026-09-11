# Expérience utilisateur mobile

## Cible de conception

Le viewport de référence du projet est fixé à **393 × 852 pixels CSS** en portrait. C'est un critère interne de test pour l'iPhone 14 Pro, pas une limite empêchant l'interface de s'adapter à d'autres écrans.

## Principes

- Une action principale par écran.
- Information la plus urgente dans le premier écran visible.
- Navigation fixe en bas, au-dessus de la zone sûre iOS.
- Bouton Feedback toujours accessible sans masquer l'action principale.
- Données chiffrées affichées avec leur unité.
- Pas de tableau large nécessitant un défilement horizontal.
- Les formulaires utilisent les claviers numériques adaptés.
- Les erreurs restent proches du champ ou de l'action concernée.

## Écrans

### Onboarding

But : produire le premier plan en moins de deux minutes.

Entrées :

- connexion Google lorsque requise ;
- nom affiché ;
- objectif course ou progression ;
- date, distance et dénivelé pour une course ;
- volume hebdomadaire et allure facile provisoires.

Un mode démonstration existe seulement lorsque la connexion Google n'est pas imposée.

### Tableau de bord

Ordre visuel :

1. séance du jour ou prochain entraînement ;
2. avancement de la semaine ;
3. objectif principal ;
4. prochaines séances.

### Plan

Vue par semaine. L'utilisateur peut parcourir les semaines et ouvrir une séance. Le déplacement utilise une date explicite afin d'éviter un glisser-déposer fragile sur petit écran.

### Séance

Affiche :

- type ;
- description ;
- durée, distance et dénivelé prévus ;
- allure cible et consignes de terrain ;
- segments ;
- justification ;
- aide concrète pour construire un parcours avec D+ ou répéter une côte ;
- idées de terrains et parcours suisses classées selon la distance, le D+ et une région modifiable, avec Lausanne par défaut ;
- déplacement ;
- formulaire de réalisation ;
- action d'annulation.

### Activités

Affiche l'historique normalisé. Offre :

- ajout manuel ;
- données de démonstration ;
- synchronisation du pont Garmin lorsqu'il est configuré ;
- régénération contrôlée du plan après import.

### Réglages

Regroupe :

- Google Drive ;
- export local pour Claude ;
- lecture, import, aperçu et application d'une adaptation ;
- mode d'adaptation ;
- capture automatique des feedbacks ;
- état Garmin ;
- maintenance et réinitialisation.

## États à vérifier

Chaque écran doit être testé avec :

- aucune donnée ;
- données longues ;
- clavier ouvert ;
- mode hors ligne ;
- erreur de service ;
- chargement ;
- texte agrandi ;
- thème clair système. Le thème sombre est hors périmètre initial.

## Accessibilité minimale

- éléments interactifs utilisables au clavier ;
- libellés explicites ;
- `aria-label` pour les icônes seules ;
- contraste suffisant ;
- messages d'erreur avec rôle d'alerte ;
- aucune information portée uniquement par une couleur ;
- respect de `prefers-reduced-motion` pour les animations futures.
