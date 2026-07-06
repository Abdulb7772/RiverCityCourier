const bcrypt = require('bcryptjs');
const { getAllDrivers, getDriverById, createDriver, updateDriverVerification, deleteDriver, formatDriver } = require('../models/driverModel');
const { insertActivity } = require('../models/activityModel');
const { findUserByEmail } = require('../models/userModel');
const { insertNotification } = require('../models/notificationModel');

async function listDrivers(req, res) {
  try {
    const drivers = await getAllDrivers();
    return res.json(drivers.map(formatDriver));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to fetch drivers.';
    return res.status(500).json({ error: message });
  }
}

async function createDriverHandler(req, res) {
  try {
    const { fullName, email, phone, password } = req.body || {};

    if (!fullName || !email || !phone || !password) {
      return res.status(400).json({ error: 'All driver fields are required.' });
    }

    const existing = await findUserByEmail(email);
    if (existing) {
      return res.status(409).json({ error: 'A driver with that email already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newDriver = await createDriver({
      fullName,
      email,
      phone,
      passwordHash,
    });

    insertActivity({
      type: 'create',
      description: `Created driver account — ${fullName}`,
      user: 'Admin',
      location: '',
      duration: '',
    }).catch(() => {});

    insertNotification({
      recipientRole: 'admin',
      title: 'New Driver Added',
      message: `Driver account created for ${fullName} (${email}).`,
      type: 'driver_created',
      referenceId: newDriver._id.toString(),
    }).catch(() => {});

    insertNotification({
      recipientRole: 'driver',
      recipientEmail: email,
      title: 'Account Created',
      message: `Welcome, ${fullName}! Your driver account has been created. Please complete your verification.`,
      type: 'driver_created',
      referenceId: newDriver._id.toString(),
    }).catch(() => {});

    return res.status(201).json(formatDriver(newDriver));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to create driver.';
    if (message.includes('E11000')) {
      return res.status(409).json({ error: 'A driver with that email already exists.' });
    }
    return res.status(500).json({ error: message });
  }
}

async function getDriverHandler(req, res) {
  try {
    const { driverId } = req.params;
    if (!driverId || !require('mongodb').ObjectId.isValid(driverId)) {
      return res.status(400).json({ error: 'Invalid driver ID.' });
    }

    const driver = await getDriverById(driverId);

    if (!driver) {
      return res.status(404).json({ error: 'Driver not found.' });
    }

    return res.json(formatDriver(driver));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to fetch driver.';
    return res.status(500).json({ error: message });
  }
}

async function patchDriverVerification(req, res) {
  try {
    const { driverId } = req.params;
    const { verified } = req.body || {};

    if (!driverId || !require('mongodb').ObjectId.isValid(driverId)) {
      return res.status(400).json({ error: 'Invalid driver ID.' });
    }

    if (typeof verified !== 'boolean') {
      return res.status(400).json({ error: 'Verified flag is required and must be boolean.' });
    }

    const updatedDriver = await updateDriverVerification(driverId, verified);

    if (!updatedDriver) {
      return res.status(404).json({ error: 'Driver not found.' });
    }

    insertActivity({
      type: 'update',
      description: `${verified ? 'Verified' : 'Unverified'} driver — ${updatedDriver.fullName || driverId}`,
      user: 'Admin',
      location: '',
      duration: '',
    }).catch(() => {});

    insertNotification({
      recipientRole: 'admin',
      title: `Driver ${verified ? 'Verified' : 'Unverified'}`,
      message: `${updatedDriver.fullName || 'Unknown'} has been ${verified ? 'verified' : 'unverified'}.`,
      type: 'driver_verification',
      referenceId: driverId,
    }).catch(() => {});

    if (updatedDriver.email) {
      insertNotification({
        recipientRole: 'driver',
        recipientEmail: updatedDriver.email,
        title: `Verification ${verified ? 'Approved' : 'Updated'}`,
        message: `Your account has been ${verified ? 'verified successfully' : 'verification status updated'}.`,
        type: 'driver_verification',
        referenceId: driverId,
      }).catch(() => {});
    }

    return res.json(formatDriver(updatedDriver));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to update driver.';
    return res.status(500).json({ error: message });
  }
}

async function deleteDriverHandler(req, res) {
  try {
    const { driverId } = req.params;
    if (!driverId || !require('mongodb').ObjectId.isValid(driverId)) {
      return res.status(400).json({ error: 'Invalid driver ID.' });
    }

    const deleted = await deleteDriver(driverId);

    if (!deleted) {
      return res.status(404).json({ error: 'Driver not found.' });
    }

    insertActivity({
      type: 'delete',
      description: `Deleted driver account — ${driverId}`,
      user: 'Admin',
      location: '',
      duration: '',
    }).catch(() => {});

    return res.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to delete driver.';
    return res.status(500).json({ error: message });
  }
}

module.exports = {
  listDrivers: listDrivers,
  createDriver: createDriverHandler,
  getDriver: getDriverHandler,
  patchDriverVerification,
  deleteDriver: deleteDriverHandler,
};
