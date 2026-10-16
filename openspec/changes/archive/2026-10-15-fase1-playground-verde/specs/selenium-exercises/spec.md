## ADDED Requirements

### Requirement: Sincronización con espera explícita (Ejercicio 1)

El sistema MUST hacer clic en el botón de envío del formulario de pedido usando una espera explícita
(`WebDriverWait` + `ExpectedConditions`) y SHALL NOT usar `Thread.sleep`.

#### Scenario: El clic espera a que el botón sea clickeable

- **WHEN** se envía el formulario de alta de pedido y el botón tarda unos segundos en habilitarse
- **THEN** la prueba espera explícitamente a que el botón sea clickeable y hace clic sin usar una pausa fija

### Requirement: Page Object con PageFactory correctamente inicializado (Ejercicio 2)

El sistema MUST inicializar los elementos anotados con `@FindBy` mediante `PageFactory.initElements()` en el
constructor de cada Page Object.

#### Scenario: El login no lanza NullPointerException

- **WHEN** se instancia `LoginPage` y se invoca `enterUsername(...)`
- **THEN** el campo de usuario no es `null` y la prueba completa el login sin `NullPointerException`

### Requirement: Re-localización de elementos tras recarga (Ejercicio 3)

El sistema MUST volver a localizar cualquier elemento de la tabla de pedidos después de que la página se
recargue y SHALL NOT reusar una referencia obtenida antes del `refresh()`.

#### Scenario: El clic en la fila no lanza StaleElementReferenceException

- **WHEN** se recarga la página de pedidos y luego se interactúa con una fila específica
- **THEN** el elemento se localiza después de la recarga y la prueba no lanza `StaleElementReferenceException`

### Requirement: Manejo de ventanas y pestañas (Ejercicio 4)

El sistema MUST cambiar explícitamente el foco del driver a la pestaña nueva antes de validar su contenido.

#### Scenario: La validación del título ocurre en la pestaña correcta

- **WHEN** se hace clic en el enlace que abre el reporte en una pestaña nueva
- **THEN** la prueba cambia al `WindowHandle` de la nueva pestaña antes de leer el título, y la aserción compara contra el título de esa pestaña

### Requirement: Validación de existencia sin lógica dirigida por excepciones (Ejercicio 5)

El sistema MUST usar `findElements` (plural) para verificar la presencia del banner promocional y SHALL NOT
depender de capturar `NoSuchElementException` para controlar el flujo.

#### Scenario: La verificación del banner es rápida con o sin implicit wait

- **WHEN** se consulta si el banner promocional está presente, con o sin que el banner exista en la página
- **THEN** la prueba responde sin lanzar ni capturar `NoSuchElementException`, usando `findElements` y revisando si la lista resultante está vacía

### Requirement: Aislamiento de defectos

Cada uno de los 5 ejercicios MUST vivir en un único método de un único Page Object, de modo que corregir uno
no requiera tocar el código de otro ejercicio.

#### Scenario: Un fix no toca otro ejercicio

- **WHEN** se revisa el diff de la corrección de cualquier ejercicio
- **THEN** el diff afecta únicamente al método correspondiente de su Page Object
