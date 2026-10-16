package com.liverpool.playground.pages;

import java.time.Duration;
import java.util.List;
import org.openqa.selenium.By;
import org.openqa.selenium.NoSuchElementException;
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

    /** Abre el reporte. */
    public void clickOpenReport() {
        new WebDriverWait(driver, Duration.ofSeconds(10))
                .until(ExpectedConditions.elementToBeClickable(openReportLink))
                .click();
    }

    /** Indica si el banner promocional está presente. */
    public boolean isPromoBannerPresent() {
        try {
            return driver.findElement(PROMO_BANNER).isDisplayed();
        } catch (NoSuchElementException e) {
            return false;
        }
    }

    /** Utilidad de sincronización para la prueba. */
    public void waitUntilPromoBanner(boolean shouldBePresent) {
        new FluentWait<>(driver)
                .withTimeout(Duration.ofSeconds(15))
                .pollingEvery(Duration.ofMillis(100))
                .withMessage("El banner no llegó al estado presente=" + shouldBePresent)
                .until(d -> d.findElements(PROMO_BANNER).isEmpty() != shouldBePresent);
    }
}
