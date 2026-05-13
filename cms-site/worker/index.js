/**
 * Cloudflare Worker — Sitio web + API de guardado para panel de admin
 * 
 * Sirve archivos estáticos del sitio y expone /api/save para guardar datos.
 */

const REPO = 'ccarrascosamur-cpu/IRC';
const BRANCH = 'main';
const DATA_PATH = 'cms-site/data';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }

    // Endpoint: guardar datos
    if (path === '/api/save' && request.method === 'POST') {
      return handleSave(request, env);
    }

    // Servir archivos estáticos
    return env.ASSETS.fetch(request);
  },
};

async function handleSave(request, env) {
  const token = env.GITHUB_TOKEN;
  if (!token) {
    return jsonResponse({ error: 'Server misconfigured: missing GitHub token' }, 500);
  }

  let payload;
  try {
    payload = await request.json();
  } catch (e) {
    return jsonResponse({ error: 'Invalid JSON' }, 400);
  }

  const { key, content } = payload;
  if (!key || !content) {
    return jsonResponse({ error: 'Missing key or content' }, 400);
  }

  const filePath = `${DATA_PATH}/${key}.json`;

  try {
    // Obtener SHA actual del archivo
    const shaRes = await fetch(`https://api.github.com/repos/${REPO}/contents/${filePath}?ref=${BRANCH}`, {
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'IRC-Worker'
      }
    });

    if (!shaRes.ok) {
      const err = await shaRes.json().catch(() => ({}));
      return jsonResponse({ error: err.message || `GitHub SHA error: ${shaRes.status}` }, 400);
    }

    const shaData = await shaRes.json();

    // Guardar archivo
    const saveRes = await fetch(`https://api.github.com/repos/${REPO}/contents/${filePath}`, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        'User-Agent': 'IRC-Worker'
      },
      body: JSON.stringify({
        message: `Actualiza ${key} desde panel de admin`,
        content: toBase64(content),
        sha: shaData.sha,
        branch: BRANCH
      })
    });

    if (!saveRes.ok) {
      const err = await saveRes.json().catch(() => ({}));
      return jsonResponse({ error: err.message || `GitHub save error: ${saveRes.status}` }, 400);
    }

    return jsonResponse({ success: true, message: `${key} guardado correctamente` });

  } catch (err) {
    return jsonResponse({ error: err.message }, 500);
  }
}

function toBase64(str) {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
