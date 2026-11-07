# Protección del panel TECNOSYSLAN

- La autenticación se valida en Cloudflare Worker, no mediante `admin.js` ni HTML estático.
- La contraseña indicada por el usuario debe guardarse como secreto `ADMIN_PASSWORD`; no se incluye en este proyecto.
- Usuario configurado: `mizuri`.
- `GITHUB_TOKEN` es un token de acceso específico con el mínimo permiso `Contents: Read and write` sobre este repositorio.
- `SESSION_SECRET` debe generarse aleatoriamente; la sesión dura 20 minutos.
- CORS restringido al origen `https://mizuri-ml.github.io`; el backend no acepta publicaciones sin token de sesión.
- Rate limiter Cloudflare para intentos de acceso: aproximado por dirección IP.
- La publicación es un commit único por petición mediante GitHub Git database, no múltiples modificaciones inconexas.
- Los archivos cargados deben considerarse código ejecutable: revisarlos antes de publicarlos.
- Las herramientas incorporadas usan iframe sandbox sin `allow-same-origin` para reducir riesgos de acceso al documento padre.
- Recomendación: activar 2FA/MFA en GitHub y Cloudflare; cambiar la contraseña compartida en esta conversación por una nueva antes del despliegue.
- Este sistema no equivale a una auditoría de seguridad. Para exposición sostenida a Internet, revisa registros, límites, autenticación y permisos periódicamente.
