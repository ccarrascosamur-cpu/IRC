/* ═══════════════════════════════════════════════════════════════════════
   Panel de Admin IRC — Con login + lectura desde GitHub via Worker
═══════════════════════════════════════════════════════════════════════ */

let state = {
  data: {},
  isLoggedIn: sessionStorage.getItem('irc_admin_auth') === 'true'
};

const MONTHS_ES = {
  ENE: '01', FEB: '02', MAR: '03', ABR: '04', MAY: '05', JUN: '06',
  JUL: '07', AGO: '08', SEP: '09', OCT: '10', NOV: '11', DIC: '12'
};

const els = {
  loginSection: document.getElementById('loginSection'),
  editorSection: document.getElementById('editorSection'),
  passwordInput: document.getElementById('passwordInput'),
  loginBtn: document.getElementById('loginBtn'),
  loginError: document.getElementById('loginError'),
  logoutBtn: document.getElementById('logoutBtn'),
  status: document.getElementById('status'),
  saveAllBtn: document.getElementById('saveAllBtn'),
  tabs: document.querySelectorAll('.tab-btn'),
  panels: document.querySelectorAll('.tab-panel')
};

/* ─── Utilidades ─────────────────────────────────────────────────── */
function showStatus(msg, type = 'info') {
  els.status.textContent = msg;
  els.status.className = `status ${type}`;
  els.status.classList.remove('hidden');
}

function normalizeImageUrl(value) {
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
    if (match) return `https://lh3.googleusercontent.com/d/${match[1]}`;
  }
  return str;
}

/* ─── Login ──────────────────────────────────────────────────────── */
async function login() {
  const password = els.passwordInput.value.trim();
  if (!password) return;

  try {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    });
    const data = await res.json();
    if (data.success) {
      sessionStorage.setItem('irc_admin_auth', 'true');
      state.isLoggedIn = true;
      showEditor();
    } else {
      els.loginError.textContent = data.error || 'Error de autenticación';
    }
  } catch (err) {
    els.loginError.textContent = 'Error de conexión';
  }
}

function logout() {
  sessionStorage.removeItem('irc_admin_auth');
  state.isLoggedIn = false;
  location.reload();
}

function showEditor() {
  els.loginSection.classList.add('hidden');
  els.editorSection.classList.remove('hidden');
  initEditor();
}

/* ─── Carga de datos (desde Worker que lee GitHub) ───────────────── */
async function loadLocalData() {
  const files = ['fixture', 'posiciones', 'noticias', 'stats', 'config', 'jugadores', 'galeria', 'institucion'];
  for (const key of files) {
    try {
      const res = await fetch(`/api/data/${key}.json`);
      const raw = await res.json();
      if (key === 'jugadores') {
        state.data.jugadores = raw.jugadores || [];
        state.data.headCoach = raw.headCoach || { Nombre: '', Cargo: 'Head Coach' };
        state.data.staff = raw.staff || [];
      } else if (key === 'institucion') {
        state.data.historia = raw.historia || { Titulo: '', Bajada: '', Contenido: '', ImagenURL: '', LinkURL: '', ImagenAlt: '' };
        state.data.directorio = raw.directorio || [];
      } else {
        state.data[key] = Array.isArray(raw) ? raw : (raw[key] || raw);
      }
    } catch (e) {
      console.warn(`No se pudo cargar ${key}.json`, e);
      if (key === 'jugadores') {
        state.data.jugadores = [];
        state.data.headCoach = { Nombre: '', Cargo: 'Head Coach' };
        state.data.staff = [];
      } else if (key === 'institucion') {
        state.data.historia = { Titulo: '', Bajada: '', Contenido: '', ImagenURL: '', LinkURL: '', ImagenAlt: '' };
        state.data.directorio = [];
      } else {
        state.data[key] = key === 'config' ? {} : (key === 'stats' ? [{}] : []);
      }
    }
  }
}

/* ─── Renderizado ────────────────────────────────────────────────── */
function renderTabs() {
  els.tabs.forEach(btn => {
    btn.addEventListener('click', () => {
      els.tabs.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      els.panels.forEach(p => p.classList.remove('active'));
      document.getElementById(`${btn.dataset.tab}Panel`).classList.add('active');
    });
  });
}

