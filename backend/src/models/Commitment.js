/**
 * Commitment model — a specific sustainability pledge by a company
 * (e.g. net-zero by 2030, 100% renewable electricity).
 */
const mongoose = require('mongoose');

// High-level lifecycle of a commitment (dashboards can filter on this)
const commitmentStatusValues = ['active', 'achieved', 'revised', 'withdrawn'];

const commitmentSchema = new mongoose.Schema(
  {
    // Which company this commitment belongs to
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: [true, 'Company is required'],
    },
    title: {
      type: String,
      required: [true, 'Commitment title is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    // Broad theme (emissions, water, supply chain, etc.) — useful for grouping
    category: {
      type: String,
      trim: true,
      default: '',
    },
    // When the company aims to meet this commitment
    targetDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: commitmentStatusValues,
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
);

commitmentSchema.index({ company: 1, createdAt: -1 });

const Commitment = mongoose.model('Commitment', commitmentSchema);
Commitment.statusValues = commitmentStatusValues;
module.exports = Commitment;
