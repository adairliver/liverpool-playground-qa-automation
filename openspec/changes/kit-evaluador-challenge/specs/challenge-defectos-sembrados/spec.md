## Purpose

Define el estado de la rama `challenge-30mins`: la misma aplicación y suite de `development`, con cinco defectos de
automatización sembrados y una solución de referencia independiente para cada uno, de modo que el examen sea
reproducible y verificable.

## ADDED Requirements

### Requirement: La rama del reto contiene exactamente cinco defectos sembrados

La rama `challenge-30mins` MUST diferir de `development` únicamente en el código de automatización (Page Objects) donde
se siembran los defectos, y cada defecto MUST residir en un único método de un único Page Object. La aplicación web,
los archivos `.feature` y las definiciones de pasos MUST permanecer idénticos a `development`.

#### Scenario: Solo cambian los Page Objects

- **WHEN** se compara `challenge-30mins` contra `development`
- **THEN** las únicas diferencias están en los cinco Page Objects de automatización (más el material de apoyo del evaluador)

#### Scenario: Cada defecto está aislado

- **WHEN** se corrige un solo defecto aplicando su solución de referencia
- **THEN** únicamente el escenario asociado a ese ejercicio cambia de fallo a éxito y los demás conservan su estado

### Requirement: Cada defecto produce un síntoma detectable por la suite

Con los defectos sembrados, la suite MUST fallar en el escenario asociado a cada ejercicio con una señal distinguible, y
el síntoma MUST coincidir con el descrito en el ticket QA correspondiente sin revelar la causa raíz.

#### Scenario: La suite sembrada falla en los cinco ejercicios

- **WHEN** se ejecuta la suite completa en `challenge-30mins` sin aplicar ninguna solución
- **THEN** fallan los escenarios de los cinco ejercicios y ninguno falla por una causa ajena a los defectos sembrados

#### Scenario: Los tickets describen síntomas, no soluciones

- **WHEN** el candidato lee los tickets QA-101 a QA-105
- **THEN** encuentra el comportamiento observado y el esperado, pero no la causa raíz ni el cambio de código requerido

### Requirement: Soluciones de referencia aplicables de forma independiente

Cada ejercicio MUST contar con una solución de referencia en forma de parche que se aplique sobre la rama sembrada de
manera independiente de las demás, y que al aplicarse todas la suite MUST quedar en verde (6/6).

#### Scenario: Aplicar todas las soluciones deja la suite en verde

- **WHEN** se aplican los cinco parches sobre una copia de `challenge-30mins` y se ejecuta la suite
- **THEN** los 6 escenarios pasan

#### Scenario: Los parches no dependen de un orden

- **WHEN** los parches se aplican en cualquier orden sobre una copia limpia
- **THEN** cada uno se aplica sin conflictos
