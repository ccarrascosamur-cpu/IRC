/**
 * Cloudflare Worker — Sitio web + API de guardado + Login
 * 
 * Lee y escribe datos directamente en GitHub via API para evitar caché.
 */

const REPO = 'ccarrascosamur-cpu/IRC';
const BRANCH = 'main';
const DATA_PATH = 'cms-site/data';

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

    if (path === '/api/login' && request.method === 'POST') {
      return handleLogin(request, env);
    }

    if (path === '/api/save' && request.method === 'POST') {
      return handleSave(request, env);
    }

    // Datos JSON: servir desde GitHub API (siempre actualizados, sin caché)
    const dataMatch = path.match(/^\/api\/data\/(\w+)\.json$/);
    if (dataMatch) {
      return serveJson(dataMatch[1], env);
    }

    return env.ASSETS.fetch(request);
  },
};

async function serveJson(key, env) {
  const token = env.GITHUB_TOKEN;
  const filePath = `${DATA_PATH}/${key}.json`;
  try {
    const res = await fetch(`https://api.github.com/repos/${REPO}/contents/${filePath}?ref=${BRANCH}`, {
      headers: {
        ...(token ? { 'Authorization': `token ${token}` } : {}),
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'IRC-Worker'
      },
      cf: { cacheTtl: 0 }
    });
    if (!res.ok) return new Response('Not found', { status: 404 });
    const data = await res.json();
    const content = fromBase64(data.content);
    return new Response(content, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (e) {
    return new Response('Error: ' + e.message, { status: 500 });
  }
}

function fromBase64(str) {
  const binary = atob(str.replace(/\s/g, ''));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
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

    const saveData = await saveRes.json().catch(() => ({}));
    if (!saveRes.ok) {
      return jsonResponse({ error: saveData.message || `GitHub save error: ${saveRes.status}` }, 400);
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
