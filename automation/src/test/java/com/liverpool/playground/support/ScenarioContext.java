package com.liverpool.playground.support;

import org.openqa.selenium.WebDriver;

/** Estado compartido entre hooks y step definitions (inyectado por PicoContainer, uno por escenario). */
public class ScenarioContext {

    private final ExceptionRecorder recorder = new ExceptionRecorder();
    private WebDriver driver;

    public WebDriver driver() {
        if (driver == null) {
            driver = DriverFactory.create(recorder);
        }
        return driver;
    }

    public ExceptionRecorder recorder() {
        return recorder;
    }

    public String baseUrl() {
        return TestConfig.baseUrl();
    }

    public void quit() {
        if (driver != null) {
            driver.quit();
            driver = null;
        }
    }
}
