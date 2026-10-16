## Why

El examen en vivo ya tiene la prueba funcionando y la workstation lista, pero los evaluadores no cuentan con material
para conducirlo: no hay una guía que explique la arquitectura, las soluciones y cómo reproducir cada fallo, ni forma de
medir el avance del candidato en tiempo real, ni una referencia visual de cómo debe verse el proyecto al 100 %.
Además, la rama `challenge-30mins` con los defectos sembrados aún no existe, y es el insumo del que dependen la guía y
el script.

## What Changes

- Grabar un **video de referencia** (con subtítulos) de la aplicación funcionando al 100 % y dejar capturas del estado
  final esperado, incluido el reporte de la suite con 6/6 en verde.
- Crear la rama `challenge-30mins` con los **5 defectos sembrados** (uno por Page Object, cada uno en un único método) y
  guardar la **solución de referencia de cada ejercicio como parche** (`ej1.patch` … `ej5.patch`).
- Crear un **script de progreso** para el evaluador que reporta cuántos ejercicios están resueltos (0/5 … 5/5), combinando
  el resultado de la suite con reglas de revisión del código, y detecta modificaciones fuera de alcance (app, features,
  steps). Se ejecuta sobre una copia en `/tmp` para no estorbar al candidato.
- Permitir que la app acepte el puerto por variable de entorno (`PORT`), conservando 5199 por defecto, para poder ejecutar
  el script en paralelo a la sesión del candidato.
- Escribir la **guía del evaluador** en Markdown: arquitectura, temas del challenge, comandos para reproducir cada fallo
  con su salida real, causa raíz, solución, errores típicos, preguntas de seguimiento, pistas por niveles, rúbrica y
  estado final esperado.
- Mantener todo el material en `evaluador/` y **excluirlo de la imagen del candidato**, con una comprobación que rompa la
  construcción si se cuela.

## Capabilities

### New Capabilities

- `challenge-defectos-sembrados`: la rama `challenge-30mins` contiene exactamente los 5 defectos acordados, detectables
  por la suite y corregibles de forma independiente mediante su parche de solución.
- `kit-evaluador`: material del evaluador (guía, script de progreso, soluciones de referencia, video y capturas) y su
  aislamiento respecto de lo que recibe el candidato.

### Modified Capabilities

<!-- Ninguna: el comportamiento de la rama development y de la app no cambia (PORT conserva 5199 por defecto). -->

## Impact

- Código: `app-web/vite.config.js` (puerto por variable de entorno), rama nueva `challenge-30mins` (los 5 Page Objects
  afectados), nueva carpeta `evaluador/` con script, guía, parches y medios.
- Infraestructura: `infra/workstation/scripts/prepare-context.sh` excluye `evaluador/` y verifica que no llegue a la
  semilla; la imagen de la rama `challenge-30mins` se reconstruye y se actualiza la configuración de la workstation.
- Dependencias: Playwright (solo para grabar el video, en `evaluador/video/`, fuera del proyecto y de la imagen).
- Documentación: `docs/banco-de-errores.md` se consolida dentro de la guía del evaluador.
