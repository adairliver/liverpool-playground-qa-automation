# Liverpool Playground — QA Automation (Selenium + Cucumber)

Reto en vivo de 30 minutos para QA Automation Senior. Este repositorio contiene:

- `app-web/` — app de pedidos en React (Vite), con datos simulados en el frontend (sin backend).
- `automation/` — suite Selenium 4 + Cucumber (Gherkin) + JUnit 5, Java 17, Maven.
- `docs/tickets/` — 5 tickets de intake estilo Jira (síntomas, sin causa raíz).
- `evaluador/` — **kit del evaluador** (**no compartir con el candidato**): guía completa en `evaluador/README.md`, soluciones,
  script de progreso y video de la app al 100 %.
- `docs/banco-de-errores.md` — índice de los 5 defectos (**no compartir con el candidato**; el detalle está en la guía).
- `openspec/` — especificaciones (OpenSpec). El spec original está en `spec_qa_automation_playground.md`.

## Ramas

| Rama | Contenido |
|------|-----------|
| `development` | Suite funcionando al 100% (línea base). |
| `challenge-30mins` | Misma suite con los 5 defectos sembrados para el candidato (Fase 2). |

## Look and feel

La app imita a liverpool.com.mx (solo colores y tipografía, **sin logos ni imágenes de la marca**; es un sitio de demostración):

- Paleta del tema público de Liverpool (rosa `#E10098`, grises, estados) en `app-web/src/styles/tokens.css`.
- Tipografía **Roboto** e íconos Material, empaquetados localmente (no requiere internet).
- Header de dos niveles, barra de anuncio y footer con la estructura de Liverpool; login con el patrón del login/registro de Liverpool.
- Pedidos como "Mis compras" (breadcrumb, estatus con color, fila completa seleccionable).
- Los controles decorativos (buscador, Categorías, favoritos, bolsa, filtros, enlaces del footer) no hacen nada a propósito.

Regla: los IDs, los `data-id`, los títulos de pestaña y los tiempos simulados no se tocan al cambiar estilos; la suite debe seguir en verde sin editar Java.

## Prerrequisitos

Node.js 18+ (probado con 20), npm, JDK 17+, Maven 3.9+ y Google Chrome. Selenium Manager descarga el chromedriver solo.

## Levantar la app (opcional, la suite la levanta sola)

```bash
cd app-web
npm install
npm run dev        # http://localhost:5199
```

Credenciales: `qa.senior` / `Liverpool123`. Elementos clave: `username`, `submit-form` (se habilita a los 3 s),
filas `tr[data-id]`, `open-report` (abre pestaña nueva) y `promo-banner` (visible 3 s / oculto 4 s).

## Correr la suite

```bash
cd automation
mvn test                        # headless (por defecto); levanta app-web automáticamente
mvn test -Dheadless=false       # Chrome visible
```

Propiedades opcionales: `-Dbase.url=http://host:puerto`, `-Dapp.autostart=false` (no levantar la app),
`-Dapp.dir=../app-web`, `-Dchrome.binary=/ruta/a/chrome`.
Un solo escenario: `mvn test -Dcucumber.filter.tags=...` o `-Dcucumber.features=src/test/resources/features/03_seleccion_pedido.feature`.

El reporte HTML queda en `automation/target/cucumber-report.html`.

> Nota: el puerto 5199 se eligió para no chocar con otros servidores de desarrollo (5173). La suite valida que
> el servicio en ese puerto sea esta app antes de usarlo.

## Los 5 ejercicios

| # | Feature | Tema |
|---|---------|------|
| 1 | `01_envio_pedido.feature` | Envío del formulario (sincronización) |
| 2 | `02_login.feature` | Inicio de sesión (Page Object) |
| 3 | `03_seleccion_pedido.feature` | Selección de pedido tras recargar |
| 4 | `04_reporte.feature` | Reporte en pestaña nueva |
| 5 | `05_banner_promocional.feature` | Banner promocional intermitente |

## Soluciones a los errores sembrados en `challenge-30mins`

Esta rama (`development`) contiene **el código ya corregido**. La rama `challenge-30mins` es idéntica salvo por 5 métodos de
`automation/src/main/java/com/liverpool/playground/pages/`. Cada solución se puede aplicar como parche independiente desde
`evaluador/soluciones/ejN.patch`. Guía completa (síntomas, errores típicos, pistas y rúbrica): [`evaluador/README.md`](evaluador/README.md).

| # | Ticket | Dónde | Error sembrado | Causa |
|---|--------|-------|----------------|-------|
| 1 | QA-101 | `PedidoFormPage.clickSubmitButton()` | `Thread.sleep(5000)` antes del clic | Espera fija (el botón se habilita a los 3 s; el escenario tarda ~5,2 s y rebasa el límite de 4,5 s) |
| 2 | QA-102 | constructor de `LoginPage` | Sin `PageFactory.initElements` | Los `@FindBy` quedan en `null` → `NullPointerException` |
| 3 | QA-103 | `PedidosTablePage.clickRowAfterRefresh()` | La fila se localiza antes del `refresh()` | `StaleElementReferenceException` |
| 4 | QA-104 | `ReportPage.verifyNewTabTitle()` | No se cambia a la pestaña nueva | Se lee el título del dashboard en lugar de "Reporte de Pedidos" |
| 5 | QA-105 | `DashboardPage.isPromoBannerPresent()` | `findElement` + `try/catch (NoSuchElementException)` | Lógica dirigida por excepciones; queda registrada la excepción cuando el banner está oculto |

### Ejercicio 1 — Espera explícita

