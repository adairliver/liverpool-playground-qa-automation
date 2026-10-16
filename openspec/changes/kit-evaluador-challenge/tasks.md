## 1. Preparación y aislamiento

- [x] 1.1 Hacer que `app-web/vite.config.js` lea `PORT` (por defecto 5199) y verificar que `PORT=5299 npm run dev` sirve en 5299 y sin variable sigue en 5199
- [x] 1.2 Excluir `evaluador/` en `infra/workstation/scripts/prepare-context.sh` y verificar que el script falla si `evaluador/` aparece en la semilla (prueba con un archivo de muestra)
- [x] 1.3 Crear la estructura `evaluador/` (guía, `soluciones/`, `media/`, `video/`) con `.gitignore` para `node_modules` y verificar que `git status` no la ignora salvo lo previsto
- [x] 1.4 Revisar `docs/banco-de-errores.md` en busca de restos de numeración; verificado con `rg '\|\|'` que el archivo está limpio (era un artefacto de visualización), sin cambios necesarios

## 2. Video y capturas del estado al 100 %

- [x] 2.1 Crear el generador con Playwright en `evaluador/video/` (guion determinista con subtítulos y cuenta regresiva) y verificar que `npm run grabar` produce un `.webm`
- [x] 2.2 Grabar el recorrido de los cinco ejercicios sobre `development` y verificar al reproducirlo que se ven login, banner, botón habilitándose a los 3 s, confirmación, selección tras recarga y reporte en pestaña nueva
- [x] 2.3 Capturar el reporte de la suite con 6/6 y las pantallas clave en `evaluador/media/` y verificar que las imágenes existen y muestran los 6 escenarios aprobados

## 3. Rama del reto y soluciones de referencia

- [x] 3.1 Crear `challenge-30mins` desde `development` y sembrar los 5 defectos (un método por Page Object) y verificar con `git diff development --stat` que solo cambian los cinco Page Objects
- [x] 3.2 Ejecutar la suite sembrada y verificar que fallan los escenarios de los cinco ejercicios con las señales descritas en el banco de errores, guardando la salida real de cada uno
- [x] 3.3 Generar `evaluador/soluciones/ej1.patch` … `ej5.patch` y verificar que cada parche se aplica solo sobre una copia limpia y mueve únicamente su escenario a verde
- [x] 3.4 Aplicar los cinco parches en una copia y verificar que la suite queda 6/6 en verde
- [x] 3.5 Revisar que los tickets QA-101 a QA-105 describen síntoma y no causa raíz, verificando con una lectura cruzada contra el banco de errores

## 4. Script de progreso

- [x] 4.1 Implementar `evaluador/progreso.py` con la tabla de ejercicios (feature, archivo y regla estática) y ejecución sobre copia temporal en otro puerto; verificar que no modifica el árbol del candidato (comparación de hashes antes y después)
- [x] 4.2 Implementar las reglas estáticas y el estado `PASA_SIN_TECNICA`; verificar con variantes incorrectas (p. ej. `Thread.sleep(3500)`, `try/catch` conservado) que no se marcan como `RESUELTO`
- [x] 4.3 Implementar la detección de cambios fuera de alcance contra el commit inicial y verificar que lista una edición a un `.feature` y no reporta nada si solo se tocan Page Objects
- [x] 4.4 Registrar el primer instante `RESUELTO` por ejercicio en `progreso.jsonl` y verificar que se conserva entre ejecuciones repetidas
- [x] 4.5 Probar el script de punta a punta: 0/5 sobre la rama sembrada, 1/5 … 5/5 aplicando los parches uno a uno, y ejecución simultánea con `mvn test` del candidato sin error de puerto

## 5. Guía del evaluador

- [x] 5.1 Escribir `evaluador/README.md` con objetivo, formato, arquitectura (diagrama ASCII y mapa ejercicio → feature → ticket → método) y temas del reto
- [x] 5.2 Documentar cada ejercicio con comando de reproducción, salida real de fallo, causa raíz, solución (diff), errores típicos, preguntas de seguimiento y tres niveles de pista; verificar ejecutando cada comando de la guía
- [x] 5.3 Añadir la rúbrica, las preguntas frecuentes del candidato, el uso del script de progreso y el estado final esperado con el video y las capturas
- [x] 5.4 Enlazar la guía desde el `README.md` principal y consolidar el banco de errores en ella (sin dejar duplicados contradictorios)

## 6. Publicación

- [x] 6.1 Reconstruir la imagen con `BRANCH=challenge-30mins` y verificar con `test-image-local.sh` que la semilla no contiene `evaluador/` ni referencias a los defectos
- [ ] 6.2 Actualizar la configuración de la workstation y recrearla; verificar en el navegador que la suite sembrada falla 5 de 5 y que el evaluador puede ejecutar el script desde su propia sesión
- [x] 6.3 Ejecutar `openspec validate kit-evaluador-challenge --strict` y subir los cambios al repositorio
