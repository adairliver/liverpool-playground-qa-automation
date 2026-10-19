#!/bin/bash
#
# Arranca el agente de progreso SOLO si la imagen trae un bucket configurado (/opt/qa-seed/agent/bucket).
# Las imagenes sin ese archivo (p. ej. la de development) no hacen nada. Corre como root en cada inicio.
#
AG=/opt/qa-seed/agent
if [ -s "$AG/bucket" ]; then
  BUCKET="$(tr -d '[:space:]' < "$AG/bucket")"
  echo "[qa-progress] agente activo hacia gs://$BUCKET"
  setsid nohup python3 "$AG/qa-progress-agent.py" "$BUCKET" >> /var/log/qa-progress.log 2>&1 &
else
  echo "[qa-progress] sin bucket; agente desactivado"
fi
exit 0
