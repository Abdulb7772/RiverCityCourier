const bcrypt = require('bcryptjs');
const { ObjectId } = require('mongodb');
const { findUserByEmail, getUserById, updateUserProfile, updateUserPassword, updateUserEmail } = require('../models/userModel');

async function patchSettings(req, res) {
  try {
    const { id, currentPassword, newPassword, fullName, email } = req.body || {};

    if (!id || !ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Valid user ID is required.' });
    }

    const user = await getUserById(id);

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // Change password
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ error: 'Current password is required to set a new password.' });
      }

      const storedPassword = user.passwordHash || user.password;
      const isBcryptHash = typeof storedPassword === 'string' && storedPassword.startsWith('$2');
      const isMatch = storedPassword
        ? isBcryptHash
          ? await bcrypt.compare(currentPassword, storedPassword)
          : storedPassword === currentPassword
        : false;
      if (!isMatch) {
        return res.status(403).json({ error: 'Current password is incorrect.' });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ error: 'New password must be at least 6 characters.' });
      }

      const passwordHash = await bcrypt.hash(newPassword, 10);
      await updateUserPassword(id, passwordHash);
    }

    // Change username
    if (fullName !== undefined) {
      if (!fullName.trim()) {
        return res.status(400).json({ error: 'Username cannot be empty.' });
      }
      await updateUserProfile(id, { fullName: fullName.trim() });
    }

    // Change email
    if (email !== undefined) {
      if (!email.trim()) {
        return res.status(400).json({ error: 'Email cannot be empty.' });
      }

      if (email !== user.email) {
        const existing = await findUserByEmail(email);
        if (existing) {
          return res.status(409).json({ error: 'A user with that email already exists.' });
        }
      }

      await updateUserEmail(id, email.trim());
    }

    const updated = await getUserById(id);

    return res.json({
      id: updated._id.toString(),
      fullName: updated.fullName,
      email: updated.email,
      phone: updated.phone || '',
      role: updated.role,
      createdAt: updated.createdAt,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to update settings.';
    if (message.includes('E11000')) {
      return res.status(409).json({ error: 'A user with that email already exists.' });
    }
    return res.status(500).json({ error: message });
  }
}

module.exports = {
  patchSettings,
};
