/* ═══════════════════════════════════════════════════════════════════════
   Ingles Rugby Club — Main JS
   Conectado a Google Sheets via Apps Script Web App
═══════════════════════════════════════════════════════════════════════ */

/* ─── CONFIG ───────────────────────────────────────────────────────── */
// ⬇️ PEGA AQUÍ LA URL DE TU WEB APP DE GOOGLE APPS SCRIPT
const SHEET_API_URL = 'https://script.google.com/macros/s/AKfycbwryB6BXEfChbFYd1Cbw83MOHNqTqo44UzUX9QwUiEP7HhKgPibFVpwFSkptWIhBnzW3g/exec';
console.log('[IRC] JS cargado. SHEET_API_URL configurada:', SHEET_API_URL ? 'SI' : 'NO');

/* ─── DATOS LOCALES (carga instantánea) ───────────────────────────── */
const LOCAL_DATA = {
  posiciones: [
    { Posicion: 1, Equipo: 'Trapiales', PJ: 3, PG: 3, PE: 0, PP: 0, PF: 79, PC: 3, Dif: 76, Pts: 15 },
    { Posicion: 2, Equipo: 'Los Troncos', PJ: 3, PG: 2, PE: 0, PP: 1, PF: 41, PC: 3, Dif: 38, Pts: 11 },
    { Posicion: 3, Equipo: 'Lions RC', PJ: 3, PG: 2, PE: 0, PP: 1, PF: 7, PC: 3, Dif: 4, Pts: 11 },
    { Posicion: 4, Equipo: 'IRC', PJ: 3, PG: 1, PE: 0, PP: 2, PF: 2, PC: 3, Dif: -1, Pts: 7 },
    { Posicion: 5, Equipo: 'Mano Rugby', PJ: 3, PG: 1, PE: 0, PP: 2, PF: 2, PC: 48, Dif: -46, Pts: 6 },
    { Posicion: 6, Equipo: 'Halcones', PJ: 2, PG: 1, PE: 0, PP: 1, PF: 1, PC: 19, Dif: -18, Pts: 5 },
    { Posicion: 7, Equipo: 'Costa del Sol', PJ: 2, PG: 1, PE: 0, PP: 1, PF: 0, PC: 13, Dif: -13, Pts: 4 },
    { Posicion: 8, Equipo: 'Old Navy', PJ: 3, PG: 0, PE: 0, PP: 3, PF: 0, PC: 49, Dif: -49, Pts: 0 }
  ],
  fixture: [
    { DiaSemana: 'SAB', DiaNum: 11, Mes: 'ABR', Ano: 2026, Hora: '13:00', Localidad: 'Visita', Rival: 'Trapiales RC', IRC_Score: '22', Rival_Score: '48', Estado: 'jugado', Cancha: 'Complejo Deportivo Las Rosas', Direccion: '', EsDestacado: false },
    { DiaSemana: 'SAB', DiaNum: 25, Mes: 'ABR', Ano: 2026, Hora: '15:00', Localidad: 'Local', Rival: 'Lions RC', IRC_Score: '31', Rival_Score: '33', Estado: 'jugado', Cancha: 'Cancha IRC', Direccion: '', EsDestacado: false },
    { DiaSemana: 'DOM', DiaNum: 10, Mes: 'MAY', Ano: 2026, Hora: '15:00', Localidad: 'Local', Rival: 'Old Navy', IRC_Score: '57', Rival_Score: '30', Estado: 'jugado', Cancha: 'Cancha IRC', Direccion: '', EsDestacado: false },
    { DiaSemana: 'SAB', DiaNum: 16, Mes: 'MAY', Ano: 2026, Hora: '13:00', Localidad: 'Visita', Rival: 'Mano Rugby', IRC_Score: '', Rival_Score: '', Estado: 'proximo', Cancha: 'Estadio Juan Antonio Ríos', Direccion: '', EsDestacado: true },
    { DiaSemana: 'SAB', DiaNum: 30, Mes: 'MAY', Ano: 2026, Hora: '15:00', Localidad: 'Local', Rival: 'Los Troncos', IRC_Score: '', Rival_Score: '', Estado: 'proximo', Cancha: 'Cancha IRC', Direccion: '', EsDestacado: false },
    { DiaSemana: 'SAB', DiaNum: 13, Mes: 'JUN', Ano: 2026, Hora: '16:00', Localidad: 'Visita', Rival: 'Costa del Sol', IRC_Score: '', Rival_Score: '', Estado: 'proximo', Cancha: 'Costa del Sol', Direccion: '', EsDestacado: false },
    { DiaSemana: 'SAB', DiaNum: 20, Mes: 'JUN', Ano: 2026, Hora: '13:00', Localidad: 'Local', Rival: 'Halcones RC', IRC_Score: '', Rival_Score: '', Estado: 'proximo', Cancha: 'Cancha IRC', Direccion: '', EsDestacado: false },
    { DiaSemana: 'DOM', DiaNum: 5, Mes: 'JUL', Ano: 2026, Hora: '15:00', Localidad: 'Local', Rival: 'Trapiales RC', IRC_Score: '', Rival_Score: '', Estado: 'proximo', Cancha: 'Cancha IRC', Direccion: '', EsDestacado: false },
    { DiaSemana: 'DOM', DiaNum: 12, Mes: 'JUL', Ano: 2026, Hora: '00:00', Localidad: 'Visita', Rival: 'Lions RC', IRC_Score: '', Rival_Score: '', Estado: 'proximo', Cancha: 'Cancha Interior Parque Mahuida', Direccion: '', EsDestacado: false },
    { DiaSemana: 'SAB', DiaNum: 1, Mes: 'AGO', Ano: 2026, Hora: '16:00', Localidad: 'Visita', Rival: 'Old Navy', IRC_Score: '', Rival_Score: '', Estado: 'proximo', Cancha: 'Las Salinas', Direccion: '', EsDestacado: false },
    { DiaSemana: 'SAB', DiaNum: 8, Mes: 'AGO', Ano: 2026, Hora: '15:00', Localidad: 'Local', Rival: 'Mano Rugby', IRC_Score: '', Rival_Score: '', Estado: 'proximo', Cancha: 'Cancha IRC', Direccion: '', EsDestacado: false },
    { DiaSemana: 'SAB', DiaNum: 15, Mes: 'AGO', Ano: 2026, Hora: '00:00', Localidad: 'Visita', Rival: 'Los Troncos', IRC_Score: '', Rival_Score: '', Estado: 'proximo', Cancha: 'Tineo Park', Direccion: '', EsDestacado: false },
    { DiaSemana: 'SAB', DiaNum: 5, Mes: 'SEP', Ano: 2026, Hora: '15:00', Localidad: 'Local', Rival: 'Costa del Sol', IRC_Score: '', Rival_Score: '', Estado: 'proximo', Cancha: 'Cancha IRC', Direccion: '', EsDestacado: false },
    { DiaSemana: 'SAB', DiaNum: 12, Mes: 'SEP', Ano: 2026, Hora: '14:00', Localidad: 'Visita', Rival: 'Halcones RC', IRC_Score: '', Rival_Score: '', Estado: 'proximo', Cancha: 'Calle Larga', Direccion: '', EsDestacado: false }
  ],
  stats: [{ Victorias: 1, Derrotas: 2, Empates: 0 }],
  noticias: [
    { Fecha: '10/05/2026', Titulo: 'Preparación intensa para la Fecha 4', Resumen: 'El equipo se prepara para enfrentar a Mano Rugby este sábado. Entrenamientos enfocados en el scrum y la defensa durante toda la semana.', ImagenURL: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=600', Link: '#', Destacada: true },
    { Fecha: '28/04/2026', Titulo: 'Empate agónico contra Lions RC', Resumen: '24-24 en un partido de ida y vuelta. El try del final nos dejó con un punto valioso en casa.', ImagenURL: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=600', Link: '#', Destacada: false },
    { Fecha: '18/04/2026', Titulo: 'Dura derrota ante Trapiales RC', Resumen: 'Caímos 48-22 en el debut. A levantar la cabeza y seguir trabajando para la próxima fecha.', ImagenURL: 'https://images.unsplash.com/photo-1521537634581-0dced2fee2ef?w=600', Link: '#', Destacada: false }
  ],
  config: {
    whatsapp_num: '56900000000',
    email: 'contacto@inglesrugbyclub.com',
    direccion: 'Cancha IRC',
    entrenamiento_dias: 'Martes y Jueves',
    entrenamiento_horario: '20:00 h',
    cancha_nombre: 'Cancha IRC',
    maps_url: 'https://maps.google.com',
    cal_summary: 'Ingles Rugby Club vs',
    cal_description: 'Partido de rugby amateur. ¡Vamos IRC!'
  }
};

const DEFAULT_STATS = { Victorias: 1, Derrotas: 2, Empates: 0 };

const MONTHS_ES = {
  ENE:'01', FEB:'02', MAR:'03', ABR:'04', MAY:'05', JUN:'06',
  JUL:'07', AGO:'08', SEP:'09', OCT:'10', NOV:'11', DIC:'12'
};

/* ─── Helpers: formatear fechas/horas de Google Sheets ───────────── */
function formatSheetTime(value) {
  if (!value) return '15:30';
  const str = String(value).trim();

  // Google Sheets devuelve horas como fechas ISO 1899 (ej: 1899-12-30T17:42:45.000Z)
  // por la fecha base de Excel. Usamos timezone Chile para convertir correctamente.
  if (str.startsWith('1899-12-30') || str.startsWith('1899-12-31')) {
    const d = new Date(str);
    if (!isNaN(d)) {
      return d.toLocaleTimeString('es-CL', {
        timeZone: 'America/Santiago',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    }
  }

  // Formato ISO normal: extraer HH:MM
  if (str.includes('T')) {
    const m = str.match(/T(\d{2}):(\d{2})/);
    if (m) return `${m[1]}:${m[2]}`;
  }

  // Si ya es HH:MM (o HH:MM:SS), devolver HH:MM
  if (/^\d{1,2}:\d{2}/.test(str)) {
    return str.substring(0, 5);
  }

  // Fecha malformateada por script viejo
  if (/^\d{2}\/\d{2}\/\d{4}/.test(str)) {
    console.warn('[IRC] Hora recibida como fecha (script viejo):', str);
    return '15:30';
  }

  return str.substring(0, 5);
}

function formatSheetDate(value) {
  if (!value) return '';
  if (typeof value === 'string' && value.includes('T')) {
    const d = new Date(value);
    if (!isNaN(d)) {
      const dd = String(d.getDate()).padStart(2, '0');
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const yyyy = d.getFullYear();
      return `${dd}/${mm}/${yyyy}`;
    }
  }
  return String(value);
}

/* ─── DEMO DATA (se muestra si el Sheet está vacío) ──────────────── */
const DEMO_DATA = {
  stats: [{ Victorias: 8, Derrotas: 2, Empates: 1 }],
  config: {
    whatsapp_num: '5491100000000',
    email: 'contacto@inglesrugbyclub.com',
    direccion: 'Av. San Martín 1240',
    maps_url: 'https://maps.google.com',
    cal_description: 'Partido de rugby amateur. ¡Vamos IRC!'
  },
  posiciones: [
    { Posicion: 1, Equipo: 'Trapiales', PJ: 3, PG: 3, PE: 0, PP: 0, PF: 79, PC: 3, Dif: 76, Pts: 15 },
    { Posicion: 2, Equipo: 'Los Troncos', PJ: 3, PG: 2, PE: 0, PP: 1, PF: 41, PC: 3, Dif: 38, Pts: 11 },
    { Posicion: 3, Equipo: 'Lions RC', PJ: 3, PG: 2, PE: 0, PP: 1, PF: 7, PC: 3, Dif: 4, Pts: 11 },
    { Posicion: 4, Equipo: 'IRC', PJ: 3, PG: 1, PE: 0, PP: 2, PF: 2, PC: 3, Dif: -1, Pts: 7 },
    { Posicion: 5, Equipo: 'Mano Rugby', PJ: 3, PG: 1, PE: 0, PP: 2, PF: 2, PC: 48, Dif: -46, Pts: 6 },
    { Posicion: 6, Equipo: 'Halcones', PJ: 2, PG: 1, PE: 0, PP: 1, PF: 1, PC: 19, Dif: -18, Pts: 5 },
    { Posicion: 7, Equipo: 'Costa del Sol', PJ: 2, PG: 1, PE: 0, PP: 1, PF: 0, PC: 13, Dif: -13, Pts: 4 },
    { Posicion: 8, Equipo: 'Old Navy', PJ: 3, PG: 0, PE: 0, PP: 3, PF: 0, PC: 49, Dif: -49, Pts: 0 }
  ],
  fixture: [
    { DiaSemana: 'SAB', DiaNum: 11, Mes: 'ABR', Ano: 2026, Hora: '13:00', Localidad: 'Visita', Rival: 'Trapiales RC', IRC_Score: '22', Rival_Score: '48', Estado: 'jugado', Cancha: 'Complejo Deportivo Las Rosas', Direccion: '', EsDestacado: false },
    { DiaSemana: 'SAB', DiaNum: 25, Mes: 'ABR', Ano: 2026, Hora: '15:00', Localidad: 'Local', Rival: 'Lions RC', IRC_Score: '31', Rival_Score: '33', Estado: 'jugado', Cancha: 'Cancha IRC', Direccion: '', EsDestacado: false },
    { DiaSemana: 'DOM', DiaNum: 10, Mes: 'MAY', Ano: 2026, Hora: '15:00', Localidad: 'Local', Rival: 'Old Navy', IRC_Score: '57', Rival_Score: '30', Estado: 'jugado', Cancha: 'Cancha IRC', Direccion: '', EsDestacado: false },
    { DiaSemana: 'SAB', DiaNum: 16, Mes: 'MAY', Ano: 2026, Hora: '13:00', Localidad: 'Visita', Rival: 'Mano Rugby', IRC_Score: '', Rival_Score: '', Estado: 'proximo', Cancha: 'Estadio Juan Antonio Ríos', Direccion: '', EsDestacado: true },
    { DiaSemana: 'SAB', DiaNum: 30, Mes: 'MAY', Ano: 2026, Hora: '15:00', Localidad: 'Local', Rival: 'Los Troncos', IRC_Score: '', Rival_Score: '', Estado: 'proximo', Cancha: 'Cancha IRC', Direccion: '', EsDestacado: false },
    { DiaSemana: 'SAB', DiaNum: 13, Mes: 'JUN', Ano: 2026, Hora: '16:00', Localidad: 'Visita', Rival: 'Costa del Sol', IRC_Score: '', Rival_Score: '', Estado: 'proximo', Cancha: 'Costa del Sol', Direccion: '', EsDestacado: false },
    { DiaSemana: 'SAB', DiaNum: 20, Mes: 'JUN', Ano: 2026, Hora: '13:00', Localidad: 'Local', Rival: 'Halcones RC', IRC_Score: '', Rival_Score: '', Estado: 'proximo', Cancha: 'Cancha IRC', Direccion: '', EsDestacado: false },
    { DiaSemana: 'DOM', DiaNum: 5, Mes: 'JUL', Ano: 2026, Hora: '15:00', Localidad: 'Local', Rival: 'Trapiales RC', IRC_Score: '', Rival_Score: '', Estado: 'proximo', Cancha: 'Cancha IRC', Direccion: '', EsDestacado: false },
    { DiaSemana: 'DOM', DiaNum: 12, Mes: 'JUL', Ano: 2026, Hora: '00:00', Localidad: 'Visita', Rival: 'Lions RC', IRC_Score: '', Rival_Score: '', Estado: 'proximo', Cancha: 'Cancha Interior Parque Mahuida', Direccion: '', EsDestacado: false },
    { DiaSemana: 'SAB', DiaNum: 1, Mes: 'AGO', Ano: 2026, Hora: '16:00', Localidad: 'Visita', Rival: 'Old Navy', IRC_Score: '', Rival_Score: '', Estado: 'proximo', Cancha: 'Las Salinas', Direccion: '', EsDestacado: false },
    { DiaSemana: 'SAB', DiaNum: 8, Mes: 'AGO', Ano: 2026, Hora: '15:00', Localidad: 'Local', Rival: 'Mano Rugby', IRC_Score: '', Rival_Score: '', Estado: 'proximo', Cancha: 'Cancha IRC', Direccion: '', EsDestacado: false },
    { DiaSemana: 'SAB', DiaNum: 15, Mes: 'AGO', Ano: 2026, Hora: '00:00', Localidad: 'Visita', Rival: 'Los Troncos', IRC_Score: '', Rival_Score: '', Estado: 'proximo', Cancha: 'Tineo Park', Direccion: '', EsDestacado: false },
    { DiaSemana: 'SAB', DiaNum: 5, Mes: 'SEP', Ano: 2026, Hora: '15:00', Localidad: 'Local', Rival: 'Costa del Sol', IRC_Score: '', Rival_Score: '', Estado: 'proximo', Cancha: 'Cancha IRC', Direccion: '', EsDestacado: false },
    { DiaSemana: 'SAB', DiaNum: 12, Mes: 'SEP', Ano: 2026, Hora: '14:00', Localidad: 'Visita', Rival: 'Halcones RC', IRC_Score: '', Rival_Score: '', Estado: 'proximo', Cancha: 'Calle Larga', Direccion: '', EsDestacado: false }
  ],
  noticias: [
    { Fecha: '10/05/2026', Titulo: 'Victoria épica contra Pumas', Resumen: 'El equipo se impuso 33-12 en un partido memorable. Gran actuación del forward pack y definición clínica de los backs.', ImagenURL: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=600', Link: '#', Destacada: true },
    { Fecha: '05/05/2026', Titulo: 'Nuevo entrenamiento los sábados', Resumen: 'A partir de junio sumamos práctica de scrum los sábados por la mañana. Abierto a todas las categorías.', ImagenURL: 'https://images.unsplash.com/photo-1521537634581-0dced2fee2ef?w=600', Link: '#', Destacada: false },
    { Fecha: '28/04/2026', Titulo: 'Empate agónico contra Lobos', Resumen: '15-15 en un partido de ida y vuelta. El penal del final nos dejó con un punto valioso de visitante.', ImagenURL: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=600', Link: '#', Destacada: false },
    { Fecha: '15/04/2026', Titulo: 'Triunfo contundente en casa', Resumen: '28-14 contra Potrillos. El mejor partido de la temporada hasta ahora. La defensa fue impenetrable.', ImagenURL: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=600', Link: '#', Destacada: false }
  ]
};

/* ─── Navbar: transparent → solid on scroll ──────────────────────── */
const navbar = document.getElementById('navbar');
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');

window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  navLinks.classList.toggle('open');
  document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
});

navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('open');
    navLinks.classList.remove('open');
    document.body.style.overflow = '';
  });
});

/* ─── Intersection Observer: reveal on scroll ────────────────────── */
const io = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        io.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);

