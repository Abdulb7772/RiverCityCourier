const express = require('express');
const {
  listCustomers,
  getCustomer,
  patchCustomerStatus,
} = require('../controllers/customerController');

const router = express.Router();

router.get('/', listCustomers);
router.get('/:customerId', getCustomer);
router.patch('/:customerId/status', patchCustomerStatus);

module.exports = router;
