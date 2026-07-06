const express = require('express');
const router = express.Router();
const { listAssignedOrders, getAssignedOrder, listCompletedOrders, getActiveOrderHandler, patchOrderStatus, patchOrderPhotos } = require('../controllers/driverOrderController');

router.get('/', listAssignedOrders);
router.get('/active', getActiveOrderHandler);
router.get('/completed', listCompletedOrders);
router.get('/:orderId', getAssignedOrder);
router.patch('/:orderId', patchOrderStatus);
router.patch('/:orderId/photos', patchOrderPhotos);

module.exports = router;
