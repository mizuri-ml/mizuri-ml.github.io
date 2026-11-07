# Publicar Nodo Seguro gratis con GitHub Pages

## Requisitos

- Una cuenta gratuita de GitHub: https://github.com/
- Un repositorio **público** de GitHub para usar GitHub Pages en el plan Free.
- No necesitas contratar hosting, pagar dominio, usar una base de datos ni configurar claves de API para esta primera versión.

## Paso 1 — Crear el repositorio

1. Entra a GitHub e inicia sesión.
2. Pulsa **+ > New repository** (o abre https://github.com/new).
3. Como nombre escribe exactamente `TUUSUARIO.github.io`, sustituyendo `TUUSUARIO` por tu nombre de usuario de GitHub en minúsculas.
4. Selecciona **Public** y crea el repositorio. Puedes dejar sin marcar la creación automática de README porque el proyecto incluye uno.

## Paso 2 — Subir los archivos

1. Descomprime `nodo-seguro-blog.zip` en tu equipo.
2. En el repositorio, selecciona **Add file > Upload files**.
3. Arrastra **el contenido de la carpeta descomprimida** (no la carpeta contenedora) para que `_config.yml`, `index.html`, `_posts/`, `_layouts/`, etc. queden en la raíz del repositorio.
4. Confirma con **Commit changes**.
5. Si tu navegador no admite arrastrar carpetas completas, usa Git en la terminal o GitHub Desktop para conservar la estructura. No subas solo `index.html`: hacen falta los directorios.

### Alternativa con Git (Windows PowerShell, macOS o Linux)

Instala Git, abre la terminal en la carpeta descomprimida y ejecuta (sustituye `TUUSUARIO`):

```bash
git init
git add .
git commit -m "Publicar primera versión de Nodo Seguro"
git branch -M main
git remote add origin https://github.com/TUUSUARIO/TUUSUARIO.github.io.git
git push -u origin main
```

GitHub solicitará autenticación por el método que tengas configurado. Nunca pongas contraseñas ni tokens en los archivos del repositorio.

## Paso 3 — Activar GitHub Pages

1. Entra en **Settings > Pages** del repositorio.
2. En **Build and deployment**, selecciona **Deploy from a branch**.
3. En la rama selecciona **main** y carpeta **/(root)**. Guarda.
4. Abre `https://TUUSUARIO.github.io` cuando termine el despliegue. GitHub indica que puede tardar hasta unos 10 minutos después de los cambios.

GitHub Pages procesa los archivos Jekyll automáticamente. No crees un archivo `.nojekyll` en este proyecto.

## Paso 4 — Personalizar

- Cambia el nombre, descripción, zona horaria y URL en `_config.yml`.
- Edita la página `acerca/index.html` con una descripción profesional y datos que quieras hacer públicos.
- Ajusta colores y tipografía en `assets/css/style.css`.
- Cambia la marca de cabecera y pie en `_layouts/default.html` si renombras el proyecto.

## Paso 5 — Publicar artículos con prompts

1. Conecta a ChatGPT la integración de GitHub y autoriza el acceso al repositorio si está disponible.
2. Abre `PLANTILLA_PROMPT.md`, copia el prompt y cambia el tema.
3. Revisa las afirmaciones técnicas y las referencias del texto propuesto.
4. Aprueba una actualización en `_posts/` únicamente cuando estés conforme y la integración tenga permiso real de escritura.
5. GitHub Pages publicará el nuevo artículo tras el commit y el despliegue.

**Sin la integración de GitHub:** pide a ChatGPT que te entregue el archivo `.md`, crea ese archivo en `_posts/` desde GitHub, pega su contenido y confirma los cambios. Es un respaldo gratuito y no requiere API.

## Comprobar que todo funciona

- [ ] Abre la portada en `https://TUUSUARIO.github.io`.
- [ ] Entra en Artículos y abre las tres entradas de muestra.
- [ ] En Herramientas calcula `192.168.10.42/24`: red `192.168.10.0`, broadcast `192.168.10.255`, máscara `255.255.255.0`, 254 hosts.
- [ ] Genera una contraseña desde un navegador con HTTPS.
- [ ] Calcula SHA-256 del texto `abc`; resultado conocido:
  `ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad`.
- [ ] Abre el sitio desde un teléfono para verificar el menú responsive.

## Limitaciones de esta versión

GitHub Pages es hosting estático: las tres herramientas se ejecutan exclusivamente en el navegador. No se incluye editor privado, base de datos, panel de administración ni API secreta de IA. No se debe guardar tokens en JavaScript público. El dominio `github.io` es gratuito; un dominio propio comprado aparte tendría costo.

Documentación oficial: https://docs.github.com/es/pages/quickstart
