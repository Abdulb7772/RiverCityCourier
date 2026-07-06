const { getOrdersByDriver, getOrderById, getActiveOrder, getCompletedOrders, updateOrderStatus, updateOrderPhotos } = require('../models/driverOrderModel');
const { insertActivity } = require('../models/activityModel');
const { insertNotification } = require('../models/notificationModel');

async function listAssignedOrders(req, res) {
  try {
    const email = req.query.email || '';
    if (!email) {
      return res.status(400).json({ error: 'Driver email is required.' });
    }
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const result = await getOrdersByDriver(email, page, limit);
    return res.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch assigned orders.';
    return res.status(500).json({ error: message });
  }
}

async function getAssignedOrder(req, res) {
  try {
    const { orderId } = req.params;
    const email = req.query.email || '';
    if (!email) {
      return res.status(400).json({ error: 'Driver email is required.' });
    }
    const order = await getOrderById(orderId);
    if (!order || String(order.assignedDriver || '').trim().toLowerCase() !== String(email || '').trim().toLowerCase()) {
      return res.status(404).json({ error: 'Order not found.' });
    }
    return res.json(order);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch order.';
    return res.status(500).json({ error: message });
  }
}

async function patchOrderStatus(req, res) {
  try {
    const { orderId } = req.params;
    const { status } = req.body || {};
    const email = req.query.email || '';
    if (!email) {
      return res.status(400).json({ error: 'Driver email is required.' });
    }
    const validStatuses = ['accepted', 'arrived_at_pickup', 'picked_up', 'in_transit', 'arrived_at_destination', 'completed'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ error: `Status must be one of: ${validStatuses.join(', ')}` });
    }
    const order = await getOrderById(orderId);
    if (!order || String(order.assignedDriver || '').trim().toLowerCase() !== String(email || '').trim().toLowerCase()) {
      return res.status(404).json({ error: 'Order not found or not assigned to you.' });
    }
    const updated = await updateOrderStatus(orderId, status);
    insertActivity({
      type: 'update',
      description: `Driver updated order #${orderId} status to "${status}"`,
      user: email,
      location: '',
      duration: '',
    }).catch(() => {});

    insertNotification({
      recipientRole: 'admin',
      title: 'Driver Order Update',
      message: `Driver ${email} updated order #${orderId} status to "${status}".`,
      type: 'order_status',
      referenceId: orderId,
    }).catch(() => {});

    if (updated.customerEmail) {
      insertNotification({
        recipientRole: 'customer',
        recipientEmail: updated.customerEmail,
        title: 'Order Status Update',
        message: `Your order #${orderId} has been updated to "${status}" by the driver.`,
        type: 'order_status',
        referenceId: orderId,
      }).catch(() => {});
    }

    return res.json(updated);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update order.';
    return res.status(500).json({ error: message });
  }
}

async function patchOrderPhotos(req, res) {
  try {
    const { orderId } = req.params;
    const { field, photos } = req.body || {};
    const email = req.query.email || '';
    if (!email) return res.status(400).json({ error: 'Driver email is required.' });
    if (!field || !['pickupPhotos', 'deliveryPhoto'].includes(field)) {
      return res.status(400).json({ error: 'Field must be pickupPhotos or deliveryPhoto.' });
    }
    if (!photos) return res.status(400).json({ error: 'Photos data is required.' });
    const order = await getOrderById(orderId);
    if (!order || String(order.assignedDriver || '').trim().toLowerCase() !== String(email || '').trim().toLowerCase()) {
      return res.status(404).json({ error: 'Order not found or not assigned to you.' });
    }
    const updated = await updateOrderPhotos(orderId, field, photos);
    return res.json(updated);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update photos.';
    return res.status(500).json({ error: message });
  }
}

async function listCompletedOrders(req, res) {
  try {
    const email = req.query.email || '';
    if (!email) return res.status(400).json({ error: 'Driver email is required.' });
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const result = await getCompletedOrders(email, page, limit);
    return res.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch completed orders.';
    return res.status(500).json({ error: message });
  }
}

async function getActiveOrderHandler(req, res) {
  try {
    const email = req.query.email || '';
    if (!email) return res.status(400).json({ error: 'Driver email is required.' });
    const order = await getActiveOrder(email);
    if (!order) return res.json(null);
    return res.json(order);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch active order.';
    return res.status(500).json({ error: message });
  }
}

module.exports = {
  listAssignedOrders,
  getAssignedOrder,
  listCompletedOrders,
  getActiveOrderHandler,
  patchOrderStatus,
  patchOrderPhotos,
};
