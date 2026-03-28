/**
 * /api/companies
 */
const express = require('express');
const companyController = require('../controllers/companyController');

const router = express.Router();

router.post('/', companyController.createCompany);
router.get('/', companyController.listCompanies);

module.exports = router;
