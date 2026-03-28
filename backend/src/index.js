/**
 * Corporate Commitment Monitor — Express API entry point.
 * Connects to MongoDB, then listens (avoids handling API traffic before DB is ready).
 */
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const { mongoStatus } = require('./config/db');

const app = express();

// GitHub Pages + local dev: reflect the browser Origin so preflight + JSON POST work cross-origin
const corsOptions = {
  origin: true,
  credentials: false,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 204,
};
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(express.json());

// Browser-friendly root — API has no React UI on this port
app.get('/', (req, res) => {
  const portHint = process.env.PORT || 5000;
  res.type('html').send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title>Corporate Commitment Monitor API</title>
  <style>
    body { font-family: system-ui,Segoe UI,sans-serif; max-width: 40rem; margin: 2rem auto; padding: 0 1rem; line-height: 1.5; color: #0f172a; }
    code { background: #f1f5f9; padding: .15rem .4rem; border-radius: 4px; }
    a { color: #0d9488; }
    ul { padding-left: 1.2rem; }
  </style>
</head>
<body>
  <h1>Corporate Commitment Monitor</h1>
  <p>This address is the <strong>API server</strong> (Express on port <code>${portHint}</code>), not the web dashboard.</p>
  <p><strong>Web UI:</strong> use your GitHub Pages or local <code>npm run dev</code> in <code>frontend</code>.</p>
  <p><strong>Quick checks:</strong></p>
  <ul>
    <li><a href="/api/health">GET /api/health</a> — server + MongoDB status (JSON)</li>
    <li><a href="/api/companies">GET /api/companies</a> — list companies (JSON)</li>
  </ul>
</body>
</html>`);
});

// REST resources
app.use('/api/companies', require('./routes/companyRoutes'));
app.use('/api/commitments', require('./routes/commitmentRoutes'));
app.use('/api/news', require('./routes/newsRoutes'));

// Simple health check — use this to confirm the server and DB are up
app.get('/api/health', (req, res) => {
  const m = mongoStatus();
  res.json({
    ok: true,
    service: 'Corporate Commitment Monitor API',
    mongo: m.connected ? 'connected' : m.label,
    mongoState: m.state,
  });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Ensure error responses still include CORS headers (browser otherwise reports "CORS" on 500s)
app.use((err, req, res, next) => {
  console.error(err);
  const origin = req.headers.origin;
  if (origin) res.setHeader('Access-Control-Allow-Origin', origin);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

const PORT = Number(process.env.PORT) || 5000;
const HOST = process.env.HOST || '0.0.0.0';

connectDB()
  .then(() => {
    app.listen(PORT, HOST, () => {
      console.log(`Server listening on http://${HOST}:${PORT}`);
    });
  })
  .catch((e) => {
    console.error('Startup failed:', e.message);
    process.exit(1);
  });
