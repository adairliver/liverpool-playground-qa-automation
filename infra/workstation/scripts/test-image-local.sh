#!/usr/bin/env bash
# Verifica la imagen construida localmente (qa-ws:local) con las mismas garantias que se exigen en la workstation.
#   ./scripts/test-image-local.sh [imagen]
set -uo pipefail
IMG="${1:-qa-ws:local}"
export DOCKER_CONFIG="${DOCKER_CONFIG:-/tmp/dockercfg}"
mkdir -p "$DOCKER_CONFIG"; [ -f "$DOCKER_CONFIG/config.json" ] || echo '{}' > "$DOCKER_CONFIG/config.json"
fail=0
ok()  { printf '  OK   %s\n' "$*"; }
bad() { printf '  FAIL %s\n' "$*"; fail=1; }
run() { docker run --rm --platform linux/amd64 --entrypoint bash "$IMG" -lc "$1"; }

echo "1) Extensiones de lenguaje presentes (built-in)"
for id in redhat.java vscjava.vscode-java-debug vscjava.vscode-java-test vscjava.vscode-maven \
          vscjava.vscode-java-dependency alexkrechik.cucumberautocomplete; do
  run "ls -d /opt/code-oss/extensions/${id}-* >/dev/null 2>&1" && ok "$id" || bad "$id"
done

echo "2) Sin extensiones ni claves de IA"
run "bash /opt/qa-seed/scripts/verify-no-ai.sh /opt/code-oss/extensions" >/dev/null 2>&1 && ok "verify-no-ai" || bad "verify-no-ai"
run "ls /opt/code-oss/extensions | grep -Eiq 'gemini|copilot|codeassist|googlecloudtools'" && bad "queda extension de IA" || ok "sin extensiones de IA de Google"
run "python3 -c \"import json;d=json.load(open('/opt/code-oss/product.json'));import sys;sys.exit(1 if 'extensionsGallery' in d else 0)\"" \
  && ok "product.json sin galeria de extensiones" || bad "product.json conserva extensionsGallery"

echo "3) Semilla sin respuestas"
run "for f in openspec .cursor infra docs/banco-de-errores.md spec_qa_automation_playground.md; do [ ! -e /opt/qa-seed/project/\$f ] || exit 1; done" \
  && ok "no hay openspec/.cursor/infra/banco de errores" || bad "la semilla contiene archivos reservados"
run "! grep -rqiE 'banco-de-errores|sembrad' /opt/qa-seed/project" && ok "sin referencias a defectos" || bad "referencias a defectos"

echo "4) Suite verde SIN red (dependencias offline)"
out="$(docker run --rm --platform linux/amd64 --network none --entrypoint bash "$IMG" -lc \
   "cp -r /opt/qa-seed/project /tmp/p && cd /tmp/p/automation && mvn -B -o test 2>&1")"
echo "$out" | grep -E "Tests run:.*Fail|BUILD" | tail -3
echo "$out" | grep -q "Tests run: 6, Failures: 0, Errors: 0" && echo "$out" | grep -q "BUILD SUCCESS" \
  && ok "6/6 escenarios en verde sin red" || bad "la suite no paso offline"
echo "$out" | grep -q "??" && bad "la consola no es UTF-8 (acentos rotos)" || ok "acentos legibles (UTF-8)"

echo "5) Arranque real del IDE (entrypoint original) + servidor de lenguaje Java"
C=qa-ws-ide-test; docker rm -f $C >/dev/null 2>&1
docker run -d --name $C --platform linux/amd64 --privileged -p 8089:80 "$IMG" >/dev/null
for i in $(seq 1 30); do [ "$(curl -s -o /dev/null -w '%{http_code}' http://localhost:8089/)" = 200 ] && break; sleep 3; done
[ "$(curl -s -o /dev/null -w '%{http_code}' http://localhost:8089/)" = 200 ] && ok "Code OSS responde HTTP 200" || bad "Code OSS no responde"
docker exec $C bash -c 'grep -q -- "--default-folder=/home/user/qa-challenge" /etc/workstation-startup.d/110_start-code-oss.sh' && ok "abre /home/user/qa-challenge por defecto" || bad "default-folder"
docker exec -u user $C bash -lc 'cd /home/user/qa-challenge && [ "$(git rev-list --count HEAD)" = 1 ] && [ -z "$(git status --short)" ]' \
  && ok "repo del reto con un solo commit y limpio" || bad "repo del reto"
docker exec -u user $C bash -lc 'python3 -c "import json;d=json.load(open(\"/home/user/.codeoss-cloudworkstations/data/Machine/settings.json\"));assert d[\"chat.disableAIFeatures\"] is True and d[\"extensions.allowed\"][\"*\"] is False"' \
  && ok "ajustes de maquina aplicados (IA deshabilitada, extensiones restringidas)" || bad "ajustes de maquina"
docker exec -d -u user $C bash -lc 'google-chrome --headless=new --no-sandbox --disable-gpu --remote-debugging-port=9333 "http://localhost:80/?folder=/home/user/qa-challenge" >/tmp/chrome-ide.log 2>&1'
echo "   (esperando a que el IDE cargue el proyecto Java, ~2 min)"; sleep 120
LOG='ls -d /home/user/.codeoss-cloudworkstations/data/logs/*/ | head -1'
docker exec $C bash -c "ps -eo args | grep -q '[j]dt.ls'" && ok "servidor de lenguaje Java activo" || bad "servidor de lenguaje Java no arranco"
imported=1
for i in $(seq 1 12); do
  docker exec $C bash -c "ls /home/user/.codeoss-cloudworkstations/data/User/workspaceStorage/*/redhat.java/jdt_ws/.metadata/.plugins/org.eclipse.core.resources/.projects/ 2>/dev/null | grep -q qa-automation-playground" && { imported=0; break; }
  sleep 10
done
[ $imported -eq 0 ] \
  && ok "proyecto Maven importado (autocompletado disponible)" || bad "proyecto no importado"
docker exec $C bash -c "grep -rhE 'PluginResolutionException|Cannot access central' \$($LOG)exthost1/redhat.java/ 2>/dev/null | grep -q ." \
  && bad "m2e no resuelve plugins offline" || ok "m2e sin errores de resolucion offline"
docker exec $C bash -c "ls \$($LOG)exthost1/ | grep -iE 'gemini|copilot|cloudcode|chat'" | grep -q . && bad "actividad de extensiones de IA" || ok "sin actividad de extensiones de IA"
docker rm -f $C >/dev/null 2>&1

echo; [ $fail -eq 0 ] && echo "TODO OK" || { echo "HAY FALLOS"; exit 1; }
