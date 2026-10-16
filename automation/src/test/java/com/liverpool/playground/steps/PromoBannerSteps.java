package com.liverpool.playground.steps;

import static org.assertj.core.api.Assertions.assertThat;

import com.liverpool.playground.pages.DashboardPage;
import com.liverpool.playground.support.ScenarioContext;
import io.cucumber.java.es.Cuando;
import io.cucumber.java.es.Dado;
import io.cucumber.java.es.Entonces;
import java.util.stream.Collectors;
import org.openqa.selenium.NoSuchElementException;

public class PromoBannerSteps {

    private final ScenarioContext context;
    private DashboardPage dashboard;
    private boolean presente;

    public PromoBannerSteps(ScenarioContext context) {
        this.context = context;
    }

    @Dado("que el banner promocional está {word}")
    public void bannerEn(String estado) {
        dashboard = new DashboardPage(context.driver());
        dashboard.open(context.baseUrl());
        dashboard.waitUntilPromoBanner("visible".equals(estado));
    }

    @Cuando("se consulta si el banner promocional está presente")
    public void consulta() {
        context.recorder().reset();
        presente = dashboard.isPromoBannerPresent();
    }

    @Entonces("la respuesta es {word}")
    public void respuesta(String esperado) {
        assertThat(presente).isEqualTo("verdadero".equals(esperado));
    }

    @Entonces("la consulta no dejó errores registrados")
    public void sinExcepciones() {
        var noSuchElement = context.recorder().errors().stream()
                .filter(NoSuchElementException.class::isInstance)
                .map(Throwable::getClass)
                .collect(Collectors.toList());
        assertThat(noSuchElement)
                .as("NoSuchElementException registradas durante la consulta")
                .isEmpty();
    }
}
