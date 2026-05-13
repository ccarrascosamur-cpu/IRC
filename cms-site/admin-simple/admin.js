/* ═══════════════════════════════════════════════════════════════════════
   Panel de Admin IRC — Edita JSON locales y commitea a GitHub
═══════════════════════════════════════════════════════════════════════ */

const REPO = 'ccarrascosamur-cpu/IRC';
const BRANCH = 'main';
const DATA_PATH = 'cms-site/data';

let state = {
  pat: localStorage.getItem('irc_github_pat') || '',
  data: {},
  shas: {}
};

const els = {
  loginSection: document.getElementById('loginSection'),
  editorSection: document.getElementById('editorSection'),
  patInput: document.getElementById('patInput'),
  savePatBtn: document.getElementById('savePatBtn'),
  saveAllBtn: document.getElementById('saveAllBtn'),
  status: document.getElementById('status'),
  tabs: document.querySelectorAll('.tab-btn'),
  panels: document.querySelectorAll('.tab-panel')
};

/* ─── Utilidades ─────────────────────────────────────────────────── */
function toBase64(str) {
  return btoa(unescape(encodeURIComponent(str)));
}

function fromBase64(str) {
  return decodeURIComponent(escape(atob(str)));
}

function showStatus(msg, type = 'info') {
  els.status.textContent = msg;
  els.status.className = `status ${type}`;
  els.status.classList.remove('hidden');
}

function hideStatus() {
  els.status.classList.add('hidden');
}

