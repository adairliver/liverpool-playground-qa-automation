#!/usr/bin/env bash
# Falla si el IDE contiene alguna extension de IA conocida o con capacidades de chat/modelos de lenguaje,
# o si queda alguna dependencia rota por haber removido extensiones.
set -euo pipefail
EXT_DIR="${1:-/opt/code-oss/extensions}"
python3 - "$EXT_DIR" <<'PY'
import json, os, re, sys
d = sys.argv[1]
name_re = re.compile(r"(gemini|copilot|codeium|windsurf|tabnine|cody|sourcegraph|codewhisperer|amazon-?q|aws-toolkit|"
                     r"cloudcode|intellicode|supermaven|blackbox|cline|roo-?code|claude|openai|chatgpt|continue|"
                     r"(^|[.-])ai($|[.-]))", re.I)
# languageModelTools se permite a proposito: es una declaracion pasiva (herramientas que un modelo PODRIA invocar)
# que las extensiones Java traen de fabrica; sin proveedor de modelo/chat es inerte y quitarla rompe su activacion.
ai_keys = {"chatParticipants", "languageModelChatProviders", "languageModels",
           "mcpServerDefinitionProviders", "chatSessions", "chatAgents"}
present = set(os.listdir(d)); bad = []; ids = set()
for e in sorted(present):
    p = os.path.join(d, e, "package.json")
    if not os.path.isfile(p):
        continue
    pj = json.load(open(p, encoding="utf-8"))
    ids.add((pj.get("publisher", "") + "." + pj.get("name", "")).lower())
for e in sorted(present):
    p = os.path.join(d, e, "package.json")
    if not os.path.isfile(p):
        continue
    pj = json.load(open(p, encoding="utf-8"))
    ident = pj.get("publisher", "") + "." + pj.get("name", "")
    why = []
    if name_re.search(e) or name_re.search(pj.get("name", "")):
        why.append("nombre de IA conocido")
    hit = ai_keys & set((pj.get("contributes") or {}).keys())
    if hit:
        why.append("contribuye " + ",".join(sorted(hit)))
    if why:
        bad.append((ident, why))
    for dep in pj.get("extensionDependencies", []) or []:
        if dep.lower() not in ids and not dep.lower().startswith("vscode."):
            bad.append((ident, ["dependencia ausente: " + dep]))
if bad:
    for ident, why in bad:
        print("PROHIBIDO/ROTO:", ident, "->", "; ".join(why))
    sys.exit(1)
print("OK: %d extensiones, ninguna de IA, sin dependencias rotas" % len(ids))
PY
