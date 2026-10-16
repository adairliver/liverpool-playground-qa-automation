## Purpose

Define el material con el que el evaluador conduce el examen en vivo: una guía en Markdown, un script que mide el avance
del candidato, soluciones de referencia y una referencia visual del estado final; todo aislado de lo que recibe el
candidato.

## ADDED Requirements

### Requirement: Guía del evaluador en Markdown

El proyecto MUST incluir una guía del evaluador en Markdown que describa la arquitectura, los temas del reto y, por cada
ejercicio, el síntoma visible, el comando para reproducirlo, la salida de fallo real, la causa raíz, la solución, los
errores típicos, las preguntas de seguimiento y tres niveles de pista. También MUST incluir una rúbrica y la descripción
del estado final esperado.

#### Scenario: El evaluador puede reproducir un fallo con un comando

- **WHEN** el evaluador sigue el comando indicado para un ejercicio sobre la rama sembrada
- **THEN** obtiene el fallo descrito en la guía

#### Scenario: Las pistas no regalan la solución en el primer nivel

- **WHEN** el evaluador usa la pista de nivel 1 de un ejercicio
- **THEN** la pista orienta sobre el tipo de problema sin nombrar el método ni el cambio de código

#### Scenario: La guía y las salidas coinciden con la rama

- **WHEN** se ejecutan los comandos de la guía sobre `challenge-30mins`
- **THEN** las salidas citadas corresponden a ejecuciones reales y no a texto supuesto

### Requirement: Script de progreso del evaluador

El kit MUST proveer un script que informe el estado de cada ejercicio y el total resuelto (de 0 a 5), combinando el
resultado de ejecutar el escenario con reglas de revisión del código que detecten soluciones aparentes (por ejemplo, una
espera fija más corta que sigue siendo una espera fija). El script MUST permitir ejecuciones repetidas y registrar la
marca de tiempo en que cada ejercicio pasó a resuelto.

#### Scenario: Estado sembrado

- **WHEN** el script se ejecuta sobre una copia de `challenge-30mins` sin cambios
- **THEN** informa 0 de 5 ejercicios resueltos

#### Scenario: Estado de referencia

- **WHEN** el script se ejecuta sobre una copia con las cinco soluciones de referencia aplicadas
- **THEN** informa 5 de 5 ejercicios resueltos y la suite en verde

#### Scenario: Solución aparente no cuenta como resuelta

- **WHEN** el candidato reemplaza una espera fija por otra espera fija de menor duración y el escenario pasa
- **THEN** el script marca el ejercicio como "pasa el escenario pero no usa la técnica esperada"

#### Scenario: Progreso parcial

- **WHEN** el candidato ha resuelto solo algunos ejercicios
- **THEN** el script informa exactamente cuáles están resueltos y cuáles no

### Requirement: El script no interfiere con la sesión del candidato

El script MUST ejecutarse sobre una copia del trabajo del candidato, sin modificar sus archivos, y MUST poder correr
mientras el candidato ejecuta la suite, sin conflictos de puerto. La aplicación MUST aceptar el puerto por variable de
entorno y conservar el puerto 5199 por defecto.

#### Scenario: Ejecución simultánea

- **WHEN** el candidato ejecuta la suite y el evaluador ejecuta el script al mismo tiempo
- **THEN** ambas ejecuciones terminan sin error de puerto ocupado

#### Scenario: Los archivos del candidato quedan intactos

- **WHEN** el script termina
- **THEN** el árbol de trabajo del candidato es idéntico al que tenía antes de ejecutarlo

### Requirement: Detección de cambios fuera de alcance

El script MUST comparar el trabajo del candidato contra el estado inicial del reto y señalar las modificaciones a la
aplicación web, a los archivos `.feature` o a las definiciones de pasos, ya que el problema debe resolverse en los Page
Objects.

#### Scenario: Se modifica un archivo fuera de alcance

- **WHEN** el candidato edita un archivo `.feature`
- **THEN** el informe lista ese archivo como modificación fuera de alcance

#### Scenario: Solo se modifican Page Objects

- **WHEN** el candidato modifica únicamente Page Objects
- **THEN** el informe indica que no hay modificaciones fuera de alcance

### Requirement: Referencia visual del estado al 100 %

El kit MUST incluir un video con subtítulos de la aplicación funcionando al 100 % y capturas del estado final esperado,
incluido el reporte de la suite con los 6 escenarios en verde, que muestren los comportamientos temporales clave (botón
de envío que se habilita a los 3 s y banner promocional que aparece y desaparece en ciclo).

#### Scenario: El video recorre los flujos de los cinco ejercicios

- **WHEN** el evaluador reproduce el video
- **THEN** ve el inicio de sesión, el banner promocional, el envío del pedido, la selección de un pedido tras recargar y el reporte en una pestaña nueva

#### Scenario: Las capturas muestran la suite en verde

- **WHEN** el evaluador consulta las capturas del estado final
- **THEN** el reporte de la suite muestra 6 de 6 escenarios aprobados

### Requirement: Aislamiento del material del evaluador

Todo el material del evaluador (guía, script, parches, video y capturas) MUST residir en una ubicación propia y MUST
excluirse de la imagen de la workstation del candidato; la construcción de la imagen MUST fallar si alguno de esos
archivos aparece en la semilla.

#### Scenario: El material no llega a la workstation

- **WHEN** se construye la imagen de la workstation
- **THEN** la semilla del candidato no contiene el material del evaluador ni referencias a las soluciones

#### Scenario: La construcción falla si hay fuga

- **WHEN** el material del evaluador aparece en la semilla
- **THEN** la preparación del contexto de construcción termina con error
