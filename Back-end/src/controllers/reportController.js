const { getDatabase } = require('../config/db');

async function getReportData(req, res) {
  try {
    const db = await getDatabase();
    const orders = db.collection('orders');
    const allOrders = await orders.find({}).toArray();

    const statusCounts = { new: 0, processing: 0, picked_up: 0, completed: 0, rejected: 0 };
    for (const o of allOrders) {
      if (statusCounts[o.status] !== undefined) statusCounts[o.status]++;
    }

    const reviews = db.collection('reviews');
    const allReviews = await reviews.find({}).toArray();
    const ratingCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    for (const r of allReviews) {
      if (ratingCounts[r.rating]) ratingCounts[r.rating]++;
    }

    const drivers = db.collection('users');
    const allDrivers = await drivers.find({ role: 'driver' }).toArray();

    return res.json({
      ordersByStatus: Object.entries(statusCounts).map(([name, value]) => ({ name, value })),
      totalOrders: allOrders.length,
      totalDrivers: allDrivers.length,
      totalReviews: allReviews.length,
      averageRating: allReviews.length
        ? (allReviews.reduce((s, r) => s + r.rating, 0) / allReviews.length).toFixed(1)
        : '0.0',
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to fetch report data.';
    return res.status(500).json({ error: message });
  }
}

module.exports = {
  getReportData,
};