function createField(label, value, key, type = 'text') {
  const div = document.createElement('div');
  div.className = 'field';
  if (type === 'textarea') {
    div.innerHTML = `<label>${label}</label><textarea data-key="${key}" class="input" rows="5">${String(value || '')}</textarea>`;
    return div;
  }
  const inputType = type === 'boolean' ? 'checkbox' : (type === 'number' ? 'number' : 'text');
  const checked = type === 'boolean' && value ? 'checked' : '';
  const valAttr = type === 'boolean' ? '' : `value="${String(value).replace(/"/g, '&quot;')}"`;
  const inputHtml = type === 'boolean'
    ? `<input type="checkbox" data-key="${key}" ${checked} style="width:auto">`
    : `<input type="${inputType}" data-key="${key}" ${valAttr} class="input">`;
  div.innerHTML = `<label>${label}</label>${inputHtml}`;
  return div;
}

function getCardData(card) {
  const obj = {};
  card.querySelectorAll('[data-key]').forEach(el => {
    const key = el.dataset.key;
    if (el.type === 'checkbox') obj[key] = el.checked;
    else if (el.type === 'number') obj[key] = Number(el.value);
    else obj[key] = el.value;
  });
  return obj;
}

function fixtureSortValue(match) {
  const year = Number(match.Ano) || 0;
  const month = MONTHS_ES[String(match.Mes || '').toUpperCase()] || '00';
  const day = String(Number(match.DiaNum) || 0).padStart(2, '0');
  const time = String(match.Hora || '00:00').padEnd(5, '0').slice(0, 5);
  return `${String(year).padStart(4, '0')}-${month}-${day}T${time}`;
}

function sortFixtureMatches(matches) {
  return [...matches].sort((a, b) => fixtureSortValue(a).localeCompare(fixtureSortValue(b)));
}

function renderFixture() {
  const list = document.getElementById('fixtureList');
  list.innerHTML = '';
  (state.data.fixture || []).forEach((item, idx) => {
    const card = document.createElement('div');
    card.className = 'item-card';
    card.innerHTML = `
      <h4>Partido #${idx + 1}: ${item.Rival || 'Sin rival'}</h4>
      <div class="form-grid">
        ${createField('Día semana', item.DiaSemana, 'DiaSemana').outerHTML}
        ${createField('Día número', item.DiaNum, 'DiaNum', 'number').outerHTML}
        ${createField('Mes', item.Mes, 'Mes').outerHTML}
        ${createField('Año', item.Ano, 'Ano', 'number').outerHTML}
        ${createField('Hora', item.Hora, 'Hora').outerHTML}
        ${createField('Localidad', item.Localidad, 'Localidad').outerHTML}
        ${createField('Rival', item.Rival, 'Rival').outerHTML}
        ${createField('IRC Score', item.IRC_Score, 'IRC_Score').outerHTML}
        ${createField('Rival Score', item.Rival_Score, 'Rival_Score').outerHTML}
        ${createField('Estado', item.Estado, 'Estado').outerHTML}
        ${createField('Cancha', item.Cancha, 'Cancha').outerHTML}
        ${createField('Dirección', item.Direccion, 'Direccion').outerHTML}
        ${createField('Destacado', item.EsDestacado, 'EsDestacado', 'boolean').outerHTML}
      </div>
      <div class="actions"><button class="btn btn-danger delete-btn">🗑 Eliminar</button></div>
    `;
    card.querySelector('.delete-btn').addEventListener('click', () => {
      state.data.fixture.splice(idx, 1);
      renderFixture();
    });
    list.appendChild(card);
  });
}

document.getElementById('addFixtureBtn').addEventListener('click', () => {
  state.data.fixture.push({
    DiaSemana: 'SAB', DiaNum: 1, Mes: 'ENE', Ano: 2026, Hora: '15:00',
    Localidad: 'Local', Rival: 'Nuevo Rival', IRC_Score: '', Rival_Score: '',
    Estado: 'proximo', Cancha: 'Cancha IRC', Direccion: '', EsDestacado: false
  });
  renderFixture();
});

