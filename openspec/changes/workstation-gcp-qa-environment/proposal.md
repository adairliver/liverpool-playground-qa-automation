## Why

El reto en vivo se hará en una Google Cloud Workstation (proyecto `crp-poc-it-hackathon-1`) para que el candidato
solo necesite su navegador. El entorno debe traer todas las dependencias y extensiones de lenguaje ya instaladas
(autocompletado de Java y Gherkin), y debe impedir el uso de herramientas de IA dentro de la workstation, porque
el reto se evalúa "sin IA generativa". El IDE base de Cloud Workstations trae Gemini Code Assist preinstalado, así
que hay que removerlo de forma explícita.

## What Changes

- Imagen de contenedor personalizada (basada en la imagen oficial de Code OSS de Cloud Workstations) con JDK 17,
  Maven, Node, Chrome y chromedriver, y con las dependencias de Maven y npm del proyecto ya descargadas.
- Extensiones de lenguaje preinstaladas e inamovibles (Java, depuración, pruebas, Maven, dependencias, Cucumber/Gherkin),
  incorporadas a la imagen en lugar de instalarse desde el marketplace.
- Remoción de las extensiones de IA preinstaladas y de la galería de extensiones; ajustes de máquina que desactivan
  las funciones de IA y limitan qué publicadores pueden ejecutarse; la construcción de la imagen falla si queda
  alguna extensión de IA.
- Workstation sin salida a internet (sin IP pública ni Cloud NAT): todo se resuelve offline desde la imagen.
- Primer arranque que deja al candidato en la carpeta del reto, abierta por defecto en el IDE, como repositorio git
  sin historial y sin los documentos de respuestas del entrevistador.
- Scripts reproducibles para construir la imagen (Cloud Build), crear la infraestructura de Workstations y
  destruirla, más una prueba local de la imagen con Docker antes de subirla.

**Fuera de alcance**: crear la rama `challenge-30mins` y sembrar defectos; control de lo que el candidato haga en
su propia computadora (fuera de la workstation); cuentas de usuarios finales más allá de documentar el permiso
IAM necesario.

## Capabilities

### New Capabilities

- `qa-workstation`: entorno de desarrollo en la nube para el reto, autocontenido, sin IA y sin internet, listo
  para ejecutar la suite desde el navegador.

### Modified Capabilities

(ninguna)

## Impact

- Código nuevo en `infra/workstation/` (Dockerfile, scripts de arranque, configuración, scripts de GCP). Sin
  cambios en `app-web/` ni `automation/`.
- Recursos de GCP con costo mientras existan (clúster y VM de la workstation, Artifact Registry, Cloud Build):
  se documenta cómo apagarlos y destruirlos.
- Requiere APIs habilitadas en el proyecto (Cloud Workstations, Artifact Registry, Cloud Build, Compute) y una
  sesión de `gcloud` autenticada con permisos de administrador.
