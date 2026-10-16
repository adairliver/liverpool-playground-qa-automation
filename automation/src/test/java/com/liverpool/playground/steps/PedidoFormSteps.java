package com.liverpool.playground.steps;

import static org.assertj.core.api.Assertions.assertThat;

import com.liverpool.playground.pages.PedidoFormPage;
import com.liverpool.playground.support.ScenarioContext;
import io.cucumber.java.es.Cuando;
import io.cucumber.java.es.Dado;
import io.cucumber.java.es.Entonces;

public class PedidoFormSteps {

    /** Tope para detectar pausas fijas: el botón se habilita a los ~3s; con Thread.sleep(5000) se excede. */
    private static final long MAX_MILLIS_HASTA_CLIC = 4500;

    private final ScenarioContext context;
    private PedidoFormPage form;
    private long inicio;
    private long duracion;

    public PedidoFormSteps(ScenarioContext context) {
        this.context = context;
    }

    @Dado("que el usuario abre el formulario de alta de pedido")
    public void abreFormulario() {
        inicio = System.currentTimeMillis();
        form = new PedidoFormPage(context.driver());
        form.open(context.baseUrl());
    }

    @Cuando("captura el pedido del cliente {string}, producto {string} y cantidad {string}")
    public void capturaPedido(String cliente, String producto, String cantidad) {
        form.fillForm(cliente, producto, cantidad);
    }

    @Cuando("envía el formulario cuando el botón esté disponible")
    public void enviaFormulario() {
        form.clickSubmitButton();
        duracion = System.currentTimeMillis() - inicio;
    }

    @Entonces("se muestra la confirmación {string}")
    public void confirmacion(String esperado) {
        assertThat(form.confirmationMessage()).isEqualTo(esperado);
    }

    @Entonces("el envío se realizó en un tiempo razonable")
    public void sinPausasFijas() {
        assertThat(duracion)
                .as("Tiempo hasta el clic (ms); una pausa fija de 5s lo excedería")
                .isLessThan(MAX_MILLIS_HASTA_CLIC);
    }
}
