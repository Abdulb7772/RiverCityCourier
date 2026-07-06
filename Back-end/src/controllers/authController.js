const bcrypt = require('bcryptjs');
const { createUser, findUserByEmail, updateUserPassword } = require('../models/userModel');
const { insertActivity } = require('../models/activityModel');

function isMongoConnectionError(error) {
  const message = error instanceof Error ? error.message : String(error || '');

  return (
    message.includes('querySrv') ||
    message.includes('MongoServerSelectionError') ||
    message.includes('getaddrinfo') ||
    message.includes('ENOTFOUND') ||
    message.includes('ECONNREFUSED')
  );
}

function handleAuthError(error, res, fallbackMessage) {
  const message = error instanceof Error ? error.message : fallbackMessage;

  if (isMongoConnectionError(error)) {
    return res.status(503).json({
      error:
        'Unable to reach MongoDB Atlas. Check the connection string, network access, and DNS resolution.',
    });
  }

  console.error(fallbackMessage, error);
  return res.status(500).json({ error: message || fallbackMessage });
}

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function sanitizeUser(user) {
  return {
    id: user._id.toString(),
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
    role: user.role,
    createdAt: user.createdAt,
  };
}

function validateRegistration(body) {
  const fullName = String(body.fullName || '').trim();
  const email = normalizeEmail(body.email);
  const phone = String(body.phone || '').trim();
  const password = String(body.password || '');
  const role = String(body.role || 'customer').trim().toLowerCase();

  if (fullName.length < 2 || !email || !phone || password.length < 8) {
    return null;
  }

  if (!['customer', 'driver', 'admin'].includes(role)) {
    return null;
  }

  return { fullName, email, phone, password, role };
}

function validateLogin(body) {
  const email = normalizeEmail(body.email);
  const password = String(body.password || '');

  if (!email || password.length < 1) {
    return null;
  }

  return { email, password };
}

async function verifyUserPassword(user, password) {
  if (!user) {
    return false;
  }

  if (user.passwordHash) {
    return bcrypt.compare(password, user.passwordHash);
  }

  if (user.password) {
    const isBcryptHash = typeof user.password === 'string' && user.password.startsWith('$2');

    if (isBcryptHash) {
      return bcrypt.compare(password, user.password);
    }

    return user.password === password;
  }

  return false;
}

async function register(req, res) {
  try {
    const input = validateRegistration(req.body || {});

    if (!input) {
      return res.status(400).json({ error: 'Please complete all required fields with valid values.' });
    }

    const existingUser = await findUserByEmail(input.email);

    if (existingUser) {
      return res.status(409).json({ error: 'A user with that email already exists.' });
    }

    const passwordHash = await bcrypt.hash(input.password, 10);
    const createdUser = await createUser({
      fullName: input.fullName,
      email: input.email,
      phone: input.phone,
      passwordHash,
      role: input.role,
      createdAt: new Date().toISOString(),
    });

    return res.status(201).json({
      user: {
        id: createdUser._id.toString(),
        fullName: input.fullName,
        email: input.email,
        phone: input.phone,
        role: createdUser.role || input.role || 'customer',
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to register account.';

    if (message.includes('E11000')) {
      return res.status(409).json({ error: 'A user with that email already exists.' });
    }

    return handleAuthError(error, res, 'Register error');
  }
}

async function login(req, res) {
  try {
    const input = validateLogin(req.body || {});

    if (!input) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = await findUserByEmail(input.email);

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isValid = await verifyUserPassword(user, input.password);

    if (!isValid) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    if (!user.passwordHash && user.password) {
      const passwordHash = await bcrypt.hash(input.password, 10);
      await updateUserPassword(user._id.toString(), passwordHash);
    }

    insertActivity({
      type: 'login',
      description: `Logged into the admin dashboard`,
      user: sanitizeUser(user).fullName || user.email,
      location: '',
      duration: '',
    }).catch(() => {});

    return res.json({ user: sanitizeUser(user) });
  } catch (error) {
    return handleAuthError(error, res, 'Login error');
  }
}

module.exports = {
  login,
  register,
};
