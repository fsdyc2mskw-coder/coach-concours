#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

if [[ ! -f package.json ]]; then
  echo "package.json introuvable" >&2
  exit 1
fi

if [[ -f package-lock.json ]]; then
  npm ci
else
  npm install
  echo "package-lock.json a été généré. Examiner puis commiter ce fichier."
fi

npm run check

echo "Dépôt validé. Lancer npm run dev pour le développement ou npm run preview pour contrôler dist/."
