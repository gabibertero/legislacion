#!/bin/bash
# Verifica un sitio publicado: pega a cada index.html del build y a cada svg/jpg/png, cuenta por código HTTP y lista los que no dan 200.
# Uso: scripts/verificar-online.sh <url-base> <carpeta-docs>   ej: scripts/verificar-online.sh https://usuario.github.io/AM2/ ../docs
set -u
[ $# -eq 2 ] || { echo "Uso: $0 <url-base> <carpeta-docs>"; exit 2; }
URL="${1%/}"; DOCS="${2%/}"
[ -d "$DOCS" ] || { echo "No existe $DOCS"; exit 2; }
TMP="$(mktemp)"
(cd "$DOCS" && find . \( -name index.html -o -name '*.svg' -o -name '*.jpg' -o -name '*.png' \) -not -path '*/node_modules/*' | sed 's|^\./||' | sort) | while IFS= read -r rel; do
  ruta="${rel%index.html}"
  code="$(curl -s -o /dev/null -L -w '%{http_code}' --max-time 20 "$URL/$(printf '%s' "$ruta" | sed 's/ /%20/g')")"
  echo "$code $URL/$ruta"
done > "$TMP"
echo "Conteo por código HTTP:"; cut -d' ' -f1 "$TMP" | sort | uniq -c | sort -rn
MAL="$(grep -v '^200 ' "$TMP")"
if [ -n "$MAL" ]; then echo "No dan 200:"; echo "$MAL"; rm -f "$TMP"; exit 1; fi
echo "Todo en 200 ($(wc -l < "$TMP" | tr -d ' ') URLs)."; rm -f "$TMP"
