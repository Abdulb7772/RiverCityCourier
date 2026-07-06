const { getDatabase } = require('../config/db');
const { ObjectId } = require('mongodb');

async function getPricingCollection() {
  const db = await getDatabase();
  return db.collection('pricing');
}

const DEFAULT_PRICING = {
  perKmPrice: 50,
  vehicleCharges: [
    { type: 'Bike', baseRate: 100, perKmRate: 20, active: true },
    { type: 'Car', baseRate: 200, perKmRate: 40, active: true },
    { type: 'Van', baseRate: 350, perKmRate: 60, active: true },
    { type: 'Truck', baseRate: 500, perKmRate: 80, active: true },
  ],
  discounts: [],
  peakHours: {
    enabled: false,
    multiplier: 1.5,
    timeRanges: [],
  },
};

async function getPricing() {
  const collection = await getPricingCollection();
  let pricing = await collection.findOne({});
  if (!pricing) {
    const doc = { ...DEFAULT_PRICING, updatedAt: new Date().toISOString() };
    const result = await collection.insertOne(doc);
    pricing = { _id: result.insertedId, ...doc };
  }
  return pricing;
}

async function updatePricing(updateData) {
  const collection = await getPricingCollection();
  let pricing = await collection.findOne({});

  if (!pricing) {
    const doc = { ...DEFAULT_PRICING, ...updateData, updatedAt: new Date().toISOString() };
    const result = await collection.insertOne(doc);
    return { _id: result.insertedId, ...doc };
  }

  const result = await collection.findOneAndUpdate(
    { _id: pricing._id },
    { $set: { ...updateData, updatedAt: new Date().toISOString() } },
    { returnDocument: 'after' },
  );

  return result.value;
}

function formatPricing(doc) {
  if (!doc) return null;
  return {
    id: doc._id.toString(),
    perKmPrice: doc.perKmPrice ?? 50,
    vehicleCharges: Array.isArray(doc.vehicleCharges) ? doc.vehicleCharges : DEFAULT_PRICING.vehicleCharges,
    discounts: Array.isArray(doc.discounts) ? doc.discounts : [],
    peakHours: {
      enabled: doc.peakHours?.enabled ?? false,
      multiplier: doc.peakHours?.multiplier ?? 1.5,
      timeRanges: Array.isArray(doc.peakHours?.timeRanges) ? doc.peakHours.timeRanges : [],
    },
    updatedAt: doc.updatedAt,
  };
}

module.exports = {
  getPricing,
  updatePricing,
  formatPricing,
};
