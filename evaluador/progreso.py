#!/usr/bin/env python3
"""Progreso del candidato en el reto de QA Automation (uso exclusivo del evaluador).

Ejecuta la suite sobre una COPIA del trabajo del candidato (no toca sus archivos) y combina dos senales por ejercicio:
  - comportamiento: el escenario del ejercicio pasa o falla;
  - tecnica: reglas sobre el codigo del metodo afectado (p. ej. un Thread.sleep(3500) pasa el escenario pero no es la solucion).

Estados:  RESUELTO | FALLA | PASA_SIN_TECNICA | NO_COMPILA

Uso (desde la workstation, en una terminal del evaluador):
  python3 progreso.py                       # una evaluacion de /home/user/qa-challenge
  python3 progreso.py --vigilar 90          # repite cada 90 s hasta resolver todo
  python3 progreso.py --ejercicios 1,2,3,4  # si se retira el ejercicio 5
  python3 progreso.py --json                # salida para maquinas
  python3 progreso.py --reiniciar           # reinicia el cronometro

Codigo de salida: 0 = todos resueltos, 1 = faltan ejercicios, 2 = error de ejecucion.
"""
import argparse
import glob
import json
import os
import re
import shutil
import subprocess
import sys
import tarfile
import tempfile
import time
import xml.etree.ElementTree as ET

# ----------------------------------------------------------------------------------------------------------------------
# Tabla de ejercicios: para quitar uno basta con borrarlo de aqui (o usar --ejercicios).
# ----------------------------------------------------------------------------------------------------------------------
PAGES = "automation/src/main/java/com/liverpool/playground/pages/"


def sin_comentarios(src):
    """Quita comentarios respetando los literales de cadena (p. ej. "http://...")."""
    pat = re.compile(r'"(?:\\.|[^"\\])*"|//[^\n]*|/\*.*?\*/', re.S)
    return pat.sub(lambda m: m.group(0) if m.group(0).startswith('"') else " ", src)


def cuerpo(src, nombre):
    """Cuerpo (entre llaves) del metodo o constructor `nombre`; None si no existe."""
    m = re.search(r'\b' + re.escape(nombre) + r'\s*\([^)]*\)\s*(?:throws\s+[\w.,\s]+)?\{', src)
    if not m:
        return None
    i, depth = m.end(), 1
    while i < len(src) and depth:
        depth += (src[i] == '{') - (src[i] == '}')
        i += 1
    return src[m.end():i - 1]


def con_llamados(src, nombre):
    """Cuerpo del metodo mas el de los metodos de la misma clase que invoca (un nivel)."""
    c = cuerpo(src, nombre)
    if c is None:
        return None
    extra = ""
    for m in set(re.findall(r'\b([A-Za-z_]\w*)\s*\(', c)):
        if m != nombre:
            sub = cuerpo(src, m)
            if sub:
                extra += "\n" + sub
    return c + extra


def regla_1(src):
    c = con_llamados(src, "clickSubmitButton")
    if c is None:
        return False, "no se encuentra el metodo clickSubmitButton"
    if re.search(r'Thread\s*\.\s*sleep|TimeUnit\s*\.\s*\w+\s*\.\s*sleep', c):
        return False, "sigue usando una pausa fija (sleep) en clickSubmitButton"
    if not re.search(r'WebDriverWait|FluentWait', c):
        return False, "no usa una espera explicita (WebDriverWait/FluentWait)"
    return True, "espera explicita"


def regla_2(src):
    if "@FindBy" not in src:
        return True, "sin @FindBy (localiza con driver.findElement)"
    c = con_llamados(src, "LoginPage")
    if c and "initElements(" in c:
        return True, "PageFactory.initElements en el constructor"
    return False, "los @FindBy no se inicializan (falta PageFactory.initElements en el constructor)"


