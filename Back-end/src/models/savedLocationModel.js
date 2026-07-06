const { getDatabase } = require('../config/db');
const { ObjectId } = require('mongodb');

async function getLocationsCollection() {
  const db = await getDatabase();
  return db.collection('savedLocations');
}

async function getLocationsByEmail(email) {
  const collection = await getLocationsCollection();
  return collection.find({ customerEmail: email }).sort({ createdAt: -1 }).toArray();
}

async function createLocation(data) {
  const collection = await getLocationsCollection();
  const doc = {
    locationName: data.locationName,
    address: data.address,
    customerEmail: data.customerEmail,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  const result = await collection.insertOne(doc);
  return { ...doc, id: result.insertedId.toString(), _id: result.insertedId };
}

async function updateLocation(id, data) {
  const collection = await getLocationsCollection();
  const updates = {};
  if (data.locationName !== undefined) updates.locationName = data.locationName;
  if (data.address !== undefined) updates.address = data.address;
  updates.updatedAt = new Date().toISOString();

  const result = await collection.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: updates },
    { returnDocument: 'after' },
  );
  return result.value;
}

async function deleteLocation(id) {
  const collection = await getLocationsCollection();
  const result = await collection.deleteOne({ _id: new ObjectId(id) });
  return result.deletedCount > 0;
}

function formatLocation(doc) {
  return {
    id: doc._id.toString(),
    locationName: doc.locationName,
    address: doc.address,
    customerEmail: doc.customerEmail,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

module.exports = {
  getLocationsByEmail,
  createLocation,
  updateLocation,
  deleteLocation,
  formatLocation,
};
