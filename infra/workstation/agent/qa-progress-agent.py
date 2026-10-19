#!/usr/bin/env python3
"""Agente de progreso del reto (solo biblioteca estandar, sin dependencias).

Cada INTERVALO segundos empaqueta el CODIGO FUENTE de /home/user/qa-challenge (sin node_modules, target ni .vscode;
con .git para poder comparar contra el commit inicial) y lo sube a un bucket de Cloud Storage con el token de la cuenta de
servicio de la VM. Esa cuenta solo puede CREAR objetos en el bucket (no listar, leer ni borrar), asi que desde la workstation
no se puede ver nada de lo que ya se subio. La evaluacion corre fuera, en la maquina del evaluador (evaluador/monitor.py);
en la workstation no hay ningun script con las respuestas.

Solo sube cuando algo cambio (o en la primera pasada tras arrancar). Registro: /var/log/qa-progress.log
"""
import hashlib
import io
import json
import os
import sys
import tarfile
import time
import urllib.error
import urllib.parse
import urllib.request

BUCKET = sys.argv[1] if len(sys.argv) > 1 else os.environ.get("QA_PROGRESS_BUCKET", "")
WS = os.environ.get("QA_WORKDIR", "/home/user/qa-challenge")
INTERVALO = int(os.environ.get("QA_PROGRESS_INTERVAL", "60"))
MAX_BYTES = 20 * 1024 * 1024
EXCLUIR = {"node_modules", "target", ".vscode"}
MD = "http://metadata.google.internal/computeMetadata/v1/"


def log(msg):
    print(time.strftime("%Y-%m-%dT%H:%M:%S"), msg, flush=True)


def metadata(ruta):
    req = urllib.request.Request(MD + ruta, headers={"Metadata-Flavor": "Google"})
    with urllib.request.urlopen(req, timeout=5) as r:
        return r.read().decode()


def huella():
    """Huella barata de los archivos incluidos (ruta, tamano, mtime)."""
    h = hashlib.sha256()
    for raiz, dirs, archivos in os.walk(WS):
        dirs[:] = sorted(d for d in dirs if d not in EXCLUIR)
        for f in sorted(archivos):
            p = os.path.join(raiz, f)
            try:
                st = os.lstat(p)
            except OSError:
                continue
            h.update(f"{os.path.relpath(p, WS)}|{st.st_size}|{int(st.st_mtime)}\n".encode())
    return h.hexdigest()


def empaquetar():
    buf = io.BytesIO()

    def filtro(ti):
        partes = ti.name.split("/")
        return None if any(p in EXCLUIR for p in partes) else ti

    with tarfile.open(fileobj=buf, mode="w:gz") as t:
        t.add(WS, arcname="qa-challenge", filter=filtro)
    return buf.getvalue()


def subir(datos, vm):
    token = json.loads(metadata("instance/service-accounts/default/token"))["access_token"]
    nombre = f"{vm}/{time.strftime('%Y%m%dT%H%M%S')}.tgz"
    url = (f"https://storage.googleapis.com/upload/storage/v1/b/{BUCKET}/o?uploadType=media&name="
           + urllib.parse.quote(nombre, safe=""))
    req = urllib.request.Request(url, data=datos, method="POST",
                                 headers={"Authorization": f"Bearer {token}", "Content-Type": "application/gzip"})
    with urllib.request.urlopen(req, timeout=60) as r:
        r.read()
    return nombre


def main():
    if not BUCKET:
        log("sin bucket configurado; no hago nada")
        return 0
    log(f"agente iniciado; bucket={BUCKET} intervalo={INTERVALO}s")
    ultima = None
    while True:
        try:
            if os.path.isdir(os.path.join(WS, "automation")):
                h = huella()
                if h != ultima:
                    datos = empaquetar()
                    if len(datos) > MAX_BYTES:
                        log(f"paquete demasiado grande ({len(datos)} bytes); omitido")
                    else:
                        nombre = subir(datos, metadata("instance/name"))
                        ultima = h
                        log(f"subido {nombre} ({len(datos)} bytes)")
        except urllib.error.HTTPError as e:
            log(f"error HTTP {e.code} al subir: {e.read()[:200]!r}")
        except Exception as e:  # noqa: BLE001 - el agente nunca debe morir
            log(f"error: {type(e).__name__}: {e}")
        time.sleep(INTERVALO)


if __name__ == "__main__":
    sys.exit(main())
