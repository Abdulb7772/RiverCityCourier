const { findUserByEmail } = require('../models/userModel');

async function getDriverProfile(req, res) {
  try {
    const email = req.query.email || '';
    if (!email) return res.status(400).json({ error: 'Email is required.' });

    const user = await findUserByEmail(email);
    if (!user) return res.status(404).json({ error: 'Driver not found.' });

    return res.json({
      id: user._id.toString(),
      fullName: user.fullName,
      email: user.email,
      phone: user.phone || '',
      role: user.role,
      verified: Boolean(user.verified),
      status: user.status || 'active',
      createdAt: user.createdAt,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch profile.';
    return res.status(500).json({ error: message });
  }
}

module.exports = { getDriverProfile };
