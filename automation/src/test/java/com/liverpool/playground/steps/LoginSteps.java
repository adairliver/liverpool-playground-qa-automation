package com.liverpool.playground.steps;

import static org.assertj.core.api.Assertions.assertThat;

import com.liverpool.playground.pages.DashboardPage;
import com.liverpool.playground.pages.LoginPage;
import com.liverpool.playground.support.ScenarioContext;
import com.liverpool.playground.support.SessionHelper;
import io.cucumber.java.es.Cuando;
import io.cucumber.java.es.Dado;
import io.cucumber.java.es.Entonces;

public class LoginSteps {

    private final ScenarioContext context;

    public LoginSteps(ScenarioContext context) {
        this.context = context;
    }

    @Dado("que el usuario abre la pantalla de login")
    public void abreLogin() {
        new LoginPage(context.driver()).open(context.baseUrl());
    }

    @Dado("que el usuario {string} inició sesión con contraseña {string}")
    public void inicioSesion(String usuario, String password) {
        SessionHelper.login(context.driver(), context.baseUrl(), usuario, password);
    }

    @Cuando("captura el usuario {string} y la contraseña {string}")
    public void capturaCredenciales(String usuario, String password) {
        LoginPage login = new LoginPage(context.driver());
        login.enterUsername(usuario);
        login.enterPassword(password);
    }

    @Cuando("presiona el botón de entrar")
    public void presionaEntrar() {
        new LoginPage(context.driver()).clickLogin();
    }

    @Entonces("se muestra el dashboard de pedidos")
    public void seMuestraDashboard() {
        assertThat(new DashboardPage(context.driver()).isLoaded()).isTrue();
    }
}
