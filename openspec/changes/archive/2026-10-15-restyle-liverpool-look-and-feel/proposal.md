## Why

La app objetivo de pedidos se ve genérica. Para que el reto en vivo sea más realista y cercano al entorno real del
equipo de QA, la app debe verse y sentirse como liverpool.com.mx (paleta, tipografía, estructura de header/footer
y formularios de acceso/registro), sin alterar lo que la suite de automatización necesita. Debe hacerse **antes**
de crear la rama `challenge-30mins`, para sembrar los defectos sobre la UI definitiva y no tener que rebasar.

## What Changes

- Nuevo sistema de diseño (tokens CSS) derivado del tema público de Liverpool: rosa `#E10098`, escala de grises,
  colores de estado y radios, con tipografía **Roboto** servida localmente (sin CDN).
- Layout compartido tipo Liverpool: barra de anuncio, header en dos niveles (barra secundaria rosa oscuro +
  barra principal rosa con "Categorías", buscador cosmético, "Iniciar sesión", favoritos y bolsa) y footer gris.
  La pantalla de login usa el header mínimo de la página de acceso de Liverpool (franja rosa de 56 px).
- Formularios con el patrón del login/registro de Liverpool (Auth0 Universal Login): etiqueta flotante con `*`,
  botón de mostrar/ocultar contraseña, botón primario rosa de 52 px, enlaces secundarios (`¿Olvidaste tu contraseña?`,
  `¿No tienes cuenta?`, `Crear cuenta`) y mensajes de error rojos. Aplica al login y al formulario de alta de pedido.
- El módulo de pedidos toma como referencia **"Mis compras"** de Liverpool (`/tienda/users/miscompras`):
  breadcrumb `Home > Mis compras`, título "Mis compras", lista de pedidos con estatus como etiqueta de color y
  fila completa seleccionable, manteniendo la tabla con `data-id` que usa la suite.
- Footer con la estructura real de Liverpool: columnas "Soporte al cliente", "Servicios Liverpool", "Acerca de
  Liverpool" y "Promociones", línea de ventas por teléfono, leyenda de derechos y leyenda de sitio de demostración.
- Restyle de dashboard (promo-banner) y reporte.
- **Se conservan intactos** los IDs, los atributos `data-id`, los títulos de pestaña, los tiempos simulados y el
  comportamiento de los 5 ejercicios. No se modifica código de `automation/`.
- Íconos Material Icons (mismos que usa el sitio), alojados localmente.

**Fuera de alcance**: copiar logos o imágenes de Liverpool (se usa un wordmark de texto), responsive móvil
(solo escritorio, 1280 px), comportamiento real de buscador/favoritos/bolsa/categorías, registro real de usuarios,
sembrar defectos de la Fase 2 y despliegue a GCP.

## Capabilities

### New Capabilities

- `liverpool-look-and-feel`: identidad visual, layout y patrones de formulario de la app objetivo, con la
  garantía de que los identificadores y comportamientos que usan las pruebas permanecen estables.

### Modified Capabilities

(ninguna: los requisitos de `target-app` del change `fase1-playground-verde` no cambian; este change solo agrega
requisitos de presentación y de no regresión)

## Impact

- Código: `app-web/` (CSS, componentes de layout y de formulario, dependencias `@fontsource/roboto` y
  `material-icons`). Sin cambios en `automation/`.
- Verificación: la suite existente debe seguir en 6 de 6 sin editar Java; la comprobación de defectos sembrados
  (los 5 deben seguir fallando donde corresponde) se repite tras el restyle.
- Dependencia de proceso: conviene archivar `fase1-playground-verde` (o tratarlo como base) antes de cerrar este change.
- Marca: uso solo de colores y tipografía; la app se rotula "Sitio de demostración" para no confundirse con el sitio real.
