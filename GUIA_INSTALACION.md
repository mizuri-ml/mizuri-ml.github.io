# TECNOSYSLAN — Guía de instalación completa

**Diseño seleccionado:** D · Plataforma moderna (violeta, blanco y tonos turquesa).  
**Sitio:** https://mizuri-ml.github.io/  
**Repositorio:** https://github.com/mizuri-ml/mizuri-ml.github.io  
**Usuario del administrador:** `mizuri`

> IMPORTANTE: La página pública y el panel visual se pueden subir reemplazando el repositorio. Para **iniciar sesión y publicar automáticamente** también hay que instalar el servidor gratuito de administración en Cloudflare Workers. GitHub Pages no ejecuta un sistema privado de usuarios/contraseñas.

## A. Reemplazar el sitio entero (GitHub Desktop; recomendado)

1. **Respaldo:** entra en https://github.com/mizuri-ml/mizuri-ml.github.io y descarga una copia de seguridad de tu repositorio actual (Code > Download ZIP). Descarga también el nuevo ZIP TECNOSYSLAN_REEMPLAZO_COMPLETO_DISENO_D.zip.
2. Abre **GitHub Desktop**, selecciona tu repositorio `mizuri-ml.github.io` y abre la carpeta de trabajo con Repository > Show in Explorer.
3. En esa carpeta local, elimina los archivos y carpetas anteriores **pero NO elimines `.git`** (puede estar oculta). No elimines el repositorio de GitHub.
4. Descomprime el ZIP nuevo y copia **el contenido** de `TECNOSYSLAN_REEMPLAZO_COMPLETO/` a la raíz de tu repositorio. Deben quedar, entre otros: `index.html`, `_config.yml`, `_layouts/`, `herramientas/`, `noticias/`, `admin/`, `contacto/`, `_backend/`.
5. Vuelve a GitHub Desktop. Comprueba que aparezcan los cambios, escribe como resumen `Nuevo diseño D y módulos TECNOSYSLAN`, pulsa **Commit to main** y después **Push origin**.
6. Comprueba en Settings > Pages que la fuente continúe `Deploy from a branch`, `main`, `/(root)`.
7. Abre el sitio público y verifica las rutas de abajo. Si ocurre un error, revisa la pestaña Actions del repositorio y el historial de commits.

No subas el ZIP como un único archivo: los archivos y carpetas deben quedar **directamente en la raíz del repositorio**. Tampoco crees una carpeta adicional `TECNOSYSLAN_REEMPLAZO_COMPLETO/` dentro del repositorio.

## B. Páginas públicas después de reemplazar

- Inicio: https://mizuri-ml.github.io/
- Herramientas: https://mizuri-ml.github.io/herramientas/
- Noticias: https://mizuri-ml.github.io/noticias/
- Artículos: https://mizuri-ml.github.io/blog/
- Contacto: https://mizuri-ml.github.io/contacto/
- Acerca de: https://mizuri-ml.github.io/acerca/
- Administrador: https://mizuri-ml.github.io/admin/

El administrador tiene formulario de acceso, pero **no será funcional** hasta completar C y D. La ruta `/admin/` no es secreta: la protección está en el servidor.

## C. Configurar administrador privado sin poner la contraseña en GitHub

El código para el backend está dentro de `_backend/`, una carpeta excluida de la web Jekyll. Usa Cloudflare Workers y la API de GitHub para publicar con autorización. Para configurar una vez:

1. Crea o inicia sesión en https://dash.cloudflare.com/ y habilita Workers (puedes empezar con el plan gratuito, sujeto a límites de uso).
2. Instala Node.js y abre **PowerShell** en la carpeta local `_backend` del repositorio (no en `admin/`).
3. Ejecuta estos comandos, uno por uno:

```powershell
npm install
npx wrangler login
npx wrangler deploy
```

4. Copia la URL HTTPS de tu Worker, con forma `https://tecnosyslan-admin-api.<tu-subdominio>.workers.dev`.
5. Configura los tres **secretos** del Worker, sin compartir sus valores ni subirlos a GitHub. Ejecuta cada comando en `_backend`:

```powershell
npx wrangler secret put ADMIN_PASSWORD
npx wrangler secret put GITHUB_TOKEN
npx wrangler secret put SESSION_SECRET
```

- En `ADMIN_PASSWORD`, introduce la contraseña que elegiste para `mizuri`. **No está escrita en los archivos**, ni debe ponerse en `admin.js` o en `_config.yml`. Como ya se compartió una contraseña en un chat, **se recomienda elegir una contraseña nueva, larga y única** para el despliegue definitivo.
- Para `GITHUB_TOKEN`, crea un **fine-grained personal access token** en https://github.com/settings/personal-access-tokens/new, limitado al repositorio `mizuri-ml.github.io`, con permiso **Contents: Read and write**. No habilites permisos innecesarios. Pon fecha de vencimiento y conserva acceso al token.
- En `SESSION_SECRET`, utiliza una cadena aleatoria de **al menos 32 caracteres**. Puedes generarla localmente desde PowerShell, por ejemplo:

