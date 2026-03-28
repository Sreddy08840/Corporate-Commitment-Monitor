/**
 * /api/commitments
 */
const express = require('express');
const commitmentController = require('../controllers/commitmentController');

const router = express.Router();

router.post('/', commitmentController.createCommitment);
router.get('/', commitmentController.listCommitments);

module.exports = router;
