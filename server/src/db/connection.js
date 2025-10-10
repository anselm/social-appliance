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
    
    // Log connection details (sanitized)
    const sanitizedUri = uri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@');
    Logger.info(`Connecting to MongoDB...`);
    Logger.info(`  URI: ${sanitizedUri}`);
    Logger.info(`  Database: ${dbName}`);
    
    client = new MongoClient(uri, options);
    await client.connect();
    
    // Test the connection
    await client.db(dbName).command({ ping: 1 });
    
    db = client.db(dbName);
    Logger.success(`✓ Connected to MongoDB`);
    Logger.success(`✓ Using database: ${dbName}`);
    
    // Create unique index on slug field
    await createIndexes(db);
    
    return db;
  } catch (error) {
    Logger.error('MongoDB connection error:', error);
    Logger.error(`Failed to connect to: ${uri.split('@')[1] || 'unknown host'}`);
    Logger.error(`Database name: ${dbName}`);
    
    if (error.code === 18) {
      Logger.error('Authentication failed. Please check your MongoDB credentials.');
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
    Logger.success('✓ Database indexes verified');
  } catch (error) {
    if (error.code !== 85) { // 85 = IndexOptionsConflict
      Logger.warn('Could not create unique index on slug:', error.message);
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
