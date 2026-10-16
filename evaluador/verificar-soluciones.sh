#!/usr/bin/env bash
# Prueba las soluciones de referencia sobre copias LIMPIAS de la rama sembrada (no toca tu arbol de trabajo):
#   base (sin parches)            -> deben fallar los 5 ejercicios
#   base + ejK                    -> deben fallar todos MENOS el K
#   base + todos                  -> no debe fallar ninguno (suite 6/6)
#   base + todos en orden inverso -> igual (los parches son independientes)
# Uso:  evaluador/verificar-soluciones.sh [REF]     (REF por defecto: HEAD, p. ej. challenge-30mins)
set -uo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
REPO="$(cd "$HERE/.." && pwd)"
REF="${1:-HEAD}"
WORK="$(mktemp -d /tmp/verificar-soluciones.XXXXXX)"
trap 'rm -rf "$WORK"' EXIT
fail=0

# Ejecuta la suite en una copia con los parches indicados y devuelve los ejercicios que fallan (p. ej. "1 3 5").
fallan() {
  local d="$WORK/run"; rm -rf "$d"; mkdir -p "$d"
  git -C "$REPO" archive "$REF" automation app-web | tar -x -C "$d"
  ln -s "$REPO/app-web/node_modules" "$d/app-web/node_modules"
  for p in "$@"; do
    (cd "$d" && git apply "$HERE/soluciones/ej$p.patch") || { echo "PATCH_ERROR_$p"; return; }
  done
  (cd "$d/automation" && mvn -B -q test >"$WORK/mvn.log" 2>&1)
  python3 - "$d/automation/target/surefire-reports" <<'PY'
import glob, re, sys
import xml.etree.ElementTree as ET
bad = set()
for f in glob.glob(sys.argv[1] + '/TEST-*.xml'):
    for tc in ET.parse(f).getroot().iter('testcase'):
        if tc.find('failure') is not None or tc.find('error') is not None:
            m = re.search(r'Ejercicio (\d)', tc.get('name', '') + tc.get('classname', ''))
            bad.add(m.group(1) if m else '?')
print(' '.join(sorted(bad)) or '-')
PY
}

esperar() { # $1=etiqueta $2=esperado $3..=parches
  local et="$1" esp="$2"; shift 2
  local got; got="$(fallan "$@")"
  if [ "$got" = "$esp" ]; then printf '  OK    %-28s fallan: %s\n' "$et" "$got"
  else printf '  FALLO %-28s fallan: %s (esperado: %s)\n' "$et" "$got" "$esp"; fail=1; fi
}

echo "Referencia: $REF"
esperar "base (sembrada)" "1 2 3 4 5"
for k in 1 2 3 4 5; do
  esp="$(for j in 1 2 3 4 5; do [ "$j" != "$k" ] && printf '%s ' "$j"; done)"
  esperar "base + ej$k" "${esp% }" "$k"
done
esperar "base + todos" "-" 1 2 3 4 5
esperar "base + todos (inverso)" "-" 5 4 3 2 1
[ $fail -eq 0 ] && echo "Soluciones verificadas." || { echo "Hay diferencias."; exit 1; }
