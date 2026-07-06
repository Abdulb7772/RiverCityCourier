const express = require('express');
const {
  getReportData,
} = require('../controllers/reportController');

const router = express.Router();

router.get('/', getReportData);

module.exports = router;
