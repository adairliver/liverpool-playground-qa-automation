package com.liverpool.playground.steps;

import com.liverpool.playground.support.AppServer;
import com.liverpool.playground.support.ScenarioContext;
import io.cucumber.java.After;
import io.cucumber.java.AfterAll;
import io.cucumber.java.BeforeAll;

public class Hooks {

    private final ScenarioContext context;

    public Hooks(ScenarioContext context) {
        this.context = context;
    }

    @BeforeAll
    public static void startApp() throws Exception {
        AppServer.ensureRunning();
    }

    @AfterAll
    public static void stopApp() {
        AppServer.stop();
    }

    @After
    public void closeDriver() {
        context.quit();
    }
}
