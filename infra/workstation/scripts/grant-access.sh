#!/usr/bin/env bash
# Da acceso (roles/workstations.user) a una cuenta de Google SOLO sobre la workstation del reto.
#   ./scripts/grant-access.sh correo@dominio.com
set -euo pipefail
MEMBER_EMAIL="${1:?Uso: grant-access.sh correo@dominio.com}"
PROJECT="${PROJECT:-crp-poc-it-hackathon-1}"; REGION="${REGION:-us-central1}"
CLUSTER="${CLUSTER:-qa-challenge-cluster}"; CONFIG="${CONFIG:-qa-challenge-config}"; WORKSTATION="${WORKSTATION:-qa-challenge-ws}"
A=(--project "$PROJECT" --cluster "$CLUSTER" --config "$CONFIG" --region "$REGION")
TMP="$(mktemp)"; trap 'rm -f "$TMP"' EXIT
gcloud workstations get-iam-policy "$WORKSTATION" "${A[@]}" --format=json > "$TMP"
python3 - "$TMP" "user:$MEMBER_EMAIL" <<'PY'
import json, sys
path, member = sys.argv[1], sys.argv[2]
policy = json.load(open(path))
role = "roles/workstations.user"
b = next((x for x in policy.setdefault("bindings", []) if x["role"] == role and "condition" not in x), None)
if b is None:
    b = {"role": role, "members": []}; policy["bindings"].append(b)
if member not in b["members"]:
    b["members"].append(member)
json.dump(policy, open(path, "w"))
PY
gcloud workstations set-iam-policy "$WORKSTATION" "$TMP" "${A[@]}" >/dev/null
echo "Acceso concedido a $MEMBER_EMAIL"
