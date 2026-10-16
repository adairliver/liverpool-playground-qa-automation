## 1. App objetivo (app-web)

- [x] 1.1 Crear proyecto React + Vite en `app-web/` con `npm run dev` en el puerto 5199 (strictPort)
- [x] 1.2 Pantalla de login con `username` y `password`, redirección a `/dashboard`
- [x] 1.3 Dashboard con formulario de pedido y botón `submit-form` que se habilita a los 3 s
- [x] 1.4 Banner `promo-banner` intermitente (determinista) y enlace `open-report` (`target=_blank`)
- [x] 1.5 Página `/pedidos` con tabla de filas `data-id` que remonta al recargar
- [x] 1.6 Página `/reporte` con título propio

## 2. Automatización (automation)

- [x] 2.1 `pom.xml` con Selenium, Cucumber, JUnit Platform Suite
- [x] 2.2 Infraestructura: `DriverFactory`, hooks (levantar app, abrir/cerrar driver)
- [x] 2.3 Page Objects con los 5 ejercicios correctos en métodos aislados
- [x] 2.4 5 features Gherkin + step definitions + runner

## 3. Documentación

- [x] 3.1 5 tickets estilo Jira en `docs/tickets/` sin revelar causa
- [x] 3.2 `docs/banco-de-errores.md`
- [x] 3.3 `README.md` y `.gitignore`

## 4. Verificación

- [x] 4.1 `mvn test` en verde (5 escenarios) en headless
- [x] 4.2 Verificar ejecución con `-Dheadless=false`
- [x] 4.3 Commit en rama `development` y push a origin
