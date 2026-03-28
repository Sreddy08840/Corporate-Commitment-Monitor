/**
 * MongoDB connection using Mongoose.
 * Loads the URI from environment variables (see .env.example).
 */
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Render / Atlas: set MONGODB_URI in the dashboard. DATABASE_URL is a common alias on some hosts.
    const uri = (process.env.MONGODB_URI || process.env.DATABASE_URL || '').trim();
    if (!uri) {
      console.error(
        'MongoDB connection string missing. Add an environment variable in your host (e.g. Render →'
      );
      console.error(
        '  Dashboard → your Web Service → Environment → Environment Variables) with either:'
      );
      console.error('  • MONGODB_URI = your Atlas connection string (mongodb+srv://...), or');
      console.error('  • DATABASE_URL = same string');
      console.error('Then save and redeploy.');
      process.exit(1);
    }

    const conn = await mongoose.connect(uri);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