```powershell
[Convert]::ToHexString([Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
```

Copia el resultado de este último comando al introducir el secreto. **No copies ninguno de estos secretos al repositorio ni al chat**.

6. Puedes comprobar los secretos añadidos en Cloudflare Dashboard > Workers & Pages > tu Worker > Settings > Variables and Secrets (el valor permanecerá oculto).
7. Si cambias la contraseña o el token de GitHub, actualiza el secreto correspondiente con el mismo comando.

**Nota técnica:** el servidor comprueba los datos de acceso, limita los intentos de inicio de sesión, entrega sesiones de 20 minutos y conserva el token de GitHub solamente en un secreto del servidor. El panel del navegador no recibe el token de GitHub. El método no sustituye una revisión de seguridad profesional.

## D. Conectar la interfaz con tu Worker

1. Abre https://mizuri-ml.github.io/admin/.
2. En **Configuración del servidor**, introduce la dirección HTTPS principal del Worker y pulsa **Guardar dirección**.
3. Pulsa **Comprobar conexión**. Debe aparecer “Servidor disponible”.
4. Escribe usuario `mizuri` y la contraseña almacenada como `ADMIN_PASSWORD` en Cloudflare; pulsa **Acceder al panel**.
5. El panel mostrará **Publicar herramienta** y **Publicar noticia**.

### Publicación de herramientas

- Pide a ChatGPT la herramienta y solicita que entregue los archivos HTML/JS/CSS listos para TECNOSYSLAN.
- Si es un archivo HTML independiente, selecciónalo directamente. Si son varios, selecciona varios archivos juntos. También puedes subir un ZIP normal que tenga `index.html` como archivo principal.
- Completa título, descripción, categoría e identificador URL, revisa el contenido y autoriza la publicación.
- El Worker crea un único commit con los recursos y la ficha automática del catálogo (colección `_herramientas/`).
- Una nueva herramienta de slug `potencia-optica` tendrá la URL `https://mizuri-ml.github.io/herramientas/potencia-optica/`.

**Límites iniciales:** hasta 12 archivos y 3 MB combinados por herramienta, máximo 800 KB por archivo. Algunos ZIP con tipos de compresión inusuales no podrán abrirse; descomprímelos primero.

### Publicación de noticias

- Solicita a ChatGPT una noticia en un archivo `.md` con el cuerpo y los enlaces a fuentes contrastadas.
- Sube el archivo en el módulo Noticias y completa título, fecha, resumen, slug y URL original de la fuente (HTTPS).
- Revisa y autoriza. El Worker crea `_posts/YYYY-MM-DD-slug.md` con categoría `Noticias` y URL `/noticias/slug/`.
- La noticia aparecerá automáticamente en el módulo Noticias y en el RSS de Jekyll cuando GitHub Pages termine el despliegue.

**IMPORTANTE:** la publicación es automática *solo después* de configurar el Worker y aprobar cada envío. Antes de ello, siempre puedes subir archivos desde GitHub Desktop, como en la sección A.

## E. Comprobaciones después de publicar

1. Visita GitHub > Actions (o Settings > Pages) para verificar que el despliegue terminó correctamente.
2. Abre la URL de la herramienta o noticia indicada en el panel.
3. Abre `/herramientas/` o `/noticias/` y verifica que la tarjeta aparezca.
4. En móvil, revisa que el menú y los formularios se vean bien.
5. Si se realizó un cambio equivocado, revierte el commit desde GitHub o restaura el respaldo.

## F. LinkedIn

El enlace compartido anteriormente es una **página de configuración de LinkedIn**, no un enlace público de perfil. Por ello, la nueva sección Contacto lo marca como pendiente. Cuando tengas el enlace correcto (`https://www.linkedin.com/in/...`), reemplaza ese texto en `contacto/index.html` por un vínculo a tu perfil.

## G. Seguridad y privacidad

- No guardes ninguna contraseña, token o secreto en los archivos públicos.
- No subas configuraciones internas de redes, información confidencial de clientes ni claves.
- No publiques noticias sin verificar su fuente y fecha.
- La ruta `/admin/` sigue siendo accesible como página, pero no concede permisos de publicación sin la autenticación del Worker.
- Los laboratorios que ejecutan JavaScript se muestran en un iframe restringido; los archivos que tú publiques deben provenir de fuentes confiables.
- Si copias una herramienta que tiene HTML con YAML/Jekyll, el panel intenta quitar la cabecera del archivo principal antes de publicarlo como una aplicación estática.

**Referencia:** Cloudflare Workers Secrets: https://developers.cloudflare.com/workers/configuration/secrets/  
**Referencia:** GitHub Git Trees REST API: https://docs.github.com/en/rest/git/trees
