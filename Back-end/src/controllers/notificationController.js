const {
  insertNotification,
  getNotificationsByRole,
  getNotificationsByEmail,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
} = require('../models/notificationModel');

async function getAdminNotifications(req, res) {
  try {
    const notifications = await getNotificationsByRole('admin');
    const unreadCount = await getUnreadCount('admin');
    return res.json({ notifications, unreadCount });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to fetch notifications.';
    return res.status(500).json({ error: message });
  }
}

async function getCustomerNotifications(req, res) {
  try {
    const email = req.query.email || '';
    if (!email) return res.status(400).json({ error: 'Email is required.' });
    const notifications = await getNotificationsByEmail('customer', email);
    const unreadCount = await getUnreadCount('customer', email);
    return res.json({ notifications, unreadCount });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to fetch notifications.';
    return res.status(500).json({ error: message });
  }
}

async function getDriverNotifications(req, res) {
  try {
    const email = req.query.email || '';
    if (!email) return res.status(400).json({ error: 'Email is required.' });
    const notifications = await getNotificationsByEmail('driver', email);
    const unreadCount = await getUnreadCount('driver', email);
    return res.json({ notifications, unreadCount });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to fetch notifications.';
    return res.status(500).json({ error: message });
  }
}

async function markNotificationRead(req, res) {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: 'Notification ID is required.' });
    await markAsRead(id);
    return res.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to mark notification as read.';
    return res.status(500).json({ error: message });
  }
}

async function markAllNotificationsRead(req, res) {
  try {
    const { role, email } = req.body || {};
    if (!role) return res.status(400).json({ error: 'Role is required.' });
    await markAllAsRead(role, email || null);
    return res.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to mark notifications as read.';
    return res.status(500).json({ error: message });
  }
}

module.exports = {
  getAdminNotifications,
  getCustomerNotifications,
  getDriverNotifications,
  markNotificationRead,
  markAllNotificationsRead,
};