def regla_3(src):
    c = con_llamados(src, "clickRowAfterRefresh")
    if c is None:
        return False, "no se encuentra clickRowAfterRefresh"
    if "refreshed(" in c or "StaleElementReferenceException" in c:
        return True, "tecnica anti-stale (refreshed / reintento)"
    r = c.find("refresh()")
    f = min([i for i in (c.find("waitForRow("), c.find("findElement("), c.find(".until(")) if i >= 0] or [-1])
    if r < 0:
        return False, "no recarga la pagina"
    if f >= 0 and f < r:
        return False, "localiza la fila ANTES de recargar la pagina"
    return True, "localiza la fila despues del refresh"


def regla_4(src):
    c = con_llamados(src, "verifyNewTabTitle")
    if c is None:
        return False, "no se encuentra verifyNewTabTitle"
    s, t = c.find("switchTo().window("), c.find("getTitle()")
    if s < 0:
        return False, "no cambia el foco a la pestana nueva (switchTo().window)"
    if t >= 0 and t < s:
        return False, "lee el titulo antes de cambiar de pestana"
    return True, "cambia de WindowHandle antes de leer el titulo"


def regla_5(src):
    c = con_llamados(src, "isPromoBannerPresent")
    if c is None:
        return False, "no se encuentra isPromoBannerPresent"
    if re.search(r'\btry\b|NoSuchElementException', c):
        return False, "usa try/catch de NoSuchElementException como control de flujo"
    if "findElements(" not in c:
        return False, "no usa findElements para consultar existencia"
    return True, "findElements sin excepciones"


EJERCICIOS = [
    {"id": 1, "nombre": "Espera explicita en el envio del formulario", "archivo": PAGES + "PedidoFormPage.java", "regla": regla_1},
    {"id": 2, "nombre": "Inicializacion de elementos (PageFactory)", "archivo": PAGES + "LoginPage.java", "regla": regla_2},
    {"id": 3, "nombre": "Fila obsoleta tras recargar (stale)", "archivo": PAGES + "PedidosTablePage.java", "regla": regla_3},
    {"id": 4, "nombre": "Cambio de pestana / WindowHandle", "archivo": PAGES + "ReportPage.java", "regla": regla_4},
    {"id": 5, "nombre": "Existencia sin excepciones (findElements)", "archivo": PAGES + "DashboardPage.java", "regla": regla_5},
]

# Rutas cuya modificacion se considera fuera de alcance (el problema esta en los Page Objects).
FUERA_DE_ALCANCE = ("app-web/", "automation/src/test/")


# ----------------------------------------------------------------------------------------------------------------------
def sh(cmd, cwd=None, env=None, timeout=None):
    return subprocess.run(cmd, cwd=cwd, env=env, capture_output=True, text=True, timeout=timeout)


def commit_inicial(trabajo):
    r = sh(["git", "rev-list", "--max-parents=0", "HEAD"], cwd=trabajo)
    return r.stdout.split()[-1] if r.returncode == 0 and r.stdout.split() else None


def fuera_de_alcance(trabajo, base):
    """Archivos modificados o nuevos (respecto del commit inicial) dentro de las rutas reservadas."""
    if not base:
        return None
    cambiados = set(sh(["git", "diff", "--name-only", base], cwd=trabajo).stdout.split())
    cambiados |= set(sh(["git", "ls-files", "-o", "--exclude-standard"], cwd=trabajo).stdout.split())
    return sorted(f for f in cambiados if f.startswith(FUERA_DE_ALCANCE) and "/target/" not in f and "node_modules" not in f)


def preparar_copia(trabajo, destino, base):
    """Copia el trabajo del candidato y restaura app-web y tests desde el commit inicial (anti-trampa)."""
    shutil.copytree(trabajo, destino, symlinks=True,
                    ignore=shutil.ignore_patterns("target", "node_modules", ".git"))
    if base:
        for ruta in ("app-web", "automation/src/test"):
            shutil.rmtree(os.path.join(destino, ruta), ignore_errors=True)
        data = subprocess.run(["git", "archive", base, "app-web", "automation/src/test"], cwd=trabajo,
                              capture_output=True).stdout
        import io
        with tarfile.open(fileobj=io.BytesIO(data)) as t:
            t.extractall(destino)
    nm = os.path.join(trabajo, "app-web", "node_modules")
    if os.path.isdir(nm):
        os.symlink(nm, os.path.join(destino, "app-web", "node_modules"))


