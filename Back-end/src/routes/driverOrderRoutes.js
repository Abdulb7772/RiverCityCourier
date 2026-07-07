const express = require('express');
const router = express.Router();
const { listAssignedOrders, getAssignedOrder, listCompletedOrders, getActiveOrderHandler, patchOrderStatus, patchOrderPhotos, patchOrderCodAmount } = require('../controllers/driverOrderController');

router.get('/', listAssignedOrders);
router.get('/active', getActiveOrderHandler);
router.get('/completed', listCompletedOrders);
router.get('/:orderId', getAssignedOrder);
router.patch('/:orderId', patchOrderStatus);
router.patch('/:orderId/photos', patchOrderPhotos);
router.patch('/:orderId/cod-amount', patchOrderCodAmount);

module.exports = router;
