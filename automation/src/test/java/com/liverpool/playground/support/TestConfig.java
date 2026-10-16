package com.liverpool.playground.support;

/** Configuración por propiedades de sistema: -Dbase.url, -Dheadless, -Dapp.autostart, -Dapp.dir. */
public final class TestConfig {

    private TestConfig() {}

    public static String baseUrl() {
        return System.getProperty("base.url", "http://localhost:5199");
    }

    public static boolean headless() {
        return Boolean.parseBoolean(System.getProperty("headless", "true"));
    }

    public static boolean appAutostart() {
        return Boolean.parseBoolean(System.getProperty("app.autostart", "true"));
    }

    public static String appDir() {
        return System.getProperty("app.dir", "../app-web");
    }
}
