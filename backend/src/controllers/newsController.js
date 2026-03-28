/**
 * HTTP handlers for news items (NewsEvent documents).
 * API uses companyId + date; the model uses company + publishedAt.
 */
const mongoose = require('mongoose');
const Company = require('../models/Company');
const Commitment = require('../models/Commitment');
const NewsEvent = require('../models/NewsEvent');
const { classifyNews } = require('../services/classifyNews');

function invalidCompanyId(res) {
  return res.status(400).json({ error: 'Invalid companyId' });
}

/** Delay / Reversal → stored alert flag and dashboard warnings */
function alertFromClassification(label) {
  return label === 'Delay' || label === 'Reversal';
}

/**
 * Resolve alert for API JSON (supports legacy docs before `alert` existed).
 */
function serializeAlert(doc) {
  if (typeof doc.alert === 'boolean') return doc.alert;
  return alertFromClassification(doc.aiClassification);
}

/** Shape one document for JSON: companyId, title, content, date + extras */
function serializeNews(doc) {
  const companyId = doc.company?._id
    ? String(doc.company._id)
    : String(doc.company);

  const dateVal = doc.publishedAt || doc.createdAt;

  return {
    _id: doc._id,
    companyId,
    title: doc.title,
    content: doc.content ?? '',
    date: dateVal ? new Date(dateVal).toISOString() : null,
    // Optional fields for dashboards / AI later
    sourceUrl: doc.sourceUrl,
    summary: doc.summary,
    commitment: doc.commitment,
    aiClassification: doc.aiClassification,
    aiConfidence: doc.aiConfidence,
    aiReason: doc.aiReason,
    alert: serializeAlert(doc),
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

/**
 * Build commitment text for the classifier: one commitment or a summary of the company's commitments.
 */
async function resolveCommitmentText(companyId, commitmentId) {
  if (commitmentId && mongoose.Types.ObjectId.isValid(commitmentId)) {
    const c = await Commitment.findOne({ _id: commitmentId, company: companyId }).lean();
    if (!c) return null; // signal invalid
    const parts = [c.title, c.description].filter(Boolean);
    return parts.join('\n');
  }

  const list = await Commitment.find({ company: companyId })
    .sort({ createdAt: -1 })
    .limit(5)
    .lean();

  if (!list.length) {
    return 'No tracked commitments on file for this company.';
  }

  return list
    .map((c) => {
      const d = c.description ? ` — ${c.description}` : '';
      return `${c.title}${d}`;
    })
    .join('\n');
}

/** POST /api/news — add a news item (AI classification stored on the document) */
exports.createNews = async (req, res) => {
  try {
    const { companyId, title, content, date, commitmentId } = req.body;

    if (!companyId || !mongoose.Types.ObjectId.isValid(companyId)) {
      return invalidCompanyId(res);
    }
    if (!title || typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({ error: 'title is required' });
    }
    if (content === undefined || content === null || typeof content !== 'string') {
      return res.status(400).json({ error: 'content is required' });
    }

    const companyDoc = await Company.findById(companyId).select('name').lean();
    if (!companyDoc) {
      return res.status(400).json({ error: 'Company not found' });
    }

    let commitmentRef;
    let commitmentText;

    if (commitmentId) {
      if (!mongoose.Types.ObjectId.isValid(commitmentId)) {
        return res.status(400).json({ error: 'Invalid commitmentId' });
      }
      commitmentText = await resolveCommitmentText(companyId, commitmentId);
      if (commitmentText === null) {
        return res.status(400).json({ error: 'Commitment not found for this company' });
      }
      commitmentRef = commitmentId;
    } else {
      commitmentText = await resolveCommitmentText(companyId, null);
    }

    const publishedAt = date ? new Date(date) : new Date();
    if (Number.isNaN(publishedAt.getTime())) {
      return res.status(400).json({ error: 'date must be a valid date string' });
    }

    const newsText = `${title.trim()}\n${content}`;
    const classification = await classifyNews(newsText, commitmentText, companyDoc.name);
    const alertFlag = alertFromClassification(classification.label);

    const news = await NewsEvent.create({
      company: companyId,
      commitment: commitmentRef,
      title: title.trim(),
      content: typeof content === 'string' ? content : '',
      publishedAt,
      aiClassification: classification.label,
      aiConfidence: classification.confidence,
      aiReason: classification.reason,
      alert: alertFlag,
    });

    const populated = await NewsEvent.findById(news._id)
      .populate('company', 'name')
      .lean();

    return res.status(201).json(serializeNews(populated));
  } catch (err) {
    console.error('createNews:', err.message);
    return res.status(500).json({ error: 'Failed to create news item' });
  }
};

/** GET /api/news — list news (optional ?companyId=) */
exports.listNews = async (req, res) => {
  try {
    const { companyId } = req.query;
    const filter = {};

    if (companyId) {
      if (!mongoose.Types.ObjectId.isValid(companyId)) {
        return invalidCompanyId(res);
      }
      filter.company = companyId;
    }

    const items = await NewsEvent.find(filter)
      .populate('company', 'name')
      .sort({ publishedAt: -1, createdAt: -1 })
      .lean();

    return res.json(items.map(serializeNews));
  } catch (err) {
    console.error('listNews:', err.message);
    return res.status(500).json({ error: 'Failed to list news' });
  }
};
