package com.liverpool.playground.pages;

import java.time.Duration;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.PageFactory;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

public class PedidoFormPage {

    private final WebDriver driver;

    @FindBy(id = "cliente")
    private WebElement clienteInput;

    @FindBy(id = "producto")
    private WebElement productoInput;

    @FindBy(id = "cantidad")
    private WebElement cantidadInput;

    @FindBy(id = "submit-form")
    private WebElement submitButton;

    public PedidoFormPage(WebDriver driver) {
        this.driver = driver;
        PageFactory.initElements(driver, this);
    }

    public void open(String baseUrl) {
        driver.get(baseUrl + "/pedidos/nuevo");
        new WebDriverWait(driver, Duration.ofSeconds(10))
                .until(ExpectedConditions.visibilityOfElementLocated(By.id("cliente")));
    }

    public void fillForm(String cliente, String producto, String cantidad) {
        clienteInput.sendKeys(cliente);
        productoInput.sendKeys(producto);
        cantidadInput.clear();
        cantidadInput.sendKeys(cantidad);
    }

    /** Ejercicio 1: espera explícita (WebDriverWait + ExpectedConditions), nunca Thread.sleep. */
    public void clickSubmitButton() {
        new WebDriverWait(driver, Duration.ofSeconds(10))
                .until(ExpectedConditions.elementToBeClickable(submitButton))
                .click();
    }

    public String confirmationMessage() {
        return new WebDriverWait(driver, Duration.ofSeconds(10))
                .until(ExpectedConditions.visibilityOfElementLocated(By.id("order-confirmation")))
                .getText();
    }
}
