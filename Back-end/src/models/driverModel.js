const { getDatabase } = require('../config/db');
const { ObjectId } = require('mongodb');

const USERS_COLLECTION = 'users';

async function getCollection() {
  const db = await getDatabase();
  return db.collection(USERS_COLLECTION);
}

async function getAllDrivers() {
  const collection = await getCollection();
  return collection.find({ role: 'driver' }).toArray();
}

async function getDriverById(driverId) {
  const collection = await getCollection();
  return collection.findOne({ _id: new ObjectId(driverId), role: 'driver' });
}

async function createDriver(driverData) {
  const collection = await getCollection();
  const doc = {
    ...driverData,
    role: 'driver',
    verified: false,
    status: 'active',
    createdAt: new Date().toISOString(),
  };
  const result = await collection.insertOne(doc);
  return { _id: result.insertedId, ...doc };
}

async function updateDriverVerification(driverId, verified) {
  const collection = await getCollection();
  const result = await collection.findOneAndUpdate(
    { _id: new ObjectId(driverId), role: 'driver' },
    { $set: { verified } },
    { returnDocument: 'after' },
  );
  return result.value;
}

async function deleteDriver(driverId) {
  const collection = await getCollection();
  const result = await collection.deleteOne({ _id: new ObjectId(driverId), role: 'driver' });
  return result.deletedCount > 0;
}

function formatDriver(doc) {
  if (!doc) return null;
  return {
    id: doc._id.toString(),
    fullName: doc.fullName,
    email: doc.email,
    phone: doc.phone,
    role: doc.role,
    verified: Boolean(doc.verified),
    createdAt: doc.createdAt,
  };
}

module.exports = {
  getAllDrivers,
  getDriverById,
  createDriver,
  updateDriverVerification,
  deleteDriver,
  formatDriver,
};
