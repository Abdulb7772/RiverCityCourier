const { ObjectId } = require('mongodb');
const { getAllCustomers, getCustomerById, updateUserStatus } = require('../models/userModel');
const { insertActivity } = require('../models/activityModel');
const { insertNotification } = require('../models/notificationModel');

function formatCustomer(user) {
  return {
    id: user._id.toString(),
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
    role: user.role,
    status: user.status || 'active',
    createdAt: user.createdAt,
  };
}

async function listCustomers(req, res) {
  try {
    const customers = await getAllCustomers();
    return res.json(customers.map(formatCustomer));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to fetch customers.';
    return res.status(500).json({ error: message });
  }
}

async function getCustomer(req, res) {
  try {
    const { customerId } = req.params;

    if (!customerId || !ObjectId.isValid(customerId)) {
      return res.status(400).json({ error: 'Invalid customer ID.' });
    }

    const customer = await getCustomerById(customerId);

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found.' });
    }

    return res.json(formatCustomer(customer));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to fetch customer.';
    return res.status(500).json({ error: message });
  }
}

async function patchCustomerStatus(req, res) {
  try {
    const { customerId } = req.params;
    const { status } = req.body || {};

    if (!customerId || !ObjectId.isValid(customerId)) {
      return res.status(400).json({ error: 'Invalid customer ID.' });
    }

    if (!status || typeof status !== 'string') {
      return res.status(400).json({ error: 'Status is required and must be a string.' });
    }

    const allowedStatuses = ['active', 'suspended', 'blocked'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ error: `Status must be one of: ${allowedStatuses.join(', ')}.` });
    }

    const updatedCustomer = await updateUserStatus(customerId, status);

    if (!updatedCustomer) {
      return res.status(404).json({ error: 'Customer not found.' });
    }

    insertActivity({
      type: 'update',
      description: `Modified customer #${customerId} account status to ${status}`,
      user: 'Admin',
      location: '',
      duration: '',
    }).catch(() => {});

    insertNotification({
      recipientRole: 'admin',
      title: 'Customer Status Changed',
      message: `Customer #${customerId} account status changed to "${status}".`,
      type: 'customer_status',
      referenceId: customerId,
    }).catch(() => {});

    if (updatedCustomer.email) {
      insertNotification({
        recipientRole: 'customer',
        recipientEmail: updatedCustomer.email,
        title: 'Account Status Update',
        message: `Your account status has been updated to "${status}".`,
        type: 'customer_status',
        referenceId: customerId,
      }).catch(() => {});
    }

    return res.json(formatCustomer(updatedCustomer));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to update customer status.';
    return res.status(500).json({ error: message });
  }
}

module.exports = {
  listCustomers,
  getCustomer,
  patchCustomerStatus,
};
