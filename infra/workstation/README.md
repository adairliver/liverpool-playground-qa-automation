# Workstation del reto (Google Cloud Workstations)

Imagen personalizada de Code OSS para el examen de **QA Automation Senior**. El candidato solo necesita un navegador:
todo viene preinstalado y **no hay IA ni internet**.

## Qué trae la imagen

| Componente | Detalle |
|------------|---------|
| Build | JDK 17 (`/opt/jdk17`), Maven 3.9.9, Chrome estable + chromedriver (misma versión), Node del IDE |
| Dependencias | Repositorio Maven en `/opt/m2` y `node_modules` precargados; Maven en modo **offline** |
| Extensiones | Red Hat Java, Debugger, Test Runner, Maven y Project Manager for Java, Cucumber (Gherkin) autocomplete |
| Proyecto | `/home/user/qa-challenge` (repo git de un solo commit, sin historial ni respuestas) |

### Cómo queda el IDE al abrir

Al abrir la URL de la workstation el candidato ve el proyecto `qa-challenge` ya abierto, con **tema oscuro**, **sin la pestaña
Welcome** y la **terminal desplegada** (`bash` en `/home/user/qa-challenge`, con Java 17 y Maven listos). Aplica igual a las dos
ramas porque lo pone la imagen, no el repositorio:

- [`extension/qa-startup`](extension/qa-startup): extensión propia (sin red ni telemetría) instalada como *built-in*. Al terminar de
  iniciar fija el tema oscuro (solo si el usuario no eligió otro), cierra Welcome y abre la terminal. Se usa una extensión porque en el
  IDE web los ajustes de usuario viven en el navegador y `configurationDefaults` de `product.json` no llega al cliente.
- `startup/105_qa-bootstrap.sh` escribe `.vscode/settings.json` del proyecto con `java.dependency.enableDependencyCheckup: false`, para
  que las extensiones de Java no ofrezcan instalar la extensión de Copilot para "modernizar" el proyecto (`.vscode/` está en `.gitignore`).

`scripts/test-image-local.sh` comprueba ambas piezas.

Versiones de extensiones en [`extensions.txt`](extensions.txt) (descargadas de Open VSX y desempaquetadas como *built-in*
en `/opt/code-oss/extensions`, así sobreviven al disco persistente y no se pueden desinstalar).

## Cómo se impide la IA (defensa en capas)

1. Se eliminan `google.geminicodeassist`, `gemini-cli-vscode-ide-companion` y `googlecloudtools.*` de la imagen base.
2. `product.json` pierde `extensionsGallery` (no se puede instalar nada) y `defaultChatAgent`.
3. Ajustes de máquina: `chat.disableAIFeatures`, `extensions.allowed` con lista blanca, sin telemetría ni actualizaciones.
4. Sin IP pública ni Cloud NAT: no hay salida a internet (solo Private Google Access).
5. `scripts/verify-no-ai.sh` **rompe la construcción** si aparece una extensión o contribución de IA
   (se tolera `languageModelTools`, una declaración pasiva que traen las extensiones Java y es inerte sin un modelo).

La imagen base se fija por *digest* para que una versión nueva no reintroduzca IA sin que lo notemos.

## Probar localmente (Docker, ~15 min la primera vez en Apple Silicon)

```bash
cd infra/workstation
BRANCH=development ./scripts/prepare-context.sh           # arma .build/ desde la rama (git archive, sin historial)
export DOCKER_CONFIG=/tmp/dockercfg                       # evita el credential helper de gcloud
docker build --platform linux/amd64 -t qa-ws:local .build
./scripts/test-image-local.sh qa-ws:local                 # extensiones, sin IA, semilla limpia, suite offline, IDE + Java LS
```

## Publicar en Google Cloud

Requiere `gcloud auth login` con permisos de administrador sobre el proyecto.

```bash
cd infra/workstation
BRANCH=development ./scripts/gcp-setup.sh        # todo: APIs, red, imagen, clúster, firewall, config, workstation
./scripts/gcp-setup.sh image                     # solo reconstruir la imagen (p. ej. con BRANCH=challenge-30mins)
./scripts/gcp-setup.sh config                    # actualizar la configuración para usar la imagen nueva
```

Valores por defecto (sobrescribibles con variables de entorno): proyecto `crp-poc-it-hackathon-1`, región `us-central1`,
`e2-standard-4`, disco `pd-balanced` 50 GB, apagado a los 20 min de inactividad y tope de 2 h por sesión.

Dar acceso a un candidato (cuenta de Google) e iniciar la workstation:

```bash
./scripts/grant-access.sh CORREO
gcloud --project crp-poc-it-hackathon-1 workstations start qa-challenge-ws \
  --cluster qa-challenge-cluster --config qa-challenge-config --region us-central1
```

## Costos y limpieza

El clúster de Cloud Workstations tiene un costo fijo por hora mientras exista, aunque no haya workstations encendidas.
Al terminar la sesión del examen:

```bash
./scripts/gcp-teardown.sh        # pide confirmar el nombre del proyecto
```

## Cambiar de rama (development → challenge-30mins)

La imagen toma el código con `git archive` de la rama indicada. Para la fase del reto:
`BRANCH=challenge-30mins ./scripts/gcp-setup.sh image && ./scripts/gcp-setup.sh config`, y **recrear la workstation**
(el disco persistente conserva `/home/user/qa-challenge` si ya existía; bórrala o usa una nueva por candidato).
