# language: es
Característica: Ejercicio 4 - Reporte de pedidos

  Escenario: Se valida el título del reporte
    Dado que el usuario "qa.senior" inició sesión con contraseña "Liverpool123"
    Y que el usuario está en el dashboard
    Cuando hace clic en el enlace que abre el reporte
    Y lee el título del reporte
    Entonces el título es "Reporte de Pedidos"
