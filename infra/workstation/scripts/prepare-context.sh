#!/usr/bin/env bash
# Genera infra/workstation/.build con todo lo que necesita el Dockerfile.
# La semilla sale de `git archive` de la rama indicada (SIN historial) excluyendo lo que no debe ver el candidato.
# Uso: BRANCH=development ./scripts/prepare-context.sh   (para el reto: BRANCH=challenge-30mins)
set -euo pipefail
HERE="$(cd "$(dirname "$0")/.." && pwd)"
REPO="$(cd "$HERE/../.." && pwd)"
BRANCH="${BRANCH:-development}"
OUT="$HERE/.build"

rm -rf "$OUT" && mkdir -p "$OUT/seed"
# Las exclusiones se aplican en git archive para que esos archivos ni siquiera se extraigan.
git -C "$REPO" archive "$BRANCH" -- . ':!openspec' ':!.cursor' ':!infra' \
    ':!docs/banco-de-errores.md' ':!spec_qa_automation_playground.md' | tar -x -C "$OUT/seed"

# Comprobacion: nada de lo excluido debe haber llegado a la semilla
for f in openspec .cursor infra docs/banco-de-errores.md spec_qa_automation_playground.md; do
  [ ! -e "$OUT/seed/$f" ] || { echo "ERROR: $f llego a la semilla" >&2; exit 1; }
done

# README propio del candidato (el del repositorio menciona el banco de errores y la rama del reto)
cp "$HERE/config/candidate-README.md" "$OUT/seed/README.md"
if grep -qiE 'banco-de-errores|challenge-30mins|sembrad' "$OUT/seed/README.md"; then
  echo "ERROR: el README del candidato delata el reto" >&2; exit 1
fi

cp "$HERE/Dockerfile" "$HERE/extensions.txt" "$OUT/"
cp -R "$HERE/scripts" "$HERE/config" "$HERE/startup" "$OUT/"
echo "Contexto listo en $OUT (rama $BRANCH, commit $(git -C "$REPO" rev-parse --short "$BRANCH"))"
echo "Archivos en la semilla:"; (cd "$OUT/seed" && find . -type f | sort | head -80)