document.querySelectorAll('.reveal').forEach(el => io.observe(el));

/* ─── Stat counter animation ─────────────────────────────────────── */
function animateCounter(el) {
  const target = parseInt(el.dataset.target, 10);
  if (isNaN(target)) return;
  const duration = 1200;
  const start = performance.now();

  // Cancelar animación previa si existe
  if (el._animFrame) cancelAnimationFrame(el._animFrame);

  function update(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(ease * target);
    if (progress < 1) {
      el._animFrame = requestAnimationFrame(update);
    } else {
      el._animFrame = null;
    }
  }

  el._animFrame = requestAnimationFrame(update);
}

const statsObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.querySelectorAll('.hero-stat-num').forEach(animateCounter);
      }
    });
  },
  { threshold: 0.5 }
);

const heroStats = document.querySelector('.hero-stats');
if (heroStats) statsObserver.observe(heroStats);

/* ─── Fixture tabs filter ────────────────────────────────────────── */
function initFixtureTabs() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.tab;
      document.querySelectorAll('.match-card').forEach(card => {
        if (filter === 'todos') {
          card.classList.remove('hidden');
        } else {
          const loc = card.dataset.localidad;
          card.classList.toggle('hidden', loc !== filter);
        }
      });
    });
  });
}
initFixtureTabs();

