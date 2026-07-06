const express = require('express');
const router = express.Router();
const { getDriverProfile } = require('../controllers/driverProfileController');

router.get('/', getDriverProfile);

module.exports = router;
