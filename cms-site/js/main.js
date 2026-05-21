/* ═══════════════════════════════════════════════════════════════════════
   Ingles Rugby Club — Main JS
   Datos locales vía JSON (administrables con Decap CMS)
═══════════════════════════════════════════════════════════════════════ */

const DEFAULT_STATS = { Victorias: 1, Derrotas: 2, Empates: 0 };

const MONTHS_ES = {
  ENE:'01', FEB:'02', MAR:'03', ABR:'04', MAY:'05', JUN:'06',
  JUL:'07', AGO:'08', SEP:'09', OCT:'10', NOV:'11', DIC:'12'
};

function extractDriveFileId(value) {
  const str = String(value || '').trim();
  if (!str) return '';

  const patterns = [
    /drive\.google\.com\/file\/d\/([^/?#]+)/i,
    /drive\.google\.com\/open\?id=([^&#]+)/i,
    /drive\.google\.com\/uc\?(?:[^#]*&)?id=([^&#]+)/i,
    /drive\.google\.com\/thumbnail\?(?:[^#]*&)?id=([^&#]+)/i,
    /lh3\.googleusercontent\.com\/d\/([^=?&#/]+)/i
  ];

  for (const pattern of patterns) {
    const match = str.match(pattern);
    if (match) return match[1];
  }

  return '';
}

function normalizeImageUrl(value) {
  const str = String(value || '').trim();
  if (!str) return '';

  const driveFileId = extractDriveFileId(str);
  if (driveFileId) {
    // `lh3.googleusercontent.com` is more reliable than the standard Drive share URL
    // for direct image embedding in CSS background-image and <img>.
    return `https://lh3.googleusercontent.com/d/${driveFileId}`;
  }

  return str;
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

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
  const nocache = `?t=${Date.now()}`;
  const files = {
    posiciones: 'api/data/posiciones.json' + nocache,
    fixture: 'api/data/fixture.json' + nocache,
    stats: 'api/data/stats.json' + nocache,
    noticias: 'api/data/noticias.json' + nocache,
    config: 'api/data/config.json' + nocache,
    jugadores: 'api/data/jugadores.json' + nocache,
    galeria: 'api/data/galeria.json' + nocache,
    institucion: 'api/data/institucion.json' + nocache,
    sponsors: 'api/data/sponsors.json' + nocache
  };

  const data = {};
  await Promise.all(
    Object.entries(files).map(async ([key, path]) => {
      try {
        const res = await fetch(path);
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const raw = await res.json();
        if (key === 'jugadores') {
          data.jugadores = raw.jugadores || [];
          data.headCoach = raw.headCoach || null;
          data.staff = raw.staff || [];
        } else if (key === 'institucion') {
          data.historia = raw.historia || null;
          data.directorio = raw.directorio || [];
        } else {
          // Decap CMS guarda objetos { key: [...] }; también soportamos arrays planos
          data[key] = Array.isArray(raw) ? raw : (raw[key] || raw);
        }
      } catch (err) {
        console.warn(`[IRC] No se pudo cargar ${path}:`, err.message);
        if (key === 'jugadores') {
          data.jugadores = [];
          data.headCoach = null;
          data.staff = [];
        } else if (key === 'institucion') {
          data.historia = null;
          data.directorio = [];
        } else {
          data[key] = key === 'stats' ? [DEFAULT_STATS] : (key === 'config' ? {} : []);
        }
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
  renderPlantel(data);
  renderGaleria(data);
  renderInstitucion(data);
  renderSponsors(data);
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
  if (footerDir) {
    footerDir.textContent = dir;
    footerDir.href = maps;
    footerDir.target = '_blank';
  }

  const uneteCanchaLink = document.getElementById('uneteCanchaLink');
  if (uneteCanchaLink) {
    uneteCanchaLink.href = maps;
    uneteCanchaLink.textContent = `Campo de Juego: ${cfg.cancha_nombre || dir}`;
    uneteCanchaLink.target = '_blank';
  }

  const mapsLink = document.getElementById('proxMapsLink');
  if (mapsLink) mapsLink.href = maps;

  const mensualidadLink = document.getElementById('footerMensualidad');
  const mensualidadUrl = cfg.mensualidad_url || '';
  const mensualidadLabel = cfg.mensualidad_label || 'Pagar mensualidad';
  if (mensualidadLink) {
    if (mensualidadUrl) {
      mensualidadLink.href = mensualidadUrl;
      mensualidadLink.textContent = mensualidadLabel;
      mensualidadLink.target = '_blank';
      mensualidadLink.style.display = '';
    } else {
      mensualidadLink.removeAttribute('href');
      mensualidadLink.textContent = '';
      mensualidadLink.style.display = 'none';
    }
  }

  /* ─── Hero video ───────────────────────────────────────────────── */
  const heroVideo = document.getElementById('heroVideo');
  if (heroVideo) {
    const videoUrl = cfg.hero_video_url || '';
    if (videoUrl) {
      const vimeoId = extractVimeoId(videoUrl);
      if (vimeoId) {
        heroVideo.src = `https://player.vimeo.com/video/${vimeoId}?autoplay=1&muted=1&loop=1&background=1&title=0&byline=0&portrait=0&controls=0`;
      } else {
        heroVideo.src = videoUrl;
      }
      heroVideo.style.display = '';
    } else {
      heroVideo.src = '';
      heroVideo.style.display = 'none';
    }
  }
}

function extractVimeoId(url) {
  if (!url) return '';
  const m = String(url).match(/vimeo\.com\/(\d+)/);
  return m ? m[1] : '';
}

/* ─── Render Próximo Partido ─────────────────────────────────────── */
function renderProximo(data) {
  const fixture = data?.fixture || [];
  const cfg = data?.config || {};

  let partido = fixture.find(p => p.EsDestacado === true || p.EsDestacado === 'TRUE');
  if (!partido) {
    partido = fixture.find(p => {
      const est = String(p.Estado || '').trim().toLowerCase();
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

  const isLocal = String(localidad).toLowerCase() === 'local';

  document.getElementById('proxDiaSemana').textContent = diaSemana;
  document.getElementById('proxDiaNum').textContent = diaNum;
  document.getElementById('proxMes').textContent = `${mes} ${ano}`;
  document.getElementById('proxHora').textContent = `${hora} h`;
  document.getElementById('proxRivalBadge').textContent = badge;
  document.getElementById('proxRival').textContent = rival;
  document.getElementById('proxLocalidad').textContent = isLocal ? 'VISITANTE' : 'LOCAL';
  document.getElementById('proxHomeTag').textContent = isLocal ? 'LOCAL' : 'VISITANTE';
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
  const posiciones = [...(data?.posiciones || [])].sort((a, b) => {
    const posA = Number(a?.Posicion ?? a?.posicion ?? Number.MAX_SAFE_INTEGER);
    const posB = Number(b?.Posicion ?? b?.posicion ?? Number.MAX_SAFE_INTEGER);
    return posA - posB;
  });
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

  fixture.forEach((match, index) => {
    const diaSemana = match.DiaSemana || 'SAB';
    const diaNum = match.DiaNum || '00';
    const mes = match.Mes || 'MES';
    const localidad = String(match.Localidad || 'local').toLowerCase();
    const rival = match.Rival || 'Rival';
    const estado = String(match.Estado || 'proximo').trim().toLowerCase();
    const ircScore = match.IRC_Score;
    const rivalScore = match.Rival_Score;
    const hora = formatSheetTime(match.Hora) || '15:30';
    const isNext = match.EsDestacado === true || match.EsDestacado === 'TRUE';

    const card = document.createElement('div');
    card.className = `match-card ${estado === 'jugado' ? (ircScore > rivalScore ? 'win' : ircScore < rivalScore ? 'loss' : 'draw') : 'upcoming'} ${isNext ? 'next' : ''}`;

    // Limitar a 6 partidos visibles inicialmente
    if (index >= 6) card.classList.add('collapsed');
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

  // Botón "Ver más" si hay más de 6 partidos
  if (fixture.length > 6) {
    const btnWrap = document.createElement('div');
    btnWrap.className = 'fixture-expand-wrap';
    btnWrap.innerHTML = `<button class="btn btn-outline fixture-expand-btn" id="fixtureExpandBtn">Ver más partidos (${fixture.length - 6}) ↓</button>`;
    grid.parentNode.insertBefore(btnWrap, grid.nextSibling);

    document.getElementById('fixtureExpandBtn').addEventListener('click', function () {
      grid.querySelectorAll('.match-card.collapsed').forEach(c => {
        c.classList.remove('collapsed');
        c.classList.add('revealed');
      });
      this.style.display = 'none';
    });
  }

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
    const imagen = normalizeImageUrl(n.ImagenURL || n.imagenURL || n.imagenurl || n.ImagenUrl || '');
    const link = n.Link || n.link || '#';
    const destacada = n.Destacada === true || n.Destacada === 'TRUE';

    const card = document.createElement('div');
    card.className = 'news-card reveal';
    if (destacada && i === 0) card.classList.add('featured');
    card.style.setProperty('--delay', `${i * 0.1}s`);

    const MAX_CHARS = 600;
    const needsTruncate = resumen.length > MAX_CHARS;
    const displayText = needsTruncate ? resumen.slice(0, MAX_CHARS) + '…' : resumen;
    const cardId = `news-card-${i}`;

    card.innerHTML = `
      ${imagen ? `<div class="news-image" style="background-image: url('${imagen}')"></div>` : ''}
      <div class="news-body">
        <span class="news-date">${fecha}</span>
        <h3 class="news-title">${titulo}</h3>
        <p class="news-excerpt" id="${cardId}-text">${displayText}</p>
        ${needsTruncate ? `<button class="news-expand" data-target="${cardId}-text" data-full="${escapeHtml(resumen)}" data-short="${escapeHtml(displayText)}">Ver más</button>` : ''}
        ${link && link !== '#' ? `<a href="${link}" class="news-link" target="_blank" rel="noopener">🔗 Ver fuente</a>` : ''}
      </div>
    `;

    grid.appendChild(card);
  });

  loading.style.display = 'none';
  grid.style.display = 'grid';

  grid.querySelectorAll('.reveal').forEach(el => io.observe(el));

  // Expand/collapse news text
  grid.querySelectorAll('.news-expand').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.dataset.target;
      const p = document.getElementById(targetId);
      if (!p) return;
      const isExpanded = btn.dataset.expanded === 'true';
      if (isExpanded) {
        p.textContent = btn.dataset.short;
        btn.textContent = 'Ver más';
        btn.dataset.expanded = 'false';
      } else {
        p.textContent = btn.dataset.full;
        btn.textContent = 'Ver menos';
        btn.dataset.expanded = 'true';
      }
    });
  });
}

/* ─── Render Plantel ─────────────────────────────────────────────── */
function renderPlantel(data) {
  const grid = document.getElementById('plantelGrid');
  const staffGrid = document.getElementById('staffGrid');
  if (!grid || !staffGrid) return;

  const jugadores = data?.jugadores || [];
  const headCoach = data?.headCoach;
  const staff = data?.staff || [];
  grid.innerHTML = '';
  staffGrid.innerHTML = '';

  if (headCoach?.Nombre) {
    const coachTitle = headCoach.Nombre && headCoach.Nombre !== headCoach.Cargo
      ? headCoach.Nombre
      : (headCoach.Cargo || 'Head Coach');
    const coachSubtitle = headCoach.Nombre && headCoach.Nombre !== headCoach.Cargo
      ? (headCoach.Cargo || 'Head Coach')
      : '';
    const coachRawFoto = headCoach.FotoURL || '';
    const coachFoto = coachRawFoto && coachRawFoto !== 'undefined' ? normalizeImageUrl(coachRawFoto) : '';
    const coachCard = document.createElement('article');
    coachCard.className = 'player-card reveal';
    coachCard.style.setProperty('--av-color', '#c49b00');
    coachCard.innerHTML = `
      ${coachFoto ? `<div class="player-avatar" style="background-image:url('${coachFoto}');background-size:cover;background-position:center;color:transparent">HC</div>` : `<div class="player-avatar">HC</div>`}
      <div class="player-info">
        <div class="player-name">${coachTitle}</div>
        ${coachSubtitle ? `<div class="player-pos">${coachSubtitle}</div>` : ''}
      </div>
    `;
    staffGrid.appendChild(coachCard);
  }

  staff.forEach((member) => {
    const initials = String(member.Cargo || 'ST')
      .split(' ')
      .filter(Boolean)
      .map(part => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
    const staffTitle = member.Nombre && member.Nombre !== member.Cargo
      ? member.Nombre
      : (member.Cargo || 'Staff');
    const staffSubtitle = member.Nombre && member.Nombre !== member.Cargo
      ? (member.Cargo || '')
      : '';
    const staffRawFoto = member.FotoURL || '';
    const staffFoto = staffRawFoto && staffRawFoto !== 'undefined' ? normalizeImageUrl(staffRawFoto) : '';

    const card = document.createElement('article');
    card.className = 'player-card reveal';
    card.style.setProperty('--av-color', member.Color || '#8d6e00');
    card.innerHTML = `
      ${staffFoto ? `<div class="player-avatar" style="background-image:url('${staffFoto}');background-size:cover;background-position:center;color:transparent">${initials || 'ST'}</div>` : `<div class="player-avatar">${initials || 'ST'}</div>`}
      <div class="player-info">
        <div class="player-name">${staffTitle}</div>
        ${staffSubtitle ? `<div class="player-pos">${staffSubtitle}</div>` : ''}
      </div>
    `;
    staffGrid.appendChild(card);
  });

  jugadores.forEach((player) => {
    const initials = String(player.Nombre || '?')
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map(part => part[0])
      .join('')
      .toUpperCase();

    const rawFoto = player.FotoURL || player.fotoURL || player.fotourl || '';
    const fotoUrl = rawFoto && rawFoto !== 'undefined' ? normalizeImageUrl(rawFoto) : '';

    const card = document.createElement('article');
    card.className = 'player-card reveal';
    card.style.setProperty('--av-color', player.Color || '#842021');
    card.innerHTML = `
      ${fotoUrl ? `<div class="player-avatar" style="background-image:url('${fotoUrl}');background-size:cover;background-position:center;color:transparent">${initials || '?'}</div>` : `<div class="player-avatar">${initials || '?'}</div>`}
      <div class="player-num">#${player.Numero ?? ''}</div>
      <div class="player-info">
        <div class="player-name">${player.Nombre || 'Sin nombre'}</div>
        <div class="player-pos">${player.Posicion || ''}</div>
      </div>
    `;
    grid.appendChild(card);
  });

  staffGrid.querySelectorAll('.reveal').forEach(el => io.observe(el));
  grid.querySelectorAll('.reveal').forEach(el => io.observe(el));
}

/* ─── Render Sponsors ────────────────────────────────────────────── */
function renderSponsors(data) {
  const row = document.getElementById('sponsorsRow');
  if (!row) return;

  const sponsors = data?.sponsors || [];
  row.innerHTML = '';

  if (!sponsors.length) {
    row.innerHTML = '<p class="hint" style="color:#888">Próximamente sponsors...</p>';
    return;
  }

  sponsors.forEach((item) => {
    const img = document.createElement('img');
    img.className = 'sponsor-logo reveal';
    img.src = normalizeImageUrl(item.ImagenURL || '');
    img.alt = item.Nombre || 'Sponsor';
    img.loading = 'lazy';
    row.appendChild(img);
  });

  row.querySelectorAll('.reveal').forEach(el => io.observe(el));
}

/* ─── Render Galería ─────────────────────────────────────────────── */
function renderGaleria(data) {
  const grid = document.getElementById('galeriaGrid');
  if (!grid) return;

  const galeria = data?.galeria || [];
  grid.innerHTML = '';

  galeria.forEach((item) => {
    const figure = document.createElement('figure');
    figure.className = `gallery-item reveal ${item.LayoutClass || ''}`.trim();
    figure.style.backgroundImage = `url('${normalizeImageUrl(item.ImagenURL || '')}')`;
    figure.innerHTML = item.Label
      ? `<figcaption class="gallery-label">${item.Label}</figcaption>`
      : '';
    grid.appendChild(figure);
  });

  grid.querySelectorAll('.reveal').forEach(el => io.observe(el));
}

/* ─── Render Institución ─────────────────────────────────────────── */
function renderInstitucion(data) {
  const titulo = document.getElementById('historiaTitulo');
  const bajada = document.getElementById('historiaBajada');
  const contenido = document.getElementById('historiaContenido');
  const historiaFoto = document.getElementById('historiaFoto');
  const historiaFotoLink = document.getElementById('historiaFotoLink');
  const directorioList = document.getElementById('directorioList');
  if (!titulo || !bajada || !contenido || !directorioList || !historiaFoto || !historiaFotoLink) return;

  const historia = data?.historia || {};
  const directorio = data?.directorio || [];

  titulo.textContent = historia.Titulo || 'Historia del Club';
  bajada.textContent = historia.Bajada || '';
  contenido.innerHTML = '';
  if (historia.ImagenURL) {
    const historiaImageUrl = normalizeImageUrl(historia.ImagenURL);
    historiaFoto.src = historiaImageUrl;
    historiaFoto.alt = historia.ImagenAlt || 'Foto oficial del club';
    historiaFotoLink.href = historia.LinkURL || historiaImageUrl;
    historiaFotoLink.style.display = '';
  } else {
    historiaFoto.removeAttribute('src');
    historiaFotoLink.removeAttribute('href');
    historiaFotoLink.style.display = 'none';
  }

  const paragraphs = String(historia.Contenido || '')
    .split(/\n+/)
    .map(item => item.trim())
    .filter(Boolean);

  if (!paragraphs.length && historia.Contenido) {
    const p = document.createElement('p');
    p.textContent = historia.Contenido;
    contenido.appendChild(p);
  } else {
    paragraphs.forEach((text) => {
      const p = document.createElement('p');
      p.textContent = text;
      contenido.appendChild(p);
    });
  }

  directorioList.innerHTML = '';
  directorio.forEach((member) => {
    const item = document.createElement('div');
    item.className = 'directorio-item reveal';
    item.innerHTML = `
      <div class="directorio-cargo">${member.Cargo || ''}</div>
      <div class="directorio-nombre">${member.Nombre || 'Sin nombre'}</div>
    `;
    directorioList.appendChild(item);
  });

  directorioList.querySelectorAll('.reveal').forEach(el => io.observe(el));
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
