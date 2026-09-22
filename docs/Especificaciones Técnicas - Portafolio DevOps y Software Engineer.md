# **Especificaciones Técnicas: Portafolio de Ingeniería de Software y DevOps (Sistema de Alta Disponibilidad Híbrido)**

# **1\. Resumen Ejecutivo**

El objetivo de este proyecto es construir un portafolio profesional para un Person cuya infraestructura represente en sí misma la prueba técnica de sus capacidades. En lugar de un sitio estático tradicional, el portafolio opera como un sistema distribuido híbrido activo-pasivo con conmutación por error (failover) transparente entre un servidor local (HomeLab) y una instancia en la nube de coste cero (Oracle Cloud Free Tier), todo coordinado en el borde por Cloudflare.

# **2\. Alcance del MVP (Producto Mínimo Viable)**

Para evitar la sobreingeniería inicial y asegurar una entrega funcional rápida, el MVP se delimita a:

&nbsp;

* **Despliegue Dual:** Una aplicación web contenerizada idéntica corriendo en el HomeLab (nodo primario) y en la nube (nodo de respaldo).  
* **Enrutamiento y Failover L7 en el Borde:** Cloudflare Worker que verifica la salud del nodo primario mediante un timeout corto (2.5 s) y redirige automáticamente al secundario si detecta fallo o degradación.  
* **Barra de Telemetría y Estado:** Header interactivo que lee encabezados HTTP custom (`X-Active-Node`, `X-Node-Region`, latencia) para mostrar desde qué nodo se sirve la página en tiempo real.  
* **Simulador de Fallo / Resiliencia:** Endpoint protegido o conmutador en la interfaz que simula una caída de red o caída de contenedor en el HomeLab para que el visitante observe el failover en vivo.  
* **Pipeline de CI/CD Básico:** GitHub Actions que compila la imagen Docker, la publica en GitHub Packages (GHCR) y actualiza automáticamente ambos nodos.  
* **Documentación y Casos de Estudio:** 2 o 3 casos de estudio de arquitectura presentados con enlaces directos a manifiestos (Docker Compose, GitHub Workflows) y código fuente.

# **3\. Arquitectura del Sistema**

## **3.1 Topología**

El sistema se estructura bajo una jerarquía de disponibilidad distribuida:

&nbsp;

1. **Capa de Usuario:** El tráfico se origina desde el navegador del reclutador o visitante.  
2. **Capa de Borde (Edge):** Cloudflare Worker actúa como el cerebro del sistema, realizando inspección de salud (Health Checks) en tiempo real.  
3. **Nodo Primario (HomeLab):** Servidor local operando bajo Proxmox, Docker o K3s, expuesto mediante un túnel seguro.  
4. **Nodo Secundario (Oracle Cloud):** Instancia de computación en espera (standby) para garantizar la continuidad del servicio.

## **3.2 Componentes Clave**

* **Edge Router (Cloudflare Worker):** Gestiona el DNS y el enrutamiento HTTP. Si `fetch(HomeLab)` responde con éxito (\< 500, \< 2500ms), inyecta `X-Active-Node: HomeLab-Primario`. Si falla, conmuta a `fetch(CloudFallback)` e inyecta `X-Failover-Triggered: true`.  
* **Origen Primario (HomeLab):** Servidor doméstico conectado a través de un túnel seguro con `cloudflared`. Cero puertos abiertos en el router local; inmune a problemas de CGNAT.  
* **Origen Secundario (Oracle Cloud Always Free):** Instancia Compute ARM (Ampere A1) o AMD micro con Ubuntu y Docker. Corre una réplica exacta de la aplicación.  
* **Capa de Datos:** La aplicación es principalmente stateless. Para métricas se utiliza una base de datos ligera serverless o distribuida como Turso o Supabase.

# **4\. Flujo de Usuario y Experiencia**

1. **Entrada al Sitio:** El usuario accede a la URL principal. La barra superior muestra inmediatamente: `🟢 Status: Operational (HomeLab Primario) | Latency: ~18ms | Current Node: HomeLab-Proxmox`.  
   |---|la sección principal, el usuario ve el diagrama interactivo de la topología que se actualiza visualmente resaltando el camino del tráfico actual.  
2. **Prueba de Resiliencia (Demo en Vivo):**  
   * El usuario hace clic en el botón "Simular Fallo en HomeLab".  
   * El frontend hace una petición al endpoint `/api/simulate-failure?duration=30`.  
   * El contenedor del HomeLab devuelve un error HTTP 503 o se desconecta temporalmente por 30 segundos.  
   * El Edge Worker detecta la falla y conmuta al nodo de Oracle Cloud.  
   * La página se actualiza vía polling, pasando el badge a: `⚠️ Failover Activo: Servido desde Oracle Cloud (Standby)`.  
3. **Inspección de Proyectos:** El visitante navega por los proyectos y puede pulsar botones directos para ver el código en GitHub o el manifiesto de Terraform.

# **5\. Stack Tecnológico Recomendado**

| Componente | Tecnología Seleccionada | Justificación Técnica |
| :---- | :---- | :---- |
| **Edge & DNS** | Cloudflare Workers & Tunnels | Enrutamiento L7 de latencia ultra baja, túnel seguro sin IP pública expuesta. |
| **Frontend** | Astro o Next.js / SvelteKit | Velocidad de carga extrema, generación estática óptima (SSG/SSR). |
| **Contenedores** | Docker & Docker Compose | Estándar de la industria, portabilidad absoluta e idéntica entre entornos. |
| **Cloud Secundario** | Oracle Cloud Always Free Tier | 4 OCPUs y 24GB de RAM gratuitos permanentemente. |
| **CI/CD** | GitHub Actions \+ GHCR | Pipeline automatizado que compila imágenes multi-arch (amd64/arm64). |
| **Telemetría** | Prometheus \+ Chart.js | Demuestra conocimiento de observabilidad sin consumo excesivo de recursos. |

# **6\. Desglose de Fases de Implementación**

## **Fase 1: Aplicación Base y Contenedorización**

* Desarrollo del frontend con la interfaz técnica y barra de estado.  
* Creación de `Dockerfile` multi-stage optimizado (imagen ligera Alpine/Distroless).  
* Creación de endpoints `/api/health` y `/api/node-info`.

## **Fase 2: Configuración del HomeLab y Túnel**

* Despliegue del contenedor en el servidor local.  
* Configuración del daemon `cloudflared` enlazado al dominio de Cloudflare.  
* Validación de conexión cifrada y tiempos de respuesta.

## **Fase 3: Despliegue en la Nube y Edge Worker**

* Creación y provisión de la instancia gratuita en Oracle Cloud.  
* Despliegue del contenedor de respaldo en la nube.  
* Escritura y publicación del Cloudflare Worker con la lógica de health-check y failover automático.

## **Fase 4: Telemetría, Simulación de Caos y CI/CD**

* Implementación del endpoint `/api/simulate-failure` para pruebas de resiliencia.  
* Creación del pipeline de GitHub Actions para despliegue automatizado continuo.  
* Ajuste final de métricas de telemetría y documentación del repositorio público.

&nbsp;