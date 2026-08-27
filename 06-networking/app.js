const http = require('http');
const os = require('os');

const APP_NAME = process.env.APP_NAME || 'app';
const LISTEN_PORT = parseInt(process.env.LISTEN_PORT || '3000', 10);
const TARGET_HOST = process.env.TARGET_HOST || '';
const TARGET_PORT = parseInt(process.env.TARGET_PORT || '4000', 10);

// Simple HTTP GET helper
function httpGet(host, port, path = '/') {
  return new Promise((resolve, reject) => {
    const options = { hostname: host, port, path, method: 'GET', timeout: 3000 };
    const req = http.request(options, res => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
    req.end();
  });
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const server = http.createServer(async (req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', app: APP_NAME }));
    return;
  }

  if (req.url === '/ping') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ pong: true, from: APP_NAME, hostname: os.hostname() }));
    return;
  }

  // Try to reach the target service (if configured)
  let targetResult = null;
  if (TARGET_HOST) {
    try {
      const response = await httpGet(TARGET_HOST, TARGET_PORT, '/ping');
      targetResult = { success: true, response: JSON.parse(response.body) };
    } catch (err) {
      targetResult = { success: false, error: err.message };
    }
  }

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${APP_NAME}</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 700px; margin: 60px auto; padding: 0 20px; }
    h1 { color: #0db7ed; }
    .box { background: #f0f0f0; padding: 16px; border-radius: 8px; margin: 12px 0; }
    code { background: #ddd; padding: 2px 6px; border-radius: 3px; }
    .ok { color: green; }
    .err { color: red; }
  </style>
</head>
<body>
  <h1>🌐 ${APP_NAME}</h1>
  <div class="box">
    <h2>This container</h2>
    <p><strong>App name:</strong> <code>${APP_NAME}</code></p>
    <p><strong>Hostname:</strong> <code>${os.hostname()}</code></p>
    <p><strong>Listening on:</strong> <code>:${LISTEN_PORT}</code></p>
  </div>
  ${TARGET_HOST ? `
  <div class="box">
    <h2>Reaching <code>${TARGET_HOST}:${TARGET_PORT}</code></h2>
    ${targetResult && targetResult.success
      ? `<p class="ok">✅ Connected! Response: <code>${escapeHtml(JSON.stringify(targetResult.response))}</code></p>`
      : `<p class="err">❌ Could not reach target: <code>${escapeHtml(targetResult ? targetResult.error : 'unknown')}</code></p>`
    }
    <p>Reload the page to ping again.</p>
  </div>` : ''}
  <div class="box">
    <h2>Network endpoints</h2>
    <p><a href="/ping">/ping</a> — JSON ping response</p>
    <p><a href="/health">/health</a> — Health check</p>
  </div>
</body>
</html>`;

  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(html);
});

server.listen(LISTEN_PORT, () => {
  console.log(`[${APP_NAME}] Listening on port ${LISTEN_PORT}`);
  if (TARGET_HOST) {
    console.log(`[${APP_NAME}] Will try to reach ${TARGET_HOST}:${TARGET_PORT}`);
  }
});
