const { getDatabase } = require('../config/db');

const COLLECTION = 'driver_verifications';

async function getCollection() {
  const db = await getDatabase();
  return db.collection(COLLECTION);
}

async function getVerification(email) {
  const collection = await getCollection();
  const doc = await collection.findOne({ email });
  if (!doc) return null;
  return formatVerification(doc);
}

async function upsertDocument(email, docType, url) {
  const collection = await getCollection();
  const existing = await collection.findOne({ email });
  if (existing) {
    const docIndex = existing.documents.findIndex((d) => d.type === docType);
    if (docIndex >= 0) {
      await collection.updateOne(
        { email, 'documents.type': docType },
        { $set: { 'documents.$.url': url, 'documents.$.status': 'pending', 'documents.$.comment': '', updatedAt: new Date().toISOString() } },
      );
    } else {
      await collection.updateOne(
        { email },
        { $push: { documents: { type: docType, url, status: 'pending', comment: '' } }, $set: { updatedAt: new Date().toISOString() } },
      );
    }
  } else {
    await collection.insertOne({
      email,
      documents: [{ type: docType, url, status: 'pending', comment: '' }],
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }
  return getVerification(email);
}

function formatVerification(doc) {
  return {
    email: doc.email,
    documents: doc.documents || [],
    status: doc.status || 'pending',
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

module.exports = { getVerification, upsertDocument };
