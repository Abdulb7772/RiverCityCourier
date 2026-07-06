const { getDatabase } = require('../config/db');
const { ObjectId } = require('mongodb');

const COLLECTION = 'notifications';
const RETENTION_DAYS = 30;

async function getCollection() {
  const db = await getDatabase();
  return db.collection(COLLECTION);
}

async function insertNotification({ recipientRole, recipientEmail, title, message, type, referenceId }) {
  const collection = await getCollection();
  const doc = {
    recipientRole,
    recipientEmail: recipientEmail || '',
    title,
    message,
    type: type || 'general',
    referenceId: referenceId || '',
    read: false,
    createdAt: new Date().toISOString(),
  };
  const result = await collection.insertOne(doc);
  return { ...doc, id: result.insertedId.toString() };
}

async function getNotificationsByRole(role, limit = 50) {
  const collection = await getCollection();
  const docs = await collection
    .find({ recipientRole: role })
    .sort({ createdAt: -1 })
    .limit(limit)
    .toArray();
  return docs.map((d) => ({ id: d._id.toString(), ...d, _id: undefined }));
}

async function getNotificationsByEmail(role, email, limit = 50) {
  const collection = await getCollection();
  const docs = await collection
    .find({ recipientRole: role, recipientEmail: email })
    .sort({ createdAt: -1 })
    .limit(limit)
    .toArray();
  return docs.map((d) => ({ id: d._id.toString(), ...d, _id: undefined }));
}

async function getUnreadCount(role, email) {
  const collection = await getCollection();
  const query = email
    ? { recipientRole: role, recipientEmail: email, read: false }
    : { recipientRole: role, read: false };
  return collection.countDocuments(query);
}

async function markAsRead(id) {
  const collection = await getCollection();
  await collection.updateOne({ _id: new ObjectId(id) }, { $set: { read: true } });
}

async function markAllAsRead(role, email) {
  const collection = await getCollection();
  const query = email
    ? { recipientRole: role, recipientEmail: email, read: false }
    : { recipientRole: role, read: false };
  await collection.updateMany(query, { $set: { read: true } });
}

async function deleteOldNotifications() {
  const collection = await getCollection();
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - RETENTION_DAYS);
  const result = await collection.deleteMany({ createdAt: { $lt: cutoff.toISOString() } });
  if (result.deletedCount > 0) {
    console.log(`[Notification Cleanup] Removed ${result.deletedCount} notification(s) older than ${RETENTION_DAYS} days.`);
  }
  return result.deletedCount;
}

async function getUpcomingDeliveries() {
  const db = await getDatabase();
  const orders = db.collection('orders');
  const now = new Date().toISOString();
  const docs = await orders.find({
    assignedDriver: { $ne: 'Unassigned', $exists: true, $ne: '' },
    status: { $nin: ['completed', 'rejected'] },
    deliveryDate: { $ne: '', $exists: true },
  }).toArray();

  const upcoming = [];
  for (const order of docs) {
    if (!order.deliveryDate) continue;
    const deliveryDateTime = new Date(`${order.deliveryDate}T${order.deliveryTime || '23:59'}`);
    const hoursUntilDelivery = (deliveryDateTime.getTime() - Date.now()) / (1000 * 60 * 60);
    if (hoursUntilDelivery > 0 && hoursUntilDelivery <= 4) {
      upcoming.push(order);
    }
  }
  return upcoming;
}

module.exports = {
  insertNotification,
  getNotificationsByRole,
  getNotificationsByEmail,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteOldNotifications,
  getUpcomingDeliveries,
  RETENTION_DAYS,
};
