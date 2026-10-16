# liverpool-look-and-feel Specification

## Purpose
Define la identidad visual, el layout y los patrones de formulario de la app objetivo para que se parezca a
liverpool.com.mx, garantizando que los identificadores y comportamientos que usa la suite de automatización no cambien.

## Requirements

### Requirement: Paleta y tipografía de Liverpool

La app MUST usar la paleta pública del tema de Liverpool: rosa de marca `#E10098`, hover `#C20083`, rosa oscuro
`#CD008A`, rosa pálido `#FCE6F5`, texto base `#333333`, texto atenuado `#767676`, fondo secundario `#F5F5F5`,
footer `#4D4D4D`, error `#D00E17` y éxito `#0A8852`. Todo el texto MUST renderizarse en Roboto, con pesos Light,
Regular, Medium y Bold.

#### Scenario: Los colores de marca se aplican en el chrome de la app

- **WHEN** se abre cualquier pantalla de la app
- **THEN** el header principal usa el rosa de marca con texto blanco, los botones primarios usan el rosa de marca y el footer usa el gris de footer

#### Scenario: La tipografía no depende de internet

- **WHEN** la app se abre en un equipo sin acceso a internet
- **THEN** el texto se muestra en Roboto y los íconos se muestran como íconos, no como texto de ligadura

### Requirement: Layout compartido estilo Liverpool

Las pantallas autenticadas MUST mostrar una barra de anuncio ("Envío gratis en todas tus compras"), un header de dos
niveles (barra secundaria rosa oscuro con accesos de servicio y barra principal rosa con "Categorías", buscador,
"Iniciar sesión", favoritos y bolsa) y un footer gris. La pantalla de login MUST usar el header mínimo de la
página de acceso de Liverpool (franja rosa de 56 px con el nombre de la tienda centrado) y el mismo footer.

#### Scenario: Las pantallas internas muestran header, anuncio y footer

- **WHEN** el usuario abre el dashboard, el formulario de pedido, la tabla de pedidos
- **THEN** se ven la barra de anuncio, el header de dos niveles y el footer en la misma posición en las tres pantallas

#### Scenario: El footer replica la estructura de Liverpool

- **WHEN** se revisa el footer de una pantalla interna
- **THEN** muestra cuatro columnas ("Soporte al cliente", "Servicios Liverpool", "Acerca de Liverpool", "Promociones"), una línea de ventas por teléfono y la leyenda de derechos reservados, y ninguno de sus enlaces navega ni abre pestañas

#### Scenario: El login muestra el header mínimo

- **WHEN** se abre la pantalla de login
- **THEN** se ve una franja rosa de 56 px con el nombre de la tienda y no se muestran buscador, favoritos ni bolsa

#### Scenario: El reporte es una vista independiente

- **WHEN** se abre el reporte en la pestaña nueva
- **THEN** se muestra con la misma paleta y tipografía, sin requerir sesión

### Requirement: Formularios con el patrón de login y registro de Liverpool

El login y el formulario de alta de pedido MUST seguir el patrón del login/registro de Liverpool: tarjeta centrada
sobre fondo claro, etiquetas flotantes con asterisco en campos requeridos, campo de contraseña con botón para mostrar
u ocultar, botón primario rosa de 52 px con radio de 3 px, estado deshabilitado en gris, foco con borde de color
y mensajes de error en rojo. El login MUST incluir los enlaces secundarios `¿Olvidaste tu contraseña?` y
`¿No tienes cuenta?` / `Crear cuenta`, que son solo de presentación.

#### Scenario: Las etiquetas flotan al capturar

- **WHEN** el usuario escribe en un campo del formulario
- **THEN** su etiqueta se reduce y se coloca sobre el campo sin tapar el texto capturado

#### Scenario: El botón deshabilitado se distingue visualmente

- **WHEN** el botón de enviar del formulario de pedido todavía no está habilitado
- **THEN** se ve en gris con cursor de no permitido, y al habilitarse cambia al rosa de marca

#### Scenario: Las credenciales inválidas muestran error en rojo

- **WHEN** el usuario envía el login con credenciales inválidas
- **THEN** se muestra el mensaje de error en rojo dentro del formulario y el usuario permanece en el login

#### Scenario: Los enlaces secundarios no sacan al usuario del flujo

- **WHEN** el usuario hace clic en `¿Olvidaste tu contraseña?` o `Crear cuenta`
- **THEN** no se abre una pestaña nueva ni se navega a otra pantalla de la app

### Requirement: Módulo de pedidos estilo "Mis compras" de Liverpool

