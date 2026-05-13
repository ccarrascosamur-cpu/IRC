# IRC Website + Decap CMS (Cloudflare)

Versión del sitio de **Ingles Rugby Club** con panel de administración integrado via [Decap CMS](https://decapcms.org/), hosteada en **Cloudflare Pages** con un **Cloudflare Worker** como proxy de autenticación.

---

## Estructura

```
cms-site/
├── index.html              # Sitio principal
├── css/                    # Estilos
├── js/                     # Lógica (lee JSON locales)
├── img/                    # Imágenes
├── data/                   # JSON editables
│   ├── posiciones.json
│   ├── fixture.json
│   ├── stats.json
│   ├── noticias.json
│   └── config.json
├── admin/
│   ├── index.html          # Panel Decap CMS
│   └── config.yml          # Configuración de colecciones
└── worker/
    ├── index.js            # Proxy OAuth para GitHub
    └── wrangler.toml       # Config del Worker
```

---

## Deploy paso a paso

### 1. Crear repositorio en GitHub

```bash
cd cms-site
git init
git add .
git commit -m "Primer commit: IRC + Decap CMS + Cloudflare"
```

Crea un repo nuevo en [github.com](https://github.com) y subí:

```bash
git remote add origin https://github.com/TU_USUARIO/irc-website.git
git branch -M main
git push -u origin main
```

### 2. Crear OAuth App en GitHub

1. Andá a **Settings** → **Developer settings** → **OAuth Apps** → **New OAuth App**
2. **Application name:** IRC Website CMS
3. **Homepage URL:** `https://irc-website.pages.dev` (o tu dominio)
4. **Authorization callback URL:** `https://irc-oauth-proxy.TU_USUARIO.workers.dev/auth`
5. Guardá el **Client ID** y generá un **Client Secret**

### 3. Desplegar el Worker de Cloudflare

```bash
cd cms-site/worker

# Instalá wrangler si no lo tenés
npm install -g wrangler

# Logueate en Cloudflare
wrangler login

# Configurá los secrets (se guardan encriptados)
wrangler secret put GITHUB_CLIENT_ID
# (pegá tu Client ID)

wrangler secret put GITHUB_CLIENT_SECRET
# (pegá tu Client Secret)

# Desplegá el Worker
wrangler deploy
```

El Worker quedará en `https://irc-oauth-proxy.TU_USUARIO.workers.dev`.

### 4. Configurar Decap CMS

Editá `cms-site/admin/config.yml` y reemplazá:

```yaml
backend:
  name: github
  repo: TU_USUARIO/TU_REPO
  branch: main
  base_url: https://irc-oauth-proxy.TU_USUARIO.workers.dev
  auth_endpoint: /auth
```

Guardá, commiteá y pusheá:

```bash
git add admin/config.yml
git commit -m "Configura backend GitHub + Cloudflare Worker"
git push
```

### 5. Conectar Cloudflare Pages

1. Andá a [dash.cloudflare.com](https://dash.cloudflare.com) → **Pages**
2. **Create a project** → **Connect to Git**
3. Elegí tu repo `irc-website`
4. Configuración:
   - **Project name:** `irc-website`
   - **Production branch:** `main`
   - **Build command:** (dejar vacío)
   - **Build output directory:** `cms-site`
5. Hacé clic en **Save and Deploy**

Cloudflare Pages te dará una URL tipo `https://irc-website.pages.dev`.

### 6. Probar el panel de admin

1. Andá a `https://irc-website.pages.dev/admin/`
2. Hacé clic en **Login with GitHub**
3. Autorizá la app
4. ¡Listo! Ya podés editar todo desde el panel.

Cada cambio que guardás se commitea al repo y Cloudflare Pages redeploya automáticamente.

---

## Probar localmente (sin deploy)

```bash
cd cms-site
npx decap-server
```

En otra terminal:

```bash
cd cms-site
npx serve .
```

Andá a `http://localhost:3000/admin/` con `local_backend: true` descomentado en `admin/config.yml`.

---

## Notas importantes

- **Las horas del fixture** se guardan como texto `HH:MM`. El frontend las lee directamente.
- **Solo un partido** debe tener `EsDestacado: true` para aparecer en el hero.
- **Estado `jugado`** muestra el resultado; **Estado `proximo`** muestra la hora.
- El Worker de Cloudflare solo se usa para el login de GitHub. El sitio en sí es 100% estático.
