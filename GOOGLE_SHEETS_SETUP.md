# Configuración de Google Sheets para IRC Website

## Paso 1: Crear el Google Sheet

1. Andá a [sheets.google.com](https://sheets.google.com) y creá una hoja de cálculo nueva.
2. Nombrala como **"IRC Website Data"**.
3. Creá las siguientes pestañas (hojas) exactamente con estos nombres:

---

### Hoja: `Posiciones`

| Posicion | Equipo | PJ | PG | PE | PP | PF | PC | Dif | Pts |
|----------|--------|----|----|----|----|----|----|-----|-----|
| 1 | Ingles RC | 7 | 5 | 1 | 1 | 175 | 108 | 67 | 27 |
| 2 | Los Halcones | 7 | 5 | 0 | 2 | 162 | 98 | 64 | 24 |
| 3 | Pumas del Sur | 7 | 4 | 1 | 2 | 148 | 120 | 28 | 21 |

**Notas:**
- `Posicion`: número del 1 en adelante
- `PJ`: Partidos Jugados
- `PG`: Partidos Ganados
- `PE`: Partidos Empatados
- `PP`: Partidos Perdidos
- `PF`: Puntos a Favor
- `PC`: Puntos en Contra
- `Dif`: Diferencia
- `Pts`: Puntos totales

---

### Hoja: `Fixture`

| DiaSemana | DiaNum | Mes | Ano | Hora | Localidad | Rival | IRC_Score | Rival_Score | Estado | Cancha | Direccion | EsDestacado |
|-----------|--------|-----|-----|------|-----------|-------|-----------|-------------|--------|--------|-----------|-------------|
| SAB | 15 | MAR | 2026 | 15:30 | Local | Club Atlético | 24 | 18 | jugado | Cancha Principal | Av. San Martín 1240 | FALSE |
| SAB | 22 | MAR | 2026 | 15:30 | Visita | Los Leones RFC | 12 | 32 | jugado | - | - | FALSE |
| SAB | 05 | ABR | 2026 | 15:30 | Local | Potrillos RFC | 28 | 14 | jugado | Cancha Principal | Av. San Martín 1240 | FALSE |
| SAB | 24 | MAY | 2026 | 15:30 | Visita | Los Halcones | | | proximo | Cancha Principal | Av. San Martín 1240 | TRUE |
| SAB | 07 | JUN | 2026 | 15:30 | Local | Club Toros | | | proximo | Cancha Principal | Av. San Martín 1240 | FALSE |

**Notas:**
- `Estado`: solo puede ser `jugado` o `proximo`
- `EsDestacado`: solo UN partido debe tener `TRUE` (el próximo partido principal que aparece en la sección "Próximo Partido")
- Para partidos `proximo`, dejá `IRC_Score` y `Rival_Score` vacíos
- `Localidad`: `Local` o `Visita`

---

### Hoja: `Noticias`

| Fecha | Titulo | Resumen | ImagenURL | Link | Destacada |
|-------|--------|---------|-----------|------|-----------|
| 10/05/2026 | Victoria épica contra Pumas | El equipo se impuso 33-12 en un partido memorable... | https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=600 | # | TRUE |
| 05/05/2026 | Nuevo entrenamiento los sábados | A partir de junio sumamos práctica de scrum los sábados por la mañana. | https://images.unsplash.com/photo-1521537634581-0dced2fee2ef?w=600 | # | FALSE |

**Notas:**
- `Destacada`: `TRUE` para la noticia principal grande, `FALSE` para las secundarias
- `ImagenURL`: URL de una imagen (podés usar Unsplash o subir a Imgur, etc.)
- `Link`: `#` si no tenés URL específica, o el link a la nota completa

---

### Hoja: `Stats`

| Victorias | Derrotas | Empates |
|-----------|----------|---------|
| 8 | 2 | 1 |

**Notas:**
- Estos números aparecen en el Hero del sitio (las estadísticas animadas)

---

### Hoja: `Config`

| Clave | Valor |
|-------|-------|
| whatsapp_num | 5491100000000 |
| email | contacto@inglesrugbyclub.com |
| direccion | Av. San Martín 1240 |
| entrenamiento_dias | Martes y Jueves |
| entrenamiento_horario | 20:00 hs |
| cancha_nombre | Cancha Principal |
| maps_url | https://maps.google.com |
| cal_summary | Ingles Rugby Club vs |
| cal_description | Partido de rugby amateur. ¡Vamos IRC! |

---

## Paso 2: Agregar el Apps Script

1. En tu Google Sheet, andá a **Extensiones → Apps Script**.
2. Borrá el código por defecto (`function myFunction(){}`).
3. Copiá y pegá TODO el código que está en el archivo **`google-apps-script.js`** de esta carpeta.
4. Guardá el proyecto (Ctrl+S o el diskette) y nombralo **"IRC API"**.
5. Hacé clic en **Deploy → New deployment**.
6. En "Select type", elegí **Web app**.
7. Configurá así:
   - **Description**: `IRC API v1`
   - **Execute as**: `Me`
   - **Who has access**: `Anyone`
8. Hacé clic en **Deploy**.
9. Te va a pedir autorización. Dale **Review permissions → Allow**.
10. Copiá la **Web App URL** que te da (se ve así: `https://script.google.com/macros/s/AKfycb.../exec`).

---

## Paso 3: Configurar el sitio web

1. Abrí el archivo `dist/js/main.js`.
2. Buscá esta línea:
   ```js
   const SHEET_API_URL = '';
   ```
3. Pegá tu URL del Web App:
   ```js
   const SHEET_API_URL = 'https://script.google.com/macros/s/AKfycbXXXXXXXX/exec';
   ```
4. Guardá el archivo.
5. Subí todo el contenido de la carpeta `dist/` a **Cloudflare Pages**.

---

## Cómo actualizar los datos

Simplemente editá las celdas en el Google Sheet. **Los cambios se reflejan en el sitio web en tiempo real** (o al recargar la página).

- Agregá filas nuevas en `Fixture` para nuevos partidos.
- Modificá `Estado` de `proximo` a `jugado` y cargá los resultados.
- Agregá noticias en la hoja `Noticias`.
- Actualizá la tabla de posiciones en `Posiciones`.

---

## Solución de problemas

**El sitio no muestra datos:**
- Verificá que la URL del Web App esté bien copiada en `main.js`.
- Abrí la URL del Web App en una pestaña del navegador. Debería mostrar un JSON con los datos.

**CORS errors en la consola:**
- Andá a tu Apps Script, hacé clic en **Deploy → Manage deployments**.
- Asegurate de que diga "Anyone" en el acceso.
- Si cambiás algo en el código del script, tenés que hacer **Deploy → New deployment** de nuevo.

**Los datos no se actualizan:**
- Google Sheets a veces tarda 1-2 minutos en cachear. Esperá un poco y recargá.
- Si el problema persiste, andá a **Deploy → Manage deployments** y hacé una nueva deployment.
