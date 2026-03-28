/**
 * MongoDB connection using Mongoose.
 * Loads the URI from environment variables (see .env.example).
 */
const mongoose = require('mongoose');

/**
 * Connect once; throws if URI missing or connection fails (caller can exit).
 */
async function connectDB() {
  const uri = (process.env.MONGODB_URI || process.env.DATABASE_URL || '').trim();
  if (!uri) {
    console.error(
      'MongoDB connection string missing. In Render: Web Service → Environment → add MONGODB_URI or DATABASE_URL (Atlas mongodb+srv://...).'
    );
    throw new Error('MONGODB_URI / DATABASE_URL is not set');
  }

  await mongoose.connect(uri);
  console.log(`MongoDB connected: ${mongoose.connection.host}`);
}

module.exports = connectDB;
