require('dotenv').config();
const { MongoClient } = require('mongodb');

async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI is not set.');
    process.exit(1);
  }

  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 10000,
    connectTimeoutMS: 10000,
  });

  try {
    await client.connect();
    const dbName = process.env.MONGODB_DB_NAME || 'rivercitycourier';
    const db = client.db(dbName);
    const orders = db.collection('orders');
    const users = db.collection('users');

    const driver = await users.findOne({ role: 'driver' });
    const driverEmail = driver ? driver.email : 'driver@test.com';
    const driverName = driver ? driver.fullName : 'Driver';

    const now = new Date();

    const doc = {
      customer: 'Sarah Johnson',
      pickup: 'AutoZone, 789 W Broad St, Richmond, VA 23220',
      destination: 'Precision Tune Auto Care, 1234 Chamberlayne Ave, Richmond, VA 23222',
      status: 'accepted',
      priority: 'medium',
      assignedDriver: driverEmail,
      paymentMethod: 'Cash',
      createdAt: now.toISOString(),
      eta: '18 Min',
      packageType: 'Brake Pads & Rotors - Auto Parts',
      distance: '8 Miles',
      contact: '+1 (804) 555-0192',
      note: 'Call Sarah at the service desk. Parts are prepaid and ready at the counter.',
      timeline: [
        `Placed at ${now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`,
        `Assigned to ${driverName}`,
        'Accepted by driver',
      ],
    };

    const result = await orders.insertOne(doc);
    console.log(`Second dummy order inserted with _id: ${result.insertedId}`);
    console.log(`Assigned to: ${driverName} (${driverEmail})`);
    console.log(`Order: ${doc.pickup} -> ${doc.destination}`);
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  } finally {
    await client.close();
  }
}

seed();
