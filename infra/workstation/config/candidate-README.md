# Reto QA Automation (30 minutos)

Bienvenido. Este proyecto contiene una app de pedidos (`app-web`) y su suite de pruebas automatizadas
(`automation`, Selenium + Cucumber/Gherkin, Java).

## Tu objetivo

Revisa los tickets de `docs/tickets/` y deja la suite en verde (**6 de 6 escenarios**), corrigiendo la automatización donde haga falta.

## Empieza aquí

<!--VIDEO-->
1. **Mira el video** `referencia/estado-esperado.mp4` (ya está abierto en la primera pestaña del IDE, dura ~70 s). Muestra cómo debe verse y
   comportarse la app y cómo debe terminar la suite. Si no arranca solo, pulsa ▶.
2. **Ejecuta la suite** y observa qué falla: `cd automation && mvn test`.
3. **Lee el ticket** que corresponda a cada fallo (`docs/tickets/`), corrige y **vuelve a ejecutar** hasta llegar a 6 de 6.
<!--/VIDEO-->
<!--SINVIDEO-->
1. **Ejecuta la suite** y observa qué falla: `cd automation && mvn test`.
2. **Lee el ticket** que corresponda a cada fallo (`docs/tickets/`), corrige y **vuelve a ejecutar** hasta llegar a 6 de 6.
<!--/SINVIDEO-->

## Arquitectura

```
 Terminal del IDE:   cd automation && mvn test
        |
        v
 +----------------------- automation/  (Java 17 + Maven) -----------------------+
 |                                                                              |
 |   Escenarios Gherkin (.feature, en espanol)       <- lo que se prueba         |
 |        |                                                                     |
 |        v                                                                     |
 |   Step definitions (Cucumber)  -- comparten estado entre pasos               |
 |        |                                                                     |
 |        v                                                                     |
 |   Page Objects (una clase por pantalla)           <- como se interactua       |
 |        |                                                                     |
 |        v                                                                     |
 |   Selenium 4 -> ChromeDriver -> Chrome (headless)                            |
 +----------------------------------+-------------------------------------------+
                                    |  http://localhost:5199  (la suite levanta la app sola)
                                    v
 +--------------------- app-web/  (React + Vite, datos simulados) ---------------+
 |   Login  ->  Dashboard  ->  Nuevo pedido  |  Pedidos  |  Reporte (pestana nueva) |
 +------------------------------------------------------------------------------+
```

| Ejercicio | Escenario (`automation/src/test/resources/features`) | Ticket |
|-----------|-------------------------------------------------------|--------|
| 1 | `01_envio_pedido.feature` — envío de un pedido | `QA-101` |
| 2 | `02_login.feature` — inicio de sesión | `QA-102` |
| 3 | `03_seleccion_pedido.feature` — selección de un pedido tras recargar | `QA-103` |
| 4 | `04_reporte.feature` — reporte en una pestaña nueva | `QA-104` |
| 5 | `05_banner_promocional.feature` — banner promocional | `QA-105` |

Credenciales de la app: `qa.senior` / `Liverpool123`.

## Estructura

| Carpeta | Contenido |
|---------|-----------|
| `automation/src/main/java/.../pages` | Page Objects |
| `automation/src/test/java/.../steps` | Step definitions de Cucumber |
| `automation/src/test/java/.../support` | Utilidades de la suite (driver, arranque de la app, etc.) |
| `automation/src/test/resources/features` | Escenarios Gherkin |
| `app-web` | App de pedidos (React) |
| `docs/tickets` | Tickets del reto |
<!--VIDEO-->
| `referencia` | Video del estado esperado |
<!--/VIDEO-->

## Comandos

La terminal del IDE ya está abierta abajo (`+` para abrir otra). Java 17 y Maven están listos y **no hace falta internet**.
Los comandos de `mvn` se ejecutan desde la carpeta `automation`.

| Para… | Comando |
|-------|---------|
| Ejecutar toda la suite | `mvn test` |
| Ejecutar un solo feature | `mvn test -Dcucumber.features=src/test/resources/features/02_login.feature` |
| Ejecutar un solo escenario por nombre (patrón regex; los demás salen como *Skipped*) | `mvn test -Dcucumber.filter.name=".*oculto.*"` |
| Ver menos ruido en la consola | `mvn -q test` |
| Comprobar que el código compila (sin ejecutar pruebas) | `mvn -q test-compile` |
| Ver el resumen de la última ejecución | `grep -h "Tests run" target/surefire-reports/*.txt` |
| Ver qué has cambiado (desde la raíz del proyecto) | `git status` y `git diff` |
| Deshacer los cambios de un archivo | `git checkout -- ruta/del/archivo` |
| Levantar la app a mano (opcional, en otra terminal) | `cd app-web && npm run dev` (puerto 5199) |

- La suite corre en modo *headless* y **levanta la app automáticamente**; no necesitas arrancar nada más.
- El reporte HTML queda en `automation/target/cucumber-report.html`; el detalle de cada fallo ya aparece en la consola.
- La primera ejecución puede tardar unos segundos más mientras arranca la app.
- Atajos del IDE: `Ctrl/Cmd + P` buscar archivo · `Ctrl/Cmd + Shift + F` buscar en el proyecto · `F12` ir a la definición ·
  `Ctrl + Espacio` autocompletar.

## Cómo leer un fallo

1. Lee el **mensaje** del error y la **primera línea del stack trace** que pertenezca a `com.liverpool.playground`.
2. Esa línea indica el archivo y el número de línea: ábrelo con `Ctrl/Cmd + clic`.
3. Compara con el **ticket** y con el comportamiento esperado de la app; aplica el cambio más pequeño que lo resuelva.
4. Vuelve a ejecutar **solo ese feature** hasta que pase y, al final, la suite completa.

## Reglas

- Sin herramientas de IA generativa. La workstation no tiene internet ni extensiones de IA.
- Puedes usar el autocompletado del IDE (Java y Gherkin).
- No cambies la app (`app-web`): el problema está en la automatización.
- No modifiques los escenarios (`.feature`) ni los *steps* para "hacer pasar" las pruebas.
<!--EVAL-->
- Para que quien lleva el examen pueda seguir tu avance, el código fuente de este proyecto (sin `node_modules` ni `target`)
  se copia automáticamente cada minuto a un almacenamiento privado al que tú no tienes acceso.
<!--/EVAL-->
- Tienes 30 minutos. ¡Éxito!
