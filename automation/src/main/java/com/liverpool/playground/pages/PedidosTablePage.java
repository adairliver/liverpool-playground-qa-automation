package com.liverpool.playground.pages;

import java.time.Duration;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

public class PedidosTablePage {

    private final WebDriver driver;

    public PedidosTablePage(WebDriver driver) {
        this.driver = driver;
    }

    public void open(String baseUrl) {
        driver.get(baseUrl + "/pedidos");
        waitForRow("1001");
    }

    /** Recarga la página y selecciona el pedido indicado. */
    public void clickRowAfterRefresh(String pedidoId) {
        WebElement rowItem = waitForRow(pedidoId);
        driver.navigate().refresh();
        rowItem.click();
    }

    public String selectedRowDetail() {
        return new WebDriverWait(driver, Duration.ofSeconds(10))
                .until(ExpectedConditions.visibilityOfElementLocated(By.id("row-detail")))
                .getText();
    }

    private WebElement waitForRow(String pedidoId) {
        return new WebDriverWait(driver, Duration.ofSeconds(10))
                .until(ExpectedConditions.elementToBeClickable(
                        By.cssSelector("tr[data-id='" + pedidoId + "']")));
    }
}
