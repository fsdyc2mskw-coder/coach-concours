# Instructions domaine

Ce dossier contient le cœur métier. Il ne doit dépendre ni de React, ni du navigateur, ni de Google Drive, ni de Garmin.

- Préférer des fonctions pures et déterministes.
- Permettre l'injection d'une date de référence dans tout calcul dépendant du temps.
- Maintenir les unités explicites dans les noms (`Km`, `M`, `Min`, `Sec`, `Bpm`).
- Toute modification de charge doit conserver les garde-fous définis dans `docs/TRAINING_ENGINE.md`.
- Une adaptation externe doit échouer fermement si le schéma, le plan de base, la version ou une séance ciblée ne correspondent pas.
- Préserver `goalWorkoutId` : aucun déplacement, remplacement, annulation externe ni doublon le jour de la course.
- Les plages d'allure doivent respecter `minSecPerKm <= maxSecPerKm`.
- Chaque règle métier nouvelle exige des tests de cas normal, limite et erreur.
