const mongoose = require('mongoose');

/** If Mongo is not connected, send 503 JSON and return false. */
function dbReady(res) {
  if (mongoose.connection.readyState === 1) return true;
  res.status(503).json({
    error: 'Database not connected',
    mongoState: mongoose.connection.readyState,
    hint: 'Check MONGODB_URI on Render and Atlas Network Access (0.0.0.0/0 for testing).',
  });
  return false;
}

module.exports = dbReady;
