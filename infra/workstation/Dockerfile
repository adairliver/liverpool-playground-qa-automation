# syntax=docker/dockerfile:1
# Imagen del reto de QA Automation para Google Cloud Workstations (Code OSS).
# El contexto de construccion lo genera scripts/prepare-context.sh (carpeta .build/).
ARG BASE_IMAGE=us-central1-docker.pkg.dev/cloud-workstations-images/predefined/code-oss@sha256:82bd8e5b11f5322af0a447b0f80112af6cef19fcb8b4571f743abd5bdcd93ebd
FROM ${BASE_IMAGE}

ARG MAVEN_VERSION=3.9.9
USER root
ENV DEBIAN_FRONTEND=noninteractive

# --- Herramientas: JDK 17 (el proyecto se valido con 17; el JDK 25 de la base queda para el servidor de lenguaje)
RUN apt-get update \
 && apt-get install -y --no-install-recommends openjdk-17-jdk-headless ca-certificates curl unzip git fonts-liberation \
 && ln -sfn "/usr/lib/jvm/java-17-openjdk-$(dpkg --print-architecture)" /opt/jdk17 \
 && rm -rf /var/lib/apt/lists/*

# --- Maven
RUN curl -fsSL "https://archive.apache.org/dist/maven/maven-3/${MAVEN_VERSION}/binaries/apache-maven-${MAVEN_VERSION}-bin.tar.gz" \
    | tar -xz -C /opt \
 && ln -sfn "/opt/apache-maven-${MAVEN_VERSION}" /opt/maven

# --- Chrome estable + chromedriver del mismo canal (Chrome for Testing): sin descargas en tiempo de ejecucion
RUN curl -fsSL -o /tmp/chrome.deb https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb \
 && apt-get update && apt-get install -y --no-install-recommends /tmp/chrome.deb \
 && rm -rf /tmp/chrome.deb /var/lib/apt/lists/* \
 && set -eux; V="$(google-chrome --version | awk '{print $3}')"; B="$(echo "$V" | cut -d. -f1-3)"; \
    CD="$(curl -fsSL "https://googlechromelabs.github.io/chrome-for-testing/LATEST_RELEASE_${B}")"; \
    curl -fsSL -o /tmp/cd.zip "https://storage.googleapis.com/chrome-for-testing-public/${CD}/linux64/chromedriver-linux64.zip"; \
    unzip -q /tmp/cd.zip -d /tmp; install -m 0755 /tmp/chromedriver-linux64/chromedriver /usr/local/bin/chromedriver; \
    rm -rf /tmp/cd.zip /tmp/chromedriver-linux64; google-chrome --version; chromedriver --version

# --- Entorno para terminales de login
RUN printf '%s\n' \
  'export JAVA_HOME=/opt/jdk17' \
  'export MAVEN_HOME=/opt/maven' \
  'export SE_OFFLINE=true' \
  'export PATH=/opt/jdk17/bin:/opt/maven/bin:$PATH' > /etc/profile.d/qa-env.sh

# --- Proyecto semilla (sin historial ni documentos de respuestas) + calentamiento de dependencias
COPY seed/ /opt/qa-seed/project/
RUN set -eux; \
    export JAVA_HOME=/opt/jdk17 PATH=/opt/jdk17/bin:/opt/maven/bin:$PATH; \
    cd /opt/qa-seed/project/app-web && npm ci --no-audit --no-fund; \
    cd /opt/qa-seed/project/automation; \
    # Calienta dependencias ejecutando la suite. Si el proyecto trae pruebas fallando a proposito (rama del reto),
    # los fallos de pruebas no deben romper la imagen; los errores de compilacion o de resolucion si.
    mvn -B -Dmaven.repo.local=/opt/m2/repository -Dmaven.test.failure.ignore=true clean test; \
    # El IDE (m2e) calcula el plan completo del ciclo de vida: resolver tambien jar/install/deploy/clean offline. \
    mvn -B -Dmaven.repo.local=/opt/m2/repository dependency:resolve-plugins dependency:resolve; \
    rm -rf /opt/qa-seed/project/automation/target; \
    chmod -R a+rwX /opt/m2 /opt/qa-seed/project

# --- Maven 100% offline desde ahora (se escribe DESPUES del calentamiento)
RUN printf '%s\n' \
  '<settings xmlns="http://maven.apache.org/SETTINGS/1.2.0">' \
  '  <localRepository>/opt/m2/repository</localRepository>' \
  '  <offline>true</offline>' \
  '</settings>' > /opt/maven/conf/settings.xml

# --- Extensiones de lenguaje como built-in
COPY extensions.txt /tmp/extensions.txt
COPY scripts/ /opt/qa-seed/scripts/
RUN bash /opt/qa-seed/scripts/fetch-extensions.sh /tmp/extensions.txt /opt/code-oss/extensions

# --- Sin IA: remover extensiones de IA del IDE base, quitar la galeria y las claves de chat de product.json
RUN set -eux; \
    rm -rf /opt/code-oss/extensions/google.geminicodeassist* \
           /opt/code-oss/extensions/google.gemini-cli-vscode-ide-companion* \
           /opt/code-oss/extensions/googlecloudtools.*; \
    python3 /opt/qa-seed/scripts/strip-product-json.py /opt/code-oss/product.json
RUN bash /opt/qa-seed/scripts/verify-no-ai.sh /opt/code-oss/extensions

# --- Ajustes del IDE y arranque (el JDK del servidor de lenguaje es el de la imagen base)
COPY config/machine-settings.json /opt/qa-seed/machine-settings.json
RUN set -eux; \
    JH="$(dirname "$(dirname "$(readlink -f "$(which java)")")")"; echo "JDT LS java home: $JH"; \
    sed -i "s|__JDTLS_JAVA_HOME__|$JH|" /opt/qa-seed/machine-settings.json; \
    python3 -c "import json; json.load(open('/opt/qa-seed/machine-settings.json'))"
COPY startup/105_qa-bootstrap.sh /etc/workstation-startup.d/105_qa-bootstrap.sh
RUN chmod +x /etc/workstation-startup.d/105_qa-bootstrap.sh \
 && sed -i 's|--port=${EDITOR_PORT}|--default-folder=/home/user/qa-challenge --port=${EDITOR_PORT}|' /etc/workstation-startup.d/110_start-code-oss.sh \
 && grep -q -- '--default-folder=/home/user/qa-challenge' /etc/workstation-startup.d/110_start-code-oss.sh

# --- Locale UTF-8 (acentos legibles en consola y reportes); al final para conservar la cache de las capas pesadas
ENV LANG=C.UTF-8 LC_ALL=C.UTF-8
