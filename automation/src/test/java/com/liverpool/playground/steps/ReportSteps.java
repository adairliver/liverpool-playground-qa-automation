package com.liverpool.playground.steps;

import static org.assertj.core.api.Assertions.assertThat;

import com.liverpool.playground.pages.DashboardPage;
import com.liverpool.playground.pages.ReportPage;
import com.liverpool.playground.support.ScenarioContext;
import io.cucumber.java.es.Cuando;
import io.cucumber.java.es.Dado;
import io.cucumber.java.es.Entonces;

public class ReportSteps {

    private final ScenarioContext context;
    private String tituloObtenido;

    public ReportSteps(ScenarioContext context) {
        this.context = context;
    }

    @Dado("que el usuario está en el dashboard")
    public void enDashboard() {
        DashboardPage dashboard = new DashboardPage(context.driver());
        dashboard.open(context.baseUrl());
        assertThat(dashboard.isLoaded()).isTrue();
    }

    @Cuando("hace clic en el enlace que abre el reporte")
    public void clicReporte() {
        new DashboardPage(context.driver()).clickOpenReport();
    }

    @Cuando("lee el título del reporte")
    public void leeTitulo() {
        tituloObtenido = new ReportPage(context.driver()).verifyNewTabTitle();
    }

    @Entonces("el título es {string}")
    public void tituloEs(String esperado) {
        assertThat(tituloObtenido).isEqualTo(esperado);
    }
}