async function githubFetch(path, opts = {}) {
  const res = await fetch(`https://api.github.com${path}`, {
    ...opts,
    headers: {
      'Authorization': `token ${state.pat}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
      ...(opts.headers || {})
    }
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `HTTP ${res.status}`);
  }
  return res.json();
}

/* ─── Carga de datos locales ─────────────────────────────────────── */
async function loadLocalData() {
  const files = ['fixture', 'posiciones', 'noticias', 'stats', 'config'];
  for (const key of files) {
    try {
      const res = await fetch(`../data/${key}.json`);
      const raw = await res.json();
      state.data[key] = Array.isArray(raw) ? raw : (raw[key] || raw);
    } catch (e) {
      console.warn(`No se pudo cargar ${key}.json`, e);
      state.data[key] = key === 'config' ? {} : (key === 'stats' ? [{}] : []);
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
  const inputType = type === 'boolean' ? 'checkbox' : (type === 'number' ? 'number' : 'text');
  const checked = type === 'boolean' && value ? 'checked' : '';
  const inputHtml = type === 'boolean'
    ? `<input type="checkbox" data-key="${key}" ${checked} style="width:auto">`
    : `<input type="${inputType}" data-key="${key}" value="${String(value).replace(/"/g, '&quot;')}" class="input">`;
  div.innerHTML = `
    <label>${label}</label>
    ${inputHtml}
  `;
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

/* Fixture */
function renderFixture() {
  const list = document.getElementById('fixtureList');
  list.innerHTML = '';
  const items = state.data.fixture || [];
  items.forEach((item, idx) => {
    const card = document.createElement('div');
    card.className = 'item-card';
    card.dataset.index = idx;
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
      <div class="actions">
        <button class="btn btn-danger delete-btn">🗑 Eliminar</button>
      </div>
    `;
    card.querySelector('.delete-btn').addEventListener('click', () => {
      items.splice(idx, 1);
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

/* Posiciones */
function renderPosiciones() {
  const list = document.getElementById('posicionesList');
  list.innerHTML = '';
  const items = state.data.posiciones || [];
  items.forEach((item, idx) => {
    const card = document.createElement('div');
    card.className = 'item-card';
    card.dataset.index = idx;
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
      <div class="actions">
        <button class="btn btn-danger delete-btn">🗑 Eliminar</button>
      </div>
    `;
    card.querySelector('.delete-btn').addEventListener('click', () => {
      items.splice(idx, 1);
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

/* Noticias */
function renderNoticias() {
  const list = document.getElementById('noticiasList');
  list.innerHTML = '';
  const items = state.data.noticias || [];
  items.forEach((item, idx) => {
    const card = document.createElement('div');
    card.className = 'item-card';
    card.dataset.index = idx;
    card.innerHTML = `
      <h4>${item.Titulo || 'Sin título'}</h4>
      <div class="form-grid">
        ${createField('Fecha', item.Fecha, 'Fecha').outerHTML}
        ${createField('Título', item.Titulo, 'Titulo').outerHTML}
        ${createField('Resumen', item.Resumen, 'Resumen').outerHTML}
        ${createField('Imagen URL', item.ImagenURL, 'ImagenURL').outerHTML}
        ${createField('Link', item.Link, 'Link').outerHTML}
        ${createField('Destacada', item.Destacada, 'Destacada', 'boolean').outerHTML}
      </div>
      <div class="actions">
        <button class="btn btn-danger delete-btn">🗑 Eliminar</button>
      </div>
    `;
    card.querySelector('.delete-btn').addEventListener('click', () => {
      items.splice(idx, 1);
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

/* Stats */
function renderStats() {
  const container = document.getElementById('statsForm');
  container.innerHTML = '';
  const item = state.data.stats?.[0] || { Victorias: 0, Derrotas: 0, Empates: 0 };
  container.appendChild(createField('Victorias', item.Victorias, 'Victorias', 'number'));
  container.appendChild(createField('Derrotas', item.Derrotas, 'Derrotas', 'number'));
  container.appendChild(createField('Empates', item.Empates, 'Empates', 'number'));
}

/* Config */
function renderConfig() {
  const container = document.getElementById('configForm');
  container.innerHTML = '';
  const item = state.data.config || {};
  const fields = [
    ['whatsapp_num', 'WhatsApp'],
    ['email', 'Email'],
    ['direccion', 'Dirección'],
    ['entrenamiento_dias', 'Días entrenamiento'],
    ['entrenamiento_horario', 'Horario entrenamiento'],
    ['cancha_nombre', 'Nombre cancha'],
    ['maps_url', 'URL Google Maps'],
    ['cal_summary', 'Calendario título'],
    ['cal_description', 'Calendario descripción']
  ];
  fields.forEach(([key, label]) => {
    container.appendChild(createField(label, item[key] || '', key));
  });
}

/* ─── Recolectar datos de los formularios ────────────────────────── */
function collectData() {
  // Fixture
  const fixtureCards = document.querySelectorAll('#fixtureList .item-card');
  state.data.fixture = Array.from(fixtureCards).map(card => getCardData(card));

  // Posiciones
  const posCards = document.querySelectorAll('#posicionesList .item-card');
  state.data.posiciones = Array.from(posCards).map(card => getCardData(card));

  // Noticias
  const newsCards = document.querySelectorAll('#noticiasList .item-card');
  state.data.noticias = Array.from(newsCards).map(card => getCardData(card));

  // Stats
  const statsInputs = document.querySelectorAll('#statsForm [data-key]');
  const statsObj = {};
  statsInputs.forEach(el => statsObj[el.dataset.key] = el.type === 'number' ? Number(el.value) : el.value);
  state.data.stats = [statsObj];

  // Config
  const configInputs = document.querySelectorAll('#configForm [data-key]');
  const configObj = {};
  configInputs.forEach(el => configObj[el.dataset.key] = el.value);
  state.data.config = configObj;
}

/* ─── Guardar en GitHub ──────────────────────────────────────────── */
async function getSha(path) {
  const data = await githubFetch(`/repos/${REPO}/contents/${path}?ref=${BRANCH}`);
  return data.sha;
}

async function saveFile(key) {
  const path = `${DATA_PATH}/${key}.json`;
  let content;
  if (key === 'stats' || key === 'config') {
    const wrapper = {};
    wrapper[key] = state.data[key];
    content = JSON.stringify(wrapper, null, 2);
  } else {
    const wrapper = {};
    wrapper[key] = state.data[key];
    content = JSON.stringify(wrapper, null, 2);
  }

  const sha = state.shas[key] || await getSha(path);
  await githubFetch(`/repos/${REPO}/contents/${path}`, {
    method: 'PUT',
    body: JSON.stringify({
      message: `Actualiza ${key} desde panel de admin`,
      content: toBase64(content),
      sha,
      branch: BRANCH
    })
  });
}

async function saveAll() {
  collectData();
  showStatus('💾 Guardando cambios...', 'info');
  els.saveAllBtn.disabled = true;

  try {
    for (const key of ['fixture', 'posiciones', 'noticias', 'stats', 'config']) {
      await saveFile(key);
    }
    showStatus('✅ Cambios guardados correctamente. El sitio se redeployará en unos segundos.', 'success');
  } catch (err) {
    showStatus('❌ Error: ' + err.message, 'error');
    console.error(err);
  } finally {
    els.saveAllBtn.disabled = false;
  }
}

/* ─── Inicialización ─────────────────────────────────────────────── */
async function init() {
  renderTabs();
  await loadLocalData();

  if (state.pat) {
    els.patInput.value = state.pat;
    els.loginSection.classList.add('hidden');
    els.editorSection.classList.remove('hidden');
    renderFixture();
    renderPosiciones();
    renderNoticias();
    renderStats();
    renderConfig();
  }

  els.savePatBtn.addEventListener('click', () => {
    const pat = els.patInput.value.trim();
    if (!pat) return;
    localStorage.setItem('irc_github_pat', pat);
    state.pat = pat;
    els.loginSection.classList.add('hidden');
    els.editorSection.classList.remove('hidden');
    renderFixture();
    renderPosiciones();
    renderNoticias();
    renderStats();
    renderConfig();
  });

  els.saveAllBtn.addEventListener('click', saveAll);
}

init();
