const { getDatabase } = require('../config/db');
const { ObjectId } = require('mongodb');

async function getUsersCollection() {
  const db = await getDatabase();
  const collection = db.collection('users');

  await collection.createIndex({ email: 1 }, { unique: true });

  return collection;
}

async function findUserByEmail(email) {
  const users = await getUsersCollection();
  return users.findOne({ email });
}

async function createUser(userData) {
  const users = await getUsersCollection();
  const document = {
    ...userData,
    role: userData.role || 'customer',
    status: userData.status || 'active',
  };

  const result = await users.insertOne({
    ...document,
  });

  await users.updateOne(
    { _id: result.insertedId },
    {
      $set: {
        role: document.role,
        status: document.status,
      },
    },
  );

  return {
    _id: result.insertedId,
    ...document,
  };
}

async function getAllDrivers() {
  const users = await getUsersCollection();
  return users.find({ role: 'driver' }).toArray();
}

async function getAllCustomers() {
  const users = await getUsersCollection();
  return users.find({ role: 'customer' }).toArray();
}

async function getDriverById(driverId) {
  const users = await getUsersCollection();
  return users.findOne({ _id: new ObjectId(driverId), role: 'driver' });
}

async function getCustomerById(customerId) {
  const users = await getUsersCollection();
  return users.findOne({ _id: new ObjectId(customerId), role: 'customer' });
}

async function updateDriverVerification(driverId, verified) {
  const users = await getUsersCollection();
  const result = await users.findOneAndUpdate(
    { _id: new ObjectId(driverId), role: 'driver' },
    { $set: { verified } },
    { returnDocument: 'after' },
  );

  return result.value;
}

async function getUserById(userId) {
  const users = await getUsersCollection();
  return users.findOne({ _id: new ObjectId(userId) });
}

async function updateUserProfile(userId, updateFields) {
  const users = await getUsersCollection();
  const result = await users.findOneAndUpdate(
    { _id: new ObjectId(userId) },
    { $set: updateFields },
    { returnDocument: 'after' },
  );
  return result.value;
}

async function updateUserPassword(userId, passwordHash) {
  const users = await getUsersCollection();
  const result = await users.findOneAndUpdate(
    { _id: new ObjectId(userId) },
    { $set: { passwordHash } },
    { returnDocument: 'after' },
  );
  return result.value;
}

async function updateUserPasswordByEmail(email, passwordHash) {
  const users = await getUsersCollection();
  const result = await users.findOneAndUpdate(
    { email },
    { $set: { passwordHash } },
    { returnDocument: 'after' },
  );

  return result.value;
}

async function updateUserEmail(userId, email) {
  const users = await getUsersCollection();
  const result = await users.findOneAndUpdate(
    { _id: new ObjectId(userId) },
    { $set: { email } },
    { returnDocument: 'after' },
  );
  return result.value;
}

async function updateUserStatus(userId, status) {
  const users = await getUsersCollection();
  const result = await users.findOneAndUpdate(
    { _id: new ObjectId(userId) },
    { $set: { status } },
    { returnDocument: 'after' },
  );

  return result.value;
}

async function backfillMissingUserRoles() {
  const users = await getUsersCollection();

  await users.updateMany(
    {
      $or: [{ role: { $exists: false } }, { role: null }, { role: '' }],
    },
    {
      $set: { role: 'customer' },
    },
  );
}

module.exports = {
  createUser,
  findUserByEmail,
  backfillMissingUserRoles,
  getAllDrivers,
  getAllCustomers,
  getDriverById,
  getCustomerById,
  getUserById,
  updateUserProfile,
  updateUserPassword,
  updateUserPasswordByEmail,
  updateUserEmail,
  updateDriverVerification,
  updateUserStatus,
};
