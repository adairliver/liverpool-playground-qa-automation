# Liverpool Playground — QA Automation (Selenium + Cucumber)

Reto en vivo de 30 minutos para QA Automation Senior. Este repositorio contiene:

- `app-web/` — app de pedidos en React (Vite), con datos simulados en el frontend (sin backend).
- `automation/` — suite Selenium 4 + Cucumber (Gherkin) + JUnit 5, Java 17, Maven.
- `docs/tickets/` — 5 tickets de intake estilo Jira (síntomas, sin causa raíz).
- `evaluador/` — **kit del evaluador** (**no compartir con el candidato**): guía completa en `evaluador/README.md`, soluciones,
  script de progreso y video de la app al 100 %.
- `docs/banco-de-errores.md` — índice de los 5 defectos (**no compartir con el candidato**; el detalle está en la guía).
- `openspec/` — especificaciones (OpenSpec). El spec original está en `spec_qa_automation_playground.md`.

## Ramas

| Rama | Contenido |
|------|-----------|
| `development` | Suite funcionando al 100% (línea base). |
| `challenge-30mins` | Misma suite con los 5 defectos sembrados para el candidato (Fase 2). |

## Look and feel

La app imita a liverpool.com.mx (solo colores y tipografía, **sin logos ni imágenes de la marca**; es un sitio de demostración):

- Paleta del tema público de Liverpool (rosa `#E10098`, grises, estados) en `app-web/src/styles/tokens.css`.
- Tipografía **Roboto** e íconos Material, empaquetados localmente (no requiere internet).
- Header de dos niveles, barra de anuncio y footer con la estructura de Liverpool; login con el patrón del login/registro de Liverpool.
- Pedidos como "Mis compras" (breadcrumb, estatus con color, fila completa seleccionable).
- Los controles decorativos (buscador, Categorías, favoritos, bolsa, filtros, enlaces del footer) no hacen nada a propósito.

Regla: los IDs, los `data-id`, los títulos de pestaña y los tiempos simulados no se tocan al cambiar estilos; la suite debe seguir en verde sin editar Java.

## Prerrequisitos

Node.js 18+ (probado con 20), npm, JDK 17+, Maven 3.9+ y Google Chrome. Selenium Manager descarga el chromedriver solo.

## Levantar la app (opcional, la suite la levanta sola)

```bash
cd app-web
npm install
npm run dev        # http://localhost:5199
```

Credenciales: `qa.senior` / `Liverpool123`. Elementos clave: `username`, `submit-form` (se habilita a los 3 s),
filas `tr[data-id]`, `open-report` (abre pestaña nueva) y `promo-banner` (visible 3 s / oculto 4 s).

## Correr la suite

```bash
cd automation
mvn test                        # headless (por defecto); levanta app-web automáticamente
mvn test -Dheadless=false       # Chrome visible
```

Propiedades opcionales: `-Dbase.url=http://host:puerto`, `-Dapp.autostart=false` (no levantar la app),
`-Dapp.dir=../app-web`, `-Dchrome.binary=/ruta/a/chrome`.
Un solo escenario: `mvn test -Dcucumber.filter.tags=...` o `-Dcucumber.features=src/test/resources/features/03_seleccion_pedido.feature`.

El reporte HTML queda en `automation/target/cucumber-report.html`.

> Nota: el puerto 5199 se eligió para no chocar con otros servidores de desarrollo (5173). La suite valida que
> el servicio en ese puerto sea esta app antes de usarlo.

## Los 5 ejercicios

| # | Feature | Tema |
|---|---------|------|
| 1 | `01_envio_pedido.feature` | Envío del formulario (sincronización) |
| 2 | `02_login.feature` | Inicio de sesión (Page Object) |
| 3 | `03_seleccion_pedido.feature` | Selección de pedido tras recargar |
| 4 | `04_reporte.feature` | Reporte en pestaña nueva |
| 5 | `05_banner_promocional.feature` | Banner promocional intermitente |

## Workstation para el examen en vivo

La imagen de Google Cloud Workstations (Java, Maven, Chrome, extensiones de Java/Gherkin, sin IA ni internet) se arma y
publica desde [`infra/workstation`](infra/workstation/README.md).
