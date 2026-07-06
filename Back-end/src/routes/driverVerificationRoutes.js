const express = require('express');
const router = express.Router();
const { getVerificationHandler, uploadDocumentHandler } = require('../controllers/driverVerificationController');

router.get('/', getVerificationHandler);
router.post('/', uploadDocumentHandler);

module.exports = router;
