const { getDatabase } = require('../config/db');

const COLLECTION = 'driver_verifications';

async function getCollection() {
  const db = await getDatabase();
  return db.collection(COLLECTION);
}

async function listAllVerifications(req, res) {
  try {
    const collection = await getCollection();
    const docs = await collection.find({}).toArray();
    const data = docs.map((doc) => ({
      email: doc.email,
      documents: doc.documents || [],
      status: doc.status || 'pending',
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    }));
    return res.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch verifications.';
    return res.status(500).json({ error: message });
  }
}

async function getVerificationByEmail(req, res) {
  try {
    const { email } = req.params;
    if (!email) return res.status(400).json({ error: 'Email is required.' });
    const collection = await getCollection();
    const doc = await collection.findOne({ email });
    if (!doc) return res.status(404).json({ error: 'Verification not found.' });
    return res.json({
      email: doc.email,
      documents: doc.documents || [],
      status: doc.status || 'pending',
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch verification.';
    return res.status(500).json({ error: message });
  }
}

async function updateDocumentStatus(req, res) {
  try {
    const { email } = req.params;
    const { type, status, comment } = req.body || {};
    if (!email || !type || !status) {
      return res.status(400).json({ error: 'Email, document type, and status are required.' });
    }
    if (!['verified', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Status must be "verified" or "rejected".' });
    }
    const validTypes = ['license', 'identification', 'insurance', 'picture', 'vehicle_photo', 'vehicle_registration'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ error: `Type must be one of: ${validTypes.join(', ')}` });
    }
    const collection = await getCollection();
    const doc = await collection.findOne({ email });
    if (!doc) return res.status(404).json({ error: 'Verification not found.' });

    const docIndex = doc.documents.findIndex((d) => d.type === type);
    if (docIndex < 0) return res.status(404).json({ error: 'Document not found.' });

    const updateFields = { [`documents.${docIndex}.status`]: status, updatedAt: new Date().toISOString() };
    if (comment !== undefined) updateFields[`documents.${docIndex}.comment`] = comment;

    await collection.updateOne({ email }, { $set: updateFields });

    const allDocs = doc.documents.map((d, i) =>
      i === docIndex ? { ...d, status, comment: comment ?? d.comment } : d,
    );
    const allVerified = allDocs.every((d) => d.status === 'verified');

    if (allVerified) {
      await collection.updateOne({ email }, { $set: { status: 'verified' } });
      const db = await getDatabase();
      await db.collection('users').updateOne(
        { email, role: 'driver' },
        { $set: { verified: true } },
      );
    }

    const updated = await collection.findOne({ email });
    return res.json({
      email: updated.email,
      documents: updated.documents || [],
      status: updated.status || 'pending',
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update document status.';
    return res.status(500).json({ error: message });
  }
}

module.exports = { listAllVerifications, getVerificationByEmail, updateDocumentStatus };
