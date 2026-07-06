const { ObjectId } = require('mongodb');
const { getAllOrders, getOrderById, createOrder, updateOrderStatus, assignDriver, updateOrderFields, formatOrder } = require('../models/orderModel');
const { insertActivity } = require('../models/activityModel');
const { insertNotification } = require('../models/notificationModel');

async function listOrders(req, res) {
  try {
    const { customer, customerEmail } = req.query;
    const orders = await getAllOrders(customer, customerEmail);
    return res.json(orders.map(formatOrder));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to fetch orders.';
    return res.status(500).json({ error: message });
  }
}

async function getOrder(req, res) {
  try {
    const { orderId } = req.params;

    if (!orderId || !ObjectId.isValid(orderId)) {
      return res.status(400).json({ error: 'Invalid order ID.' });
    }

    const order = await getOrderById(orderId);

    if (!order) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    return res.json(formatOrder(order));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to fetch order.';
    return res.status(500).json({ error: message });
  }
}

async function postOrder(req, res) {
  try {
    const { customer, pickup, destination, priority, paymentMethod, eta, packageType, distance, contact, note, customerEmail, pickupName, pickupContact, pickupItems, pickupQuantity, pickupVehicleType, deliveryName, deliveryContact, deliveryItems, deliveryQuantity, deliveryVehicleType, pickupDate, deliveryDate, pickupTime, deliveryTime } = req.body || {};

    if (!customer || !pickup || !destination) {
      return res.status(400).json({ error: 'Customer, pickup, and destination are required.' });
    }

    const newOrder = await createOrder({
      customer,
      customerEmail: customerEmail || '',
      pickup,
      destination,
      priority: priority || 'Medium',
      paymentMethod: paymentMethod || 'Cash',
      eta: eta || '',
      packageType: packageType || '',
      distance: distance || '',
      contact: contact || '',
      note: note || '',
      assignedDriver: 'Unassigned',
      pickupName: pickupName || customer,
      pickupContact: pickupContact || contact,
      pickupItems: pickupItems || packageType || '',
      pickupQuantity: pickupQuantity || '',
      pickupVehicleType: pickupVehicleType || '',
      deliveryName: deliveryName || '',
      deliveryContact: deliveryContact || '',
      deliveryItems: deliveryItems || '',
      deliveryQuantity: deliveryQuantity || '',
      deliveryVehicleType: deliveryVehicleType || '',
      pickupDate: pickupDate || '',
      deliveryDate: deliveryDate || '',
      pickupTime: pickupTime || '',
      deliveryTime: deliveryTime || '',
    });

    insertActivity({
      type: 'create',
      description: `Created order for ${customer}`,
      user: 'Admin',
      location: '',
      duration: '',
    }).catch(() => {});

    insertNotification({
      recipientRole: 'admin',
      title: 'New Order Placed',
      message: `Order created for ${customer} — Pickup: ${pickup}, Destination: ${destination}.`,
      type: 'order_created',
      referenceId: newOrder._id.toString(),
    }).catch(() => {});

    if (customerEmail) {
      insertNotification({
        recipientRole: 'customer',
        recipientEmail: customerEmail,
        title: 'Order Placed Successfully',
        message: `Your order has been placed. Pickup: ${pickup}, Destination: ${destination}. Current status: New.`,
        type: 'order_created',
        referenceId: newOrder._id.toString(),
      }).catch(() => {});
    }

    return res.status(201).json(formatOrder(newOrder));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to create order.';
    return res.status(500).json({ error: message });
  }
}

