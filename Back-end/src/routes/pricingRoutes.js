const express = require('express');
const {
  getPricingConfig,
  patchPricingConfig,
} = require('../controllers/pricingController');

const router = express.Router();

router.get('/', getPricingConfig);
router.patch('/', patchPricingConfig);

module.exports = router;
