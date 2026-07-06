const { getDatabase } = require('../config/db');
const { ObjectId } = require('mongodb');

const COLLECTION = 'orders';
const PAGE_SIZE = 10;

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function buildDriverEmailFilter(driverEmail) {
  const normalizedEmail = String(driverEmail || '').trim();
  if (!normalizedEmail) {
    return null;
  }

  return { $regex: new RegExp(`^${escapeRegex(normalizedEmail)}$`, 'i') };
}

async function getCollection() {
  const db = await getDatabase();
  return db.collection(COLLECTION);
}

async function getOrdersByDriver(driverEmail, page = 1, limit = PAGE_SIZE) {
  const collection = await getCollection();
  const skip = (page - 1) * limit;
  const query = { assignedDriver: buildDriverEmailFilter(driverEmail) };
  const total = await collection.countDocuments(query);
  const docs = await collection
    .find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .toArray();
  const data = docs.map(formatDriverOrder);
  return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
}

async function getCompletedOrders(driverEmail, page = 1, limit = PAGE_SIZE) {
  const collection = await getCollection();
  const skip = (page - 1) * limit;
  const query = { assignedDriver: buildDriverEmailFilter(driverEmail), status: 'completed' };
  const total = await collection.countDocuments(query);
  const docs = await collection
    .find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .toArray();
  const data = docs.map(formatDriverOrder);
  return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
}

async function getActiveOrder(driverEmail) {
  const collection = await getCollection();
  const activeStatuses = ['arrived_at_pickup', 'picked_up', 'in_transit', 'arrived_at_destination'];
  const doc = await collection.findOne({ assignedDriver: buildDriverEmailFilter(driverEmail), status: { $in: activeStatuses } });
  return doc ? formatDriverOrder(doc) : null;
}

async function getOrderById(orderId) {
  const collection = await getCollection();
  const doc = await collection.findOne({ _id: new ObjectId(orderId) });
  return doc ? formatDriverOrder(doc) : null;
}

async function updateOrderStatus(orderId, status) {
  const collection = await getCollection();
  const oid = new ObjectId(orderId);
  const update = { $set: { status } };
  if (status === 'completed') {
    const now = new Date();
    update.$push = {
      timeline: `Delivered on ${now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} at ${now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`,
    };
  }
  await collection.updateOne({ _id: oid }, update);
  const updated = await collection.findOne({ _id: oid });
  return updated ? formatDriverOrder(updated) : null;
}

async function updateOrderPhotos(orderId, field, photos) {
  const collection = await getCollection();
  const oid = new ObjectId(orderId);
  await collection.updateOne({ _id: oid }, { $set: { [field]: photos } });
  const updated = await collection.findOne({ _id: oid });
  return updated ? formatDriverOrder(updated) : null;
}

function formatDriverOrder(doc) {
  return {
    id: doc._id.toString(),
    orderNumber: doc.orderNumber || `#${doc._id.toString().slice(-6).toUpperCase()}`,
    customer: doc.customer,
    customerEmail: doc.customerEmail || '',
    pickup: doc.pickup,
    destination: doc.destination,
    status: doc.status,
    priority: doc.priority || 'Normal',
    assignedDriver: doc.assignedDriver || 'Unassigned',
    paymentMethod: doc.paymentMethod || 'Cash',
    createdAt: doc.createdAt,
    eta: doc.eta || '',
    packageType: doc.packageType || '',
    distance: doc.distance || '',
    contact: doc.contact || '',
    note: doc.note || '',
    timeline: doc.timeline || [],
    pickupPhotos: doc.pickupPhotos || [],
    deliveryPhoto: doc.deliveryPhoto || '',
    pickupName: doc.pickupName || doc.customer || '',
    pickupContact: doc.pickupContact || doc.contact || '',
    pickupItems: doc.pickupItems || doc.packageType || '',
    pickupQuantity: doc.pickupQuantity || '',
    pickupVehicleType: doc.pickupVehicleType || '',
    deliveryName: doc.deliveryName || '',
    deliveryContact: doc.deliveryContact || '',
    deliveryItems: doc.deliveryItems || '',
    deliveryQuantity: doc.deliveryQuantity || '',
    deliveryVehicleType: doc.deliveryVehicleType || '',
    pickupDate: doc.pickupDate || '',
    deliveryDate: doc.deliveryDate || '',
  };
}

module.exports = {
  getOrdersByDriver,
  getOrderById,
  getActiveOrder,
  getCompletedOrders,
  updateOrderStatus,
  updateOrderPhotos,
};
