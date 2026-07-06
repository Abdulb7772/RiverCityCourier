const express = require('express');
const router = express.Router();
const { getAvailability, updateAvailability } = require('../controllers/driverAvailabilityController');

router.get('/', getAvailability);
router.patch('/', updateAvailability);

module.exports = router;
