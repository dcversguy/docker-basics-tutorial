const http = require('http');
const fs = require('fs');
const path = require('path');
const { URLSearchParams } = require('url');

const PORT = process.env.PORT || 3000;
const DATA_DIR = process.env.DATA_DIR || '/data';
const NOTES_FILE = path.join(DATA_DIR, 'notes.json');

// Ensure the data directory exists
try {
  fs.mkdirSync(DATA_DIR, { recursive: true });
} catch (_) {}

function loadNotes() {
  try {
    return JSON.parse(fs.readFileSync(NOTES_FILE, 'utf8'));
  } catch (_) {
    return [];
  }
}

function saveNotes(notes) {
  fs.writeFileSync(NOTES_FILE, JSON.stringify(notes, null, 2));
}

const server = http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/add') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      const params = new URLSearchParams(body);
      const text = params.get('note') || '';
      if (text.trim()) {
        const notes = loadNotes();
        notes.push({ id: Date.now(), text: text.trim(), created: new Date().toISOString() });
        saveNotes(notes);
      }
      res.writeHead(302, { Location: '/' });
      res.end();
    });
    return;
  }

  if (req.method === 'POST' && req.url.startsWith('/delete/')) {
    const id = parseInt(req.url.replace('/delete/', ''), 10);
    const notes = loadNotes().filter(n => n.id !== id);
    saveNotes(notes);
    res.writeHead(302, { Location: '/' });
    res.end();
    return;
  }

  const notes = loadNotes();
  const notesHtml = notes.length === 0
    ? '<p><em>No notes yet. Add one above!</em></p>'
    : notes.map(n => `
        <li>
          <span>${escapeHtml(n.text)}</span>
          <small style="color:#888"> — ${n.created}</small>
          <form method="POST" action="/delete/${n.id}" style="display:inline">
            <button type="submit" style="margin-left:8px;color:red;border:none;background:none;cursor:pointer">✕</button>
          </form>
        </li>`).join('');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Persistent Notes</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 600px; margin: 60px auto; padding: 0 20px; }
    h1 { color: #0db7ed; }
    input[type=text] { width: 70%; padding: 8px; }
    button[type=submit] { padding: 8px 16px; }
    ul { list-style: none; padding: 0; }
    li { padding: 8px 0; border-bottom: 1px solid #eee; }
    .storage-info { background: #f0f0f0; padding: 12px; border-radius: 8px; margin-top: 24px; font-size: 0.9em; }
    code { background: #ddd; padding: 2px 6px; border-radius: 3px; }
  </style>
</head>
<body>
  <h1>📝 Persistent Notes</h1>
  <form method="POST" action="/add">
    <input type="text" name="note" placeholder="Type a note..." required>
    <button type="submit">Add</button>
  </form>
  <ul>${notesHtml}</ul>
  <div class="storage-info">
    <strong>Storage:</strong> Notes are saved to <code>${NOTES_FILE}</code> inside the container.<br>
    Mount a volume to <code>${DATA_DIR}</code> to persist notes across container restarts.
  </div>
</body>
</html>`;

  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(html);
});

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

server.listen(PORT, () => {
  console.log(`Notes app running on port ${PORT}`);
  console.log(`Data directory: ${DATA_DIR}`);
});
