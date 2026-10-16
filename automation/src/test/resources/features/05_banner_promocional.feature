# language: es
Característica: Ejercicio 5 - Banner promocional

  Escenario: El banner no se reporta cuando está oculto
    Dado que el usuario "qa.senior" inició sesión con contraseña "Liverpool123"
    Y que el banner promocional está oculto
    Cuando se consulta si el banner promocional está presente
    Entonces la respuesta es falso
    Y la consulta no dejó errores registrados

  Escenario: El banner se reporta cuando está visible
    Dado que el usuario "qa.senior" inició sesión con contraseña "Liverpool123"
    Y que el banner promocional está visible
    Cuando se consulta si el banner promocional está presente
    Entonces la respuesta es verdadero
    Y la consulta no dejó errores registrados
