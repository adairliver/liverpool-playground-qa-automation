# Liverpool Playground — QA Automation (Selenium + Cucumber)

Reto en vivo de 30 minutos para QA Automation Senior. Este repositorio contiene:

- `app-web/` — app de pedidos en React (Vite), con datos simulados en el frontend (sin backend).
- `automation/` — suite Selenium 4 + Cucumber (Gherkin) + JUnit 5, Java 17, Maven.
- `docs/tickets/` — 5 tickets de intake estilo Jira (síntomas, sin causa raíz).
- `docs/banco-de-errores.md` — guía del entrevistador (**no compartir con el candidato**).
- `openspec/` — especificaciones (OpenSpec). El spec original está en `spec_qa_automation_playground.md`.

## Ramas

| Rama | Contenido |
|------|-----------|
| `development` | Suite funcionando al 100% (línea base). |
| `challenge-30mins` | Misma suite con los 5 defectos sembrados para el candidato (Fase 2). |

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
