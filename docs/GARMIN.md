# Stratégie Garmin

## Besoin

Récupérer automatiquement depuis Garmin :

- distance ;
- durée ;
- allure ;
- fréquence cardiaque moyenne ;
- dénivelé positif ;
- identifiant externe et date.

Ces données servent au calibrage initial, au suivi des séances réalisées et au contexte envoyé à Claude.

## Contrainte officielle

Le Garmin Connect Developer Program est destiné aux intégrations professionnelles approuvées. L'accès à ses interfaces de programmation d'application est soumis à une demande et à un accord. Les secrets, jetons et notifications doivent être gérés côté serveur.

Une webapp GitHub Pages personnelle ne peut donc pas assurer seule une intégration officielle complète et sécurisée.

## Décision

Le frontend définit un contrat `GarminProvider` et deux implémentations :

- `DemoGarminProvider` pour développer et tester sans compte ;
- `OfficialGarminBridgeProvider` pour appeler plus tard un service serveur approuvé.

Aucune bibliothèque non officielle qui demande le mot de passe Garmin n'est intégrée.

## Contrat du pont

Le frontend attend une réponse normalisée depuis une URL configurée dans `VITE_GARMIN_BRIDGE_URL`.

Requête indicative :

```http
GET /api/garmin/activities?since=2026-08-01T00:00:00.000Z
Accept: application/json
```

Réponse :

```json
{
  "activities": [
    {
      "id": "activity-local-or-provider-id",
      "externalId": "garmin-123456",
      "source": "garmin",
      "name": "Trail running",
      "startedAt": "2026-08-09T07:10:00.000Z",
      "durationSec": 4520,
      "distanceM": 11240,
      "averagePaceSecPerKm": 402,
      "averageHeartRateBpm": 148,
      "elevationGainM": 620,
      "importedAt": "2026-08-10T16:00:00.000Z"
    }
  ],
  "syncedAt": "2026-08-10T16:00:00.000Z"
}
```

Le contrat final devra inclure l'authentification du propriétaire et la pagination. Le frontend ne doit pas supposer que l'identifiant Garmin est secret.

## Responsabilités du pont futur

- authentification de l'utilisateur de Trail Coach ;
- gestion des autorisations Garmin ;
- stockage chiffré des jetons ;
- réception des notifications d'activité lorsque l'API le permet ;
- récupération des détails ou fichiers d'activité ;
- normalisation et déduplication ;
- limitation des données renvoyées ;
- journalisation sans données sensibles ;
- suppression et révocation.

## Mode avant approbation

Le produit reste testable avec :

- données de démonstration ;
- saisie manuelle d'une activité ;
- éventuellement import de fichiers FIT, GPX ou TCX dans un jalon ultérieur, sans contourner Garmin Connect.

**FIT** signifie Flexible and Interoperable Data Transfer. **GPX** signifie GPS Exchange Format. **TCX** signifie Training Center XML.

## Critère d'activation

Ne développer le backend Garmin qu'après :

1. validation du besoin quotidien avec le produit local ;
2. décision d'hébergement ;
3. approbation du programme Garmin ;
4. réception des documents et identifiants officiels ;
5. définition d'un modèle de sécurité.

## Références officielles

- Présentation du programme : https://developer.garmin.com/gc-developer-program/overview/
- Activity API : https://developer.garmin.com/gc-developer-program/activity-api/
- Questions fréquentes : https://developer.garmin.com/gc-developer-program/program-faq/
