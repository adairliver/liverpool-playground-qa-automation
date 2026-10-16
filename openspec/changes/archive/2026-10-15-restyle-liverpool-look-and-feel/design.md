## Context

`app-web/` es una SPA React + Vite sin router: cada navegación es una carga completa de página y el título de cada
ruta se asigna de forma síncrona en `main.jsx`. La suite (`automation/`) localiza todo por `By.id` o
`tr[data-id=...]` y compara textos exactos de `order-confirmation` y `row-detail`. Ver `proposal.md` (Why) para la
motivación y `specs/liverpool-look-and-feel/spec.md` para los requisitos.

Datos tomados del sitio público (HTML y CSS, solo lectura): `<body class="liverpool">` usa Roboto; tokens
`--pink-*`/`--prim-*`, `--header-bg-primary` = `prim-500`, `--header-bg-secondary` = `prim-600`, footer `carbon-400`;
la página de acceso (Auth0 Universal Login) usa franja de 56 px `#e10098`, botón `#e10098` blanco, altura 52 px,
radio 3 px, fondo `#FFF`, footer `#555`, error `#D00E17`, éxito `#0A8852`. El sitio bloquea Chrome headless, así que
la composición visual se infiere del HTML y no de una captura.

## Goals / Non-Goals

**Goals:**
- Parecido reconocible con Liverpool en paleta, tipografía, header, footer y formularios.
- Cero cambios en `automation/`: la suite en 6/6 y los 5 defectos detectables es el criterio de no regresión.

**Non-Goals:**
- Pixel-perfect, responsive móvil, menú de categorías desplegable, tarjetas de producto, comportamiento real
  de buscador/favoritos/bolsa.

## Decisions

- **Tokens CSS en un solo archivo (`styles/tokens.css`)** con variables `--prim-*`, `--carbon-*`, `--feedback-*`,
  `--radius-*`, `--font-*`, con los mismos nombres que usa Liverpool. Alternativa descartada: Tailwind/MUI, que
  agrega dependencias y build sin beneficio para 5 pantallas.
- **Roboto local con `@fontsource/roboto`** (pesos 300/400/500/700, subset latin) y **íconos con el paquete
  `material-icons`**, ambos empaquetados por Vite. Alternativa descartada: Google Fonts por CDN (la workstation puede
  no tener salida a internet, y la prueba no debe depender de red externa).
- **Componentes de layout**: `AuthLayout` (franja de 56 px + tarjeta + footer) para el login; `StoreLayout`
  (anuncio, header de 2 niveles, contenido, footer) para dashboard, formulario y tabla. `ReportePage` se mantiene
  independiente (sin header de tienda), con la paleta y la tipografía.
- **Los IDs viven en el elemento interactivo**: un componente `FloatingField` recibe `id` y lo asigna al
  `<input>`, nunca al contenedor. Los `<label>` usan `htmlFor`. Las etiquetas flotantes se hacen solo con CSS
  (`placeholder=" "` + `:placeholder-shown`/`:focus`) y con `pointer-events: none`, para no interceptar clics.
- **Contraseña con ojo**: el botón de mostrar/ocultar es un `<button type="button" id="toggle-password">` fuera del
  orden de tab de captura; el `<input id="password">` mantiene `type="password"` por defecto.
- **Header estático, no `sticky`**: un header fijo puede tapar elementos y causar `ElementClickInterceptedException`
  en ventanas de 900 px de alto. Alternativa descartada: sticky como en el sitio real.
- **Banner con ranura reservada**: se envuelve en un contenedor de altura fija (`min-height` igual a la del banner);
  el elemento `#promo-banner` sigue entrando y saliendo del DOM igual que hoy (misma semántica para `findElements`).
  Alternativa descartada: ocultarlo con `visibility`, porque cambiaría la semántica que prueba el Ejercicio 5.
- **Controles decorativos**: son `<button type="button" aria-disabled="true">` sin handlers (o `<input>` sin lógica),
  con `title="Demostración"`. Los enlaces `¿Olvidaste tu contraseña?` y `Crear cuenta` usan `href="#"` con
  `preventDefault`, sin cambiar la URL ni abrir pestañas.
- **Textos con íconos**: los íconos Material van en `<span aria-hidden>` fuera de `order-confirmation`, `row-detail`
  y de cualquier elemento cuyo texto se compare. Si un ícono contiene texto de ligadura, no puede quedar dentro de
  esos elementos.
