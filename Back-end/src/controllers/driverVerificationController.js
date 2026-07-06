const { getVerification, upsertDocument } = require('../models/driverVerificationModel');
const { insertNotification } = require('../models/notificationModel');

async function getVerificationHandler(req, res) {
  try {
    const email = req.query.email || '';
    if (!email) {
      return res.status(400).json({ error: 'Driver email is required.' });
    }
    const verification = await getVerification(email);
    if (!verification) {
      return res.json({ email, documents: [], status: 'pending' });
    }
    return res.json(verification);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch verification status.';
    return res.status(500).json({ error: message });
  }
}

async function uploadDocumentHandler(req, res) {
  try {
    const email = req.query.email || '';
    const { type, url } = req.body || {};
    if (!email) {
      return res.status(400).json({ error: 'Driver email is required.' });
    }
    if (!type || !url) {
      return res.status(400).json({ error: 'Document type and URL are required.' });
    }
    const validTypes = ['license', 'identification', 'insurance', 'picture', 'vehicle_photo', 'vehicle_registration'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ error: `Type must be one of: ${validTypes.join(', ')}` });
    }
    const verification = await upsertDocument(email, type, url);

    insertNotification({
      recipientRole: 'admin',
      title: 'Driver Document Uploaded',
      message: `Driver ${email} uploaded a ${type} document for verification.`,
      type: 'driver_verification',
    }).catch(() => {});

    return res.json(verification);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to upload document.';
    return res.status(500).json({ error: message });
  }
}

module.exports = { getVerificationHandler, uploadDocumentHandler };
