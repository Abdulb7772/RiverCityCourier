const { getDatabase } = require('../config/db');
const { ObjectId } = require('mongodb');

async function getOrdersCollection() {
  const db = await getDatabase();
  return db.collection('orders');
}

async function getNextSequence() {
  const db = await getDatabase();
  const counter = await db.collection('counters').findOneAndUpdate(
    { _id: 'orderNumber' },
    { $inc: { seq: 1 } },
    { returnDocument: 'after', upsert: true },
  );
  return counter.seq;
}

async function getAllOrders(customer, customerEmail) {
  const collection = await getOrdersCollection();
  const filter = {};
  if (customer && customerEmail) {
    filter.$or = [
      { customer: { $regex: customer, $options: 'i' } },
      { customerEmail: customerEmail },
    ];
  } else {
    if (customer) filter.customer = { $regex: customer, $options: 'i' };
    if (customerEmail) filter.customerEmail = customerEmail;
  }
  return collection.find(filter).sort({ createdAt: -1 }).toArray();
}

async function getOrderById(orderId) {
  const collection = await getOrdersCollection();
  return collection.findOne({ _id: new ObjectId(orderId) });
}

async function createOrder(orderData) {
  const collection = await getOrdersCollection();
  const seq = await getNextSequence();
  const orderNumber = `ORD-${String(seq).padStart(5, '0')}`;
  const doc = {
    ...orderData,
    orderNumber,
    status: orderData.status || 'new',
    createdAt: new Date().toISOString(),
    timeline: [`Placed on ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} at ${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`],
  };
  const result = await collection.insertOne(doc);
  return { _id: result.insertedId, ...doc };
}

async function updateOrderStatus(orderId, status) {
  const collection = await getOrdersCollection();
  const update = { $set: { status } };
  if (status === 'completed') {
    const now = new Date();
    update.$push = {
      timeline: `Delivered on ${now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} at ${now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`,
    };
  }
  const oid = new ObjectId(orderId);
  await collection.updateOne(
    { _id: oid },
    update,
  );
  return collection.findOne({ _id: oid });
}

async function assignDriver(orderId, driverEmail) {
  const collection = await getOrdersCollection();
  const oid = new ObjectId(orderId);
  const now = new Date();
  await collection.updateOne(
    { _id: oid },
    {
      $set: { assignedDriver: driverEmail, status: 'accepted' },
      $push: { timeline: `Driver assigned on ${now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} at ${now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}` },
    },
  );
  return collection.findOne({ _id: oid });
}

function formatOrder(doc) {
  return {
    id: doc._id.toString(),
    orderNumber: doc.orderNumber || `#${doc._id.toString().slice(-6).toUpperCase()}`,
    customer: doc.customer,
    customerEmail: doc.customerEmail || '',
    pickup: doc.pickup,
    destination: doc.destination,
    status: doc.status,
    priority: doc.priority,
    assignedDriver: doc.assignedDriver || 'Unassigned',
    paymentMethod: doc.paymentMethod,
    createdAt: doc.createdAt,
    eta: doc.eta,
    packageType: doc.packageType,
    distance: doc.distance,
    contact: doc.contact,
    note: doc.note || '',
    timeline: doc.timeline || [],
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
    pickupPhotos: doc.pickupPhotos || [],
    deliveryPhoto: doc.deliveryPhoto || '',
    pickupDate: doc.pickupDate || '',
    deliveryDate: doc.deliveryDate || '',
    pickupTime: doc.pickupTime || '',
    deliveryTime: doc.deliveryTime || '',
  };
}

async function updateOrderFields(orderId, fields) {
  const collection = await getOrdersCollection();
  const oid = new ObjectId(orderId);
  const allowedFields = [
    'pickup', 'destination', 'pickupName', 'pickupContact', 'pickupItems',
    'pickupQuantity', 'pickupVehicleType', 'deliveryName', 'deliveryContact',
    'deliveryItems', 'deliveryQuantity', 'deliveryVehicleType', 'note',
    'pickupDate', 'pickupTime', 'deliveryDate', 'deliveryTime', 'contact',
  ];
  const update = {};
  for (const key of allowedFields) {
    if (fields[key] !== undefined) {
      update[key] = fields[key];
    }
  }
  if (Object.keys(update).length === 0) return null;
  update.updatedAt = new Date().toISOString();
  await collection.updateOne({ _id: oid }, { $set: update });
  return collection.findOne({ _id: oid });
}

async function deleteOldOrders() {
  const collection = await getOrdersCollection();
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 60);
  const result = await collection.deleteMany({ createdAt: { $lt: cutoff.toISOString() } });
  if (result.deletedCount > 0) {
    console.log(`[Order Cleanup] Removed ${result.deletedCount} order(s) older than 60 days.`);
  }
  return result.deletedCount;
}

module.exports = {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
  assignDriver,
  updateOrderFields,
  formatOrder,
  deleteOldOrders,
};
