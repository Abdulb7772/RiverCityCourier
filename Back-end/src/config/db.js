const { MongoClient } = require('mongodb');

let client;
let databasePromise;

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

async function getDatabase() {
  const mongoUri = getMongoUri();

  if (!mongoUri) {
    throw new Error('MongoDB connection string is not defined');
  }

  if (!databasePromise) {
    client = new MongoClient(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });

    databasePromise = client.connect().then((connectedClient) => {
      const databaseName = getDatabaseNameFromUri(mongoUri);
      const database = connectedClient.db(databaseName);
      console.log(`MongoDB Connected: ${database.databaseName}`);
      return database;
    });
  }

  return databasePromise;
}

async function connectDB() {
  return getDatabase();
}

module.exports = {
  getDatabase,
  connectDB,
};
