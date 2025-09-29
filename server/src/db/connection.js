import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const dbName = process.env.DB_NAME || 'social_appliance';

let db = null;
let client = null;

export async function connectDB() {
  if (db) return db;
  
  try {
    // Parse the URI to check if it includes authentication
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    };
    
    // If using MongoDB Atlas or authenticated MongoDB, the URI should include credentials
    // Format: mongodb://username:password@host:port/database?authSource=admin
    // Or for Atlas: mongodb+srv://username:password@cluster.mongodb.net/database
    
    client = new MongoClient(uri, options);
    await client.connect();
    
    // Test the connection
    await client.db('admin').command({ ping: 1 });
    
    db = client.db(dbName);
    console.log('Connected to MongoDB successfully');
    return db;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

export async function getDB() {
  if (!db) {
    await connectDB();
  }
  return db;
}

export async function closeDB() {
  if (client) {
    await client.close();
    db = null;
    client = null;
  }
}
