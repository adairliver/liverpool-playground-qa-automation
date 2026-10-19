#!/usr/bin/env bash
# Crea (de forma idempotente) la infraestructura de Cloud Workstations del reto y publica la imagen.
# Requiere: gcloud autenticado con permisos de administrador sobre el proyecto (gcloud auth login).
# Uso:  BRANCH=development ./scripts/gcp-setup.sh [paso]
#   pasos: all (por defecto) | apis | network | image | cluster | firewall | config | workstation
# Variables (con valores por defecto): PROJECT, REGION, NETWORK, SUBNET, REPO, CLUSTER, CONFIG, WORKSTATION,
#   MACHINE_TYPE, DISK_GB, IDLE_SECONDS, RUNNING_SECONDS, BRANCH
set -euo pipefail

PROJECT="${PROJECT:-crp-poc-it-hackathon-1}"
REGION="${REGION:-us-central1}"
NETWORK="${NETWORK:-qa-challenge-net}"
SUBNET="${SUBNET:-qa-challenge-subnet}"
SUBNET_RANGE="${SUBNET_RANGE:-10.80.0.0/24}"
REPO="${REPO:-qa-challenge}"
IMAGE_NAME="${IMAGE_NAME:-qa-workstation}"
CLUSTER="${CLUSTER:-qa-challenge-cluster}"
CONFIG="${CONFIG:-qa-challenge-config}"
WORKSTATION="${WORKSTATION:-qa-challenge-ws}"
MACHINE_TYPE="${MACHINE_TYPE:-e2-standard-4}"
DISK_GB="${DISK_GB:-50}"
IDLE_SECONDS="${IDLE_SECONDS:-1200}"       # apaga tras 20 min de inactividad
RUNNING_SECONDS="${RUNNING_SECONDS:-7200}"  # tope de 2 h por sesion
BRANCH="${BRANCH:-development}"
# Alcances OAuth de la VM. Por defecto solo lectura de Storage (imagen + logs). La config del reto con agente de progreso
# necesita escribir en el bucket: SA_SCOPES=https://www.googleapis.com/auth/devstorage.read_write,https://www.googleapis.com/auth/logging.write,https://www.googleapis.com/auth/monitoring.write
# (el IAM sigue limitando a esa cuenta a CREAR objetos en ese unico bucket).
SA_SCOPES="${SA_SCOPES:-https://www.googleapis.com/auth/devstorage.read_only,https://www.googleapis.com/auth/logging.write,https://www.googleapis.com/auth/monitoring.write}"
STEP="${1:-all}"

HERE="$(cd "$(dirname "$0")/.." && pwd)"
WS_SA_NAME="${WS_SA_NAME:-qa-ws-sa}"
WS_SA="$WS_SA_NAME@$PROJECT.iam.gserviceaccount.com"
IMAGE_URI="$REGION-docker.pkg.dev/$PROJECT/$REPO/$IMAGE_NAME:latest"
g() { gcloud --project "$PROJECT" "$@"; }
log() { printf '\n== %s\n' "$*"; }

apis() {
  log "Habilitando APIs"
  g services enable workstations.googleapis.com artifactregistry.googleapis.com \
    cloudbuild.googleapis.com compute.googleapis.com
}

network() {
  log "Red dedicada con Private Google Access y SIN Cloud NAT (sin salida a internet)"
  g compute networks describe "$NETWORK" >/dev/null 2>&1 || \
    g compute networks create "$NETWORK" --subnet-mode=custom
  g compute networks subnets describe "$SUBNET" --region "$REGION" >/dev/null 2>&1 || \
    g compute networks subnets create "$SUBNET" --network "$NETWORK" --region "$REGION" \
      --range "$SUBNET_RANGE" --enable-private-ip-google-access
  # Sin IP publica en las VMs y sin Cloud NAT => no hay salida a internet; Private Google Access cubre
  # solo las APIs de Google (Artifact Registry, etc.). Las reglas hacia el plano de control van en firewall().
}

