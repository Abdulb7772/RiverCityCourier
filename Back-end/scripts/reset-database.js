require('dotenv').config({ path: require('path').resolve(__dirname, '..', '.env') });

const bcrypt = require('bcryptjs');
const { MongoClient } = require('mongodb');

function getMongoUri() {
  return process.env.MONGO_URI || process.env.MONGODB_URI || process.env.DATABASE_URL;
}

function getDatabaseNameFromUri(uri) {
  try {
    const parsed = new URL(uri);
    const pathname = parsed.pathname.replace(/^\//, '');
    return pathname || process.env.MONGO_DB_NAME || process.env.MONGODB_DB_NAME || 'test';
  } catch {
    return process.env.MONGO_DB_NAME || process.env.MONGODB_DB_NAME || 'test';
  }
}

async function seedDatabase(db) {
  const now = new Date().toISOString();
  const passwordHash = await bcrypt.hash('Password123!', 10);

  const users = db.collection('users');
  await users.createIndex({ email: 1 }, { unique: true });

  await users.insertMany([
    {
      fullName: 'RiverCity Customer',
      email: 'customer@test.com',
      phone: '0123456789123',
      passwordHash,
      role: 'customer',
      status: 'active',
      createdAt: now,
    },
    {
      fullName: 'RiverCity Admin',
      email: 'admin@rivercitycourier.com',
      phone: '+1 (804) 555-0100',
      passwordHash,
      role: 'admin',
      status: 'active',
      createdAt: now,
    },
    {
      fullName: 'RiverCity Driver',
      email: 'driver@rivercitycourier.com',
      phone: '+1 (804) 555-0101',
      passwordHash,
      role: 'driver',
      status: 'active',
      verified: false,
      createdAt: now,
    },
  ]);

  await db.collection('pricing').insertOne({
    perKmPrice: 1.5,
    vehicleCharges: {
      car: 5,
      van: 10,
      truck: 15,
    },
    discounts: [],
    peakHours: [],
    updatedAt: now,
  });

  await db.collection('driver_verifications').insertOne({
    email: 'driver@rivercitycourier.com',
    documents: [],
    status: 'pending',
    createdAt: now,
    updatedAt: now,
  });

  await db.collection('activities').insertOne({
    type: 'create',
    description: 'Fresh database initialized',
    user: 'System',
    location: '',
    duration: '',
    timestamp: now,
  });
}

async function main() {
  const mongoUri = getMongoUri();

  if (!mongoUri) {
    throw new Error('MongoDB connection string is not defined');
  }

  const client = new MongoClient(mongoUri, {
    serverSelectionTimeoutMS: 10000,
  });

  try {
    await client.connect();
    const databaseName = getDatabaseNameFromUri(mongoUri);
    const db = client.db(databaseName);

    console.log(`Dropping database ${databaseName}...`);
    await db.dropDatabase();

    console.log('Seeding fresh baseline data...');
    await seedDatabase(db);

    console.log(`Database reset complete: ${databaseName}`);
  } finally {
    await client.close();
  }
}

main().catch((error) => {
  console.error('Database reset failed:', error);
  process.exit(1);
});