const express = require('express');
const router = express.Router();
const { getDriverDashboardStats } = require('../controllers/driverDashboardController');

router.get('/', getDriverDashboardStats);

module.exports = router;