function renderPosiciones() {
  const list = document.getElementById('posicionesList');
  list.innerHTML = '';
  (state.data.posiciones || []).forEach((item, idx) => {
    const card = document.createElement('div');
    card.className = 'item-card';
    card.innerHTML = `
      <h4>#${item.Posicion || idx + 1} — ${item.Equipo || 'Sin nombre'}</h4>
      <div class="form-grid">
        ${createField('Posición', item.Posicion, 'Posicion', 'number').outerHTML}
        ${createField('Equipo', item.Equipo, 'Equipo').outerHTML}
        ${createField('PJ', item.PJ, 'PJ', 'number').outerHTML}
        ${createField('PG', item.PG, 'PG', 'number').outerHTML}
        ${createField('PE', item.PE, 'PE', 'number').outerHTML}
        ${createField('PP', item.PP, 'PP', 'number').outerHTML}
        ${createField('PF', item.PF, 'PF', 'number').outerHTML}
        ${createField('PC', item.PC, 'PC', 'number').outerHTML}
        ${createField('Dif', item.Dif, 'Dif', 'number').outerHTML}
        ${createField('Pts', item.Pts, 'Pts', 'number').outerHTML}
      </div>
      <div class="actions"><button class="btn btn-danger delete-btn">🗑 Eliminar</button></div>
    `;
    card.querySelector('.delete-btn').addEventListener('click', () => {
      state.data.posiciones.splice(idx, 1);
      renderPosiciones();
    });
    list.appendChild(card);
  });
}

document.getElementById('addPosicionBtn').addEventListener('click', () => {
  state.data.posiciones.push({
    Posicion: state.data.posiciones.length + 1, Equipo: 'Nuevo Equipo',
    PJ: 0, PG: 0, PE: 0, PP: 0, PF: 0, PC: 0, Dif: 0, Pts: 0
  });
  renderPosiciones();
});

function renderNoticias() {
  const list = document.getElementById('noticiasList');
  list.innerHTML = '';
  (state.data.noticias || []).forEach((item, idx) => {
    const card = document.createElement('div');
    card.className = 'item-card';
    const previewUrl = normalizeImageUrl(item.ImagenURL || '');
    const isFolder = String(item.ImagenURL || '').includes('/folders/');
    card.innerHTML = `
      <h4>${item.Titulo || 'Sin título'}</h4>
      <div class="form-grid">
        ${createField('Fecha', item.Fecha, 'Fecha').outerHTML}
        ${createField('Título', item.Titulo, 'Titulo').outerHTML}
        ${createField('Resumen', item.Resumen, 'Resumen').outerHTML}
        ${createField('Imagen URL', item.ImagenURL, 'ImagenURL').outerHTML}
        <div class="img-preview-wrap" style="grid-column:1/-1">
          ${isFolder ? '<p class="hint" style="color:#c0392b">⚠️ Este link es una carpeta de Drive. Usá un link directo a la imagen (botón derecho → "Compartir" → "Copiar link" en el archivo).</p>' : (previewUrl ? `<img src="${previewUrl}" class="img-preview" alt="Preview" onerror="this.style.display='none';this.nextElementSibling.style.display='block'"><p class="hint" style="display:none;color:#c0392b">⚠️ No se pudo cargar la imagen. Verificá que sea un link directo a un archivo de imagen.</p>` : '<p class="hint">Pegá el link directo a una imagen (Google Drive, Imgur, etc.). Se mostrará una preview aquí.</p>')}
        </div>
        ${createField('Link', item.Link, 'Link').outerHTML}
        <p class="hint" style="grid-column:1/-1;margin-top:4px">Podés pegar cualquier URL (web, noticia, video, etc.). El sitio abrirá el link en una nueva pestaña.</p>
        ${createField('Destacada', item.Destacada, 'Destacada', 'boolean').outerHTML}
      </div>
      <div class="actions"><button class="btn btn-danger delete-btn">🗑 Eliminar</button></div>
    `;
    // Live preview on input
    const imgInput = card.querySelector('input[data-key="ImagenURL"]');
    const previewWrap = card.querySelector('.img-preview-wrap');
    if (imgInput && previewWrap) {
      imgInput.addEventListener('input', () => {
        const url = normalizeImageUrl(imgInput.value);
        const folder = String(imgInput.value || '').includes('/folders/');
        if (folder) {
          previewWrap.innerHTML = '<p class="hint" style="color:#c0392b">⚠️ Este link es una carpeta de Drive. Usá un link directo a la imagen (botón derecho → "Compartir" → "Copiar link" en el archivo).</p>';
        } else if (url) {
          previewWrap.innerHTML = `<img src="${url}" class="img-preview" alt="Preview" onerror="this.style.display='none';this.nextElementSibling.style.display='block'"><p class="hint" style="display:none;color:#c0392b">⚠️ No se pudo cargar la imagen. Verificá que sea un link directo a un archivo de imagen.</p>`;
        } else {
          previewWrap.innerHTML = '<p class="hint">Pegá el link directo a una imagen (Google Drive, Imgur, etc.). Se mostrará una preview aquí.</p>';
        }
      });
    }
    card.querySelector('.delete-btn').addEventListener('click', () => {
      state.data.noticias.splice(idx, 1);
      renderNoticias();
    });
    list.appendChild(card);
  });
}

