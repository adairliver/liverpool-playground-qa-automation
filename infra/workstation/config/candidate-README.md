# Reto QA Automation (30 minutos)

Bienvenido. Este proyecto contiene una app de pedidos (`app-web`) y su suite de pruebas automatizadas
(`automation`, Selenium + Cucumber/Gherkin, Java).

## Tu objetivo

Revisa los tickets de `docs/tickets/` y deja la suite en verde, corrigiendo la automatización donde haga falta.

## Cómo ejecutar la suite

Abre una terminal del IDE (`Terminal > New Terminal`) y ejecuta:

```bash
cd automation
mvn test
```

- Corre en modo headless y levanta la app automáticamente; no necesitas arrancar nada más.
- Para ejecutar un solo escenario: `mvn test -Dcucumber.features=src/test/resources/features/02_login.feature`
- El reporte queda en `automation/target/cucumber-report.html`.

## Estructura

| Carpeta | Contenido |
|---------|-----------|
| `automation/src/main/java/.../pages` | Page Objects |
| `automation/src/test/java/.../steps` | Step definitions de Cucumber |
| `automation/src/test/resources/features` | Escenarios Gherkin |
| `docs/tickets` | Tickets del reto |

## Reglas

- Sin herramientas de IA generativa. La workstation no tiene internet ni extensiones de IA.
- Puedes usar el autocompletado del IDE (Java y Gherkin).
- No cambies la app (`app-web`): el problema está en la automatización.
- Tienes 30 minutos. ¡Éxito!
