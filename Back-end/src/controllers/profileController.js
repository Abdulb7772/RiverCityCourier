const { ObjectId } = require('mongodb');
const { findUserByEmail, getUserById, updateUserProfile } = require('../models/userModel');

const allowedFields = ['fullName', 'phone', 'email'];

function formatProfile(user) {
  return {
    id: user._id.toString(),
    fullName: user.fullName,
    email: user.email,
    phone: user.phone || '',
    role: user.role,
    createdAt: user.createdAt,
  };
}

async function getProfile(req, res) {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ error: 'Email query parameter is required.' });
    }

    const user = await findUserByEmail(email);

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    return res.json(formatProfile(user));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to fetch profile.';
    return res.status(500).json({ error: message });
  }
}

async function patchProfile(req, res) {
  try {
    const { id, ...updates } = req.body || {};

    if (!id) {
      return res.status(400).json({ error: 'User ID is required.' });
    }

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid user ID.' });
    }

    const invalidFields = Object.keys(updates).filter(
      (key) => !allowedFields.includes(key) || key === 'email',
    );

    if (invalidFields.length > 0) {
      return res.status(400).json({
        error: `Only ${allowedFields.join(', ')} can be updated. Invalid fields: ${invalidFields.join(', ')}`,
      });
    }

    const cleanUpdates = {};
    if (updates.fullName !== undefined) cleanUpdates.fullName = updates.fullName;
    if (updates.phone !== undefined) cleanUpdates.phone = updates.phone;

    if (Object.keys(cleanUpdates).length === 0) {
      return res.status(400).json({ error: 'No valid fields provided for update.' });
    }

    const updated = await updateUserProfile(id, cleanUpdates);

    if (!updated) {
      return res.status(404).json({ error: 'User not found.' });
    }

    return res.json(formatProfile(updated));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to update profile.';
    if (message.includes('E11000')) {
      return res.status(409).json({ error: 'A user with that email already exists.' });
    }
    return res.status(500).json({ error: message });
  }
}

module.exports = {
  getProfile,
  patchProfile,
};
