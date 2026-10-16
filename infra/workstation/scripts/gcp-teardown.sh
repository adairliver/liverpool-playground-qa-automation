#!/usr/bin/env bash
# Destruye la infraestructura del reto para dejar de generar costo. Pide confirmacion.
set -euo pipefail
PROJECT="${PROJECT:-crp-poc-it-hackathon-1}"
REGION="${REGION:-us-central1}"
NETWORK="${NETWORK:-qa-challenge-net}"
SUBNET="${SUBNET:-qa-challenge-subnet}"
REPO="${REPO:-qa-challenge}"
CLUSTER="${CLUSTER:-qa-challenge-cluster}"
CONFIG="${CONFIG:-qa-challenge-config}"
WORKSTATION="${WORKSTATION:-qa-challenge-ws}"
g() { gcloud --project "$PROJECT" "$@"; }

echo "Se eliminaran: workstation $WORKSTATION, config $CONFIG, clúster $CLUSTER, red $NETWORK y (opcional) el repo de imágenes $REPO en $PROJECT/$REGION."
read -r -p "Escribe el nombre del proyecto para confirmar: " ok
[ "$ok" = "$PROJECT" ] || { echo "Cancelado."; exit 1; }

g workstations delete "$WORKSTATION" --cluster "$CLUSTER" --config "$CONFIG" --region "$REGION" --quiet || true
g workstations configs delete "$CONFIG" --cluster "$CLUSTER" --region "$REGION" --quiet || true
g workstations clusters delete "$CLUSTER" --region "$REGION" --quiet || true
for r in qa-challenge-allow-internal qa-challenge-ws-ingress qa-challenge-ws-egress; do
  g compute firewall-rules delete "$r" --quiet || true
done
g compute networks subnets delete "$SUBNET" --region "$REGION" --quiet || true
g compute networks delete "$NETWORK" --quiet || true
g iam service-accounts delete "${WS_SA_NAME:-qa-ws-sa}@$PROJECT.iam.gserviceaccount.com" --quiet || true
read -r -p "¿Borrar tambien el repositorio de imagenes $REPO? [s/N] " d
[ "$d" = "s" ] && g artifacts repositories delete "$REPO" --location "$REGION" --quiet || true
echo "Listo."