def correr_suite(copia, puerto, tiempo_max):
    env = dict(os.environ, PORT=str(puerto))
    cmd = ["mvn", "-B", "test", f"-Dbase.url=http://localhost:{puerto}"]
    try:
        r = sh(cmd, cwd=os.path.join(copia, "automation"), env=env, timeout=tiempo_max)
    except subprocess.TimeoutExpired:
        return None, "tiempo agotado ejecutando la suite"
    xmls = glob.glob(os.path.join(copia, "automation", "target", "surefire-reports", "TEST-*.xml"))
    if not xmls:
        errores = [l for l in r.stdout.splitlines() if "ERROR" in l][:4]
        return None, "\n".join(errores) or r.stdout[-400:]
    resultados = {}
    for f in xmls:
        for tc in ET.parse(f).getroot().iter("testcase"):
            m = re.search(r"Ejercicio (\d+)", tc.get("name", "") + tc.get("classname", ""))
            if not m:
                continue
            n = int(m.group(1))
            falla = tc.find("failure") if tc.find("failure") is not None else tc.find("error")
            msg = ""
            if falla is not None:
                txt = (falla.get("message") or falla.text or "").strip().splitlines()
                msg = next((l.strip() for l in txt if l.strip()), "falla")
                tipo = (falla.get("type") or "").split(".")[-1]
                msg = f"{tipo}: {msg}" if tipo and tipo not in msg else msg
            previo = resultados.get(n)
            if previo is None or (previo["ok"] and falla is not None):
                resultados[n] = {"ok": falla is None, "mensaje": msg}
    return resultados, None


def evaluar(trabajo, ids, puerto, tiempo_max):
    base = commit_inicial(trabajo)
    fuera = fuera_de_alcance(trabajo, base)
    tmp = tempfile.mkdtemp(prefix="evaluacion-")
    try:
        copia = os.path.join(tmp, "copia")
        preparar_copia(trabajo, copia, base)
        resultados, error = correr_suite(copia, puerto, tiempo_max)
        filas = []
        for e in EJERCICIOS:
            if e["id"] not in ids:
                continue
            ruta = os.path.join(copia, e["archivo"])
            src = sin_comentarios(open(ruta, encoding="utf-8").read()) if os.path.exists(ruta) else ""
            tecnica_ok, motivo = e["regla"](src)
            if resultados is None:
                estado, detalle = "NO_COMPILA", error
            else:
                r = resultados.get(e["id"], {"ok": False, "mensaje": "escenario no encontrado"})
                if r["ok"] and tecnica_ok:
                    estado, detalle = "RESUELTO", motivo
                elif r["ok"]:
                    estado, detalle = "PASA_SIN_TECNICA", "el escenario pasa pero " + motivo
                else:
                    estado, detalle = "FALLA", r["mensaje"]
            filas.append({"id": e["id"], "nombre": e["nombre"], "estado": estado, "detalle": detalle})
        return {"ejercicios": filas, "fuera_de_alcance": fuera, "commit_inicial": base}
    finally:
        shutil.rmtree(tmp, ignore_errors=True)


# ----------------------------------------------------------------------------------------------------------------------
def cargar(path, defecto):
    try:
        return json.load(open(path))
    except Exception:
        return defecto


def mmss(seg):
    seg = max(0, int(seg))
    return f"{seg // 60:02d}:{seg % 60:02d}"