/* ─── Add to Calendar (.ics download) ───────────────────────────── */
let calData = {
  date: '20260516',
  time: '130000',
  endTime: '150000',
  summary: 'Ingles Rugby Club vs Mano Rugby',
  location: 'Estadio Juan Antonio Ríos',
  description: 'Partido de rugby amateur. ¡Vamos IRC!'
};

document.getElementById('addCalBtn')?.addEventListener('click', (e) => {
  e.preventDefault();
  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Ingles Rugby Club//ES',
    'BEGIN:VEVENT',
    'DTSTART:' + calData.date + 'T' + calData.time,
    'DTEND:' + calData.date + 'T' + calData.endTime,
    'SUMMARY:' + calData.summary,
    'LOCATION:' + calData.location,
    'DESCRIPTION:' + calData.description,
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  const blob = new Blob([ics], { type: 'text/calendar' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'irc-partido.ics';
  a.click();
  URL.revokeObjectURL(url);
});

/* ─── Smooth active nav link on scroll ──────────────────────────── */
const sections = document.querySelectorAll('section[id]');
const navAnchors = document.querySelectorAll('.nav-links a[href^="#"]');

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navAnchors.forEach(a => {
          a.style.color = a.getAttribute('href') === `#${id}`
            ? 'var(--gold)'
            : '';
        });
      }
    });
  },
  { rootMargin: '-40% 0px -55% 0px' }
);

