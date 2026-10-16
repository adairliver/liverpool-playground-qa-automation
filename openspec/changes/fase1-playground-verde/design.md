## Context

Repositorio vacío. Se construye en macOS (local) y luego se llevará a una workstation de Google Cloud
(proyecto `crp-poc-it-hackathon-1`) donde el candidato resolverá el reto en vivo. Stack del equipo: Selenium,
Cucumber, Gherkin, Jira, Java.

## Goals / Non-Goals

**Goals:**
- Línea base verde y determinista (sin flakiness) en rama `development`.
- Que la Fase 2 sea un diff pequeño y predecible sobre esta base.
- Reproducible en la workstation (Linux, sin pantalla → headless por defecto, visible opcional).

**Non-Goals:**
- Backend, Appium, sembrar defectos, despliegue a GCP en esta fase.

## Decisions

- **Frontend**: React 18 + Vite. Sin router externo: la app usa rutas por `location.pathname` con
  `history.pushState`; el servidor de Vite hace fallback a `index.html`. Alternativa descartada: Create React App
  (obsoleto).
- **Rutas**: `/` login (`username`, `password`), `/dashboard` (formulario de pedido con `submit-form`,
  banner `promo-banner`, enlace `open-report`), `/pedidos` (tabla con filas `data-id`), `/reporte` (pestaña
  nueva, `document.title` = "Reporte de Pedidos").
- **Latencia determinista**: el botón se habilita a los 3 s; el banner alterna visible 2 s / oculto 2 s en ciclo
  fijo (determinista, no aleatorio) para no generar flakiness; la tabla se re-renderiza (remonta filas) en
  cada carga, lo que invalida referencias previas al `refresh()`.
- **Automatización**: Java 17, Maven, Selenium 4.x (Selenium Manager resuelve chromedriver), Cucumber 7 +
  JUnit Platform Suite, AssertJ/JUnit asserts.
- **Page Objects**: `LoginPage`, `PedidoFormPage`, `PedidosTablePage`, `ReportPage`, `DashboardPage`; cada
  ejercicio en un método: `PedidoFormPage.clickSubmitButton()`, `LoginPage` constructor + `enterUsername()`,
  `PedidosTablePage.clickRowAfterRefresh()`, `ReportPage.verifyNewTabTitle()`,
  `DashboardPage.isPromoBannerPresent()`.
- **Autocontenida**: un hook de Cucumber (`@BeforeAll`) levanta `npm run dev` (puerto 5199) si no responde y lo
  apaga al final; instala dependencias de npm si falta `node_modules`. Headless por defecto, `-Dheadless=false`
  para visible. `-Dbase.url` permite apuntar a otra URL.
- **Escenario del banner**: el banner se evalúa con `implicitlyWait` activo para evidenciar que `findElements`
  responde rápido aunque no exista el elemento.

## Risks / Trade-offs

- [Flakiness por tiempos] → ciclos deterministas y esperas con margen; el banner se verifica en ambos estados.
- [Node/Chrome ausentes en la workstation] → README documenta prerequisitos; se resolverá en la fase de GCP.
- [Fase 2 usa un nombre de rama distinto al del spec original (`challenge-30mins` en lugar de
  `reto-candidato`; `development` en lugar de `main`)] → se sigue la decisión explícita del usuario.
