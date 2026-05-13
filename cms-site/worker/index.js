/**
 * Cloudflare Worker — Sitio web + API de guardado + Login
 * 
 * Los archivos JSON se sirven directamente desde GitHub raw para que
 * siempre reflejen los últimos cambios.
 */

const REPO = 'ccarrascosamur-cpu/IRC';
const BRANCH = 'main';
const DATA_PATH = 'cms-site/data';
const RAW_BASE = `https://raw.githubusercontent.com/${REPO}/${BRANCH}/${DATA_PATH}`;

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

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

    // Endpoint: login
    if (path === '/api/login' && request.method === 'POST') {
      return handleLogin(request, env);
    }

    // Endpoint: guardar datos
    if (path === '/api/save' && request.method === 'POST') {
      return handleSave(request, env);
    }

    // Archivos JSON: servir desde GitHub raw (siempre actualizados)
    const jsonMatch = path.match(/^\/data\/(\w+)\.json$/);
    if (jsonMatch) {
      return serveJson(jsonMatch[1]);
    }

    // Todo lo demás: assets estáticos
    return env.ASSETS.fetch(request);
  },
};

async function serveJson(key) {
  const res = await fetch(`${RAW_BASE}/${key}.json`, {
    cf: { cacheTtl: 5 } // Cache de solo 5 segundos en el edge
  });
  if (!res.ok) {
    return new Response('Not found', { status: 404 });
  }
  const body = await res.text();
  return new Response(body, {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Access-Control-Allow-Origin': '*',
    },
  });
}

async function handleLogin(request, env) {
  const { password } = await request.json().catch(() => ({}));
  if (password === env.ADMIN_PASSWORD) {
    return jsonResponse({ success: true, token: 'authenticated' });
  }
  return jsonResponse({ error: 'Contraseña incorrecta' }, 401);
}

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
