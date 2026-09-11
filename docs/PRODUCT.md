# Spécification produit

## Problème

L'utilisateur souhaite un outil personnel de préparation au trail qui rassemble :

- un plan clair et mobile ;
- l'historique réel de course ;
- son ressenti après chaque séance ;
- une adaptation régulière par Claude ;
- un canal de feedback produit utilisable pendant le développement.

Les applications existantes couvrent chacune une partie du besoin, mais le produit recherché est volontairement personnel, simple et contrôlable.

## Utilisateur

Une seule personne, sur iPhone 14 Pro. Il n'y a pas de rôle administrateur, d'entraîneur externe ni de partage public.

## Proposition de valeur

Ouvrir l'app, voir immédiatement la séance du jour, l'exécuter, noter l'effort et un commentaire, puis mettre à disposition de Claude un contexte suffisamment structuré pour adapter les séances futures.

## Périmètre du produit minimum viable

### Inclus

- objectif unique de progression générale ou de course ;
- course de 5 à 30 km ;
- date, distance et dénivelé positif pour une course ;
- plan de 1 à 24 semaines ;
- calendrier hebdomadaire et séance détaillée ;
- déplacement manuel des séances futures, sauf la course objectif ;
- intensité principalement prescrite par allure, avec ressenti de secours pour les côtes et le terrain technique ;
- activités : distance, durée, allure moyenne, fréquence cardiaque moyenne facultative et dénivelé positif ;
- ressenti après séance : effort de 1 à 5 et texte libre ;
- stockage local ;
- export et synchronisation Google Drive ;
- analyse de Claude hors de l'app ;
- aperçu, garde-fous et application d'une adaptation structurée avec protection de la course objectif ;
- feedback produit global avec capture et métadonnées techniques ;
- installation comme application web progressive.

### Hors périmètre initial

- plusieurs utilisateurs ;
- plusieurs objectifs simultanés ;
- paiement ou abonnement ;
- réseau social ;
- messagerie avec un coach ;
- appel direct à Claude depuis l'app ;
- prédiction médicale, diagnostic, prévention automatisée des blessures ;
- navigation GPS et création de parcours ;
- export direct des séances structurées vers une montre ;
- publication App Store ;
- intégration Garmin sans accès officiel approuvé.

## Principes d'usage

### Avant une séance

L'écran d'accueil met en avant :

1. la séance du jour ;
2. la progression de la semaine ;
3. le prochain jalon de l'objectif.

### Après une séance

L'utilisateur enregistre au minimum :

- distance réelle ;
- durée réelle ;
- dénivelé positif réel ;
- effort de 1 à 5 ;
- commentaire libre.

La fréquence cardiaque moyenne est facultative.

### Adaptation

Le moteur local ne prétend pas comprendre tout le contexte. Il produit un plan cohérent et déterministe. Claude reçoit ensuite l'état du plan, les activités et les ressentis. Il propose uniquement des opérations structurées sur les séances futures.

Par défaut, l'utilisateur examine et valide l'adaptation. Un mode automatique sûr peut être activé, mais uniquement lorsqu'aucun avertissement n'est déclenché. Les modifications bloquantes — version obsolète, séance passée ou course objectif ciblée, par exemple — sont toujours refusées.

### Feedback produit

Un bouton Feedback reste accessible sur chaque écran. Il permet de sélectionner l'écran ou le bloc fonctionnel précis concerné. Le retour contient :

- texte libre ;
- route et fonction ;
- version de l'app ;
- dimensions de la fenêtre et de l'écran ;
- navigateur, langue et état réseau ;
- dernière erreur technique connue ;
- capture de l'écran, si disponible.

## Exigences non fonctionnelles

- fonctionnement à 393 × 852 pixels CSS ;
- cible tactile minimale de 44 pixels CSS pour les actions principales ;
- respect des zones sûres iOS ;
- plan consultable hors ligne après chargement ;
- aucune perte silencieuse des données locales ;
- aucune clé secrète dans le bundle ;
- validation stricte des entrées externes ;
- messages d'erreur exploitables en français ;
- performance acceptable sur iPhone 14 Pro sans dépendance à un backend pour le rendu courant.

## Mesure de réussite du produit minimum viable

Le produit minimum viable est réussi lorsque l'utilisateur peut accomplir pendant deux semaines le cycle suivant sans modifier manuellement des fichiers internes :

```text
consulter → courir → enregistrer → synchroniser → faire analyser → prévisualiser → adapter
```

Les critères détaillés se trouvent dans `ACCEPTANCE.md`.