sections.forEach(s => sectionObserver.observe(s));

/* ════════════════════════════════════════════════════════════════════
   GOOGLE SHEETS INTEGRATION + CACHE
═════════════════════════════════════════════════════════════════════ */

const CACHE_KEY = 'irc_data_cache';
const CACHE_META_KEY = 'irc_data_cache_meta';

function saveCache(data) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
    localStorage.setItem(CACHE_META_KEY, JSON.stringify({ savedAt: Date.now() }));
  } catch (e) { /* ignore */ }
}

function loadCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) { /* ignore */ }
  return null;
}

function getInitialData() {
  const cached = loadCache();
  if (cached) {
    console.log('[IRC] Datos cargados desde cache.');
    return cached;
  }
  console.log('[IRC] Datos cargados desde LOCAL_DATA.');
  return LOCAL_DATA;
}

/* ─── fetch con timeout ────────────────────────────────────────────── */
function fetchWithTimeout(url, options = {}, timeout = 5000) {
  return Promise.race([
    fetch(url, options),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Timeout')), timeout)
    )
  ]);
}

async function fetchSheetData() {
  // Siempre retorna datos inmediatos (cache o LOCAL_DATA)
  const initialData = getInitialData();

  // En segundo plano intenta actualizar desde Google Sheets
  if (SHEET_API_URL) {
    fetchWithTimeout(SHEET_API_URL + '?action=all', { redirect: 'follow' }, 5000)
      .then(res => {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
      })
      .then(data => {
        const hasData = (data.posiciones?.length > 0) ||
                        (data.fixture?.length > 0) ||
                        (data.noticias?.length > 0);
        if (!hasData) return;

        // Comparar con lo que ya se está mostrando
        const isDifferent = JSON.stringify(initialData) !== JSON.stringify(data);
        if (isDifferent) {
          console.log('[IRC] Datos de Sheets cambiaron. Actualizando página...');
          saveCache(data);
          renderAll(data);
        } else {
          console.log('[IRC] Datos de Sheets sin cambios.');
        }
      })
      .catch(err => {
        console.error('[IRC] Sheets no disponible:', err.message);
      });
  }

  return initialData;
}

