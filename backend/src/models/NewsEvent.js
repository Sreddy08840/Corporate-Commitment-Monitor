/**
 * NewsEvent model — an article or update about a company;
 * AI will classify how it relates to tracked commitments.
 */
const mongoose = require('mongoose');

// Labels produced by the AI classifier (matches app requirements)
const aiClassificationValues = ['Progress', 'Delay', 'Reversal', 'Unrelated'];

const newsEventSchema = new mongoose.Schema(
  {
    // Company this news is primarily about
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: [true, 'Company is required'],
    },
    // Optional: tie the story to a specific commitment
    commitment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Commitment',
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    // Original article or press release URL
    sourceUrl: {
      type: String,
      trim: true,
      default: '',
    },
    // Short excerpt or manual summary before AI runs
    summary: {
      type: String,
      trim: true,
      default: '',
    },
    // When the news was published (if known)
    publishedAt: {
      type: Date,
    },
    // Optional full text for AI classification
    content: {
      type: String,
      default: '',
    },
    // Result from the AI classifier
    aiClassification: {
      type: String,
      enum: aiClassificationValues,
    },
    // Optional 0–1 score from the model (if your AI returns it)
    aiConfidence: {
      type: Number,
      min: 0,
      max: 1,
    },
    // Short explanation from the classifier (OpenAI or mock)
    aiReason: {
      type: String,
      default: '',
    },
    // True when classification is Delay or Reversal — surfaces critical dashboard alerts
    alert: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

newsEventSchema.index({ company: 1, publishedAt: -1 });
newsEventSchema.index({ aiClassification: 1 });
newsEventSchema.index({ alert: 1, publishedAt: -1 });

const NewsEvent = mongoose.model('NewsEvent', newsEventSchema);
NewsEvent.classificationValues = aiClassificationValues;
module.exports = NewsEvent;
