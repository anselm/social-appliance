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
    // MongoDB driver v4+ doesn't need these options
    const options = {};
    
    // If using MongoDB Atlas or authenticated MongoDB, the URI should include credentials
    // Format: mongodb://username:password@host:port/database?authSource=admin
    // Or for Atlas: mongodb+srv://username:password@cluster.mongodb.net/database
    
    console.log('Connecting to MongoDB at:', uri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@'));
    
    client = new MongoClient(uri, options);
    await client.connect();
    
    // Test the connection - use the target database, not admin
    await client.db(dbName).command({ ping: 1 });
    
    db = client.db(dbName);
    console.log(`Connected to MongoDB successfully (database: ${dbName})`);
    
    // Create unique index on slug field to prevent duplicates
    try {
      await db.collection('entities').createIndex(
        { slug: 1 }, 
        { 
          unique: true, 
          sparse: true,  // Allow multiple null values
          background: true 
        }
      );
      console.log('✅ Created unique index on slug field');
    } catch (error) {
      if (error.code !== 85) { // 85 = IndexOptionsConflict (index already exists)
        console.warn('⚠️  Could not create unique index on slug:', error.message);
      }
    }
    
    return db;
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    if (error.code === 18) {
      console.error('Authentication failed. Please check your MongoDB credentials in the .env file.');
      console.error('Expected format: MONGODB_URI=mongodb://username:password@host:port/database');
    }
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
