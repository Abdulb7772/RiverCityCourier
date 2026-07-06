const { getDatabase } = require('../config/db');

const COLLECTION = 'activities';
const RETENTION_DAYS = 14;

async function getCollection() {
  const db = await getDatabase();
  return db.collection(COLLECTION);
}

async function insertActivity({ type, description, user, location, duration }) {
  const collection = await getCollection();
  const doc = {
    type,
    description,
    user,
    location: location || '',
    duration: duration || '',
    timestamp: new Date().toISOString(),
  };
  const result = await collection.insertOne(doc);
  return { ...doc, id: result.insertedId.toString() };
}

async function listActivities(page = 1, limit = 10) {
  const collection = await getCollection();
  const skip = (page - 1) * limit;
  const total = await collection.countDocuments();
  const docs = await collection
    .find({})
    .sort({ timestamp: -1 })
    .skip(skip)
    .limit(limit)
    .toArray();
  const data = docs.map((d) => ({
    id: d._id.toString(),
    type: d.type,
    description: d.description,
    user: d.user,
    location: d.location,
    duration: d.duration,
    timestamp: d.timestamp,
  }));
  return {
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

async function deleteOldActivities() {
  const collection = await getCollection();
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - RETENTION_DAYS);
  const result = await collection.deleteMany({ timestamp: { $lt: cutoff.toISOString() } });
  if (result.deletedCount > 0) {
    console.log(`[Activity Cleanup] Removed ${result.deletedCount} activity log(s) older than ${RETENTION_DAYS} days.`);
  }
  return result.deletedCount;
}

module.exports = {
  insertActivity,
  listActivities,
  deleteOldActivities,
  RETENTION_DAYS,
};
