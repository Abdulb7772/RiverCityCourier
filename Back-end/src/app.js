const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const { backfillMissingUserRoles } = require('./models/userModel');

const app = express();
const frontendOrigin = process.env.FRONTEND_ORIGIN || 'http://localhost:3000';

app.use(
  cors({
    origin: frontendOrigin,
    credentials: true,
  }),
);

// Stripe webhook must use raw body — mounted before express.json()
const { handleWebhook } = require('./controllers/stripeController');
app.post('/api/stripe/webhook', express.raw({ type: 'application/json' }), handleWebhook);

app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

const driverRoutes = require('./routes/driverRoutes');
const customerRoutes = require('./routes/customerRoutes');
const orderRoutes = require('./routes/orderRoutes');
const pricingRoutes = require('./routes/pricingRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const profileRoutes = require('./routes/profileRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const reportRoutes = require('./routes/reportRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const activityRoutes = require('./routes/activityRoutes');
const stripeRoutes = require('./routes/stripeRoutes');
const { deleteOldActivities, insertActivity, listActivities } = require('./models/activityModel');
const {
  deleteOldNotifications,
  insertNotification,
  getUpcomingDeliveries,
  getNotificationsByEmail,
} = require('./models/notificationModel');
const { deleteOldOrders } = require('./models/orderModel');
app.use('/api/admin/drivers', driverRoutes);
app.use('/api/admin/customers', customerRoutes);
app.use('/api/admin/orders', orderRoutes);
app.use('/api/admin/pricing', pricingRoutes);
app.use('/api/admin/reviews', reviewRoutes);
app.use('/api/admin/profile', profileRoutes);
app.use('/api/admin/settings', settingsRoutes);
app.use('/api/admin/dashboard', dashboardRoutes);
app.use('/api/admin/reports', reportRoutes);
app.use('/api/admin/activity', activityRoutes);

// Notifications for all roles
app.use('/api/admin/notifications', notificationRoutes);
app.use('/api/customer/notifications', notificationRoutes);
app.use('/api/driver/notifications', notificationRoutes);

const adminVerificationRoutes = require('./routes/adminVerificationRoutes');
app.use('/api/admin/verification', adminVerificationRoutes);

const driverOrderRoutes = require('./routes/driverOrderRoutes');
app.use('/api/driver/orders', driverOrderRoutes);

const driverVerificationRoutes = require('./routes/driverVerificationRoutes');
app.use('/api/driver/verification', driverVerificationRoutes);

const driverDashboardRoutes = require('./routes/driverDashboardRoutes');
app.use('/api/driver/dashboard', driverDashboardRoutes);

const driverProfileRoutes = require('./routes/driverProfileRoutes');
app.use('/api/driver/profile', driverProfileRoutes);

const driverAvailabilityRoutes = require('./routes/driverAvailabilityRoutes');
app.use('/api/driver/availability', driverAvailabilityRoutes);

const customerProfileRoutes = require('./routes/customerProfileRoutes');
app.use('/api/customer/profile', customerProfileRoutes);

const savedLocationRoutes = require('./routes/savedLocationRoutes');
app.use('/api/customer/locations', savedLocationRoutes);

app.use('/api/stripe', stripeRoutes);

// Run cleanup jobs every 6 hours
const CLEANUP_INTERVAL_MS = 6 * 60 * 60 * 1000;
setInterval(() => {
  deleteOldActivities().catch((err) => console.error('Activity cleanup error:', err));
  deleteOldNotifications().catch((err) => console.error('Notification cleanup error:', err));
  deleteOldOrders().catch((err) => console.error('Order cleanup error:', err));
}, CLEANUP_INTERVAL_MS);
// Run once on startup
deleteOldActivities().catch((err) => console.error('Activity startup cleanup error:', err));
deleteOldNotifications().catch((err) => console.error('Notification startup cleanup error:', err));
deleteOldOrders().catch((err) => console.error('Order startup cleanup error:', err));

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

// Driver delivery reminder check every 30 minutes
setInterval(async () => {
  try {
    const upcoming = await getUpcomingDeliveries();
    for (const order of upcoming) {
      const driverEmail = order.assignedDriver;
      if (!driverEmail || driverEmail === 'Unassigned') continue;
      const existing = await getNotificationsByEmail('driver', driverEmail);
      const alreadySent = existing.some(
        (n) => n.type === 'delivery_reminder' && n.referenceId === order._id.toString(),
      );
      if (alreadySent) continue;
      const driverFilter = buildDriverEmailFilter(driverEmail);
      if (!driverFilter) continue;
      await insertNotification({
        recipientRole: 'driver',
        recipientEmail: driverEmail,
        title: 'Upcoming Delivery Reminder',
        message: `You have a delivery scheduled for ${order.deliveryDate || 'today'}${order.deliveryTime ? ' at ' + order.deliveryTime : ''}. Pickup: ${order.pickup || 'N/A'}, Destination: ${order.destination || 'N/A'}.`,
        type: 'delivery_reminder',
        referenceId: order._id.toString(),
      });
    }
  } catch (err) {
    console.error('Delivery reminder check error:', err);
  }
}, 30 * 60 * 1000);

// Seed sample activity data if collection is empty
(async () => {
  try {
    const existing = await listActivities(1, 1);
    if (existing.total === 0) {
      const samples = [
        { type: 'login', description: 'Logged into the admin dashboard', user: 'Admin' },
        { type: 'update', description: 'Updated order #ORD-1042 status to "In Transit"', user: 'Admin' },
        { type: 'create', description: 'Assigned driver David Chen to order #ORD-1039', user: 'Admin' },
        { type: 'settings', description: 'Updated delivery pricing tiers', user: 'Admin' },
        { type: 'update', description: 'Modified customer #C-0089 account status to active', user: 'Admin' },
        { type: 'create', description: 'Created new customer account — Sarah Miller', user: 'Admin' },
        { type: 'update', description: 'Replied to review #REV-0052', user: 'Admin' },
        { type: 'login', description: 'Logged into the admin dashboard', user: 'Admin' },
      ];
      for (const s of samples) {
        await insertActivity({ ...s, location: '', duration: '' });
      }
      console.log(`[Activity] Seeded ${samples.length} sample activity log entries.`);
    }
  } catch (err) {
    console.warn('[Activity] Seed skipped —', err instanceof Error ? err.message : err);
  }
})();

backfillMissingUserRoles().catch((error) => {
  const message = error instanceof Error ? error.message : String(error || '');

  if (
    message.includes('MongoServerSelectionError') ||
    message.includes('querySrv') ||
    message.includes('tlsv1 alert internal error') ||
    message.includes('ENOTFOUND') ||
    message.includes('ECONNREFUSED')
  ) {
    console.warn('Skipping user role backfill until MongoDB Atlas is reachable.');
    return;
  }

  console.error('Failed to backfill missing user roles', error);
});

app.use('/api/auth', authRoutes);

module.exports = app;
