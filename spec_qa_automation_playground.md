# Spec: QA Automation — Reto en vivo (Selenium + Gherkin sobre la app de pedidos)

## Purpose

Este spec describe la "app objetivo" y la suite de automatización de referencia que un candidato a QA Automation
debe usar durante un reto en vivo de **30 minutos**, monitoreado por pantalla compartida y sin herramientas de
IA generativa. Se usa para generar, con un agente de código en VS Code, dos ramas de un mismo repositorio:

- **Rama `main` ("funcionando")** — Fase 1 de este spec: la app de pedidos (React) y la suite de automatización
  Selenium + Cucumber/Gherkin completas, limpias y en verde al 100%.
- **Rama `reto-candidato` ("con errores")** — Fase 2 de este spec: la misma suite, con los 5 defectos del
  documento `Ejercicios_Entrevista` sembrados a propósito, listos para que el candidato los repare en vivo.

**Importante — alcance de IA en este spec**: la política de "sin IA generativa" aplica al candidato cuando
resuelve el reto. Este spec sí se construye con ayuda de un agente de código (Claude/Copilot) en VS Code — es la
preparación del ambiente, no el examen en sí.

Fuente: documento `Ejercicios_Entrevista` — 5 ejercicios de Selenium, todos sobre automatización web.

---

## 0. Fases y tiempos — léeme antes de empezar

1. **Fase 1 (implementar ahora)**: construir la app objetivo en React y la suite de automatización Selenium +
   Cucumber/Gherkin con la "solución esperada" de los 5 ejercicios, funcionando al 100% y en verde. Detente en
   el Definition of Done de Fase 1 y espera confirmación antes de continuar.
2. **Fase 2 (NO implementar todavía)**: sembrar, en una rama aparte, los 5 defectos del documento
   `Ejercicios_Entrevista`. Fuera de alcance por ahora.
3. **Duración del reto**: 30 minutos en vivo. Los 5 ejercicios están pensados para caber en ese tiempo
   (aproximadamente 5-6 minutos por ejercicio, incluyendo diagnóstico, corrección y verificación corriendo la
   suite de nuevo). Si en la práctica resulta justo, se puede sembrar solo 4 de los 5 por sesión — la decisión
   queda documentada aquí pero no es necesario automatizarla.

---

## Requirements

### Requirement: App objetivo de pedidos en React (sin backend obligatorio)

El sistema DEBERÁ incluir una aplicación web en React que reproduzca las pantallas necesarias para los 5
ejercicios, con datos e interacciones simulados en el propio frontend (sin necesidad de un backend real). Si se
agrega un backend, DEBERÁ ser Java 17+ (Spring Boot).

#### Scenario: La app levanta con un solo comando

- **WHEN** se ejecuta el comando documentado en el README (`npm run dev` o equivalente)
- **THEN** la app de pedidos queda disponible en `localhost` con datos de prueba precargados, sin pasos manuales adicionales

#### Scenario: Las pantallas exponen los identificadores que las pruebas esperan

- **WHEN** se inspecciona el HTML renderizado de cada pantalla
- **THEN** existen los elementos `submit-form` (Ejercicio 1), `username` (Ejercicio 2), filas de tabla con
  `data-id` (Ejercicio 3), el enlace `open-report` que abre una pestaña nueva (Ejercicio 4), y el contenedor
  `promo-banner` que aparece de forma intermitente (Ejercicio 5)

### Requirement: Sincronización con espera explícita (Ejercicio 1)

El sistema DEBERÁ hacer clic en el botón de envío del formulario de pedido usando una espera explícita
(`WebDriverWait` + `ExpectedConditions`), nunca `Thread.sleep`.

#### Scenario: El clic espera a que el botón sea clickeable

- **WHEN** se envía el formulario de alta de pedido y el botón tarda unos segundos en habilitarse
- **THEN** la prueba espera explícitamente a que el botón sea clickeable y hace clic sin usar una pausa fija

### Requirement: Page Object con PageFactory correctamente inicializado (Ejercicio 2)

El sistema DEBERÁ inicializar los elementos anotados con `@FindBy` mediante `PageFactory.initElements()` en el
constructor de cada Page Object.

#### Scenario: El login no lanza NullPointerException

- **WHEN** se instancia `LoginPage` y se invoca `enterUsername(...)`
- **THEN** el campo de usuario no es `null` y la prueba completa el login sin `NullPointerException`

### Requirement: Re-localización de elementos tras recarga (Ejercicio 3)

El sistema DEBERÁ volver a localizar cualquier elemento de la tabla de pedidos después de que la página se
recargue, nunca reusar una referencia obtenida antes del `refresh()`.

#### Scenario: El clic en la fila no lanza StaleElementReferenceException

- **WHEN** se recarga la página de pedidos y luego se interactúa con una fila específica
- **THEN** el elemento se localiza después de la recarga y la prueba no lanza `StaleElementReferenceException`

### Requirement: Manejo de ventanas/pestañas (Ejercicio 4)

El sistema DEBERÁ cambiar explícitamente el foco del driver a la pestaña nueva antes de validar su contenido.

#### Scenario: La validación del título ocurre en la pestaña correcta

- **WHEN** se hace clic en el enlace que abre el reporte en una pestaña nueva
- **THEN** la prueba cambia al `WindowHandle` de la nueva pestaña antes de leer el título, y la aserción compara contra el título de esa pestaña