function renderAll(data) {
  renderStats(data);
  renderConfig(data);
  renderProximo(data);
  renderPosiciones(data);
  renderFixture(data);
  renderNoticias(data);
}

/* ─── Render Stats ───────────────────────────────────────────────── */
function renderStats(data) {
  const stats = data?.stats?.[0] || DEFAULT_STATS;
  const v = parseInt(stats.Victorias ?? stats.victorias ?? DEFAULT_STATS.Victorias, 10);
  const d = parseInt(stats.Derrotas ?? stats.derrotas ?? DEFAULT_STATS.Derrotas, 10);
  const e = parseInt(stats.Empates ?? stats.empates ?? DEFAULT_STATS.Empates, 10);

  const elV = document.getElementById('statVictorias');
  const elD = document.getElementById('statDerrotas');
  const elE = document.getElementById('statEmpates');

  if (elV) { elV.dataset.target = v; animateCounter(elV); }
  if (elD) { elD.dataset.target = d; animateCounter(elD); }
  if (elE) { elE.dataset.target = e; animateCounter(elE); }
}

/* ─── Render Config ──────────────────────────────────────────────── */
function renderConfig(data) {
  const cfg = data?.config || {};

  const wa = String(cfg.whatsapp_num || '5491100000000');
  const email = cfg.email || 'contacto@inglesrugbyclub.com';
  const dir = cfg.direccion || 'Av. San Martín 1240';
  const maps = cfg.maps_url || 'https://maps.google.com';

  const waMsg = 'Hola!%20Me%20interesa%20el%20Ingles%20Rugby%20Club';
  const waLink = `https://wa.me/${wa}?text=${waMsg}`;

  const btnWa = document.getElementById('btnWhatsapp');
  if (btnWa) btnWa.href = waLink;

  const waFloat = document.getElementById('whatsappFloat');
  if (waFloat) waFloat.href = waLink;

  const btnEmail = document.getElementById('btnEmail');
  if (btnEmail) { btnEmail.href = `mailto:${email}`; btnEmail.textContent = email; }

  const footerEmail = document.getElementById('footerEmail');
  if (footerEmail) { footerEmail.href = `mailto:${email}`; footerEmail.textContent = email; }

  const footerWa = document.getElementById('footerWhatsapp');
  if (footerWa) footerWa.href = waLink;

  const footerDir = document.getElementById('footerDireccion');
  if (footerDir) footerDir.textContent = dir;

  const mapsLink = document.getElementById('proxMapsLink');
  if (mapsLink) mapsLink.href = maps;
}

