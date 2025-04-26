import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const options = {}; // you can add poolSize, ssl, etc. here

// Use a global to preserve the client across hot-reloads in dev
let client;
let clientPromise;

if (!global._mongoClientPromise) {
  client = new MongoClient(uri, options);
  global._mongoClientPromise = client.connect();
}
clientPromise = global._mongoClientPromise;

export async function getDb() {
  const client = await clientPromise;
  return client.db();        // default DB from connection string
}
