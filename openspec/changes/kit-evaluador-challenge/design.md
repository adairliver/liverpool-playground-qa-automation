## Context

Ver `proposal.md` para la motivación. Estado actual relevante:

- `development` tiene la app React (puerto fijo 5199 en `vite.config.js`) y la suite Selenium/Cucumber en verde (6/6).
- Cada defecto del reto vive en un único método de un Page Object; los escenarios "de fondo" inician sesión con
  `SessionHelper`, por lo que un defecto no rompe a los demás.
- El proyecto del candidato es un repositorio git de un solo commit ("Estado inicial del reto"), sin historial ni
  documentos de respuestas; `prepare-context.sh` ya excluye `openspec`, `.cursor`, `infra`, `docs/banco-de-errores.md`
  y el spec original.
- La workstation no tiene SSH ni túneles TCP (endurecimiento) y no tiene salida a internet; el evaluador puede abrir su
  propia sesión del IDE sobre la misma workstation (rol `workstations.user`).
- No hay `ffmpeg` en la máquina de desarrollo; sí Node 20 y Chrome.

## Goals / Non-Goals

**Goals:**

- Que el evaluador conduzca el examen con una guía fiable, medida contra la rama real.
- Medir el avance sin molestar al candidato y sin depender de que el escenario pase "de cualquier forma".
- Que lo verificable se verifique solo: el script se prueba aplicando las soluciones de referencia.

**Non-Goals:**

- Calificación automática final: el script informa, el criterio de aprobación sigue siendo del evaluador.
- Anti-trampa robusto: no se bloquea al candidato; se registra y se avisa.
- Cambiar la app o las features de `development`.

## Decisions

### 1. Todo el material en `evaluador/`, nunca en la semilla

Estructura: `evaluador/README.md` (guía), `evaluador/progreso.sh`, `evaluador/soluciones/ej{1..5}.patch`,
`evaluador/media/` (video y capturas), `evaluador/video/` (generador con Playwright, `node_modules` ignorado).
`prepare-context.sh` excluye `evaluador` en `git archive` y verifica su ausencia (como ya hace con `infra`).
*Alternativa:* una rama aparte para el material; descartada porque complica mantenerlo sincronizado con los defectos.

### 2. Orden de trabajo guiado por la verificabilidad

1) video de `development` (independiente de la rama del reto); 2) sembrar defectos y generar parches; 3) script;
4) guía con salidas reales. Los parches son a la vez la solución documentada y el oráculo de pruebas del script
(0/5 sembrado → 5/5 con todos aplicados, y cada parche mueve exactamente un ejercicio).
*Alternativa:* escribir la guía primero; descartada porque las salidas de fallo serían supuestas.

### 3. Script de progreso con dos señales por ejercicio

Cada ejercicio se define en una tabla (id, feature, archivo, regla estática); quitar el ejercicio 5 es cambiar una línea.
- **Comportamiento:** ejecuta el feature del ejercicio con Maven sobre una copia temporal.
- **Estático:** reglas sobre el método afectado (p. ej. sin `Thread.sleep` y con `WebDriverWait`; presencia de
  `initElements`; `switchTo().window`; sin `try/catch` de `NoSuchElementException`).
- Estados: `RESUELTO`, `FALLA`, `PASA_SIN_TECNICA` (pasa el escenario pero no la regla).
- Lleva un `progreso.jsonl` con la marca de tiempo del primer `RESUELTO` de cada ejercicio.
*Alternativa:* solo ejecutar la suite; descartada porque un `Thread.sleep(3500)` pasaría el ejercicio 1.

### 4. Ejecución sobre copia y puerto configurable

El script copia el árbol de trabajo a un directorio temporal (excluyendo `target` y `node_modules`, que enlaza), levanta
la app en otro puerto y ejecuta ahí. Para ello `vite.config.js` lee `PORT` (por defecto 5199, `strictPort` se mantiene) y
la suite recibe `-Dbase.url`. Así no hay conflicto con la ejecución del candidato ni se tocan sus archivos.
*Alternativa:* ejecutar en el árbol del candidato; descartada por colisión de puerto y de `target/`.

### 5. Cambios fuera de alcance contra el commit inicial

El repo del candidato tiene un único commit inicial; `git diff --name-only <commit inicial>` más los archivos sin
seguimiento da la lista. Se consideran fuera de alcance `app-web/`, `*.feature` y `steps/`.

### 6. Dónde corre el script

Opción A elegida: el evaluador abre su propia sesión del IDE en la misma workstation y pega el script; no hay respuestas
en la imagen. Para revisión posterior, el script funciona igual sobre una copia exportada en su laptop.

### 7. Video con Playwright y subtítulos inyectados

Guion determinista contra la app corriendo en local: login, banner (aparece/desaparece), formulario con botón que se
habilita a los 3 s y confirmación, tabla de pedidos con selección tras recarga y reporte en pestaña nueva; cierra con el
reporte de Cucumber en verde. Subtítulos como superposición en el DOM con cuenta regresiva visible. Salida `.webm`
nativa de Playwright (no requiere ffmpeg); mp4 opcional. Vive en `evaluador/video/` con su propio `package.json`.
*Alternativas:* CDP screencast con Selenium (requiere instalar ffmpeg); grabación de pantalla (manual, no reproducible).

## Risks / Trade-offs

- [El script contiene las respuestas] → no se incluye en la imagen; se pega en una sesión de evaluador.
- [Reglas estáticas con falsos positivos/negativos] → se prueban con las soluciones de referencia y con variantes
  incorrectas conocidas; el estado `PASA_SIN_TECNICA` informa sin descalificar.
- [Ejecutar la suite completa por ejercicio tarda en la VM] → cada feature corre por separado y en paralelo opcional; el
  intervalo de repetición es configurable.
- [5 ejercicios en 30 min sin margen] → la tabla permite quitar el 5 con una línea; la guía y el script se generan desde ella.
- [Playwright descarga ~150 MB de Chromium] → solo en `evaluador/video/`, ignorado por git y ausente de la imagen.
- [El video se desactualiza si cambia la app] → el guion se versiona y se regenera con un comando.

## Migration Plan

Aditivo: no cambia `development` salvo el puerto configurable. La rama `challenge-30mins` se crea desde `development`.
Para publicar el reto: reconstruir la imagen con `BRANCH=challenge-30mins`, actualizar la configuración y recrear la
workstation del candidato. Reversión: volver a la imagen de `development`.
