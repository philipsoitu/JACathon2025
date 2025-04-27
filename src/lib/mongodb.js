import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const options = {}; // you can add poolSize, ssl, etc. here

if (!uri) {
  throw new Error(
    'Please define the MONGODB_URI environment variable inside .env.local or in your deployment platform'
  );
}

// Use a global to preserve the client across hot-reloads in dev
let client;
let clientPromise;

if (!global._mongoClientPromise) {
  try {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    throw new Error('Could not connect to database');
  }
}
clientPromise = global._mongoClientPromise;

export async function getDb() {
  try {
    const client = await clientPromise;
    return client.db();        // default DB from connection string
  } catch (error) {
    console.error('Failed to get database instance:', error);
    throw new Error('Database connection failed');
  }
}
