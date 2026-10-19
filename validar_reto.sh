#!/usr/bin/env bash
# Validador del reto (para el candidato): ejecuta la suite y resume tu avance en porcentaje por ejercicio.
# Ubicado en la raiz del proyecto; corre desde cualquier directorio.  No modifiques este archivo.
set -uo pipefail

HERE="$(cd "$(dirname "$0")" && pwd)"
AUTO="$HERE/automation"
cd "$AUTO" 2>/dev/null || { echo "No encuentro la carpeta 'automation/' junto a $(basename "$0")."; exit 2; }

MVN_ARGS=(-B -q test -Dmaven.test.failure.ignore=true)
if [ "${1:-}" = "-h" ] || [ "${1:-}" = "--help" ]; then
  cat <<EOF
Uso: $(basename "$0") [--filtro NOMBRE]
  Sin argumentos ejecuta toda la suite y muestra tu porcentaje de avance.
  --filtro NOMBRE   ejecuta solo escenarios cuyo nombre coincida (regex de Cucumber).
EOF
  exit 0
fi
if [ "${1:-}" = "--filtro" ] && [ -n "${2:-}" ]; then
  MVN_ARGS+=("-Dcucumber.filter.name=.*${2}.*")
fi

echo "Ejecutando la suite... (tarda ~20-40 s en una workstation en caliente)"
mvn "${MVN_ARGS[@]}" >/tmp/validar-reto.mvn.log 2>&1
mvn_status=$?

python3 - "$mvn_status" <<'PY'
import glob, os, re, sys, xml.etree.ElementTree as ET

mvn_status = int(sys.argv[1])
color = sys.stdout.isatty() and os.environ.get("TERM", "dumb") != "dumb"
VERDE  = "\033[32m" if color else ""
ROJO   = "\033[31m" if color else ""
AMAR   = "\033[33m" if color else ""
BOLD   = "\033[1m"  if color else ""
RESET  = "\033[0m"  if color else ""

EJERCICIOS = [
    (1, "Envio de un pedido"),
    (2, "Inicio de sesion"),
    (3, "Seleccion de un pedido tras recargar"),
    (4, "Reporte en una pestana nueva"),
    (5, "Banner promocional"),
]
ANCHO = 70

def linea(c="=", char_len=ANCHO):
    print(c * char_len)

xmls = sorted(glob.glob("target/surefire-reports/TEST-*.xml"))
if not xmls:
    print()
    linea()
    print(f"  {ROJO}No se encontraron reportes de pruebas{RESET} en 'automation/target/surefire-reports/'.")
    print(f"  Revisa si el proyecto compilo:  tail -40 /tmp/validar-reto.mvn.log")
    linea()
    sys.exit(2)

por_ej = {}
for f in xmls:
    try:
        root = ET.parse(f).getroot()
    except ET.ParseError:
        continue
    for tc in root.iter("testcase"):
        nombre = (tc.get("name", "") + " " + tc.get("classname", "")).strip()
        m = re.search(r"Ejercicio (\d+)", nombre)
        if not m:
            continue
        ej = int(m.group(1))
        falla = tc.find("failure") if tc.find("failure") is not None else tc.find("error")
        d = por_ej.setdefault(ej, {"ok": 0, "total": 0, "msg": ""})
        d["total"] += 1
        if falla is None:
            d["ok"] += 1
        elif not d["msg"]:
            txt = (falla.get("message") or falla.text or "").strip().splitlines()
            d["msg"] = next((l.strip() for l in txt if l.strip()), "falla")[:ANCHO - 10]

ejercicios_total = len(EJERCICIOS)
cumplidos = sum(1 for n, _ in EJERCICIOS if por_ej.get(n, {"ok": 0, "total": 0})["total"] > 0
                and por_ej[n]["ok"] == por_ej[n]["total"])
pct = round(100 * cumplidos / ejercicios_total)
ancho_barra = 25
llenas = round(ancho_barra * pct / 100)
barra = "█" * llenas + "·" * (ancho_barra - llenas)
color_pct = VERDE if pct == 100 else (AMAR if pct >= 60 else ROJO)

print()
linea()
print(f"  {BOLD}LIVERPOOL PLAYGROUND  -  VERIFICADOR DE AVANCE (30 MIN){RESET}")
linea()
print()
print(f"  [Progreso: {cumplidos} / {ejercicios_total} ejercicios en verde]   "
      f"[{color_pct}{barra}{RESET}]  {color_pct}{pct}%{RESET}")
print()
for num, titulo in EJERCICIOS:
    d = por_ej.get(num)
    if not d or d["total"] == 0:
        marca, color_m, estado = "-", AMAR, "no ejecutado"
    elif d["ok"] == d["total"]:
        marca, color_m, estado = "v", VERDE, ""
    else:
        marca, color_m, estado = "x", ROJO, ""
    sufijo = ""
    if d and d["total"] > 1:
        sufijo = f"   ({d['ok']}/{d['total']} variantes)"
    print(f"  [ {color_m}{marca}{RESET} ]  {num}. {titulo}{sufijo}")
    if d and d["ok"] != d["total"] and d["msg"]:
        print(f"           {ROJO}->{RESET} {d['msg']}")
    elif not d or d["total"] == 0:
        print(f"           {AMAR}no se encontro su escenario en los reportes{RESET}")
print()
linea()
if cumplidos == ejercicios_total:
    print(f"  {VERDE}FELICIDADES: completaste el {pct}% del reto.{RESET}")
    print(f"  Revisa que no hayas tocado la app, los .feature ni los steps.")
else:
    print(f"  Para iterar en un solo ejercicio:")
    print(f"      ./validar_reto.sh --filtro \"parte del nombre del escenario\"")
    print(f"  Log completo:  tail -60 /tmp/validar-reto.mvn.log")
linea()
sys.exit(0 if cumplidos == ejercicios_total else 1)
PY
