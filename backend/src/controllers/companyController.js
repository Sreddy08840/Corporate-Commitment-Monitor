/**
 * HTTP handlers for companies.
 */
const Company = require('../models/Company');

/** POST /api/companies — create a company */
exports.createCompany = async (req, res) => {
  try {
    const { name, industry, website, description } = req.body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ error: 'name is required' });
    }

    const company = await Company.create({
      name: name.trim(),
      industry: industry ?? '',
      website: website ?? '',
      description: description ?? '',
    });

    return res.status(201).json(company);
  } catch (err) {
    console.error('createCompany:', err.message);
    return res.status(500).json({ error: 'Failed to create company' });
  }
};

/** GET /api/companies — list all companies */
exports.listCompanies = async (req, res) => {
  try {
    const companies = await Company.find().sort({ name: 1 }).lean();
    return res.json(companies);
  } catch (err) {
    console.error('listCompanies:', err.message);
    return res.status(500).json({ error: 'Failed to list companies' });
  }
};
