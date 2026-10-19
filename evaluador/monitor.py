#!/usr/bin/env python3
"""Monitor del evaluador: mide el avance de TODAS las workstations del reto desde tu maquina (uso exclusivo del evaluador).

Como las workstations no admiten SSH ni TCP (solo navegador) y progreso.py contiene las respuestas, la evaluacion NO corre
dentro de ellas. En su lugar, un agente de la imagen (infra/workstation/agent) sube cada minuto el codigo fuente del
candidato a un bucket de Cloud Storage; este script descarga el ultimo paquete de cada workstation en marcha y le aplica
progreso.py (sobre una copia, con la app y los tests originales) en TU maquina.

Requisitos locales: gcloud autenticado con permisos de lectura sobre el bucket y de lectura sobre Compute/Workstations,
Java 17 + Maven con las dependencias del proyecto, Node con app-web/node_modules instalado (npm install en app-web).

Uso:
  python3 monitor.py                       # una pasada sobre todas las workstations del reto
  python3 monitor.py --vigilar 120         # repite cada 120 s (Ctrl+C para salir)
  python3 monitor.py --reiniciar           # reinicia el cronometro de cada candidato (hazlo al empezar el examen)
  python3 monitor.py --solo qa-ws-fjnavam  # una sola workstation
  python3 monitor.py --detalle             # muestra el motivo de cada ejercicio no resuelto
"""
import argparse
import json
import os
import shutil
import subprocess
import sys
import tarfile
import tempfile
import time
from datetime import datetime, timezone

AQUI = os.path.dirname(os.path.abspath(__file__))
PROGRESO = os.path.join(AQUI, "progreso.py")
MARCA = {"RESUELTO": "OK", "FALLA": "--", "PASA_SIN_TECNICA": "~~", "NO_COMPILA": "!!"}


def gcloud(*args, check=True):
    r = subprocess.run(["gcloud", *args], capture_output=True, text=True)
    if check and r.returncode != 0:
        raise RuntimeError(f"gcloud {' '.join(args[:3])}: {(r.stderr or r.stdout).strip()[:300]}")
    return r.stdout


def descubrir(a):
    """{workstation: {'estado': ..., 'vm': nombre de VM o None}} de la config del reto."""
    ws = json.loads(gcloud("workstations", "list", "--project", a.project, "--cluster", a.cluster, "--config", a.config,
                           "--region", a.region, "--format=json(name,state)") or "[]")
    vms = json.loads(gcloud("compute", "instances", "list", "--project", a.project,
                            f"--filter=labels.workstation_config_id={a.config} AND status=RUNNING",
                            "--format=json(name,labels)") or "[]")
    por_ws = {v["labels"]["workstation_id"]: v["name"] for v in vms if "workstation_id" in v.get("labels", {})}
    out = {}
    for w in ws:
        nombre = w["name"].rsplit("/", 1)[-1]
        out[nombre] = {"estado": w.get("state", "?").replace("STATE_", ""), "vm": por_ws.get(nombre)}
    return out


def ultimo_paquete(a, vm):
    r = subprocess.run(["gcloud", "storage", "ls", f"gs://{a.bucket}/{vm}/", "--project", a.project],
                       capture_output=True, text=True)
    if r.returncode != 0:
        return None
    objs = sorted(l.strip() for l in r.stdout.splitlines() if l.strip().endswith(".tgz"))
    return objs[-1] if objs else None


def edad(obj):
    try:
        ts = datetime.strptime(os.path.basename(obj)[:-4], "%Y%m%dT%H%M%S").replace(tzinfo=timezone.utc)
        return int((datetime.now(timezone.utc) - ts).total_seconds())
    except ValueError:
        return None


def fmt_edad(seg):
    if seg is None:
        return "?"
    return f"{seg // 60}m{seg % 60:02d}s" if seg >= 60 else f"{seg}s"


def evaluar(a, nombre, obj, primera):
    tmp = tempfile.mkdtemp(prefix="monitor-")
    try:
        tgz = os.path.join(tmp, "paquete.tgz")
        gcloud("storage", "cp", obj, tgz, "--project", a.project)
        with tarfile.open(tgz) as t:
            for m in t.getmembers():  # defensa extra ademas del filtro: nada fuera del directorio
                if m.name.startswith(("/", "..")) or ".." in m.name.split("/"):
                    raise RuntimeError(f"ruta sospechosa en el paquete: {m.name}")
            try:
                t.extractall(tmp, filter="data")
            except TypeError:  # Python < 3.12 sin filtros
                t.extractall(tmp)
        trabajo = os.path.join(tmp, "qa-challenge")
        nm = os.path.abspath(a.node_modules)
        if os.path.isdir(nm) and os.path.isdir(os.path.join(trabajo, "app-web")):
            os.symlink(nm, os.path.join(trabajo, "app-web", "node_modules"))
        cmd = [sys.executable, PROGRESO, "--trabajo", trabajo, "--json", "--puerto", str(a.puerto),
               "--ejercicios", a.ejercicios, "--estado", os.path.join(a.estado, nombre)]
        if primera and a.reiniciar:
            cmd.append("--reiniciar")
        r = subprocess.run(cmd, capture_output=True, text=True)
        linea = next((l for l in reversed(r.stdout.splitlines()) if l.startswith("{")), None)
        if not linea:
            raise RuntimeError((r.stderr or r.stdout).strip()[-300:] or "progreso.py no devolvio resultados")
        return json.loads(linea)
    finally:
        shutil.rmtree(tmp, ignore_errors=True)


