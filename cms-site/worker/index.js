/**
 * Cloudflare Worker — Sitio web + OAuth Proxy para Decap CMS + GitHub
 * 
 * Sirve archivos estáticos del sitio y maneja autenticación en /auth
 */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === '/auth') {
      return handleAuth(request, env);
    }

    // Servir archivos estáticos (index.html, css, js, admin/, etc.)
    return env.ASSETS.fetch(request);
  },
};

async function handleAuth(request, env) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');

  const clientId = env.GITHUB_CLIENT_ID;
  const clientSecret = env.GITHUB_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return htmlResponse(errorHtml('Server misconfigured: missing credentials'));
  }

  // Sin code → redirigir a GitHub OAuth
  if (!code) {
    const githubAuthUrl = new URL('https://github.com/login/oauth/authorize');
    githubAuthUrl.searchParams.set('client_id', clientId);
    githubAuthUrl.searchParams.set('redirect_uri', url.origin + '/auth');
    githubAuthUrl.searchParams.set('scope', 'repo');
    return Response.redirect(githubAuthUrl.toString(), 302);
  }

  // Con code → intercambiar por token
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
      return htmlResponse(errorHtml(tokenData.error_description || tokenData.error));
    }

    return htmlResponse(successHtml(tokenData.access_token));

  } catch (err) {
    return htmlResponse(errorHtml(err.message));
  }
}

function htmlResponse(html) {
  return new Response(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}

function successHtml(token) {
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
    (function() {
      var token = "${token}";
      if (window.opener) {
        window.opener.postMessage({
          type: "authorization:github:success",
          payload: { provider: "github", token: token }
        }, "*");
      }
      setTimeout(function() {
        window.close();
      }, 1000);
    })();
  </script>
</body>
</html>`;
}

function errorHtml(message) {
  const safe = message.replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Error de autenticación</title>
  <style>
    body { font-family: system-ui, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #f5f5f5; }
    .box { background: white; padding: 2rem; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,.1); text-align: center; }
    h1 { font-size: 1.25rem; margin: 0 0 .5rem; color: #842021; }
    p { color: #666; margin: 0; }
    code { background: #f0f0f0; padding: .25rem .5rem; border-radius: 4px; font-size: .9rem; }
  </style>
</head>
<body>
  <div class="box">
    <h1>❌ Error de autenticación</h1>
    <p><code>${safe}</code></p>
  </div>
</body>
</html>`;
}
