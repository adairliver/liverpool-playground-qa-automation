package com.liverpool.playground.pages;

import java.time.Duration;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

public class ReportPage {

    private final WebDriver driver;

    public ReportPage(WebDriver driver) {
        this.driver = driver;
    }

    /** Devuelve el título de la pestaña del reporte. */
    public String verifyNewTabTitle() {
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));
        wait.until(ExpectedConditions.numberOfWindowsToBe(2));
        wait.until(d -> "complete".equals(
                ((org.openqa.selenium.JavascriptExecutor) d).executeScript("return document.readyState")));
        return driver.getTitle();
    }
}
