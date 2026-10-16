## ADDED Requirements

### Requirement: Tickets de intake estilo Jira sin revelar la causa raíz

El sistema MUST incluir, para cada uno de los 5 defectos, una descripción de síntoma estilo ticket de Jira que
NO mencione la causa raíz ni el nombre del anti-patrón, para usarse como intake del candidato.

#### Scenario: El ticket describe el síntoma, no la causa

- **WHEN** se abre `docs/tickets/` para cualquiera de los 5 defectos
- **THEN** el texto describe el comportamiento observado (p. ej. "el botón de enviar a veces tarda, a veces falla") sin mencionar `Thread.sleep`, `PageFactory`, `StaleElementReferenceException` ni ningún otro término que delate directamente la causa

### Requirement: Banco de errores de referencia

El sistema MUST incluir `docs/banco-de-errores.md` con los 5 ejercicios fuente (síntoma, causa, solución esperada)
para uso exclusivo del entrevistador.

#### Scenario: El entrevistador consulta la solución esperada

- **WHEN** se abre `docs/banco-de-errores.md`
- **THEN** cada ejercicio lista el síntoma, la causa raíz, el método afectado y la solución esperada
