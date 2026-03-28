/**
 * Corporate Commitment Monitor — Express API entry point.
 * Connects to MongoDB and exposes a small health route for verification.
 */
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Connect to MongoDB before handling requests
connectDB();

const app = express();

// Allow the React dev server (or other origins) to call this API
app.use(cors());
// Parse JSON request bodies
app.use(express.json());

// Browser-friendly root — API has no React UI on this port
app.get('/', (req, res) => {
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
  <p>This address is the <strong>API server</strong> (Express on port <code>${process.env.PORT || 5000}</code>), not the web dashboard.</p>
  <p><strong>Web UI:</strong> run <code>npm run dev</code> in the <code>frontend</code> folder, then open <a href="http://localhost:5173">http://localhost:5173</a> (Vite default port).</p>
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
  res.json({
    ok: true,
    service: 'Corporate Commitment Monitor API',
    mongo:
      require('mongoose').connection.readyState === 1 ? 'connected' : 'disconnected',
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
