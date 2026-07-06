const express = require('express');
const router = express.Router();
const { listAllVerifications, getVerificationByEmail, updateDocumentStatus } = require('../controllers/adminVerificationController');

router.get('/', listAllVerifications);
router.get('/:email', getVerificationByEmail);
router.patch('/:email', updateDocumentStatus);

module.exports = router;
