# Prompt Template — Sitio Estático + Panel Admin en Cloudflare Workers

## Contexto del proyecto

Quiero crear un sitio web estático (HTML/CSS/JS) cuyos datos sean editables desde un panel de administración web, sin depender de CMS externos, bases de datos ni Google Sheets.

## Arquitectura requerida

### 1. Estructura de archivos

```
project/
├── index.html              # Sitio principal
├── css/                    # Estilos
├── js/                     # Lógica del sitio
├── data/                   # JSON editables (fixture, posiciones, noticias, stats, config)
│   ├── fixture.json        # Formato: { "fixture": [ {...}, ... ] }
│   ├── posiciones.json     # Formato: { "posiciones": [ {...}, ... ] }
│   ├── noticias.json       # Formato: { "noticias": [ {...}, ... ] }
│   ├── stats.json          # Formato: { "stats": [ {...} ] }
│   └── config.json         # Formato: objeto plano
├── admin-simple/
│   ├── index.html          # Panel de admin
│   ├── admin.css           # Estilos del panel
│   └── admin.js            # Lógica del panel
├── worker/
│   ├── index.js            # Código del Cloudflare Worker
│   └── wrangler.toml       # Configuración de Wrangler
└── wrangler.toml           # Configuración principal (en root)
```

### 2. Cloudflare Worker — Responsabilidades

El Worker debe:

- **Servir assets estáticos** (HTML, CSS, JS, imágenes) usando `env.ASSETS.fetch(request)`
- **Interceptar `/api/data/*.json`** para leer los JSON directamente desde la **API de GitHub** (`api.github.com/repos/OWNER/REPO/contents/...`) en tiempo real, sin caché. NUNCA servir los JSON desde los assets estáticos del deploy (evita caché agresiva de `raw.githubusercontent.com`)
- **Endpoint `/api/save`** (POST): recibir `{ key, content }`, obtener el SHA actual del archivo desde GitHub, y hacer un commit con el nuevo contenido en base64
- **Endpoint `/api/login`** (POST): recibir `{ password }`, comparar contra el secret `ADMIN_PASSWORD` del Worker, y devolver un token de sesión

### 3. Panel de admin (`admin-simple/`)

- **Pantalla de login**: campo de contraseña. La contraseña se verifica contra `/api/login`. Si es correcta, guarda un flag en `sessionStorage` y muestra el editor
- **Editor por pestañas**: Fixture, Posiciones, Noticias, Stats, Configuración
- **Cada ítem es una tarjeta editable** con inputs para cada campo
- **Botones**: Agregar ítem, Eliminar ítem, Guardar todos los cambios
- **Lectura de datos**: usa `fetch('/api/data/xxx.json')` (nunca `../data/xxx.json`)
- **Guardado**: al hacer clic en "Guardar", envía cada JSON modificado a `/api/save` via POST

### 4. Sitio web (`js/main.js`)

- Al cargar, hace `fetch('/api/data/xxx.json')` para obtener cada JSON
- Renderiza las secciones dinámicamente desde esos datos
- No debe tener datos hardcodeados como fallback

### 5. Configuración de Wrangler (`wrangler.toml` en root)

```toml
name = "PROJECT_NAME"
main = "worker/index.js"
compatibility_date = "2024-01-01"

[assets]
directory = "."
not_found_handling = "single-page-application"
```

### 6. Secrets del Worker (configurar con `wrangler secret put`)

- `GITHUB_TOKEN`: Personal Access Token de GitHub con scope `repo`
- `ADMIN_PASSWORD`: Contraseña para acceder al panel de admin

### 7. Repositorio GitHub

- Crear un repo público o privado en GitHub
- Los archivos JSON se guardan en `data/` en la raíz del repo
- El Worker se conecta a la API de GitHub para leer/escribir esos archivos

## Instrucciones de deploy

1. Crear repo en GitHub y subir los archivos
2. Generar GitHub Personal Access Token (classic) con scope `repo`
3. Instalar Wrangler: `npm install -g wrangler`
4. Loguearse: `wrangler login`
5. Configurar secrets:
   ```bash
   wrangler secret put GITHUB_TOKEN
   wrangler secret put ADMIN_PASSWORD
   ```
6. Deployar: `wrangler deploy`

## Pregunta inicial

**¿Querés que incluya un panel de administración web para editar los datos sin tocar código?**

- **Sí**: se agrega la carpeta `admin-simple/` con login, formularios y guardado automático a GitHub
- **No**: el sitio lee los JSON locales y los datos se editan manualmente subiendo archivos al repo

## Notas importantes

- NUNCA usar `raw.githubusercontent.com` para leer datos (tiene caché de 5 minutos)
- SIEMPRE leer JSON desde `/api/data/xxx.json` (el Worker usa GitHub API sin caché)
- SIEMPRE enviar datos al Worker como strings JSON (no como objetos) para evitar problemas de encoding
- El Worker debe usar `TextEncoder` + `btoa` para codificar a base64 (funciona con UTF-8)
