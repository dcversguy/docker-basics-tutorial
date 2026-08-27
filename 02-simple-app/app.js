const http = require('http');
const os = require('os');

const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok' }));
    return;
  }

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Docker Simple App</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 600px; margin: 60px auto; padding: 0 20px; }
    h1 { color: #0db7ed; }
    .info { background: #f0f0f0; padding: 16px; border-radius: 8px; }
    code { background: #ddd; padding: 2px 6px; border-radius: 3px; }
  </style>
</head>
<body>
  <h1>🐳 Hello from Docker!</h1>
  <p>This Node.js app is running inside a Docker container.</p>
  <div class="info">
    <h2>Container Info</h2>
    <p><strong>Hostname:</strong> <code>${os.hostname()}</code></p>
    <p><strong>Platform:</strong> <code>${os.platform()} / ${os.arch()}</code></p>
    <p><strong>Node.js:</strong> <code>${process.version}</code></p>
    <p><strong>Port:</strong> <code>${PORT}</code></p>
    <p><strong>Uptime:</strong> <code>${Math.floor(process.uptime())}s</code></p>
  </div>
</body>
</html>`;

  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(html);
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Visit http://localhost:${PORT}`);
});
