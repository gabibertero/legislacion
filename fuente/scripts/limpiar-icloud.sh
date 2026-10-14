#!/bin/bash
# Borra las copias en conflicto que crea iCloud ("nombre 2", "nombre 2.ext") en fuente/ y ../docs, salvo node_modules.
# Uso: scripts/limpiar-icloud.sh [--dry]   (--dry solo lista)
set -u
RAIZ="$(cd "$(dirname "$0")/.." && pwd)"
for d in "$RAIZ" "$RAIZ/../docs"; do
  [ -d "$d" ] || continue
  find "$d" -name node_modules -prune -o \( -name '* [2-9]' -o -name '* [2-9].*' \) -print | while IFS= read -r f; do
    if [ "${1:-}" = "--dry" ]; then echo "$f"; else rm -rf "$f" && echo "borrado: $f"; fi
  done
done
