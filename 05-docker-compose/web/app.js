const http = require('http');
const { Client } = require('pg');

const PORT = process.env.PORT || 3000;

// Build connection config from individual env vars (or DATABASE_URL as fallback)
// NOTE: In production, never hardcode credentials. Use Docker secrets or a
// .env file (excluded from version control) to supply sensitive values at runtime.
function getDbConfig() {
  if (process.env.DATABASE_URL) {
    return { connectionString: process.env.DATABASE_URL };
  }
  return {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    database: process.env.DB_NAME || 'appdb',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
  };
}

async function getClient() {
  const client = new Client(getDbConfig());
  await client.connect();
  return client;
}

const server = http.createServer(async (req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok' }));
    return;
  }

  let visitCount = 0;
  let dbConnected = false;
  let client;

  try {
    client = await getClient();
    // Record this visit
    await client.query('INSERT INTO visitors (visited_at) VALUES (NOW())');
    const result = await client.query('SELECT COUNT(*) AS count FROM visitors');
    visitCount = parseInt(result.rows[0].count, 10);
    dbConnected = true;
  } catch (err) {
    console.error('DB error:', err.message);
  } finally {
    if (client) await client.end();
  }

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Docker Compose Demo</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 600px; margin: 60px auto; padding: 0 20px; }
    h1 { color: #0db7ed; }
    .counter { font-size: 3rem; font-weight: bold; color: #0db7ed; }
    .info { background: #f0f0f0; padding: 16px; border-radius: 8px; margin-top: 16px; }
    code { background: #ddd; padding: 2px 6px; border-radius: 3px; }
    .status { display:inline-block; padding: 4px 8px; border-radius: 4px; }
    .ok { background: #d4edda; color: #155724; }
    .err { background: #f8d7da; color: #721c24; }
  </style>
</head>
<body>
  <h1>🐳 Docker Compose Demo</h1>
  <p>This page is served by a Node.js app connected to PostgreSQL.</p>
  <p>Total visits: <span class="counter">${visitCount}</span></p>
  <div class="info">
    <p><strong>Database:</strong>
      <span class="status ${dbConnected ? 'ok' : 'err'}">
        ${dbConnected ? '✅ Connected' : '❌ Not connected'}
      </span>
    </p>
    <p>Reload the page to increment the counter.</p>
    <p><strong>Database GUI:</strong> <a href="http://localhost:8080">Adminer (port 8080)</a></p>
  </div>
</body>
</html>`;

  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(html);
});

server.listen(PORT, () => {
  const cfg = getDbConfig();
  console.log(`Web app listening on port ${PORT}`);
  console.log(`Database host: ${cfg.host || '(from DATABASE_URL)'}`);
});