/* ─── Render Próximo Partido ─────────────────────────────────────── */
function renderProximo(data) {
  const fixture = data?.fixture || [];
  const cfg = data?.config || {};

  // Buscar el partido destacado o el primer próximo
  let partido = fixture.find(p => p.EsDestacado === true || p.EsDestacado === 'TRUE');
  if (!partido) {
    partido = fixture.find(p => {
      const est = String(p.Estado || '').toLowerCase();
      return est === 'proximo';
    });
  }

  if (!partido) return; // Dejar el HTML estático como fallback

  const diaSemana = partido.DiaSemana || 'SAB';
  const diaNum = partido.DiaNum || '24';
  const mes = partido.Mes || 'MAY';
  const ano = partido.Ano || '2026';
  const hora = formatSheetTime(partido.Hora) || '15:30';
  const localidad = partido.Localidad || 'Visita';
  const rival = partido.Rival || 'Los Halcones';
  const cancha = partido.Cancha || 'Cancha Principal';
  const direccion = partido.Direccion || 'Av. San Martín 1240';

  // Badge del rival (iniciales)
  const badge = rival.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();

  document.getElementById('proxDiaSemana').textContent = diaSemana;
  document.getElementById('proxDiaNum').textContent = diaNum;
  document.getElementById('proxMes').textContent = `${mes} ${ano}`;
  document.getElementById('proxHora').textContent = `${hora} h`;
  document.getElementById('proxRivalBadge').textContent = badge;
  document.getElementById('proxRival').textContent = rival;
  document.getElementById('proxLocalidad').textContent = localidad.toUpperCase();
  document.getElementById('proxCancha').textContent = `${cancha} · ${direccion}`;
  document.getElementById('proxInfoExtra').textContent = `${hora} h — Entrada libre y gratuita`;

  // Actualizar calendario
  const mm = MONTHS_ES[mes.toUpperCase()] || '05';
  const dd = String(diaNum).padStart(2, '0');
  calData.date = `${ano}${mm}${dd}`;
  calData.time = hora.replace(':', '') + '00';
  // End time = +2h
  const [h, m] = hora.split(':').map(Number);
  const endH = String(h + 2).padStart(2, '0');
  calData.endTime = `${endH}${String(m).padStart(2, '0')}00`;
  calData.summary = `Ingles Rugby Club vs ${rival}`;
  calData.location = `${cancha}, ${direccion}`;
  calData.description = cfg.cal_description || 'Partido de rugby amateur. ¡Vamos IRC!';
}