async function patchOrderStatus(req, res) {
  try {
    const { orderId } = req.params;
    const body = req.body || {};

    if (!orderId || !ObjectId.isValid(orderId)) {
      return res.status(400).json({ error: 'Invalid order ID.' });
    }

    // If status is provided, handle as status update
    if (body.status) {
      const validStatuses = ['new', 'processing', 'picked_up', 'completed', 'rejected'];
      if (!validStatuses.includes(body.status)) {
        return res.status(400).json({ error: `Status must be one of: ${validStatuses.join(', ')}` });
      }

      const updated = await updateOrderStatus(orderId, body.status);

      if (!updated) {
        return res.status(404).json({ error: 'Order not found.' });
      }

      insertActivity({
        type: 'update',
        description: `Updated order #${orderId} status to "${body.status}"`,
        user: 'Admin',
        location: '',
        duration: '',
      }).catch(() => {});

      insertNotification({
        recipientRole: 'admin',
        title: 'Order Status Updated',
        message: `Order #${orderId} status changed to "${body.status}".`,
        type: 'order_status',
        referenceId: orderId,
      }).catch(() => {});

      if (updated.customerEmail) {
        insertNotification({
          recipientRole: 'customer',
          recipientEmail: updated.customerEmail,
          title: 'Order Status Update',
          message: `Your order #${orderId} status has been updated to "${body.status}".`,
          type: 'order_status',
          referenceId: orderId,
        }).catch(() => {});
      }

      const driverEmail = updated.assignedDriver;
      if (driverEmail && driverEmail !== 'Unassigned') {
        insertNotification({
          recipientRole: 'driver',
          recipientEmail: driverEmail,
          title: 'Order Status Update',
          message: `Order #${orderId} assigned to you has been updated to "${body.status}".`,
          type: 'order_status',
          referenceId: orderId,
        }).catch(() => {});
      }

      return res.json(formatOrder(updated));
    }

    // Otherwise handle as general field update
    const order = await getOrderById(orderId);
    if (!order) return res.status(404).json({ error: 'Order not found.' });

    const isAssigned = order.assignedDriver && order.assignedDriver !== 'Unassigned';
    if (isAssigned) {
      return res.status(403).json({ error: 'Order cannot be modified after a driver has been assigned.' });
    }

    const updated = await updateOrderFields(orderId, body);
    if (!updated) {
      return res.status(400).json({ error: 'No valid fields provided for update.' });
    }

    return res.json(formatOrder(updated));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to update order.';
    return res.status(500).json({ error: message });
  }
}

async function assignDriverToOrder(req, res) {
  try {
    const { orderId } = req.params;
    const { driverEmail } = req.body || {};

    if (!orderId || !ObjectId.isValid(orderId)) {
      return res.status(400).json({ error: 'Invalid order ID.' });
    }

    if (!driverEmail) {
      return res.status(400).json({ error: 'Driver email is required.' });
    }

    const updated = await assignDriver(orderId, driverEmail);

    if (!updated) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    insertActivity({
      type: 'update',
      description: `Assigned order #${orderId} to driver ${driverEmail}`,
      user: 'Admin',
      location: '',
      duration: '',
    }).catch(() => {});

    insertNotification({
      recipientRole: 'admin',
      title: 'Driver Assigned',
      message: `Order #${orderId} assigned to driver ${driverEmail}.`,
      type: 'driver_assigned',
      referenceId: orderId,
    }).catch(() => {});

    insertNotification({
      recipientRole: 'driver',
      recipientEmail: driverEmail,
      title: 'New Order Assigned',
      message: `You have been assigned to order #${orderId}. Check your orders for details.`,
      type: 'driver_assigned',
      referenceId: orderId,
    }).catch(() => {});

    if (updated.customerEmail) {
      insertNotification({
        recipientRole: 'customer',
        recipientEmail: updated.customerEmail,
        title: 'Driver Assigned to Your Order',
        message: `A driver has been assigned to your order #${orderId}.`,
        type: 'driver_assigned',
        referenceId: orderId,
      }).catch(() => {});
    }

    return res.json(formatOrder(updated));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to assign driver.';
    return res.status(500).json({ error: message });
  }
}

module.exports = {
  listOrders,
  getOrder,
  postOrder,
  patchOrderStatus,
  assignDriverToOrder,
};
