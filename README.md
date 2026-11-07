# TECNOSYSLAN — Plataforma moderna (Diseño D)

Sitio público estático con GitHub Pages y Jekyll.

Módulos: Inicio, Herramientas, Noticias, Artículos, Contacto, Acerca de y Administración.

El panel de administración requiere un Cloudflare Worker separado, con la contraseña y el token de GitHub almacenados exclusivamente como secretos. Los archivos de ese servidor están en `_backend/` y no deben mezclarse con el frontend publicado.

Para instalar el ZIP en GitHub Desktop y activar la administración, lee primero **GUIA_INSTALACION.md**.

## Contenido preservado del sitio original

- Tres artículos publicados sobre phishing, VLAN y FTTH/GPON.
- Calculadora IPv4, generador de contraseñas y SHA-256.
- Laboratorio de patrones ICMP y conversor Mbps/MB/s de entregas anteriores.
- Feed RSS y la configuración general de GitHub Pages.

## Publicar contenido desde el panel

- Herramientas nuevas: `_herramientas/<slug>.md` (metadatos) + `herramientas/apps/<slug>/index.html` (contenido).
- Noticias: `_posts/YYYY-MM-DD-<slug>.md`.
- La colección Jekyll detecta nuevas herramientas sin editar manualmente el índice.

**No se ha ejecutado ningún commit ni desplegado ningún Worker desde la generación de este paquete.**
