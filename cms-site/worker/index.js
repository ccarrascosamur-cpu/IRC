/**
 * Cloudflare Worker — OAuth Proxy para Decap CMS + GitHub
 * 
 * Este Worker recibe el code de GitHub OAuth y lo intercambia por un access_token,
 * permitiendo que Decap CMS use GitHub como backend sin Netlify Identity.
 * 
 * Variables de entorno necesarias:
 *   GITHUB_CLIENT_ID
 *   GITHUB_CLIENT_SECRET
 */

const ALLOWED_ORIGIN = null; // Cambiar por tu dominio si querés restringir: "https://tu-dominio.com"

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders(ALLOWED_ORIGIN),
      });
    }

    // Endpoint: /auth — callback de GitHub OAuth
    if (path === '/auth') {
      return handleAuth(request, env);
    }

    // Endpoint: /success — recibe token del popup y lo devuelve
    if (path === '/success') {
      return new Response(successHtml(), {
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      });
    }

    return new Response('Not found', { status: 404 });
  },
};

async function handleAuth(request, env) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');

  if (!code) {
    return jsonResponse({ error: 'Missing code parameter' }, 400);
  }

  const clientId = env.GITHUB_CLIENT_ID;
  const clientSecret = env.GITHUB_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return jsonResponse({ error: 'Server misconfigured: missing credentials' }, 500);
  }

  try {
    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code,
      }),
    });

    const tokenData = await tokenRes.json();

    if (tokenData.error) {
      return jsonResponse({ error: tokenData.error_description || tokenData.error }, 400);
    }

    // Redirigir a /success con el token en el hash
    return Response.redirect(`${url.origin}/success#${tokenData.access_token}`, 302);

  } catch (err) {
    return jsonResponse({ error: err.message }, 500);
  }
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders(ALLOWED_ORIGIN),
    },
  });
}

function corsHeaders(origin) {
  return {
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

function successHtml() {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Autenticación completada</title>
  <style>
    body { font-family: system-ui, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #f5f5f5; }
    .box { background: white; padding: 2rem; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,.1); text-align: center; }
    h1 { font-size: 1.25rem; margin: 0 0 .5rem; color: #1a1a1a; }
    p { color: #666; margin: 0; }
  </style>
</head>
<body>
  <div class="box">
    <h1>✅ Autenticación exitosa</h1>
    <p>Cerrá esta ventana para volver al panel de admin.</p>
  </div>
  <script>
    // Decap CMS espera que el popup rediriga a una URL con el token en el hash
    // El CMS lee window.location.hash desde el popup
  </script>
</body>
</html>`;
}
