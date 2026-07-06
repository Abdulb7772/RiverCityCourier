const { getDatabase } = require('../config/db');
const { insertNotification } = require('../models/notificationModel');

async function getAvailability(req, res) {
  try {
    const email = req.query.email || '';
    if (!email) return res.status(400).json({ error: 'Email is required.' });

    const db = await getDatabase();
    const users = db.collection('users');
    const user = await users.findOne({ email });
    if (!user) return res.status(404).json({ error: 'Driver not found.' });

    return res.json({ availability: user.availability || 'Offline' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch availability.';
    return res.status(500).json({ error: message });
  }
}

async function updateAvailability(req, res) {
  try {
    const email = req.query.email || '';
    const { availability } = req.body || {};

    if (!email) return res.status(400).json({ error: 'Email is required.' });
    if (!['Online', 'Offline', 'Busy'].includes(availability)) {
      return res.status(400).json({ error: 'Availability must be Online, Offline, or Busy.' });
    }

    const db = await getDatabase();
    const users = db.collection('users');
    const result = await users.findOneAndUpdate(
      { email },
      { $set: { availability } },
      { returnDocument: 'after' },
    );
    if (!result.value) return res.status(404).json({ error: 'Driver not found.' });

    const driver = result.value;

    insertNotification({
      recipientRole: 'admin',
      title: 'Driver Availability Changed',
      message: `Driver ${driver.fullName || email} is now ${availability}.`,
      type: 'driver_availability',
      referenceId: driver._id.toString(),
    }).catch(() => {});

    return res.json({ availability: driver.availability });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update availability.';
    return res.status(500).json({ error: message });
  }
}

module.exports = { getAvailability, updateAvailability };
