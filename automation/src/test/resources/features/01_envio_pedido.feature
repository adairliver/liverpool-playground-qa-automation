# language: es
Característica: Ejercicio 1 - Envío del formulario de pedido

  Escenario: El pedido se envía correctamente
    Dado que el usuario "qa.senior" inició sesión con contraseña "Liverpool123"
    Y que el usuario abre el formulario de alta de pedido
    Cuando captura el pedido del cliente "Ana Torres", producto "Laptop 14" y cantidad "2"
    Y envía el formulario cuando el botón esté disponible
    Entonces se muestra la confirmación "Pedido registrado para Ana Torres"
    Y el envío se realizó en un tiempo razonable
