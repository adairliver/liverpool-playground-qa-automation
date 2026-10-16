package com.liverpool.playground.support;

import java.time.Duration;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

/**
 * Login "de fondo" para los escenarios que no prueban el login. Es independiente de LoginPage a propósito:
 * así el Ejercicio 2 queda aislado y un defecto en LoginPage no rompe los demás ejercicios.
 */
public final class SessionHelper {

    private SessionHelper() {}

    public static void login(WebDriver driver, String baseUrl, String usuario, String password) {
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));
        driver.get(baseUrl + "/");
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("username"))).sendKeys(usuario);
        driver.findElement(By.id("password")).sendKeys(password);
        driver.findElement(By.id("login-button")).click();
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("dashboard-title")));
    }
}
