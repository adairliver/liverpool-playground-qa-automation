# language: es
Característica: Ejercicio 3 - Selección de pedidos en la tabla

  Escenario: Se selecciona un pedido después de recargar la página
    Dado que el usuario "qa.senior" inició sesión con contraseña "Liverpool123"
    Y que el usuario abre la tabla de pedidos
    Cuando recarga la página y selecciona el pedido "1002"
    Entonces se muestra el detalle "Pedido 1002 seleccionado"
