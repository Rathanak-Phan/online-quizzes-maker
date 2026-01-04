// lib/mongodb.ts
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI!;
const dbName = process.env.MONGODB_DB_NAME || 'online-quizzes';

if (!uri) {
  throw new Error('Please define MONGODB_URI in environment variables');
}

// MongoDB options (Atlas-friendly)
const options = {
  connectTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  serverSelectionTimeoutMS: 10000,
  maxPoolSize: 10,
  ssl: true, // ensures TLS
};

// Global variable to prevent multiple connections in dev
declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development') {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // Production: connect per request (serverless-friendly)
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default clientPromise;
export { dbName };