/* ─── Render Posiciones ──────────────────────────────────────────── */
function renderPosiciones(data) {
  const posiciones = data?.posiciones || [];
  const loading = document.getElementById('standingsLoading');
  const table = document.getElementById('standingsTable');
  const tbody = document.getElementById('standingsBody');
  const error = document.getElementById('standingsError');

  if (!posiciones.length) {
    loading.style.display = 'none';
    error.style.display = 'block';
    return;
  }

  tbody.innerHTML = '';
  posiciones.forEach((row, i) => {
    const pos = row.Posicion || row.posicion || (i + 1);
    const team = row.Equipo || row.equipo || '-';
    const pj = row.PJ || row.pj || 0;
    const pg = row.PG || row.pg || 0;
    const pe = row.PE || row.pe || 0;
    const pp = row.PP || row.pp || 0;
    const pf = row.PF || row.pf || 0;
    const pc = row.PC || row.pc || 0;
    const dif = row.Dif || row.dif || 0;
    const pts = row.Pts || row.pts || 0;

    const isIRC = String(team).toLowerCase().includes('irc');
    const tr = document.createElement('tr');
    if (isIRC) tr.classList.add('highlight-row');
    if (pos === 1 || pos === '1') tr.classList.add('top-1');
    if (pos === 2 || pos === '2') tr.classList.add('top-2');
    if (pos === 3 || pos === '3') tr.classList.add('top-3');

    let posBadge = '';
    if (pos === 1 || pos === '1') posBadge = '<span class="pos-badge gold">1</span>';
    else if (pos === 2 || pos === '2') posBadge = '<span class="pos-badge silver">2</span>';
    else if (pos === 3 || pos === '3') posBadge = '<span class="pos-badge bronze">3</span>';
    else posBadge = `<span class="pos-badge">${pos}</span>`;

    tr.innerHTML = `
      <td class="col-pos" data-label="Pos">${posBadge}</td>
      <td class="col-team" data-label="Equipo">${team}</td>
      <td class="col-num" data-label="PJ">${pj}</td>
      <td class="col-num" data-label="PG">${pg}</td>
      <td class="col-num" data-label="PE">${pe}</td>
      <td class="col-num" data-label="PP">${pp}</td>
      <td class="col-num hide-mobile" data-label="PF">${pf}</td>
      <td class="col-num" data-label="Dif">${dif > 0 ? '+' + dif : dif}</td>
      <td class="col-pts" data-label="Pts"><span class="pts-value">${pts}</span></td>
    `;
    tbody.appendChild(tr);
  });

  loading.style.display = 'none';
  table.style.display = 'block';
}

