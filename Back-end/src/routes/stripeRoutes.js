const express = require('express');
const { createCheckoutSession, confirmPayment, handleWebhook } = require('../controllers/stripeController');

const router = express.Router();

router.post('/create-checkout', createCheckoutSession);
router.post('/confirm-payment', confirmPayment);
router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);

module.exports = router;