firewall() {
  log "Reglas de firewall hacia el plano de control (docs: configure-firewall-rules)"
  local cp_ip
  cp_ip="$(g workstations clusters describe "$CLUSTER" --region "$REGION" \
    --format='value(controlPlaneIp)')"
  [ -n "$cp_ip" ] || { echo "No se obtuvo controlPlaneIp; ¿el clúster ya está listo?" >&2; exit 1; }
  g compute firewall-rules describe qa-challenge-ws-ingress >/dev/null 2>&1 || \
    g compute firewall-rules create qa-challenge-ws-ingress --network "$NETWORK" \
      --action ALLOW --direction INGRESS --rules tcp \
      --source-tags cloud-workstations-instance --destination-ranges "$cp_ip"
  g compute firewall-rules describe qa-challenge-ws-egress >/dev/null 2>&1 || \
    g compute firewall-rules create qa-challenge-ws-egress --network "$NETWORK" \
      --action ALLOW --direction EGRESS --rules tcp:980,tcp:443 \
      --target-tags cloud-workstations-instance --destination-ranges "$cp_ip"
  g compute firewall-rules describe qa-challenge-allow-internal >/dev/null 2>&1 || \
    g compute firewall-rules create qa-challenge-allow-internal --network "$NETWORK" \
      --allow tcp,udp,icmp --source-ranges "$SUBNET_RANGE"
}

image() {
  log "Construyendo imagen (rama $BRANCH) con Cloud Build"
  g artifacts repositories describe "$REPO" --location "$REGION" >/dev/null 2>&1 || \
    g artifacts repositories create "$REPO" --repository-format docker --location "$REGION" \
      --description "Imagenes del reto de QA"
  local ctx="${BUILD_DIR:-$HERE/.build}"
  BRANCH="$BRANCH" OUT="$ctx" "$HERE/scripts/prepare-context.sh" >/dev/null
  g builds submit "$ctx" --region "$REGION" --tag "$IMAGE_URI" --timeout 3000s \
    --machine-type e2-highcpu-8
}

cluster() {
  log "Clúster de Cloud Workstations (puede tardar ~20 min la primera vez)"
  g workstations clusters describe "$CLUSTER" --region "$REGION" >/dev/null 2>&1 || \
    g workstations clusters create "$CLUSTER" --region "$REGION" \
      --network "projects/$PROJECT/global/networks/$NETWORK" \
      --subnetwork "projects/$PROJECT/regions/$REGION/subnetworks/$SUBNET"
}

config() {
  log "Configuración de workstation (sin IP publica, apagado por inactividad, cuenta de servicio sin privilegios)"
  # La VM NO debe usar la cuenta de Compute por defecto (suele ser Editor): desde la terminal del candidato daria
  # acceso a APIs de Google (incluidas las de IA). Esta cuenta solo puede LEER la imagen y escribir logs.
  g iam service-accounts describe "$WS_SA" >/dev/null 2>&1 || \
    g iam service-accounts create "$WS_SA_NAME" --display-name "Workstation del reto (solo lectura de imagen)"
  g artifacts repositories add-iam-policy-binding "$REPO" --location "$REGION" \
    --member "serviceAccount:$WS_SA" --role roles/artifactregistry.reader >/dev/null
  g projects add-iam-policy-binding "$PROJECT" --member "serviceAccount:$WS_SA" \
    --role roles/logging.logWriter --condition=None >/dev/null
  local verb=create
  g workstations configs describe "$CONFIG" --cluster "$CLUSTER" --region "$REGION" >/dev/null 2>&1 && verb=update
  if [ "$verb" = create ]; then
    g workstations configs create "$CONFIG" --cluster "$CLUSTER" --region "$REGION" \
      --machine-type "$MACHINE_TYPE" --pd-disk-size "$DISK_GB" --pd-disk-type pd-balanced \
      --container-custom-image "$IMAGE_URI" \
      --idle-timeout "$IDLE_SECONDS" --running-timeout "$RUNNING_SECONDS" \
      --disable-public-ip-addresses --disable-tcp-connections \
      --service-account "$WS_SA" --service-account-scopes "$SA_SCOPES" --pool-size 0
  else
    g workstations configs update "$CONFIG" --cluster "$CLUSTER" --region "$REGION" \
      --container-custom-image "$IMAGE_URI" --service-account "$WS_SA" --service-account-scopes "$SA_SCOPES"
  fi
}

workstation() {
  log "Workstation"
  g workstations describe "$WORKSTATION" --cluster "$CLUSTER" --config "$CONFIG" --region "$REGION" >/dev/null 2>&1 || \
    g workstations create "$WORKSTATION" --cluster "$CLUSTER" --config "$CONFIG" --region "$REGION"
  echo "Para dar acceso al candidato (cuenta de Google):  ./scripts/grant-access.sh CORREO"
  echo "Para iniciarla:  gcloud --project $PROJECT workstations start $WORKSTATION --cluster $CLUSTER --config $CONFIG --region $REGION"
}

case "$STEP" in
  all) apis; network; image; cluster; firewall; config; workstation ;;
  apis|network|image|cluster|firewall|config|workstation) "$STEP" ;;
  *) echo "Paso desconocido: $STEP" >&2; exit 2 ;;
esac
