# Manual de Usuario — Ingles Rugby Club

## Sitio web: https://www.inglesrugbyclub.cl

---

## Acceso al Panel de Administración

**URL:** https://www.inglesrugbyclub.cl/admin/

### Para entrar al panel:

1. Andá a https://www.inglesrugbyclub.cl/admin/
2. Ingresá la **contraseña de administrador** (la tiene el encargado del sitio)
3. Hacé clic en **Entrar**

> La sesión se mantiene activa mientras no cierres la pestaña del navegador.

---

## Secciones del Panel de Admin

Una vez dentro, vas a ver pestañas para editar cada parte del sitio:

### 1. Fixture
- Agregá, editá o eliminá partidos
- Campos: Fecha, Hora, Rival, Lugar, Resultado, Estado (próximo/jugado), Destacado
- **Solo un partido puede estar destacado** (aparece en la pantalla principal)
- Si el estado es **"jugado"**, se muestra el resultado
- Si el estado es **"proximo"**, se muestra la hora

### 2. Posiciones
- Tabla de posiciones de la liga
- Campos: Equipo, PJ (partidos jugados), PG (partidos ganados), PE (empates), PP (perdidos), PF (puntos a favor), PC (puntos en contra), Dif (diferencia), BP (bonus), Pts (puntos totales)

### 3. Noticias
- Agregá noticias con título, fecha, extracto, contenido e imagen
- Podés usar URLs de imagen directas o links de Google Drive

### 4. Stats
- Estadísticas del equipo: Partidos jugados, ganados, empatados, perdidos, tries a favor, tries en contra

### 5. Plantel
- **Cuerpo técnico:** Head Coach, y lista de staff
- **Jugadores:** Nombre, posición, número, foto, categoría (plantel titular o reserva)
- Para las fotos podés usar URLs directas o links de Google Drive

### 6. Galería
- Agregá imágenes para la galería del sitio
- Funciona con URLs normales o links compartidos de Google Drive (se convierten automáticamente)

### 7. Institución
- **Historia del club:** Texto libre con la historia
- **Directorio:** Miembros del directorio con nombre, cargo, email y foto

### 8. Sponsors
- Logos de los sponsors del club
- URLs de imagen directas o Google Drive

### 9. Configuración
- Datos generales del club: nombre, email, teléfono, dirección, redes sociales, año de fundación, etc.

---

## Cómo Guardar los Cambios

1. Editá los campos que necesites en cada pestaña
2. Hacé clic en el botón **💾 Guardar todos los cambios** (arriba a la derecha)
3. Esperá a que aparezca el mensaje de confirmación
4. Los cambios se reflejan automáticamente en el sitio web (puede tardar 1-2 minutos)

> **Importante:** Los cambios se guardan directamente en el servidor. No es necesario hacer nada más.

---

## Cómo Usar Imágenes de Google Drive

Si querés usar una imagen de Google Drive:

1. Andá a Google Drive, hacé clic derecho en la imagen → **Compartir** → **Copiar link**
2. El link se ve así: `https://drive.google.com/file/d/ABC123/view`
3. Pegá ese link directamente en el campo de imagen
4. El sistema convierte automáticamente el link al formato correcto

---

## Estructura del Sitio Web

El sitio tiene las siguientes secciones públicas:

| Sección | Descripción |
|---------|-------------|
| **Inicio / Hero** | Pantalla principal con logo y nombre del club |
| **Próximo Partido** | Muestra el partido destacado del fixture |
| **Posiciones** | Tabla de posiciones de la liga |
| **Fixture** | Lista completa de partidos |
| **Noticias** | Novedades del club |
| **Plantel** | Jugadores y cuerpo técnico |
| **Galería** | Fotos del club |
| **Institución** | Historia y directorio |
| **Únete** | Formulario de contacto |
| **Series Menores** | Página aparte (link en el menú) |

---

## Series Menores

Hay una página separada para series menores:
**URL:** https://www.inglesrugbyclub.cl/Series%20menores.html

Esta página se edita directamente como archivo HTML (requiere conocimientos técnicos).

---

## Datos Técnicos

- **Hosting:** Cloudflare (sitio 100% estático, carga rápida)
- **Dominio:** www.inglesrugbyclub.cl
- **Repositorio:** GitHub (backup automático de todos los datos)
- **Panel de admin:** Protegido con contraseña

---

## Contacto para Soporte

Si tenés algún problema con el sitio o el panel de admin, contactá a la persona encargada del desarrollo.
