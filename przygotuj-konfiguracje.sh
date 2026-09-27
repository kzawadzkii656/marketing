#!/bin/sh
set -eu
cd "$(dirname "$0")"
if [ ! -f google-config.mjs ]; then
  cp google-config.example.mjs google-config.mjs
  echo 'Konfiguracja utworzona. Tryb lokalny działa; Google wymaga uzupełnienia Client ID.'
else
  echo 'Zachowano dotychczasową konfigurację Google.'
fi
