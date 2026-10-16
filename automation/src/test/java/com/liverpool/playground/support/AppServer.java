package com.liverpool.playground.support;

import java.io.File;
import java.net.HttpURLConnection;
import java.net.URI;
import java.time.Duration;
import java.time.Instant;

/** Levanta app-web (npm run dev) si no está disponible, y la apaga al terminar si la levantó este proceso. */
public final class AppServer {

    /** Texto presente en el index.html de app-web (title). */
    private static final String APP_MARKER = "Pedidos Playground";

    private static Process process;

    private AppServer() {}

    public static synchronized void ensureRunning() throws Exception {
        if (isUp()) {
            return;
        }
        if (!TestConfig.appAutostart()) {
            throw new IllegalStateException("app-web no responde en " + TestConfig.baseUrl()
                    + " y app.autostart=false");
        }
        File appDir = new File(TestConfig.appDir()).getCanonicalFile();
        if (!new File(appDir, "package.json").exists()) {
            throw new IllegalStateException("No se encontró app-web en " + appDir);
        }
        if (!new File(appDir, "node_modules").exists()) {
            run(appDir, "npm", "install");
        }
        File log = new File("target/app-web.log");
        log.getParentFile().mkdirs();
        process = new ProcessBuilder("npm", "run", "dev")
                .directory(appDir)
                .redirectErrorStream(true)
                .redirectOutput(log)
                .start();

        Instant deadline = Instant.now().plus(Duration.ofSeconds(60));
        while (Instant.now().isBefore(deadline)) {
            if (isUp()) {
                return;
            }
            if (!process.isAlive()) {
                throw new IllegalStateException("app-web terminó inesperadamente, ver " + log);
            }
            Thread.sleep(500);
        }
        throw new IllegalStateException("app-web no levantó en 60s, ver " + log);
    }

    public static synchronized void stop() {
        if (process == null) {
            return;
        }
        process.descendants().forEach(ProcessHandle::destroy);
        process.destroy();
        process = null;
    }

    private static boolean isUp() {
        try {
            HttpURLConnection c = (HttpURLConnection) URI.create(TestConfig.baseUrl()).toURL().openConnection();
            c.setConnectTimeout(1000);
            c.setReadTimeout(1000);
            if (c.getResponseCode() != 200) {
                return false;
            }
            // Verifica que sea NUESTRA app y no otro servicio ocupando el puerto.
            try (var in = c.getInputStream()) {
                return new String(in.readAllBytes()).contains(APP_MARKER);
            }
        } catch (Exception e) {
            return false;
        }
    }

    private static void run(File dir, String... cmd) throws Exception {
        Process p = new ProcessBuilder(cmd).directory(dir).inheritIO().start();
        if (p.waitFor() != 0) {
            throw new IllegalStateException("Falló: " + String.join(" ", cmd));
        }
    }
}