def registrar(estado_dir, informe, reiniciar):
    os.makedirs(estado_dir, exist_ok=True)
    inicio_p = os.path.join(estado_dir, "inicio.json")
    hist_p = os.path.join(estado_dir, "progreso.jsonl")
    if reiniciar:
        for p in (inicio_p, hist_p):
            if os.path.exists(p):
                os.remove(p)
    inicio = cargar(inicio_p, None)
    if inicio is None:
        inicio = {"ts": time.time()}
        json.dump(inicio, open(inicio_p, "w"))
    ahora = time.time()
    with open(hist_p, "a") as h:
        h.write(json.dumps({"ts": ahora, "t": round(ahora - inicio["ts"]),
                            "estados": {f["id"]: f["estado"] for f in informe["ejercicios"]},
                            "fuera_de_alcance": informe["fuera_de_alcance"]}) + "\n")
    primero = {}
    for linea in open(hist_p):
        r = json.loads(linea)
        for k, v in r["estados"].items():
            if v == "RESUELTO" and k not in primero:
                primero[k] = r["t"]
    return ahora - inicio["ts"], primero


def imprimir(informe, transcurrido, primero, limite_min):
    marca = {"RESUELTO": "[x]", "FALLA": "[ ]", "PASA_SIN_TECNICA": "[~]", "NO_COMPILA": "[!]"}
    print(f"\nEVALUACION  QA Automation Senior            tiempo: {mmss(transcurrido)} / {limite_min:02d}:00")
    print("-" * 78)
    for f in informe["ejercicios"]:
        extra = f"  (verde a los {mmss(primero[str(f['id'])])})" if str(f["id"]) in primero and f["estado"] == "RESUELTO" else ""
        print(f" {marca[f['estado']]} {f['id']} {f['nombre']:<46} {f['estado']}{extra}")
        if f["estado"] != "RESUELTO":
            print(f"       {str(f['detalle'])[:150]}")
    ok = sum(1 for f in informe["ejercicios"] if f["estado"] == "RESUELTO")
    print("-" * 78)
    print(f" Progreso: {ok}/{len(informe['ejercicios'])} resueltos")
    fa = informe["fuera_de_alcance"]
    if fa is None:
        print(" Fuera de alcance: no se pudo comprobar (el trabajo no es un repositorio git)")
    elif fa:
        print(" Fuera de alcance (app o tests modificados; en la evaluacion se usan los originales):")
        for f in fa:
            print(f"   - {f}")
    else:
        print(" Fuera de alcance: ninguno")
    return ok == len(informe["ejercicios"])


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--trabajo", default=None, help="carpeta del candidato (por defecto /home/user/qa-challenge o el directorio actual)")
    ap.add_argument("--ejercicios", default="1,2,3,4,5")
    ap.add_argument("--puerto", type=int, default=int(os.environ.get("EVAL_PORT", 5299)))
    ap.add_argument("--limite-min", type=int, default=30)
    ap.add_argument("--vigilar", type=int, default=0, help="repetir cada N segundos hasta resolver todo")
    ap.add_argument("--estado", default=os.environ.get("EVAL_DIR", os.path.expanduser("~/.evaluador")))
    ap.add_argument("--reiniciar", action="store_true")
    ap.add_argument("--json", action="store_true")
    ap.add_argument("--timeout", type=int, default=600)
    a = ap.parse_args()

    trabajo = a.trabajo or ("/home/user/qa-challenge" if os.path.isdir("/home/user/qa-challenge") else os.getcwd())
    trabajo = os.path.abspath(trabajo)
    if not os.path.isdir(os.path.join(trabajo, "automation")):
        print(f"No encuentro 'automation/' en {trabajo}. Usa --trabajo.", file=sys.stderr)
        return 2
    ids = {int(x) for x in a.ejercicios.split(",") if x.strip()}
    reiniciar = a.reiniciar
    while True:
        informe = evaluar(trabajo, ids, a.puerto, a.timeout)
        transcurrido, primero = registrar(a.estado, informe, reiniciar)
        reiniciar = False
        if a.json:
            print(json.dumps(dict(informe, transcurrido_s=round(transcurrido), resuelto_en=primero), ensure_ascii=False))
            todo = all(f["estado"] == "RESUELTO" for f in informe["ejercicios"])
        else:
            todo = imprimir(informe, transcurrido, primero, a.limite_min)
        if todo or not a.vigilar:
            return 0 if todo else 1
        time.sleep(a.vigilar)


if __name__ == "__main__":
    sys.exit(main())
