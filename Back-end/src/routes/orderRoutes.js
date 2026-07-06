const express = require('express');
const {
  listOrders,
  getOrder,
  postOrder,
  patchOrderStatus,
  assignDriverToOrder,
} = require('../controllers/orderController');

const router = express.Router();

router.get('/', listOrders);
router.post('/', postOrder);
router.get('/:orderId', getOrder);
router.patch('/:orderId', patchOrderStatus);
router.patch('/:orderId/assign', assignDriverToOrder);

module.exports = router;
