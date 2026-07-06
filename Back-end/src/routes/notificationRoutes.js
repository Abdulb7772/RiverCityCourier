const express = require('express');
const {
  getAdminNotifications,
  getCustomerNotifications,
  getDriverNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} = require('../controllers/notificationController');

const router = express.Router();

function resolveHandler(req, res) {
  const base = req.baseUrl || '';
  if (base.includes('/customer/')) return getCustomerNotifications(req, res);
  if (base.includes('/driver/')) return getDriverNotifications(req, res);
  return getAdminNotifications(req, res);
}

router.get('/', resolveHandler);
router.patch('/:id/read', markNotificationRead);
router.patch('/read-all', markAllNotificationsRead);

module.exports = router;