La pantalla de pedidos MUST presentarse como el módulo "Mis compras" de Liverpool: breadcrumb `Home > Mis compras`,
título "Mis compras", pestañas de filtro y buscador de presentación, y una lista de pedidos con número de pedido,
fecha, cliente, producto, cantidad, total y estatus (Pendiente, Enviado, Entregado) como etiqueta de color. La lista
MUST seguir siendo una tabla cuyas filas conservan su identificador de pedido, y la fila completa MUST ser el área de
clic para seleccionar el pedido. Al seleccionar un pedido, la pantalla MUST mostrar su detalle con el texto
`Pedido <id> seleccionado` y marcar la fila como seleccionada.

#### Scenario: La lista muestra el estatus con color

- **WHEN** se abre la pantalla de pedidos
- **THEN** cada pedido muestra su estatus como etiqueta (Entregado en verde de éxito, los demás en tonos distinguibles) y la fila se resalta en rosa pálido al pasar el cursor

#### Scenario: Seleccionar un pedido muestra su detalle

- **WHEN** el usuario hace clic en cualquier punto de la fila de un pedido
- **THEN** la fila queda marcada como seleccionada y se muestra `Pedido <id> seleccionado`

#### Scenario: Los controles de filtro y búsqueda no alteran la lista

- **WHEN** el usuario hace clic en una pestaña de filtro o escribe en el buscador de pedidos
- **THEN** la lista de pedidos y el pedido seleccionado no cambian

#### Scenario: El breadcrumb vuelve al dashboard

- **WHEN** el usuario hace clic en `Home` del breadcrumb
- **THEN** se muestra el dashboard en la misma pestaña

### Requirement: Estabilidad de identificadores y comportamiento

El restyle MUST conservar los identificadores `username`, `password`, `login-button`, `cliente`, `producto`,
`cantidad`, `submit-form`, `order-confirmation`, `row-detail`, `pedidos-table`, `open-report`, `promo-banner`,
`dashboard-title`, el atributo `data-id` de cada fila de pedidos y los títulos de pestaña. Cada identificador MUST
residir en el propio elemento interactivo (input, botón, enlace, fila) y no en un contenedor. El texto de
`order-confirmation` y de `row-detail` MUST permanecer idéntico y sin íconos. Los tiempos simulados (botón de envío
habilitado a los 3 s; banner visible 3 s y oculto 4 s) y el comportamiento de `open-report` (pestaña nueva) MUST
permanecer sin cambios.

#### Scenario: Los identificadores siguen en su elemento original

- **WHEN** se inspecciona el HTML renderizado tras el restyle
- **THEN** cada identificador listado existe una sola vez por pantalla y pertenece al input, botón, enlace o fila correspondiente

#### Scenario: La suite existente sigue en verde sin cambios

- **WHEN** se ejecuta la suite de automatización sin modificar su código
- **THEN** los 6 escenarios pasan

#### Scenario: Los defectos de la Fase 2 siguen siendo detectables

- **WHEN** se aplican los 5 defectos conocidos sobre la app restilizada
- **THEN** la suite falla exactamente en los 5 ejercicios correspondientes

### Requirement: Layout estable para interacción automatizada

El layout MUST ser estable para pruebas: el header SHALL NOT quedar fijo ni superponerse al contenido, las
etiquetas flotantes SHALL NOT interceptar clics sobre su campo, el banner promocional MUST aparecer y desaparecer
sin desplazar el contenido de la pantalla y las transiciones visuales MUST durar 150 ms o menos.

#### Scenario: El banner intermitente no mueve el contenido

- **WHEN** el banner promocional aparece y desaparece en el dashboard
- **THEN** la posición vertical de los enlaces del dashboard no cambia

#### Scenario: Ningún elemento intercepta los clics

- **WHEN** la suite interactúa con campos, botones, enlaces y filas con una ventana de 1280 x 900
- **THEN** no ocurre ningún error de clic interceptado

### Requirement: Controles decorativos inertes

Los controles del header que no forman parte de los ejercicios (buscador, "Categorías", favoritos, bolsa, accesos de
servicio y "Otros sitios") MUST ser solo de presentación: no navegan, no abren pestañas, no usan los
identificadores reservados y se identifican como no operativos para tecnologías de apoyo.

#### Scenario: Interactuar con un control decorativo no altera el flujo

- **WHEN** se hace clic o se escribe en el buscador, favoritos, bolsa o "Categorías"
- **THEN** la pantalla actual se mantiene, el número de pestañas no cambia y no aparece ningún error

### Requirement: Identidad de demostración y sin activos de marca

La app MUST rotularse como sitio de demostración y SHALL NOT incluir logotipos, imágenes ni fuentes propietarias
de Liverpool; el nombre de la tienda se representa con texto.

#### Scenario: El footer indica que es una demostración

- **WHEN** se revisa el footer de cualquier pantalla
- **THEN** incluye la leyenda "Sitio de demostración, no es una tienda real"
