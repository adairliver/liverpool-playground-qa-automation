## ADDED Requirements

### Requirement: Framework BDD con Cucumber/Gherkin

El sistema MUST envolver los 5 escenarios de referencia en features de Gherkin con sus step definitions,
consistente con el stack del equipo de QA (Cucumber, Selenium, Gherkin, Jira).

#### Scenario: Cada ejercicio tiene su feature file

- **WHEN** se revisa el directorio `src/test/resources/features/`
- **THEN** existe un archivo `.feature` por cada uno de los 5 ejercicios, con un escenario Gherkin (Given/When/Then) que ejercita el caso descrito en el documento fuente

#### Scenario: La suite corre en verde de punta a punta

- **WHEN** se ejecuta el runner de Cucumber (`mvn test` o equivalente)
- **THEN** los 5 escenarios pasan sin errores ni advertencias de `StaleElementReferenceException`, `NullPointerException` ni timeouts por hard wait

### Requirement: Ejecución autocontenida

La suite MUST poder ejecutarse con un solo comando de Maven sin levantar manualmente la app, y SHALL permitir
ejecución headless para entornos sin pantalla (p. ej. una workstation en la nube).

#### Scenario: La suite levanta su propia app objetivo

- **WHEN** se ejecuta `mvn test` desde `automation/`
- **THEN** la app objetivo se sirve automáticamente si no está ya disponible y la suite corre contra ella

#### Scenario: Modo con navegador visible

- **WHEN** se ejecuta la suite con `-Dheadless=false`
- **THEN** Chrome se abre con interfaz gráfica para que el entrevistador y el candidato vean la ejecución
