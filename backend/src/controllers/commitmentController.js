/**
 * HTTP handlers for commitments.
 */
const mongoose = require('mongoose');
const Company = require('../models/Company');
const Commitment = require('../models/Commitment');
const dbReady = require('../middleware/dbReady');

function invalidId(res) {
  return res.status(400).json({ error: 'Invalid companyId' });
}

/** POST /api/commitments — create a commitment */
exports.createCommitment = async (req, res) => {
  try {
    if (!dbReady(res)) return;
    const { companyId, title, description, category, targetDate, status } = req.body;

    if (!companyId || !mongoose.Types.ObjectId.isValid(companyId)) {
      return invalidId(res);
    }
    if (!title || typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({ error: 'title is required' });
    }

    const companyExists = await Company.exists({ _id: companyId });
    if (!companyExists) {
      return res.status(400).json({ error: 'Company not found' });
    }

    const commitment = await Commitment.create({
      company: companyId,
      title: title.trim(),
      description: description ?? '',
      category: category ?? '',
      targetDate: targetDate ? new Date(targetDate) : undefined,
      status: status || 'active',
    });

    return res.status(201).json(commitment);
  } catch (err) {
    console.error('createCommitment:', err.message);
    return res.status(500).json({ error: 'Failed to create commitment' });
  }
};

/** GET /api/commitments — list commitments (optional ?companyId=) */
exports.listCommitments = async (req, res) => {
  try {
    if (!dbReady(res)) return;
    const { companyId } = req.query;
    const filter = {};

    if (companyId) {
      if (!mongoose.Types.ObjectId.isValid(companyId)) {
        return invalidId(res);
      }
      filter.company = companyId;
    }

    const commitments = await Commitment.find(filter)
      .populate('company', 'name industry')
      .sort({ createdAt: -1 })
      .lean();

    return res.json(commitments);
  } catch (err) {
    console.error('listCommitments:', err.message);
    return res.status(500).json({ error: 'Failed to list commitments' });
  }
};
