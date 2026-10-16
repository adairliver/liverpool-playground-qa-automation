## ADDED Requirements

### Requirement: App objetivo de pedidos en React sin backend obligatorio

El sistema MUST incluir una aplicación web en React que reproduzca las pantallas necesarias para los 5
ejercicios, con datos e interacciones simulados en el propio frontend. El sistema SHALL NOT requerir un backend
real. Si se agrega un backend, MUST ser Java 17+ (Spring Boot).

#### Scenario: La app levanta con un solo comando

- **WHEN** se ejecuta el comando documentado en el README (`npm run dev` o equivalente)
- **THEN** la app de pedidos queda disponible en `localhost` con datos de prueba precargados, sin pasos manuales adicionales

#### Scenario: Las pantallas exponen los identificadores que las pruebas esperan

- **WHEN** se inspecciona el HTML renderizado de cada pantalla
- **THEN** existen los elementos `submit-form` (Ejercicio 1), `username` (Ejercicio 2), filas de tabla con `data-id` (Ejercicio 3), el enlace `open-report` que abre una pestaña nueva (Ejercicio 4) y el contenedor `promo-banner` que aparece de forma intermitente (Ejercicio 5)

### Requirement: Comportamiento asíncrono realista

La app MUST simular latencia en las interacciones relevantes para que las esperas explícitas sean necesarias: el
botón de envío del formulario SHALL habilitarse tras unos segundos, la tabla de pedidos SHALL re-renderizar sus
filas al recargarse, y el banner promocional SHALL aparecer y desaparecer de forma intermitente.

#### Scenario: El botón de envío tarda en habilitarse

- **WHEN** se abre el formulario de alta de pedido
- **THEN** el botón `submit-form` está deshabilitado durante unos segundos y luego se habilita

#### Scenario: El reporte abre en una pestaña nueva

- **WHEN** se hace clic en `open-report`
- **THEN** se abre una pestaña nueva con un título distinto al de la pestaña original
