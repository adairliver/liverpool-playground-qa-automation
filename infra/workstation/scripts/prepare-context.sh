#!/usr/bin/env bash
# Genera infra/workstation/.build con todo lo que necesita el Dockerfile.
# La semilla sale de `git archive` de la rama indicada (SIN historial) excluyendo lo que no debe ver el candidato.
# Uso: BRANCH=development ./scripts/prepare-context.sh   (para el reto: BRANCH=challenge-30mins)
set -euo pipefail
HERE="$(cd "$(dirname "$0")/.." && pwd)"
REPO="$(cd "$HERE/../.." && pwd)"
BRANCH="${BRANCH:-development}"
OUT="${OUT:-$HERE/.build}"   # carpeta de contexto (configurable para construir dos imagenes en paralelo)

rm -rf "$OUT" && mkdir -p "$OUT/seed"
# Las exclusiones se aplican en git archive para que esos archivos ni siquiera se extraigan.
git -C "$REPO" archive "$BRANCH" -- . ':!openspec' ':!.cursor' ':!infra' ':!evaluador' \
    ':!docs/banco-de-errores.md' ':!spec_qa_automation_playground.md' | tar -x -C "$OUT/seed"

# Video del estado esperado para el candidato (subtitulos neutros, generado con MODO=candidato; ver evaluador/video).
# Solo va en la imagen del reto; la ruta fuente (evaluador/) nunca entra a la semilla, se copia con otro nombre.
VIDEO_SRC="evaluador/media-candidato/estado-esperado.mp4"
if [ "${INCLUDE_REFERENCE:-$([ "$BRANCH" = challenge-30mins ] && echo 1 || echo 0)}" = 1 ]; then
  mkdir -p "$OUT/seed/referencia"
  git -C "$REPO" show "$BRANCH:$VIDEO_SRC" > "$OUT/seed/referencia/estado-esperado.mp4" \
    || { echo "Falta $VIDEO_SRC en la rama $BRANCH (genera el video con: cd evaluador/video && npm run grabar:candidato)" >&2; exit 1; }
  # Salvaguarda: el video del evaluador lleva las soluciones en los subtitulos y jamas debe llegar al candidato.
  EVAL_SHA="$(git -C "$REPO" show "$BRANCH:evaluador/media/estado-al-100.mp4" 2>/dev/null | shasum -a 256 | cut -d' ' -f1)"
  CAND_SHA="$(shasum -a 256 "$OUT/seed/referencia/estado-esperado.mp4" | cut -d' ' -f1)"
  [ "$EVAL_SHA" != "$CAND_SHA" ] || { echo "FUGA: el video de la semilla es el del evaluador" >&2; exit 1; }
  WITH_VIDEO=1
else
  WITH_VIDEO=0
fi

# README propio del candidato (el del repositorio menciona el banco de errores y la rama del reto).
# Los bloques <!--VIDEO--> solo se conservan si la imagen lleva el video; <!--SINVIDEO--> solo si no lo lleva.
python3 - "$HERE/config/candidate-README.md" "$OUT/seed/README.md" "$WITH_VIDEO" "${PROGRESS_BUCKET:+1}" <<'PY'
import re, sys
src, dst, con = sys.argv[1], sys.argv[2], sys.argv[3] == "1"
con_agente = sys.argv[4] == "1"   # el aviso <!--EVAL--> solo va si la imagen lleva el agente de progreso
t = open(src, encoding="utf-8").read()
keep, drop = ("VIDEO", "SINVIDEO") if con else ("SINVIDEO", "VIDEO")
t = re.sub(rf"<!--{drop}-->.*?<!--/{drop}-->\n", "", t, flags=re.S)
t = re.sub(rf"<!--/?{keep}-->\n", "", t)
if con_agente:
    t = re.sub(r"<!--/?EVAL-->\n", "", t)
else:
    t = re.sub(r"<!--EVAL-->.*?<!--/EVAL-->\n", "", t, flags=re.S)
assert "<!--" not in t, "quedaron marcadores sin resolver"
open(dst, "w", encoding="utf-8").write(t)
PY
# Comprobacion final: nada reservado al evaluador/desarrolladores debe estar en la semilla (ver check-seed.sh)
"$HERE/scripts/check-seed.sh" "$OUT/seed"

cp "$HERE/Dockerfile" "$HERE/extensions.txt" "$OUT/"
cp -R "$HERE/scripts" "$HERE/config" "$HERE/startup" "$HERE/extension" "$HERE/agent" "$OUT/"
# Agente de progreso: solo se activa si se indica PROGRESS_BUCKET (la imagen de development no lo lleva).
if [ -n "${PROGRESS_BUCKET:-}" ]; then
  printf '%s\n' "$PROGRESS_BUCKET" > "$OUT/agent/bucket"
  echo "Agente de progreso activado hacia gs://$PROGRESS_BUCKET"
fi
echo "Contexto listo en $OUT (rama $BRANCH, commit $(git -C "$REPO" rev-parse --short "$BRANCH"))"
echo "Archivos en la semilla:"; (cd "$OUT/seed" && find . -type f | sort | head -80)