- **Login**: etiqueta "Usuario o correo electrónico*" (el campo se sigue llamando `username` y acepta `qa.senior`).
- **Alta de pedido con patrón de registro**: título "Registrar pedido", campos `cliente`, `producto`, `cantidad`
  con etiqueta flotante, botón `submit-form` "Enviar pedido" (gris al estar deshabilitado, rosa al habilitarse) y
  enlace "Volver al dashboard".
- **Pedidos como "Mis compras"**: el HTML público de `/tienda/users/miscompras` solo trae header, breadcrumb
  (`Home > Mis compras`) y footer; la lista de compras se renderiza con sesión iniciada y **no se pudo observar**.
  Por eso la lista es una aproximación: se conserva `<table id="pedidos-table">` con `<tr data-id>` (contrato de la
  suite) y se estiliza como lista de compras: columnas Pedido, Fecha, Cliente, Producto, Cant., Total y Estatus
  (chip de color), con pestañas de filtro ("Todas", "En línea", "En tienda") y buscador de pedidos inertes.
  Alternativa descartada: tarjetas con `div`, que obligaría a cambiar el localizador `tr[data-id]` y por tanto la
  suite. Se agregan datos `fecha` y `total` a `data.js`; las filas no incluyen controles clicables nuevos (solo un
  chevron decorativo `aria-hidden`), de modo que el clic al centro de la fila siempre llega al manejador de la fila.
- **Footer real**: cuatro columnas con los textos reales del sitio (Soporte al cliente: Facturación, Ayuda, Mis
  compras, Personas desaparecidas; Servicios Liverpool: Crédito, Tiempo aire, Concursos y promociones, Diseño de
  interiores, Ventas corporativas; Acerca de Liverpool: Bolsa de Trabajo, ¿Quiénes somos?, Relación con
  inversionistas, Sostenibilidad; Promociones: Venta Nocturna, Hot Sale, Buen Fin, Bolo Fest). Son texto inerte
  (`<span>`/`<li>` sin `href`), para no agregar enlaces ni pestañas. Los teléfonos y correos del sitio real **no**
  se copian: la línea de ventas usa un número ficticio rotulado como demostración.
- **Marca**: wordmark de texto "Liverpool" en Roboto Bold blanco (sin logo), leyenda "Sitio de demostración, no es
  una tienda real" en el footer.
- **Transiciones ≤ 150 ms** y sin animaciones de entrada, para no afectar `elementToBeClickable` ni el tiempo hasta
  el clic del Ejercicio 1 (que tolera hasta 4.5 s con el botón habilitado a los 3 s).

## Risks / Trade-offs

- [Textos con ligaduras de íconos se cuelan en `getText()`] → los íconos nunca van dentro de elementos que se
  comparan; revisar con la suite.
- [La fidelidad se infiere sin captura renderizada, y la lista de "Mis compras" requiere sesión] → pedir al usuario
  capturas de "Mis compras" (con y sin compras) y del header si se quiere mayor exactitud; los tokens, el breadcrumb
  y el footer sí son los reales.
- [Columnas nuevas hacen más ancha la tabla y la fila puede salir del viewport de 1280 px] → ancho máximo de
  contenido de ~1100 px, texto con truncado y sin scroll horizontal; verificar con la suite.
- [Un header más alto reduce el área visible a 900 px y obliga a hacer scroll para ver el formulario] → mantener el
  header compacto (≈ 110 px entre ambas barras más anuncio) y verificar que ningún elemento clicable quede fuera del
  viewport al cargar; Selenium hace scroll automático, pero se revisa.
- [El restyle altera el tiempo de carga y puede desfasar el banner] → los ciclos del banner se miden desde el
  montaje del componente, que no cambia.
- [Dependencias npm nuevas en la workstation] → se instalan con `npm install`; `package-lock.json` se versiona.

## Migration Plan

1. Implementar el restyle en la rama `development` con la suite en verde y la comprobación de los 5 defectos.
2. Subir `development`; solo después crear `challenge-30mins` desde ella para sembrar los defectos.
3. Rollback: `git revert` del commit del restyle (los cambios están confinados a `app-web/`).

## Open Questions

- ¿Se quiere una captura de referencia del header real para ajustar proporciones? (No cambia specs ni tareas.)
- ¿Menú "Categorías" solo como botón decorativo (decisión actual) o con panel desplegable inerte en una iteración posterior?