document.getElementById('addNoticiaBtn').addEventListener('click', () => {
  state.data.noticias.push({
    Fecha: '01/01/2026', Titulo: 'Nueva noticia', Resumen: '',
    ImagenURL: '', Link: '#', Destacada: false
  });
  renderNoticias();
});

function renderStats() {
  const container = document.getElementById('statsForm');
  container.innerHTML = '';
  const item = state.data.stats?.[0] || { Victorias: 0, Derrotas: 0, Empates: 0 };
  container.appendChild(createField('Victorias', item.Victorias, 'Victorias', 'number'));
  container.appendChild(createField('Derrotas', item.Derrotas, 'Derrotas', 'number'));
  container.appendChild(createField('Empates', item.Empates, 'Empates', 'number'));
}

function renderPlantel() {
  const headCoachForm = document.getElementById('headCoachForm');
  const staffList = document.getElementById('staffList');
  const jugadoresList = document.getElementById('jugadoresList');
  const coach = state.data.headCoach || { Nombre: '', Cargo: 'Head Coach' };

  headCoachForm.innerHTML = '';
  headCoachForm.appendChild(createField('Head Coach: nombre', coach.Nombre || '', 'Nombre'));
  headCoachForm.appendChild(createField('Head Coach: cargo', coach.Cargo || 'Head Coach', 'Cargo'));

  staffList.innerHTML = '';
  (state.data.staff || []).forEach((item, idx) => {
    const card = document.createElement('div');
    card.className = 'item-card';
    card.innerHTML = `
      <h4>${item.Cargo || `Staff #${idx + 1}`}</h4>
      <div class="form-grid">
        ${createField('Nombre', item.Nombre, 'Nombre').outerHTML}
        ${createField('Cargo', item.Cargo, 'Cargo').outerHTML}
        ${createField('Color', item.Color, 'Color').outerHTML}
      </div>
      <div class="actions"><button class="btn btn-danger delete-btn">🗑 Eliminar</button></div>
    `;
    card.querySelector('.delete-btn').addEventListener('click', () => {
      state.data.staff.splice(idx, 1);
      renderPlantel();
    });
    staffList.appendChild(card);
  });

  jugadoresList.innerHTML = '';
  (state.data.jugadores || []).forEach((item, idx) => {
    const card = document.createElement('div');
    card.className = 'item-card';
    card.innerHTML = `
      <h4>#${item.Numero || idx + 1} — ${item.Nombre || 'Sin nombre'}</h4>
      <div class="form-grid">
        ${createField('Nombre', item.Nombre, 'Nombre').outerHTML}
        ${createField('Número', item.Numero, 'Numero', 'number').outerHTML}
        ${createField('Posición', item.Posicion, 'Posicion').outerHTML}
        ${createField('Color', item.Color, 'Color').outerHTML}
        ${createField('Foto URL', item.FotoURL, 'FotoURL').outerHTML}
      </div>
      <div class="actions"><button class="btn btn-danger delete-btn">🗑 Eliminar</button></div>
    `;
    card.querySelector('.delete-btn').addEventListener('click', () => {
      state.data.jugadores.splice(idx, 1);
      renderPlantel();
    });
    jugadoresList.appendChild(card);
  });
}

document.getElementById('addStaffBtn').addEventListener('click', () => {
  state.data.staff.push({
    Nombre: 'Nuevo staff',
    Cargo: 'Cargo',
    Color: '#c49b00'
  });
  renderPlantel();
});

document.getElementById('addJugadorBtn').addEventListener('click', () => {
  state.data.jugadores.push({
    Nombre: 'Nuevo jugador',
    Numero: (state.data.jugadores?.length || 0) + 1,
    Posicion: '',
    Color: '#842021',
    FotoURL: ''
  });
  renderPlantel();
});

function renderGaleria() {
  const list = document.getElementById('galeriaList');
  list.innerHTML = '';
  (state.data.galeria || []).forEach((item, idx) => {
    const card = document.createElement('div');
    card.className = 'item-card';
    card.innerHTML = `
      <h4>${item.Label || `Imagen #${idx + 1}`}</h4>
      <div class="form-grid">
        ${createField('Imagen URL', item.ImagenURL, 'ImagenURL').outerHTML}
        ${createField('Texto', item.Label, 'Label').outerHTML}
        ${createField('LayoutClass', item.LayoutClass, 'LayoutClass').outerHTML}
      </div>
      <div class="actions"><button class="btn btn-danger delete-btn">🗑 Eliminar</button></div>
    `;
    card.querySelector('.delete-btn').addEventListener('click', () => {
      state.data.galeria.splice(idx, 1);
      renderGaleria();
    });
    list.appendChild(card);
  });
}

document.getElementById('addGaleriaBtn').addEventListener('click', () => {
  state.data.galeria.push({
    ImagenURL: '',
    Label: '',
    LayoutClass: ''
  });
  renderGaleria();
});

function renderInstitucion() {
  const historiaForm = document.getElementById('historiaForm');
  const directorioList = document.getElementById('directorioList');
  const historia = state.data.historia || { Titulo: '', Bajada: '', Contenido: '', ImagenURL: '', LinkURL: '', ImagenAlt: '' };

  historiaForm.innerHTML = '';
  historiaForm.appendChild(createField('Título', historia.Titulo || '', 'Titulo'));
  historiaForm.appendChild(createField('Bajada', historia.Bajada || '', 'Bajada', 'textarea'));
  historiaForm.appendChild(createField('Contenido', historia.Contenido || '', 'Contenido', 'textarea'));
  historiaForm.appendChild(createField('Foto oficial URL', historia.ImagenURL || '', 'ImagenURL'));
  historiaForm.appendChild(createField('Foto oficial link', historia.LinkURL || '', 'LinkURL'));
  historiaForm.appendChild(createField('Foto oficial alt', historia.ImagenAlt || '', 'ImagenAlt'));

  directorioList.innerHTML = '';
  (state.data.directorio || []).forEach((item, idx) => {
    const card = document.createElement('div');
    card.className = 'item-card';
    card.innerHTML = `
      <h4>${item.Cargo || `Miembro #${idx + 1}`}</h4>
      <div class="form-grid">
        ${createField('Nombre', item.Nombre, 'Nombre').outerHTML}
        ${createField('Cargo', item.Cargo, 'Cargo').outerHTML}
      </div>
      <div class="actions"><button class="btn btn-danger delete-btn">🗑 Eliminar</button></div>
    `;
    card.querySelector('.delete-btn').addEventListener('click', () => {
      state.data.directorio.splice(idx, 1);
      renderInstitucion();
    });
    directorioList.appendChild(card);
  });
}

document.getElementById('addDirectorioBtn').addEventListener('click', () => {
  state.data.directorio.push({
    Nombre: 'Nuevo integrante',
    Cargo: 'Cargo'
  });
  renderInstitucion();
});

function renderConfig() {
  const container = document.getElementById('configForm');
  container.innerHTML = '';
  const item = state.data.config || {};
  [
    ['whatsapp_num', 'WhatsApp'], ['email', 'Email'], ['direccion', 'Dirección'],
    ['entrenamiento_dias', 'Días entrenamiento'], ['entrenamiento_horario', 'Horario entrenamiento'],
    ['cancha_nombre', 'Nombre cancha'], ['maps_url', 'URL Google Maps'],
    ['cal_summary', 'Calendario título'], ['cal_description', 'Calendario descripción'],
    ['mensualidad_url', 'URL mensualidad'], ['mensualidad_label', 'Texto link mensualidad']
  ].forEach(([key, label]) => {
    container.appendChild(createField(label, item[key] || '', key));
  });
}

/* ─── Recolectar datos ───────────────────────────────────────────── */
function collectData() {
  state.data.fixture = sortFixtureMatches(
    Array.from(document.querySelectorAll('#fixtureList .item-card')).map(getCardData)
  );
  state.data.posiciones = Array.from(document.querySelectorAll('#posicionesList .item-card')).map(getCardData);
  state.data.noticias = Array.from(document.querySelectorAll('#noticiasList .item-card')).map(getCardData);
  state.data.staff = Array.from(document.querySelectorAll('#staffList .item-card')).map(getCardData);
  state.data.jugadores = Array.from(document.querySelectorAll('#jugadoresList .item-card')).map(getCardData);
  state.data.galeria = Array.from(document.querySelectorAll('#galeriaList .item-card')).map(getCardData);
  state.data.directorio = Array.from(document.querySelectorAll('#directorioList .item-card')).map(getCardData);

  const statsObj = {};
  document.querySelectorAll('#statsForm [data-key]').forEach(el => {
    statsObj[el.dataset.key] = el.type === 'number' ? Number(el.value) : el.value;
  });
  state.data.stats = [statsObj];

  const headCoachObj = {};
  document.querySelectorAll('#headCoachForm [data-key]').forEach(el => {
    headCoachObj[el.dataset.key] = el.value;
  });
  state.data.headCoach = headCoachObj;

  const historiaObj = {};
  document.querySelectorAll('#historiaForm [data-key]').forEach(el => {
    historiaObj[el.dataset.key] = el.value;
  });
  state.data.historia = historiaObj;

  const configObj = {};
  document.querySelectorAll('#configForm [data-key]').forEach(el => {
    configObj[el.dataset.key] = el.value;
  });
  state.data.config = configObj;
}

/* ─── Guardar via Worker API ─────────────────────────────────────── */
async function saveFile(key) {
  let wrapper;
  if (key === 'jugadores') {
    wrapper = {
      jugadores: state.data.jugadores || [],
      headCoach: state.data.headCoach || { Nombre: '', Cargo: 'Head Coach' },
      staff: state.data.staff || []
    };
  } else if (key === 'institucion') {
    wrapper = {
      historia: state.data.historia || { Titulo: '', Bajada: '', Contenido: '', ImagenURL: '', LinkURL: '', ImagenAlt: '' },
      directorio: state.data.directorio || []
    };
  } else {
    wrapper = {};
    wrapper[key] = state.data[key];
  }
  const content = JSON.stringify(wrapper, null, 2);

  const res = await fetch('/api/save', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ key, content })
  });

  const data = await res.json();
  if (!res.ok || data.error) {
    throw new Error(data.error || `HTTP ${res.status}`);
  }
  return data;
}

async function saveAll() {
  console.log('[Admin] Iniciando guardado...');
  collectData();
  renderFixture();
  console.log('[Admin] Datos recolectados:', state.data);
  showStatus('💾 Guardando cambios...', 'info');
  els.saveAllBtn.disabled = true;

  try {
    for (const key of ['fixture', 'posiciones', 'noticias', 'stats', 'jugadores', 'galeria', 'institucion', 'config']) {
      console.log('[Admin] Guardando:', key);
      await saveFile(key);
      console.log('[Admin] OK:', key);
    }
    showStatus('✅ Cambios guardados. Recargando...', 'success');
    setTimeout(() => location.reload(), 1500);
  } catch (err) {
    showStatus('❌ Error: ' + err.message, 'error');
    console.error(err);
  } finally {
    els.saveAllBtn.disabled = false;
  }
}

/* ─── Inicialización ─────────────────────────────────────────────── */
async function initEditor() {
  renderTabs();
  await loadLocalData();
  renderFixture();
  renderPosiciones();
  renderNoticias();
  renderStats();
  renderPlantel();
  renderGaleria();
  renderInstitucion();
  renderConfig();
  els.saveAllBtn.addEventListener('click', saveAll);
  els.logoutBtn.addEventListener('click', logout);
}

// Inicio
if (state.isLoggedIn) {
  showEditor();
} else {
  els.loginBtn.addEventListener('click', login);
  els.passwordInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') login();
  });
}
