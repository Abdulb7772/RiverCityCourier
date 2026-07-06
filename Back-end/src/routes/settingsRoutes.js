const express = require('express');
const {
  patchSettings,
} = require('../controllers/settingsController');

const router = express.Router();

router.patch('/', patchSettings);

module.exports = router;
