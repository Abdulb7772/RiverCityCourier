const { getDatabase } = require('../config/db');

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

async function getDriverDashboardStats(req, res) {
  try {
    const email = req.query.email || '';
    if (!email) return res.status(400).json({ error: 'Driver email is required.' });

    const db = await getDatabase();
    const orders = db.collection('orders');
    const driverFilter = buildDriverEmailFilter(email);

    const allDriverOrders = await orders.find({ assignedDriver: driverFilter }).toArray();
    const todayStr = new Date().toISOString().slice(0, 10);

    const completedToday = allDriverOrders.filter(
      (o) => o.status === 'completed' && o.createdAt && o.createdAt.startsWith(todayStr),
    ).length;

    const activeOrder = allDriverOrders.find((o) =>
      ['accepted', 'arrived_at_pickup', 'picked_up', 'in_transit', 'arrived_at_destination'].includes(o.status),
    );

    const completedOrders = allDriverOrders
      .filter((o) => o.status === 'completed')
      .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))
      .slice(0, 5);

    return res.json({
      completedToday,
      activeOrder: activeOrder ? {
        id: activeOrder._id.toString(),
        orderNumber: activeOrder.orderNumber || `#${activeOrder._id.toString().slice(-6).toUpperCase()}`,
        pickup: activeOrder.pickup,
        destination: activeOrder.destination,
        status: activeOrder.status,
        customer: activeOrder.customer,
        eta: activeOrder.eta || '',
      } : null,
      totalDeliveries: allDriverOrders.filter((o) => o.status === 'completed').length,
      recentCompleted: completedOrders.map((o) => ({
        id: o._id.toString(),
        orderNumber: o.orderNumber || `#${o._id.toString().slice(-6).toUpperCase()}`,
        customer: o.customer,
        pickup: o.pickup,
        destination: o.destination,
        createdAt: o.createdAt,
      })),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to fetch dashboard data.';
    return res.status(500).json({ error: message });
  }
}

module.exports = { getDriverDashboardStats };
