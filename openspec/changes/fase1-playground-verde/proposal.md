## Why

Se necesita un ambiente de práctica para un reto en vivo de 30 minutos para candidatos a QA Automation Senior
(Selenium + Cucumber/Gherkin). Antes de sembrar defectos, hace falta una línea base "dorada": una app objetivo
y una suite de automatización completas, limpias y en verde al 100%. Fuente: `spec_qa_automation_playground.md`
y el documento `Ejercicios_Entrevista` (5 ejercicios de Selenium).

## What Changes

- Nueva app web en React (`app-web/`) con datos simulados en el frontend, sin backend, que expone los
  identificadores que esperan las pruebas.
- Nueva suite de automatización (`automation/`) con Selenium 4 + Cucumber (Gherkin) + JUnit 5, con la solución
  correcta de los 5 ejercicios, cada defecto potencial aislado en un único método de un único Page Object.
- Un archivo `.feature` por ejercicio (5 en total) con sus step definitions y un runner.
- 5 tickets estilo Jira (`docs/tickets/`) que describen síntomas sin revelar causa raíz, y
  `docs/banco-de-errores.md` con los 5 ejercicios fuente.
- README con instrucciones para levantar la app y correr la suite.
- Estrategia de ramas: `development` (esta fase, 100% verde) y `challenge-30mins` (Fase 2, defectos sembrados).

**Fuera de alcance**: sembrar defectos, crear la rama `challenge-30mins`, componentes móviles/Appium, y el
despliegue a la workstation de GCP (se hace después de validar localmente).

## Capabilities

### New Capabilities

- `target-app`: app web de pedidos en React que expone los 5 escenarios de prueba con datos precargados.
- `selenium-exercises`: comportamiento correcto de automatización para los 5 ejercicios (espera explícita,
  inicialización de Page Objects, re-localización tras recarga, manejo de pestañas, existencia sin excepciones).
- `bdd-framework`: organización BDD con Cucumber/Gherkin y ejecución de la suite en verde.
- `intake-tickets`: tickets de intake estilo Jira que describen síntomas sin revelar la causa.

### Modified Capabilities

(ninguna)

## Impact

- Código nuevo: `app-web/` (Node 20, React + Vite), `automation/` (Java 17, Maven), `docs/`, `README.md`.
- Dependencias: Node/npm, JDK 17+, Maven, Google Chrome (Selenium Manager resuelve el driver).
- Sin impacto en sistemas existentes (repositorio vacío).