/* ─── Render Fixture ─────────────────────────────────────────────── */
function renderFixture(data) {
  const fixture = data?.fixture || [];
  const loading = document.getElementById('fixtureLoading');
  const grid = document.getElementById('fixtureGrid');
  const error = document.getElementById('fixtureError');

  if (!fixture.length) {
    loading.style.display = 'none';
    error.style.display = 'block';
    return;
  }

  grid.innerHTML = '';

  fixture.forEach(match => {
    const diaSemana = match.DiaSemana || 'SAB';
    const diaNum = match.DiaNum || '00';
    const mes = match.Mes || 'MES';
    const localidad = String(match.Localidad || 'local').toLowerCase();
    const rival = match.Rival || 'Rival';
    const estado = String(match.Estado || 'proximo').toLowerCase();
    const ircScore = match.IRC_Score;
    const rivalScore = match.Rival_Score;
    const hora = formatSheetTime(match.Hora) || '15:30';
    const isNext = match.EsDestacado === true || match.EsDestacado === 'TRUE';

    const card = document.createElement('div');
    card.className = `match-card ${estado === 'jugado' ? (ircScore > rivalScore ? 'win' : ircScore < rivalScore ? 'loss' : 'draw') : 'upcoming'} ${isNext ? 'next' : ''}`;
    card.dataset.localidad = localidad === 'visita' ? 'visita' : 'local';

    let resultHtml = '';
    if (estado === 'jugado') {
      const badge = ircScore > rivalScore ? 'V' : ircScore < rivalScore ? 'D' : 'E';
      const badgeClass = ircScore > rivalScore ? 'win-badge' : ircScore < rivalScore ? 'loss-badge' : 'draw-badge';
      card.classList.add(ircScore > rivalScore ? 'win' : ircScore < rivalScore ? 'loss' : 'draw');
      resultHtml = `
        <div class="card-result ${ircScore > rivalScore ? 'win-result' : ircScore < rivalScore ? 'loss-result' : 'draw-result'}">
          <span class="result-score">${ircScore} – ${rivalScore}</span>
          <span class="result-badge ${badgeClass}">${badge}</span>
        </div>
      `;
    } else {
      resultHtml = `
        <div class="card-result upcoming-result">
          <span class="upcoming-time">${hora} h</span>
        </div>
      `;
    }

    card.innerHTML = `
      <div class="card-date">
        <span class="card-day">${diaSemana}</span>
        <span class="card-daynum">${diaNum}</span>
        <span class="card-month">${mes}</span>
      </div>
      <div class="card-body">
        <span class="card-location ${localidad}">${localidad === 'visita' ? '✈ Visita' : '🏠 Local'}</span>
        <span class="card-rival">vs. ${rival}</span>
      </div>
      ${resultHtml}
    `;

    grid.appendChild(card);
  });

  loading.style.display = 'none';
  grid.style.display = 'grid';

  // Re-inicializar tabs porque los elementos cambiaron
  initFixtureTabs();
}

/* ─── Render Noticias ────────────────────────────────────────────── */
function renderNoticias(data) {
  const noticias = data?.noticias || [];
  const loading = document.getElementById('newsLoading');
  const grid = document.getElementById('newsGrid');
  const error = document.getElementById('newsError');

  if (!noticias.length) {
    loading.style.display = 'none';
    error.style.display = 'block';
    return;
  }

  grid.innerHTML = '';

  noticias.forEach((n, i) => {
    const fecha = formatSheetDate(n.Fecha || n.fecha || '');
    const titulo = n.Titulo || n.titulo || 'Sin título';
    const resumen = n.Resumen || n.resumen || '';
    const imagen = n.ImagenURL || n.imagenURL || n.imagenurl || n.ImagenUrl || '';
    const link = n.Link || n.link || '#';
    const destacada = n.Destacada === true || n.Destacada === 'TRUE';

    const card = document.createElement('div');
    card.className = 'news-card reveal';
    if (destacada && i === 0) card.classList.add('featured');
    card.style.setProperty('--delay', `${i * 0.1}s`);

    card.innerHTML = `
      ${imagen ? `<div class="news-image" style="background-image: url('${imagen}')"></div>` : ''}
      <div class="news-body">
        <span class="news-date">${fecha}</span>
        <h3 class="news-title">${titulo}</h3>
        <p class="news-excerpt">${resumen}</p>
        <a href="${link}" class="news-link" ${link !== '#' ? 'target="_blank"' : ''}>Leer más</a>
      </div>
    `;

    grid.appendChild(card);
  });

  loading.style.display = 'none';
  grid.style.display = 'grid';

  // Observar nuevos elementos reveal
  grid.querySelectorAll('.reveal').forEach(el => io.observe(el));
}

/* ─── Main Load ──────────────────────────────────────────────────── */
async function loadAllData() {
  console.log('[IRC] loadAllData iniciado...');
  try {
    const data = await fetchSheetData();
    renderAll(data);
    console.log('[IRC] Todo renderizado OK.');
  } catch (err) {
    console.error('[IRC] ERROR en loadAllData:', err);
  }
}

// Cargar datos cuando el DOM esté listo
console.log('[IRC] DOM readyState:', document.readyState);
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadAllData);
} else {
  loadAllData();
}
