/**
 * MongoDB connection using Mongoose.
 * Loads the URI from environment variables (see .env.example).
 */
const mongoose = require('mongoose');

const CONNECT_OPTS = {
  // Atlas / cloud: avoid hanging forever on bad network
  serverSelectionTimeoutMS: 20_000,
  socketTimeoutMS: 60_000,
  maxPoolSize: 10,
  // Helps some hosts (e.g. Render) stay warm with Atlas
  family: 4,
};

let keepAliveTimer;

function startKeepAlive() {
  if (keepAliveTimer) clearInterval(keepAliveTimer);
  keepAliveTimer = setInterval(async () => {
    if (mongoose.connection.readyState !== 1) return;
    try {
      await mongoose.connection.db.admin().command({ ping: 1 });
    } catch (e) {
      console.warn('Mongo ping failed:', e.message);
    }
  }, 60_000);
}

/**
 * Connect with retries (Render cold starts + transient DNS).
 */
async function connectDB() {
  const uri = (process.env.MONGODB_URI || process.env.DATABASE_URL || '').trim();
  if (!uri) {
    console.error(
      'MongoDB URI missing. Render → Web Service → Environment → MONGODB_URI or DATABASE_URL (Atlas mongodb+srv://...).'
    );
    throw new Error('MONGODB_URI / DATABASE_URL is not set');
  }

  mongoose.connection.on('error', (err) => console.error('Mongo connection error:', err.message));
  mongoose.connection.on('disconnected', () => console.warn('Mongo disconnected'));

  const attempts = 3;
  let lastErr;
  for (let i = 1; i <= attempts; i += 1) {
    try {
      if (mongoose.connection.readyState === 1) {
        console.log(`MongoDB already connected: ${mongoose.connection.host}`);
        startKeepAlive();
        return;
      }
      await mongoose.connect(uri, CONNECT_OPTS);
      console.log(`MongoDB connected: ${mongoose.connection.host}`);
      startKeepAlive();
      return;
    } catch (e) {
      lastErr = e;
      console.error(`Mongo connect attempt ${i}/${attempts} failed:`, e.message);
      if (i < attempts) await new Promise((r) => setTimeout(r, 3000 * i));
    }
  }
  throw lastErr;
}

function mongoStatus() {
  const s = mongoose.connection.readyState;
  const labels = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };
  return {
    state: s,
    label: labels[s] || 'unknown',
    connected: s === 1,
  };
}

module.exports = connectDB;
module.exports.mongoStatus = mongoStatus;