### Requirement: Validación de existencia sin lógica dirigida por excepciones (Ejercicio 5)

El sistema DEBERÁ usar `findElements` (plural) para verificar la presencia del banner promocional, sin
depender de capturar `NoSuchElementException` para controlar el flujo.

#### Scenario: La verificación del banner es rápida con o sin implicit wait

- **WHEN** se consulta si el banner promocional está presente, con o sin que el banner exista en la página
- **THEN** la prueba responde sin lanzar ni capturar `NoSuchElementException`, usando `findElements` y revisando si la lista resultante está vacía

### Requirement: Framework BDD con Cucumber/Gherkin

El sistema DEBERÁ envolver los 5 escenarios de referencia en features de Gherkin con sus step definitions,
consistente con el stack real del equipo de QA (Cucumber, Selenium, Gherkin, Jira).

#### Scenario: Cada ejercicio tiene su feature file

- **WHEN** se revisa el directorio `src/test/resources/features/`
- **THEN** existe un archivo `.feature` por cada uno de los 5 ejercicios, con un escenario Gherkin (Given/When/Then) que ejercita el caso descrito en el documento fuente

#### Scenario: La suite corre en verde de punta a punta

- **WHEN** se ejecuta el runner de Cucumber (`mvn test` o equivalente)
- **THEN** los 5 escenarios pasan sin errores ni advertencias de `StaleElementReferenceException`, `NullPointerException` ni timeouts por hard wait

### Requirement: Tickets de intake estilo Jira (sin revelar la causa raíz)

El sistema DEBERÁ incluir, para cada uno de los 5 defectos, una descripción de síntoma estilo ticket de Jira
(sin mencionar la causa raíz ni el nombre del anti-patrón), para usarse como intake del candidato.

#### Scenario: El ticket describe el síntoma, no la causa

- **WHEN** se abre `docs/tickets/` para cualquiera de los 5 defectos
- **THEN** el texto describe el comportamiento observado (ej. "el botón de enviar a veces tarda, a veces falla")
  sin mencionar `Thread.sleep`, `PageFactory`, `StaleElementReferenceException` ni ningún otro término que
  delate directamente la causa

---

## Arquitectura de referencia

```
qa-automation-playground/
├── app-web/                      # App React — objetivo de los 5 ejercicios
│   └── src/
├── automation/
│   ├── src/main/java/.../pages/        # Page Objects: LoginPage, PedidoFormPage, PedidosTablePage, ReportPage, DashboardPage
│   ├── src/test/java/.../steps/        # Step definitions de Cucumber
│   ├── src/test/resources/features/    # 5 archivos .feature
│   └── src/test/java/.../runners/      # TestNG/JUnit runner de Cucumber
├── docs/
│   ├── tickets/                  # 5 tickets estilo Jira, uno por defecto
│   └── banco-de-errores.md       # Copia en markdown de los 5 ejercicios fuente
└── README.md                     # Cómo levantar app-web y correr la suite
```

Regla de aislamiento: cada uno de los 5 defectos vive en un único método de un único Page Object. Corregir uno
no debe requerir tocar el código de otro ejercicio.

---

## Fase 2 — defectos a sembrar (DEFERIDA, NO IMPLEMENTAR TODAVÍA)

**No sembrar ninguno hasta confirmar el Definition of Done de Fase 1.** Los 5 defectos del documento fuente, tal
cual, en la rama `reto-candidato`:

| # | Ejercicio | Qué se siembra |
|---|---|---|
| 1 | Hard wait | Revertir `clickSubmitButton()` a la versión con `Thread.sleep(5000)` |
| 2 | PageFactory sin inicializar | Quitar `PageFactory.initElements()` del constructor de `LoginPage` |
| 3 | StaleElementReferenceException | Mover la búsqueda del `rowItem` antes del `refresh()` |
| 4 | Cambio de pestaña no manejado | Quitar el manejo de `WindowHandles` en `verifyNewTabTitle()` |
| 5 | Exception-driven logic | Revertir `isPromoBannerPresent()` a `findElement` + `try/catch` |

Para cada sesión: sembrar los 5 (o 4 de los 5, si el tiempo resulta justo en la práctica) sobre la rama
`reto-candidato` reseteada desde `main`, y confirmar que la suite falla exactamente en esos puntos antes de que
el candidato empiece.

---

## Definition of Done — Fase 1

- [ ] `app-web` levanta con un solo comando y expone los 5 elementos/IDs requeridos.
- [ ] La suite de Cucumber/Selenium (5 escenarios) corre en verde contra `app-web`.
- [ ] Existen los 5 archivos `.feature` de Gherkin, uno por ejercicio, con sus step definitions.
- [ ] Existen los 5 tickets de intake en `docs/tickets/`, cada uno describiendo el síntoma sin revelar la causa.
- [ ] Cada uno de los 5 defectos está aislado en un único método — verificado revisando que el diff de un fix no toca código de otro ejercicio.
- [ ] El README documenta cómo levantar `app-web` y correr la suite.

---

## Fuera de alcance (por ahora)

- No sembrar ningún defecto de la tabla de Fase 2.
- No crear la rama `reto-candidato` todavía.
- No agregar Appium ni ningún componente móvil — el reto es exclusivamente Selenium + Gherkin sobre la app web.

---

## Siguiente paso sugerido

Detente en el Definition of Done de Fase 1 anterior y espera confirmación explícita antes de crear la rama
`reto-candidato` y sembrar los 5 defectos para la primera sesión.
