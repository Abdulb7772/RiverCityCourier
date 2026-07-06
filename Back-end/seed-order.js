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

    const users = db.collection('users');
    const orders = db.collection('orders');

    const driver = await users.findOne({ role: 'driver' });
    const driverEmail = driver ? driver.email : 'driver@rivercitycourier.com';
    const driverName = driver ? driver.fullName : 'John Driver';

    const existing = await orders.findOne({ assignedDriver: driverEmail });
    if (existing) {
      console.log(`Dummy order already exists for ${driverEmail} (${driverName}).`);
      await client.close();
      return;
    }

    const now = new Date();
    const doc = {
      customer: 'Marcus Reed',
      pickup: 'Firestone Richmond, 2023 Broad St, Richmond, VA',
      destination: 'ABC Auto Repair, 4512 Main St, Richmond, VA',
      status: 'accepted',
      priority: 'high',
      assignedDriver: driverEmail,
      paymentMethod: 'Card',
      createdAt: now.toISOString(),
      eta: '28 Min',
      packageType: '4 Tires - Automotive Parts',
      distance: '12 Miles',
      contact: '+1 (804) 555-0145',
      note: 'Deliver to service bay #3. Call Marcus upon arrival for gate code.',
      timeline: [
        `Placed at ${now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`,
        `Assigned to ${driverName}`,
        'Accepted by driver',
      ],
    };

    const result = await orders.insertOne(doc);
    console.log(`Dummy order inserted with _id: ${result.insertedId}`);
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
