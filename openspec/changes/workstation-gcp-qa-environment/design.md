## Context

Verificado inspeccionando la imagen oficial `us-central1-docker.pkg.dev/cloud-workstations-images/predefined/code-oss`
(pública, amd64, Ubuntu 24.04): Code OSS `1.123.2-cde`, Java 25, Node 24; las extensiones viven en
`/opt/code-oss/extensions`; el IDE arranca con `/etc/workstation-startup.d/110_start-code-oss.sh` (como usuario
`user`, `HOME=/home/user`); los scripts de `/etc/workstation-startup.d/` corren como root en cada arranque en orden
numérico; la galería apunta a Open VSX. Trae **extensiones de IA preinstaladas**: `google.geminicodeassist`,
`google.gemini-cli-vscode-ide-companion` y `googlecloudtools.cloudcode` (y `googlecloudtools.datacloud`).
El disco persistente de la workstation se monta en `/home/user` y oculta lo que la imagen tenga ahí.

## Goals / Non-Goals

**Goals:** entorno que funciona offline, sin IA, con autocompletado, reproducible y que no filtra las respuestas.

**Non-Goals:** impedir que el candidato use IA en su propia computadora; sembrar defectos; autenticar usuarios finales.

## Decisions

- **Imagen personalizada sobre la imagen oficial de Code OSS** (en vez de configurar una workstation vacía y
  descargar al arrancar): permite no tener internet en runtime y arranques de segundos. Se construye con Cloud Build
  (sin depender de Docker local) y se puede probar localmente con Docker (emulación amd64).
- **Todo lo instalado va fuera de `/home/user`**: JDK 17 en `/usr/lib/jvm`, Maven en `/opt/maven`, repositorio
  Maven en `/opt/m2`, proyecto semilla en `/opt/qa-seed`, Chrome y chromedriver del mismo canal Chrome for Testing
  en `/usr/local/bin`. El script de arranque copia la semilla a `/home/user/qa-challenge` solo si no existe.
- **JDK 17 para compilar y JDK 25 (el del IDE base) para el servidor de lenguaje**: el soporte de Java del IDE
  requiere JDK reciente, pero el proyecto se validó con 17. `JAVA_HOME` apunta a 17; se registra como runtime del IDE.
- **Maven offline por configuración** (`settings.xml` global y de usuario con `offline=true` y repositorio
  `/opt/m2`), llenado en la construcción ejecutando `mvn test` completo. Selenium usa el chromedriver del PATH y
  `SE_OFFLINE=true`, sin descargar nada.
- **Extensiones como "built-in"**: los `.vsix` se descargan de Open VSX con versión fija y se descomprimen en
  `/opt/code-oss/extensions/`. Así sobreviven al disco persistente, no se pueden desinstalar y no requieren galería.
  Se instalan individualmente (no `vscode-java-pack`, que incorpora extensiones de IA). Cucumber: `alexkrechik.cucumberautocomplete`.
- **Bloqueo de IA en capas**: (1) borrar las extensiones de IA y `googlecloudtools.*`; (2) quitar
  `extensionsGallery` y las claves de chat de `product.json`; (3) ajustes de máquina con
  `chat.disableAIFeatures`, `extensions.allowed` (solo publicadores permitidos), sin autoactualización ni telemetría,
  reescritos en cada arranque; (4) sin salida a internet; (5) la construcción falla si `verify-no-ai.sh` encuentra
  extensiones de IA conocidas. Alternativa descartada: depender solo de ajustes, que el usuario puede cambiar.
- **Sin salida a internet**: configuración de workstation con `disable_public_ip_addresses` y subred con Private
  Google Access, sin Cloud NAT. Aviso: las APIs de Google siguen alcanzables por Private Google Access; por eso la
  capa (1) es imprescindible y no basta con la red.
- **El IDE abre la carpeta del reto** reemplazando `110_start-code-oss.sh` por una copia con `--default-folder`.
- **Sin respuestas en la semilla**: se genera con `git archive` (sin historial), excluyendo
  `docs/banco-de-errores.md`, `spec_qa_automation_playground.md`, `openspec/`, `.cursor/` e `infra/`, y se crea un
  repositorio nuevo con un solo commit. Importante para `challenge-30mins`: su historial heredado contiene la solución.
- **Operación**: región `us-central1`, VM `e2-standard-4` (16 GB), disco persistente `pd-balanced` de 50 GB,
  apagado por inactividad a los 20 min y tope de 2 h. Acceso por la puerta de enlace pública de Cloud Workstations
  con IAM (`roles/workstations.user` sobre esa única workstation); el candidato necesita una cuenta de Google.

## Risks / Trade-offs

- [Las APIs de Google siguen accesibles] → las extensiones de IA se eliminan de la imagen; `verify-no-ai.sh`
  rompe la construcción si reaparecen (p. ej. al actualizar la imagen base).
- [La imagen base `latest` puede cambiar y reintroducir extensiones] → fijar el digest en el Dockerfile y
  revisar al actualizar.
- [Construir y probar amd64 en Apple Silicon es lento y Chrome puede fallar bajo emulación] → la validación
  definitiva ocurre en Cloud Build; la prueba local es complementaria.
- [`extensions.allowed` puede interactuar con extensiones built-in] → se valida en la prueba local; las capas
  1, 2 y 4 no dependen de ella.
- [Costo del clúster y la VM mientras existan] → apagado por inactividad y script de destrucción.
- [La sesión de `gcloud` caduca] → el usuario debe ejecutar `gcloud auth login`; los pasos de GCP se pausan hasta entonces.

## Migration Plan

1. Probar la imagen localmente. 2. Construir y publicar con Cloud Build. 3. Crear clúster, configuración y
workstation. 4. Verificar desde el navegador. 5. Destruir al terminar. La semilla de `challenge-30mins` se
reconstruye después con el mismo script (`BRANCH=challenge-30mins`).

## Open Questions

- ¿Qué cuentas de Google tendrán `roles/workstations.user`? (No cambia la imagen.)
- ¿Red existente del proyecto o red nueva dedicada? Se decide al inspeccionar el proyecto con `gcloud`.
