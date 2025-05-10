import { MongoClient } from 'mongodb';

const uri: string | undefined = process.env.MONGODB_URI;

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (!uri) {
    throw new Error('Add Mongo URI to .env.local');
}

if (process.env.NODE_ENV === 'development') {
    // Use a global variable to preserve the value across module reloads in development
    if (!(global as any)._mongoClientPromise) {
        client = new MongoClient(uri);
        (global as any)._mongoClientPromise = client.connect();
    }
    clientPromise = (global as any)._mongoClientPromise;
} else {
    // In production, create a new client for each request
    client = new MongoClient(uri);
    clientPromise = client.connect();
}

export default clientPromise;