```java
// Sembrado (challenge-30mins)
try { Thread.sleep(5000); } catch (InterruptedException e) { Thread.currentThread().interrupt(); }
submitButton.click();

// Solución (development)
new WebDriverWait(driver, Duration.ofSeconds(10))
        .until(ExpectedConditions.elementToBeClickable(submitButton))
        .click();
```

### Ejercicio 2 — Inicializar el Page Object

```java
// Sembrado: el constructor solo asigna el driver
public LoginPage(WebDriver driver) {
    this.driver = driver;
}

// Solución: inicializar los @FindBy (y el import org.openqa.selenium.support.PageFactory)
public LoginPage(WebDriver driver) {
    this.driver = driver;
    PageFactory.initElements(driver, this);
}
```

### Ejercicio 3 — Elemento obsoleto (stale)

```java
// Sembrado: la referencia se obtiene ANTES de recargar
WebElement rowItem = waitForRow(pedidoId);
driver.navigate().refresh();
rowItem.click();

// Solución: localizar DESPUÉS de recargar
driver.navigate().refresh();
WebElement rowItem = waitForRow(pedidoId);
rowItem.click();
```

### Ejercicio 4 — Cambiar a la pestaña nueva

```java
// Sembrado: espera 2 ventanas y lee el título sin cambiar de pestaña (devuelve el del dashboard)
// Solución:
String originalHandle = driver.getWindowHandle();
WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));
wait.until(ExpectedConditions.numberOfWindowsToBe(2));
for (String handle : driver.getWindowHandles()) {
    if (!handle.equals(originalHandle)) {
        driver.switchTo().window(handle);
        break;
    }
}
wait.until(d -> "complete".equals(((JavascriptExecutor) d).executeScript("return document.readyState")));
return driver.getTitle();
```

### Ejercicio 5 — Existencia sin excepciones

```java
// Sembrado
try {
    return driver.findElement(PROMO_BANNER).isDisplayed();
} catch (NoSuchElementException e) {
    return false;
}

// Solución: findElements devuelve una lista vacía, no lanza
return !driver.findElements(PROMO_BANNER).isEmpty();
```

## Cómo probar cada rama

Todos los comandos se ejecutan desde la raíz del repositorio, salvo los de `mvn` (carpeta `automation/`). La primera vez instala
las dependencias de la app: `cd app-web && npm install`.

### 1. Comprobar que `development` funciona al 100 %

```bash
git checkout development
cd automation
mvn test
```

Resultado esperado: `Tests run: 6, Failures: 0, Errors: 0` y `BUILD SUCCESS`. El reporte queda en `automation/target/cucumber-report.html`.
Un solo ejercicio: `mvn test -Dcucumber.features=src/test/resources/features/02_login.feature`.

### 2. Ver los errores en `challenge-30mins`

```bash
git checkout challenge-30mins
cd automation
mvn test                         # esperado: Tests run: 6, Failures: 3, Errors: 2
```

Un ejercicio a la vez (cada comando falla con el síntoma indicado):

| # | Comando (desde `automation/`) | Síntoma esperado |
|---|-------------------------------|------------------|
| 1 | `mvn test -Dcucumber.features=src/test/resources/features/01_envio_pedido.feature` | `[Tiempo hasta el clic (ms)] Expecting actual: 52xxL to be less than: 4500L` |
| 2 | `mvn test -Dcucumber.features=src/test/resources/features/02_login.feature` | `NullPointerException ... "this.usernameInput" is null` |
| 3 | `mvn test -Dcucumber.features=src/test/resources/features/03_seleccion_pedido.feature` | `StaleElementReferenceException` |
| 4 | `mvn test -Dcucumber.features=src/test/resources/features/04_reporte.feature` | `expected: "Reporte de Pedidos" but was: "Dashboard - Pedidos Playground"` |
| 5 | `mvn test -Dcucumber.features=src/test/resources/features/05_banner_promocional.feature` | `Expecting empty but was: [org.openqa.selenium.NoSuchElementException]` |

Para ver exactamente qué cambia entre las ramas:

```bash
git diff development challenge-30mins -- automation/src/main
```

### 3. Aplicar las soluciones sobre `challenge-30mins`

```bash
git checkout challenge-30mins
git apply evaluador/soluciones/ej1.patch     # solo el ejercicio 1; repite con ej2 ... ej5
cd automation && mvn test -Dcucumber.features=src/test/resources/features/01_envio_pedido.feature   # ahora pasa
```

Aplicar los 5 parches deja la suite en 6/6. Para descartar los cambios: `git checkout -- automation`.

### 4. Verificación automática de todas las soluciones

No toca tu árbol de trabajo (usa copias temporales). Requiere `npm install` previo en `app-web`:

```bash
evaluador/verificar-soluciones.sh challenge-30mins
```

Prueba la rama sembrada sin parches (deben fallar los 5), con cada parche (fallan los otros 4) y con todos (6/6, en cualquier orden).
Termina con `Soluciones verificadas.`

### 5. Medir el avance de un candidato

```bash
python3 evaluador/progreso.py --trabajo /ruta/al/proyecto-del-candidato
```

Informa por ejercicio `RESUELTO`, `PASA_SIN_TECNICA` o `FALLA`. Más detalle en `evaluador/README.md`.

### Video de referencia

`evaluador/media/estado-al-100.mp4` muestra la app y la suite funcionando sin errores.

## Workstation para el examen en vivo

La imagen de Google Cloud Workstations (Java, Maven, Chrome, extensiones de Java/Gherkin, sin IA ni internet) se arma y
publica desde [`infra/workstation`](infra/workstation/README.md).
