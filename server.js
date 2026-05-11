const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const os = require('os');

const app = express();
const PORT = process.env.PORT || 3000;

// --- Storage ---
const UPLOAD_DIR = path.join(__dirname, 'public', 'portraits');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const upload = multer({
  storage: multer.diskStorage({
    destination: (_, __, cb) => cb(null, UPLOAD_DIR),
    filename: (_, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
  }),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_, file, cb) => {
    const ok = /^image\/(jpeg|png|gif|webp)$/.test(file.mimetype);
    cb(ok ? null : new Error('Images only'), ok);
  }
});

// In-memory state
let npcs = [];       // [{ id, name, image }]
let activeId = null;  // currently displayed NPC id

// Scan portraits folder on startup and load files matching "<digits>-<name>.<ext>"
function loadPortraitsFromDisk() {
  const validExts = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp']);
  const files = fs.readdirSync(UPLOAD_DIR);
  for (const filename of files) {
    const match = filename.match(/^(\d+)-(.+)$/);
    if (!match) continue;
    const [, id, rest] = match;
    if (!validExts.has(path.extname(rest).toLowerCase())) continue;
    const name = path.basename(rest, path.extname(rest));
    npcs.push({ id, name, image: `/portraits/${filename}` });
  }
  npcs.sort((a, b) => Number(a.id) - Number(b.id));
}

// Local IP (calcolato una volta sola all'avvio)
function getLocalIP() {
  for (const iface of Object.values(os.networkInterfaces())) {
    for (const cfg of iface) {
      if (cfg.family === 'IPv4' && !cfg.internal) return cfg.address;
    }
  }
  return 'localhost';
}
const LOCAL_IP = getLocalIP();

// --- Middleware ---
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// --- API ---

// Server info (IP e porta per costruire l'URL player)
app.get('/api/info', (_, res) => res.json({ localIP: LOCAL_IP, port: PORT }));

// Get all NPCs
app.get('/api/npcs', (_, res) => res.json(npcs));

// Add NPC
app.post('/api/npcs', upload.single('image'), (req, res) => {
  if (!req.file || !req.body.name) return res.status(400).json({ error: 'name and image required' });
  const idMatch = req.file.filename.match(/^(\d+)-/);
  const npc = {
    id: idMatch ? idMatch[1] : Date.now().toString(),
    name: req.body.name.trim(),
    image: `/portraits/${req.file.filename}`
  };
  npcs.push(npc);
  res.status(201).json(npc);
});

// Delete NPC
app.delete('/api/npcs/:id', (req, res) => {
  const idx = npcs.findIndex(n => n.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'not found' });
  const [removed] = npcs.splice(idx, 1);
  // remove file
  const filePath = path.join(__dirname, 'public', removed.image);
  fs.unlink(filePath, () => {});
  if (activeId === removed.id) activeId = null;
  res.json({ ok: true });
});

// Get active NPC (player polling endpoint)
app.get('/api/active', (_, res) => {
  if (!activeId) return res.json({ active: null });
  const npc = npcs.find(n => n.id === activeId);
  res.json({ active: npc || null });
});

// Set active NPC
app.post('/api/active', (req, res) => {
  activeId = req.body.id || null;
  res.json({ ok: true, activeId });
});

// --- Page routes ---
app.get('/dm', (_, res) => res.sendFile(path.join(__dirname, 'public', 'dm.html')));
app.get('/players', (_, res) => res.sendFile(path.join(__dirname, 'public', 'players.html')));
app.get('/', (_, res) => res.redirect('/players'));

// --- Start ---
loadPortraitsFromDisk();

app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n  ⚔️  Dramatis Personae`);
  console.log(`  ─────────────────────`);
  console.log(`  DM Panel:     http://localhost:${PORT}/dm`);
  console.log(`  Player View:  http://${LOCAL_IP}:${PORT}/players`);
  console.log(`  Portraits:    ${npcs.length} loaded from disk`);
  console.log(`\n  Share the Player URL with phones on the same network.\n`);
});