def pasada(a, cache, vistos):
    estado = descubrir(a)
    if a.solo:
        estado = {k: v for k, v in estado.items() if k in a.solo}
    ids = [int(x) for x in a.ejercicios.split(",") if x.strip()]
    print(f"\nMONITOR  QA Automation Senior   {datetime.now().strftime('%H:%M:%S')}   (bucket gs://{a.bucket})")
    print("-" * 92)
    print(f" {'workstation':<22}{'estado':<10}{'ult. paquete':<14}" + "".join(f"E{i:<3}" for i in ids) + "  progreso")
    print("-" * 92)
    detalles = []
    for nombre in sorted(estado):
        info = estado[nombre]
        if not info["vm"]:
            print(f" {nombre:<22}{info['estado'].lower():<10}{'-':<14}(detenida: nada que medir)")
            continue
        obj = ultimo_paquete(a, info["vm"])
        if not obj:
            print(f" {nombre:<22}{'running':<10}{'-':<14}(aun sin paquetes: el agente sube cada ~60 s)")
            continue
        try:
            if cache.get(nombre, (None, None))[0] != obj:
                informe = evaluar(a, nombre, obj, nombre not in vistos)
                vistos.add(nombre)
                cache[nombre] = (obj, informe)
            informe = cache[nombre][1]
        except Exception as e:  # noqa: BLE001
            print(f" {nombre:<22}{'running':<10}{fmt_edad(edad(obj)):<14}ERROR: {str(e)[:60]}")
            continue
        por_id = {f["id"]: f for f in informe["ejercicios"]}
        celdas = "".join(f"{MARCA.get(por_id[i]['estado'], '??') if i in por_id else '  ':<4}" for i in ids)
        ok = sum(1 for f in informe["ejercicios"] if f["estado"] == "RESUELTO")
        extra = f"  (cronometro {informe['transcurrido_s'] // 60}:{informe['transcurrido_s'] % 60:02d})"
        fuera = f"  fuera de alcance: {len(informe['fuera_de_alcance'])}" if informe.get("fuera_de_alcance") else ""
        print(f" {nombre:<22}{'running':<10}{fmt_edad(edad(obj)):<14}{celdas}  {ok}/{len(informe['ejercicios'])}{extra}{fuera}")
        for f in informe["ejercicios"]:
            if f["estado"] != "RESUELTO":
                detalles.append(f"   {nombre} E{f['id']} {f['estado']}: {str(f['detalle'])[:110]}")
    print("-" * 92)
    print(" OK resuelto  |  -- falla  |  ~~ pasa sin la tecnica esperada  |  !! no compila")
    if a.detalle and detalles:
        print("\n".join(detalles))


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--project", default=os.environ.get("PROJECT", "crp-poc-it-hackathon-1"))
    ap.add_argument("--region", default=os.environ.get("REGION", "us-central1"))
    ap.add_argument("--cluster", default=os.environ.get("CLUSTER", "qa-challenge-cluster"))
    ap.add_argument("--config", default=os.environ.get("CONFIG", "qa-challenge-config-reto"))
    ap.add_argument("--bucket", default=os.environ.get("PROGRESS_BUCKET", "crp-poc-it-hackathon-1-qa-progreso"))
    ap.add_argument("--ejercicios", default="1,2,3,4,5")
    ap.add_argument("--puerto", type=int, default=int(os.environ.get("EVAL_PORT", 5299)))
    ap.add_argument("--node-modules", default=os.path.join(AQUI, "..", "app-web", "node_modules"))
    ap.add_argument("--estado", default=os.path.expanduser("~/.evaluador-remoto"))
    ap.add_argument("--solo", action="append", help="limitar a esta workstation (repetible)")
    ap.add_argument("--vigilar", type=int, default=0, help="repetir cada N segundos")
    ap.add_argument("--reiniciar", action="store_true")
    ap.add_argument("--detalle", action="store_true")
    a = ap.parse_args()
    cache, vistos = {}, set()
    try:
        while True:
            pasada(a, cache, vistos)
            if not a.vigilar:
                return 0
            time.sleep(a.vigilar)
    except KeyboardInterrupt:
        return 0
    except RuntimeError as e:
        print(f"ERROR: {e}", file=sys.stderr)
        return 2


if __name__ == "__main__":
    sys.exit(main())
