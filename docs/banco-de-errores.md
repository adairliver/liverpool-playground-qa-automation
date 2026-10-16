# Banco de errores (uso exclusivo del entrevistador)

> No compartir con el candidato. Fuente: documento `Ejercicios_Entrevista`.
> Cada defecto vive en un único método de un único Page Object (`automation/src/main/java/com/liverpool/playground/pages/`).

| # | Ticket | Feature | Método afectado | Causa raíz | Solución esperada |
|---|--------|---------|-----------------|-----------|-------------------|
| 1 | QA-101 | `01_envio_pedido` | `PedidoFormPage.clickSubmitButton()` | Hard wait (`Thread.sleep(5000)`) | `WebDriverWait` + `ExpectedConditions.elementToBeClickable(...)` y luego `click()` |
| 2 | QA-102 | `02_login` | constructor de `LoginPage` | `PageFactory.initElements()` ausente → `@FindBy` en `null` (NPE) | Llamar `PageFactory.initElements(driver, this)` en el constructor |
| 3 | QA-103 | `03_seleccion_pedido` | `PedidosTablePage.clickRowAfterRefresh()` | Referencia al `rowItem` obtenida antes del `refresh()` → `StaleElementReferenceException` | Localizar la fila **después** de `driver.navigate().refresh()` |
| 4 | QA-104 | `04_reporte` | `ReportPage.verifyNewTabTitle()` | No se cambia el foco al nuevo `WindowHandle`; se lee el título de la pestaña original | Iterar `getWindowHandles()` y `switchTo().window(...)` a la nueva antes de `getTitle()` |
| 5 | QA-105 | `05_banner_promocional` | `DashboardPage.isPromoBannerPresent()` | Lógica dirigida por excepciones (`findElement` + `try/catch NoSuchElementException`) | `!driver.findElements(By.id("promo-banner")).isEmpty()` |

## Cómo se detecta cada defecto sembrado

| # | Señal de fallo en la suite |
|---|-----------------------------|
| 1 | Falla la aserción "el envío se realizó en un tiempo razonable" (tiempo hasta el clic ≥ 4.5 s; el botón se habilita a los 3 s) |
| 2 | `NullPointerException` en `LoginPage.enterUsername` (`usernameInput` es `null`) |
| 3 | `StaleElementReferenceException` al hacer clic en la fila |
| 4 | Aserción de título: se obtiene el título del dashboard en lugar de "Reporte de Pedidos" |
| 5 | Falla "la consulta no dejó errores registrados" (el listener de WebDriver registra la excepción) en el escenario con banner oculto |

## Notas para el entrevistador

- El login "de fondo" de los escenarios 1, 3, 4 y 5 usa `SessionHelper` (no `LoginPage`), por eso el defecto 2 no rompe los demás.
- Sobre el Ejercicio 5: en ChromeDriver, un *implicit wait* también aplica a `findElements` cuando la lista está vacía
  (espera el timeout completo). Por eso la suite trabaja con implicit wait = 0 y detecta el anti-patrón con un
  listener que registra las `NoSuchElementException` lanzadas, no por tiempo.
- Con la app en reposo: el botón se habilita a los 3 s; el banner está visible 3 s y oculto 4 s, en ciclo.
- Tiempo sugerido: ~5-6 min por ejercicio. Si resulta justo, sembrar solo 4 de 5.
