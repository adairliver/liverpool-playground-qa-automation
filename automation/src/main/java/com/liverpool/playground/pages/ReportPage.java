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

    /**
     * Ejercicio 4: cambia el foco del driver a la pestaña nueva y devuelve el título de ESA pestaña.
     */
    public String verifyNewTabTitle() {
        String originalHandle = driver.getWindowHandle();
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));
        wait.until(ExpectedConditions.numberOfWindowsToBe(2));
        for (String handle : driver.getWindowHandles()) {
            if (!handle.equals(originalHandle)) {
                driver.switchTo().window(handle);
                break;
            }
        }
        wait.until(d -> "complete".equals(
                ((org.openqa.selenium.JavascriptExecutor) d).executeScript("return document.readyState")));
        return driver.getTitle();
    }
}
