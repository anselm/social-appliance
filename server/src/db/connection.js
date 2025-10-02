import { MongoClient } from 'mongodb';
import { Logger } from '../utils/logger.js';

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const dbName = process.env.DB_NAME || 'social_appliance';

let db = null;
let client = null;

export async function connectDB() {
  if (db) return db;
  
  try {
    const options = {};
    
    const sanitizedUri = uri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@');
    Logger.info(`Connecting to MongoDB at: ${sanitizedUri}`);
    
    client = new MongoClient(uri, options);
    await client.connect();
    
    // Test the connection
    await client.db(dbName).command({ ping: 1 });
    
    db = client.db(dbName);
    Logger.success(`Connected to MongoDB (database: ${dbName})`);
    
    // Create unique index on slug field
    await createIndexes(db);
    
    return db;
  } catch (error) {
    Logger.error('MongoDB connection error:', error);
    if (error.code === 18) {
      Logger.error('Authentication failed. Please check your MongoDB credentials in the .env file.');
      Logger.info('Expected format: MONGODB_URI=mongodb://username:password@host:port/database');
    }
    throw error;
  }
}

async function createIndexes(db) {
  try {
    await db.collection('entities').createIndex(
      { slug: 1 }, 
      { 
        unique: true, 
        sparse: true,
        background: true 
      }
    );
    Logger.success('Created unique index on slug field');
  } catch (error) {
    if (error.code !== 85) { // 85 = IndexOptionsConflict
      Logger.warn('Could not create unique index on slug:', error);
    }
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
    Logger.info('MongoDB connection closed');
  }
}
