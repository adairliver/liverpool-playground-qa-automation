package com.liverpool.playground.pages;

import java.time.Duration;
import java.util.List;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.PageFactory;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.FluentWait;
import org.openqa.selenium.support.ui.WebDriverWait;

public class DashboardPage {

    private static final By PROMO_BANNER = By.id("promo-banner");

    private final WebDriver driver;

    @FindBy(id = "dashboard-title")
    private WebElement title;

    @FindBy(id = "open-report")
    private WebElement openReportLink;

    public DashboardPage(WebDriver driver) {
        this.driver = driver;
        PageFactory.initElements(driver, this);
    }

    public void open(String baseUrl) {
        driver.get(baseUrl + "/dashboard");
    }

    public boolean isLoaded() {
        return new WebDriverWait(driver, Duration.ofSeconds(10))
                .until(ExpectedConditions.visibilityOf(title))
                .isDisplayed();
    }

    /** Ejercicio 4 (parte 1): abre el reporte en una pestaña nueva. */
    public void clickOpenReport() {
        new WebDriverWait(driver, Duration.ofSeconds(10))
                .until(ExpectedConditions.elementToBeClickable(openReportLink))
                .click();
    }

    /** Ejercicio 5: existencia sin lógica dirigida por excepciones (findElements + lista vacía). */
    public boolean isPromoBannerPresent() {
        List<WebElement> banners = driver.findElements(PROMO_BANNER);
        return !banners.isEmpty();
    }

    /** Utilidad de sincronización para la prueba (no es parte de ningún ejercicio). */
    public void waitUntilPromoBanner(boolean shouldBePresent) {
        new FluentWait<>(driver)
                .withTimeout(Duration.ofSeconds(15))
                .pollingEvery(Duration.ofMillis(100))
                .withMessage("El banner no llegó al estado presente=" + shouldBePresent)
                .until(d -> d.findElements(PROMO_BANNER).isEmpty() != shouldBePresent);
    }
}
