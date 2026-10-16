# Banco de errores (uso exclusivo del entrevistador)

> No compartir con el candidato. Fuente: documento `Ejercicios_Entrevista`.
> Cada defecto vive en un único método de un único Page Object (`automation/src/main/java/com/liverpool/playground/pages/`).
>
> **Este archivo es solo el índice.** La guía completa (arquitectura, cómo reproducir cada fallo con su salida real, solución,
> errores típicos, preguntas de seguimiento, pistas, rúbrica y operación del examen) está en
> [`evaluador/README.md`](../evaluador/README.md), junto con las soluciones de referencia y el script de progreso.

| # | Ticket | Feature | Método afectado | Causa raíz | Solución esperada |
|---|--------|---------|-----------------|-----------|-------------------|
| 1 | QA-101 | `01_envio_pedido` | `PedidoFormPage.clickSubmitButton()` | Hard wait (`Thread.sleep(5000)`) | `WebDriverWait` + `ExpectedConditions.elementToBeClickable(...)` y luego `click()` |
| 2 | QA-102 | `02_login` | constructor de `LoginPage` | `PageFactory.initElements()` ausente → `@FindBy` en `null` (NPE) | Llamar `PageFactory.initElements(driver, this)` en el constructor |
| 3 | QA-103 | `03_seleccion_pedido` | `PedidosTablePage.clickRowAfterRefresh()` | Referencia al `rowItem` obtenida antes del `refresh()` → `StaleElementReferenceException` | Localizar la fila **después** de `driver.navigate().refresh()` |
| 4 | QA-104 | `04_reporte` | `ReportPage.verifyNewTabTitle()` | No se cambia el foco al nuevo `WindowHandle`; se lee el título de la pestaña original | Iterar `getWindowHandles()` y `switchTo().window(...)` a la nueva antes de `getTitle()` |
| 5 | QA-105 | `05_banner_promocional` | `DashboardPage.isPromoBannerPresent()` | Lógica dirigida por excepciones (`findElement` + `try/catch NoSuchElementException`) | `!driver.findElements(By.id("promo-banner")).isEmpty()` |

La señal de fallo concreta de cada defecto (comando y salida real) está en la sección 4 de la guía y en `evaluador/salidas/`.
