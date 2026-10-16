#!/usr/bin/env bash
# Falla (exit 1) si la semilla del candidato contiene material reservado al evaluador o a los desarrolladores.
#   ./scripts/check-seed.sh <directorio-de-la-semilla>
set -euo pipefail
SEED="${1:?Uso: check-seed.sh <semilla>}"
bad=0
for f in openspec .cursor infra evaluador docs/banco-de-errores.md spec_qa_automation_playground.md; do
  [ ! -e "$SEED/$f" ] || { echo "FUGA: $f esta en la semilla" >&2; bad=1; }
done
# Rutas anidadas o archivos sueltos con nombres delatores
hits="$(find "$SEED" \( -ipath '*evaluador*' -o -iname '*.patch' -o -iname 'progreso*' -o -iname 'banco-de-errores*' \) -not -path '*/node_modules/*' | head)"
[ -z "$hits" ] || { echo "FUGA: rutas sospechosas en la semilla:" >&2; echo "$hits" >&2; bad=1; }
# Referencias a la existencia de defectos o soluciones
refs="$(grep -rIliE 'banco-de-errores|sembrad|challenge-30mins|evaluador|soluciones/ej' "$SEED" --exclude-dir=node_modules 2>/dev/null | head || true)"
[ -z "$refs" ] || { echo "FUGA: referencias al reto en:" >&2; echo "$refs" >&2; bad=1; }
[ $bad -eq 0 ] && echo "Semilla limpia: $SEED" || exit 1
