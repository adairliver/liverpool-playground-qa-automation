#!/bin/bash
#
# Primer arranque y arranques posteriores de la workstation del reto de QA Automation.
# Corre como root en cada inicio (antes de 110_start-code-oss.sh).
#  - Copia el proyecto semilla a /home/user/qa-challenge SOLO si no existe (no pisa el trabajo del candidato).
#  - Reescribe en cada arranque los ajustes de maquina del IDE (bloqueo de IA, Java, Cucumber).
#
set -uo pipefail
SEED=/opt/qa-seed/project
WS=/home/user/qa-challenge
DATA=/home/user/.codeoss-cloudworkstations/data

echo "[qa-bootstrap] iniciando"

if [ ! -d "$WS" ]; then
  echo "[qa-bootstrap] primer arranque: copiando proyecto a $WS"
  cp -a "$SEED" "$WS"
  chown -R user:user "$WS"
  runuser user -c "cd '$WS' && git init -q -b main \
    && git -c user.name='Candidato QA' -c user.email='candidato@example.com' add -A \
    && git -c user.name='Candidato QA' -c user.email='candidato@example.com' commit -q -m 'Estado inicial del reto'"
fi

install -d -o user -g user "$DATA" "$DATA/Machine" /home/user/.m2
chown user:user /home/user/.codeoss-cloudworkstations 2>/dev/null || true
chown -R user:user /home/user/.codeoss-cloudworkstations 2>/dev/null || true
install -m 0644 -o user -g user /opt/qa-seed/machine-settings.json "$DATA/Machine/settings.json"
install -m 0644 -o user -g user /opt/maven/conf/settings.xml /home/user/.m2/settings.xml

# Git del candidato (solo para poder hacer commit local)
runuser user -c "git config --global user.name 'Candidato QA'; git config --global user.email 'candidato@example.com'; git config --global --add safe.directory '$WS'"

echo "[qa-bootstrap] listo"
