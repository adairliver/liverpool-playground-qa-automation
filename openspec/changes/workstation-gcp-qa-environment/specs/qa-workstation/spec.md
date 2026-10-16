## Purpose

Define el entorno de Google Cloud Workstations del reto en vivo: autocontenido, con herramientas de autocompletado
de lenguaje, sin herramientas de IA y sin salida a internet, accesible solo con un navegador.

## ADDED Requirements

### Requirement: Entorno autocontenido y ejecutable sin internet

La workstation MUST incluir JDK 17, Maven, Node, Chrome y su chromedriver, y las dependencias de Maven y npm del
proyecto ya descargadas, de modo que la suite se ejecute sin acceso a internet.

#### Scenario: La suite corre sin red

- **WHEN** se ejecuta `mvn test` en `automation/` desde una workstation sin acceso a internet
- **THEN** los 6 escenarios pasan sin intentar descargar nada

#### Scenario: Se puede ejecutar con navegador visible o headless

- **WHEN** el candidato ejecuta la suite en modo headless
- **THEN** Chrome se ejecuta dentro de la workstation y el reporte queda disponible en `automation/target`

### Requirement: Extensiones de lenguaje preinstaladas

El IDE MUST traer preinstaladas las extensiones necesarias para autocompletar palabras reservadas, símbolos y APIs de
Java y Gherkin, navegar y ejecutar pruebas y depurar: soporte de lenguaje Java, depuración Java, ejecución de pruebas
Java, Maven, explorador de dependencias Java y autocompletado de Cucumber. El candidato MUST poder usarlas sin instalar nada.

#### Scenario: El autocompletado de Java funciona al abrir el proyecto

- **WHEN** el candidato abre un archivo Java del proyecto y escribe el inicio de una palabra reservada o de un método de Selenium
- **THEN** el IDE sugiere el autocompletado correspondiente

#### Scenario: Los pasos de Gherkin se autocompletan

- **WHEN** el candidato edita un archivo `.feature`
- **THEN** el IDE sugiere los pasos definidos en las step definitions del proyecto

### Requirement: Sin herramientas de IA en el IDE

El IDE MUST NOT contener extensiones ni funciones de IA generativa. Las extensiones de IA que trae el IDE base MUST
estar removidas, las funciones de IA del editor MUST estar desactivadas, la galería de extensiones MUST NOT estar
disponible y la construcción de la imagen MUST fallar si queda alguna extensión de IA conocida.

#### Scenario: No hay extensiones de IA instaladas

- **WHEN** se listan las extensiones instaladas en la imagen
- **THEN** no aparece ninguna extensión de IA (por ejemplo Gemini, Copilot, Codeium, Tabnine, Cody, Continue, Amazon Q)

#### Scenario: No se pueden instalar extensiones

- **WHEN** el candidato abre la vista de extensiones e intenta buscar o instalar una extensión
- **THEN** no hay galería disponible para buscar ni descargar extensiones

#### Scenario: La interfaz de IA no aparece

- **WHEN** el candidato abre el IDE
- **THEN** no se muestra el panel de chat ni sugerencias en línea de IA

### Requirement: Sin salida a internet desde la workstation

La workstation MUST NOT tener dirección IP pública ni acceso a internet; solo SHALL tener acceso a las APIs de
Google necesarias para funcionar (imagen, registro de eventos).

#### Scenario: No se alcanzan sitios externos

- **WHEN** el candidato intenta acceder desde la terminal de la workstation a un sitio externo
- **THEN** la conexión falla

### Requirement: Primer arranque listo para el reto

Al iniciar por primera vez, la workstation MUST dejar el proyecto del reto en la carpeta del usuario, abierto
por defecto en el IDE, como repositorio git con un único commit inicial y sin historial previo. La copia MUST NOT
incluir `docs/banco-de-errores.md`, el spec original, `openspec/`, ni la carpeta `infra/`. Los arranques posteriores
MUST conservar el trabajo del candidato.

#### Scenario: El IDE abre directamente el proyecto

- **WHEN** el candidato abre su workstation en el navegador
- **THEN** el IDE muestra la carpeta del reto con `app-web`, `automation` y `docs/tickets`

#### Scenario: No hay respuestas en el entorno

- **WHEN** el candidato revisa los archivos y el historial de git
- **THEN** no encuentra el banco de errores, los specs del entrevistador ni commits anteriores con la solución

#### Scenario: El trabajo sobrevive a un reinicio

- **WHEN** la workstation se detiene y se vuelve a iniciar
- **THEN** los cambios del candidato siguen en su carpeta y no se sobrescriben

### Requirement: Infraestructura reproducible y desechable

La imagen y la infraestructura MUST poder crearse y destruirse con scripts documentados e idempotentes, y la
imagen MUST poder probarse localmente antes de subirla. La configuración MUST apagar la workstation por inactividad.

#### Scenario: La imagen se prueba antes de publicarla

- **WHEN** se ejecuta la prueba local de la imagen
- **THEN** se verifica que no haya extensiones de IA, que las extensiones de Java estén presentes y que la suite pase sin red

#### Scenario: La infraestructura se destruye al terminar

- **WHEN** se ejecuta el script de destrucción
- **THEN** la workstation, su configuración y el clúster dejan de existir y de generar costo
