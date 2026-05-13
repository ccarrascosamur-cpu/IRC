/* ═══════════════════════════════════════════════════════════════════════
   Ingles Rugby Club — Main JS
   Datos locales vía JSON (administrables con Decap CMS)
═══════════════════════════════════════════════════════════════════════ */

const DEFAULT_STATS = { Victorias: 1, Derrotas: 2, Empates: 0 };

const MONTHS_ES = {
  ENE:'01', FEB:'02', MAR:'03', ABR:'04', MAY:'05', JUN:'06',
  JUL:'07', AGO:'08', SEP:'09', OCT:'10', NOV:'11', DIC:'12'
};

/* ─── Helpers: formatear fechas/horas ────────────────────────────── */
function formatSheetTime(value) {
  if (!value) return '15:30';
  const str = String(value).trim();

  // JSON locales ya vienen como HH:MM
  if (/^\d{1,2}:\d{2}/.test(str)) {
    return str.substring(0, 5);
  }

  // Fallback ISO
  if (str.includes('T')) {
    const m = str.match(/T(\d{2}):(\d{2})/);
    if (m) return `${m[1]}:${m[2]}`;
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

/* ─── Carga de datos locales (JSON) ──────────────────────────────── */
async function loadData() {
  const files = {
    posiciones: 'data/posiciones.json',
    fixture: 'data/fixture.json',
    stats: 'data/stats.json',
    noticias: 'data/noticias.json',
    config: 'data/config.json'
  };

  const data = {};
  await Promise.all(
    Object.entries(files).map(async ([key, path]) => {
      try {
        const res = await fetch(path);
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const raw = await res.json();
        // Decap CMS guarda objetos { key: [...] }; también soportamos arrays planos
        data[key] = Array.isArray(raw) ? raw : (raw[key] || raw);
      } catch (err) {
        console.warn(`[IRC] No se pudo cargar ${path}:`, err.message);
        data[key] = key === 'stats' ? [DEFAULT_STATS] : (key === 'config' ? {} : []);
      }
    })
  );

  return data;
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

  const wa = String(cfg.whatsapp_num || '56900000000');
  const email = cfg.email || 'contacto@inglesrugbyclub.com';
  const dir = cfg.direccion || 'Cancha IRC';
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

  let partido = fixture.find(p => p.EsDestacado === true || p.EsDestacado === 'TRUE');
  if (!partido) {
    partido = fixture.find(p => {
      const est = String(p.Estado || '').toLowerCase();
      return est === 'proximo';
    });
  }

  if (!partido) return;

  const diaSemana = partido.DiaSemana || 'SAB';
  const diaNum = partido.DiaNum || '24';
  const mes = partido.Mes || 'MAY';
  const ano = partido.Ano || '2026';
  const hora = formatSheetTime(partido.Hora) || '15:30';
  const localidad = partido.Localidad || 'Visita';
  const rival = partido.Rival || 'Los Halcones';
  const cancha = partido.Cancha || 'Cancha Principal';
  const direccion = partido.Direccion || '';

  const badge = rival.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();

  document.getElementById('proxDiaSemana').textContent = diaSemana;
  document.getElementById('proxDiaNum').textContent = diaNum;
  document.getElementById('proxMes').textContent = `${mes} ${ano}`;
  document.getElementById('proxHora').textContent = `${hora} h`;
  document.getElementById('proxRivalBadge').textContent = badge;
  document.getElementById('proxRival').textContent = rival;
  document.getElementById('proxLocalidad').textContent = localidad.toUpperCase();
  document.getElementById('proxCancha').textContent = `${cancha}${direccion ? ' · ' + direccion : ''}`;
  document.getElementById('proxInfoExtra').textContent = `${hora} h — Entrada libre y gratuita`;

  const mm = MONTHS_ES[mes.toUpperCase()] || '05';
  const dd = String(diaNum).padStart(2, '0');
  calData.date = `${ano}${mm}${dd}`;
  calData.time = hora.replace(':', '') + '00';
  const [h, m] = hora.split(':').map(Number);
  const endH = String(h + 2).padStart(2, '0');
  calData.endTime = `${endH}${String(m).padStart(2, '0')}00`;
  calData.summary = `Ingles Rugby Club vs ${rival}`;
  calData.location = `${cancha}${direccion ? ', ' + direccion : ''}`;
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
    if (loading) loading.style.display = 'none';
    if (error) error.style.display = 'block';
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
    if (loading) loading.style.display = 'none';
    if (error) error.style.display = 'block';
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

  initFixtureTabs();
}

/* ─── Render Noticias ────────────────────────────────────────────── */
function renderNoticias(data) {
  const noticias = data?.noticias || [];
  const loading = document.getElementById('newsLoading');
  const grid = document.getElementById('newsGrid');
  const error = document.getElementById('newsError');

  if (!noticias.length) {
    if (loading) loading.style.display = 'none';
    if (error) error.style.display = 'block';
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

  grid.querySelectorAll('.reveal').forEach(el => io.observe(el));
}


/* ════════════════════════════════════════════════════════════════════
   UI & INTERACTIONS
═════════════════════════════════════════════════════════════════════ */

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

/* ─── Main Load ──────────────────────────────────────────────────── */
async function loadAllData() {
  console.log('[IRC] Cargando datos locales...');
  try {
    const data = await loadData();
    renderAll(data);
    console.log('[IRC] Todo renderizado OK.');
  } catch (err) {
    console.error('[IRC] ERROR en loadAllData:', err);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadAllData);
} else {
  loadAllData();
}
