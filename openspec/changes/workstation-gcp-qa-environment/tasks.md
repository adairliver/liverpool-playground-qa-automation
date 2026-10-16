## 1. Imagen

- [x] 1.1 `infra/workstation/extensions.txt` con versiones fijas y descarga desde Open VSX
- [x] 1.2 `Dockerfile`: JDK 17, Maven, Chrome y chromedriver, extensiones built-in, remoción de IA y galería
- [x] 1.3 `verify-no-ai.sh` integrado en la construcción
- [x] 1.4 `prepare-context.sh`: semilla sin historial y sin documentos de respuestas
- [x] 1.5 Calentar Maven y npm dentro de la imagen ejecutando la suite completa
- [x] 1.6 Ajustes de máquina (`machine-settings.json`) y arranque (`105_qa-bootstrap.sh`, `110_start-code-oss.sh`)

## 2. Prueba local

- [x] 2.1 `test-image-local.sh`: construir con Docker, listar extensiones, comprobar ausencia de IA
- [x] 2.2 Comprobar `mvn test` sin red (`--network none`) y que el IDE abre la carpeta del reto

## 3. Google Cloud

- [x] 3.1 Script `gcp-setup.sh` idempotente (APIs, Artifact Registry, red, clúster, configuración, workstation)
- [x] 3.2 Construir y publicar la imagen con Cloud Build
- [x] 3.3 Crear la infraestructura y la workstation
- [x] 3.4 Otorgar acceso IAM al usuario del reto
- [ ] 3.5 Verificar desde el navegador (IDE, autocompletado, sin IA, suite en verde)
- [x] 3.6 Script `gcp-teardown.sh`

## 4. Documentación

- [x] 4.1 `infra/workstation/README.md` (construcción, costos, acceso, destrucción) y enlace desde el README principal
