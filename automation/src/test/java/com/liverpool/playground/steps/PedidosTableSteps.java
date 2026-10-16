package com.liverpool.playground.steps;

import static org.assertj.core.api.Assertions.assertThat;

import com.liverpool.playground.pages.PedidosTablePage;
import com.liverpool.playground.support.ScenarioContext;
import io.cucumber.java.es.Cuando;
import io.cucumber.java.es.Dado;
import io.cucumber.java.es.Entonces;

public class PedidosTableSteps {

    private final ScenarioContext context;
    private PedidosTablePage tabla;

    public PedidosTableSteps(ScenarioContext context) {
        this.context = context;
    }

    @Dado("que el usuario abre la tabla de pedidos")
    public void abreTabla() {
        tabla = new PedidosTablePage(context.driver());
        tabla.open(context.baseUrl());
    }

    @Cuando("recarga la página y selecciona el pedido {string}")
    public void recargaYSelecciona(String id) {
        tabla.clickRowAfterRefresh(id);
    }

    @Entonces("se muestra el detalle {string}")
    public void detalle(String esperado) {
        assertThat(tabla.selectedRowDetail()).isEqualTo(esperado);
    }
}
