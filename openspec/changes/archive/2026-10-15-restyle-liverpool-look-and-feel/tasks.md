## 1. Fundamentos de diseño

- [x] 1.1 Instalar `@fontsource/roboto` y `material-icons` en `app-web/` y versionar `package-lock.json`
- [x] 1.2 Crear `styles/tokens.css` con paleta, tipografía, radios, espaciado y colores de estado
- [x] 1.3 Reescribir `styles.css` como base global (tipografía, fondo, enlaces, tablas, botones primarios y estado deshabilitado)

## 2. Layout compartido

- [x] 2.1 Componente `AnnouncementBar` ("Envío gratis en todas tus compras")
- [x] 2.2 Componente `Header` de dos niveles (servicios, Categorías, buscador cosmético, Iniciar sesión, favoritos, bolsa), estático
- [x] 2.3 Componente `Footer` gris con las 4 columnas reales (texto inerte), línea de ventas ficticia, derechos y leyenda "Sitio de demostración, no es una tienda real"
- [x] 2.4 `StoreLayout` (anuncio + header + contenido + footer) y `AuthLayout` (franja de 56 px + tarjeta + footer)
- [x] 2.5 Controles decorativos inertes con `aria-disabled` y sin handlers

## 3. Formularios estilo login/registro de Liverpool

- [x] 3.1 Componente `FloatingField` que asigna `id` al `<input>` y etiqueta flotante con `pointer-events: none`
- [x] 3.2 Campo de contraseña con botón mostrar/ocultar (`toggle-password`), manteniendo `id="password"` y `type="password"`
- [x] 3.3 Login: etiquetas, botón primario de 52 px, error rojo, enlaces `¿Olvidaste tu contraseña?` y `Crear cuenta` inertes
- [x] 3.4 Alta de pedido: título "Registrar pedido", campos flotantes, `submit-form` gris/rosa, confirmación sin íconos

## 4. Pantallas

- [x] 4.1 Dashboard: acciones como tarjetas con los mismos `id` en los `<a>`; ranura de altura fija para `promo-banner`
- [x] 4.2 Pedidos como "Mis compras": breadcrumb `Home > Mis compras`, título, pestañas y buscador inertes, columnas Fecha y Total en `data.js`
- [x] 4.3 Tabla de pedidos: chips de estatus, hover rosa pálido, fila seleccionada, chevron decorativo, `data-id`, `pedidos-table` y `row-detail` intactos
- [x] 4.4 Reporte: paleta y tipografía, sin header de tienda y sin requerir sesión
- [x] 4.5 Mantener `main.jsx` con los títulos de pestaña sin cambios

## 5. Verificación de no regresión

- [x] 5.1 Revisar que los identificadores existan una sola vez por pantalla y en su elemento correcto
- [x] 5.2 `mvn clean test` en `automation/`: 6 de 6 en verde sin editar Java (headless y `-Dheadless=false`)
- [x] 5.3 Aplicar temporalmente en una copia los 5 defectos y confirmar que fallan los 5 ejercicios
- [x] 5.4 Verificar sin internet que Roboto e íconos cargan (sin peticiones a dominios externos)
- [x] 5.5 Revisión visual de las 5 pantallas a 1280 x 900 y ajuste final
- [x] 5.6 Actualizar `README.md` (capturas o descripción del look and feel) y commit en `development` con push
