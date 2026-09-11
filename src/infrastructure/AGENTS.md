# Instructions infrastructure

Ce dossier contient les frontières vers le navigateur et les services externes.

- Les adaptateurs ne doivent pas contaminer le domaine avec des types propres à un fournisseur.
- Les jetons OAuth restent uniquement en mémoire et ne sont jamais écrits dans IndexedDB, localStorage, les journaux ou un feedback.
- Utiliser le périmètre Google Drive minimal `drive.file` tant que le produit n'exige pas davantage.
- Sérialiser les synchronisations Drive, préserver une proposition Claude réelle et maintenir le schéma de sortie dans le dossier Drive.
- Toute requête externe doit vérifier le statut HTTP et produire une erreur française exploitable.
- L'intégration Garmin officielle doit passer par un service serveur approuvé ; ne jamais embarquer de secret Garmin dans la webapp.
- Prévoir un mode de démonstration ou une solution manuelle lorsque le fournisseur n'est pas configuré.
