/**
 * Company model — organizations whose sustainability commitments we track.
 */
const mongoose = require('mongoose');

const companySchema = new mongoose.Schema(
  {
    // Display name (e.g. "Acme Corp")
    name: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
    },
    // Optional sector for filtering on the dashboard
    industry: {
      type: String,
      trim: true,
      default: '',
    },
    // Company website for reference
    website: {
      type: String,
      trim: true,
      default: '',
    },
    // Short description shown in the UI
    description: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Helpful for searching companies by name
companySchema.index({ name: 1 });

module.exports = mongoose.model('Company', companySchema);
