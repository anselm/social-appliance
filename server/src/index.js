import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './db/connection.js';
import apiRoutes from './routes/api.js';
import authRoutes from './routes/auth.js';
import testRoutes from './routes/test.js';
import { SeedLoader } from './services/seedLoader.js';
import { Logger } from './utils/logger.js';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { readdir } from 'fs/promises';

import { getDB } from './db/connection.js'

// Load .env from project root
const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '../../');
dotenv.config({ path: join(rootDir, '.env') });

const app = express();
const PORT = process.env.PORT || 8080;

// Simple CORS configuration - allow all origins
const corsOptions = {
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// API Routes
app.use('/api', authRoutes);
app.use('/api', apiRoutes);
app.use('/api/test', testRoutes);

// Serve static files from the client build directory
const clientBuildPath = join(__dirname, '../../client-svelte/dist');
Logger.info(`Serving static files from: ${clientBuildPath}`);
Logger.debug(`Current working directory: ${process.cwd()}`);
Logger.debug(`__dirname: ${__dirname}`);

// Check if the build directory exists
import('fs').then(fs => {
  if (fs.existsSync(clientBuildPath)) {
    Logger.success('Client build directory found');
  } else {
    Logger.warn('Client build directory not found at:', clientBuildPath);
  }
});

app.use(express.static(clientBuildPath));

// Serve the client app for all non-API routes
app.get('*', (req, res) => {
  const indexPath = join(clientBuildPath, 'index.html');
  Logger.debug(`Serving index.html for route: ${req.path}`);
  res.sendFile(indexPath);
});

// Error handling middleware
app.use((err, req, res, next) => {
  Logger.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
async function start() {

  let db;
  let dbConnected = false;
  
  // Log critical environment variables
  Logger.info('=== Environment Configuration ===');
  Logger.info(`MONGODB_URI: ${process.env.MONGODB_URI ? process.env.MONGODB_URI.substring(0, 50) + '...' : 'NOT SET'}`);
  Logger.info(`DB_NAME: ${process.env.DB_NAME || 'social_appliance (default)'}`);
  Logger.info(`NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
  Logger.info(`LOAD_SEED_DATA: ${process.env.LOAD_SEED_DATA}`);
  Logger.info(`FLUSH_DB: ${process.env.FLUSH_DB}`);
  Logger.info('================================');
  
  // Try to connect to MongoDB
  try {
    await connectDB();
    Logger.success('MongoDB connected successfully');
    dbConnected = true;
    
    db = await getDB();

    // Flush database if requested
    if (process.env.FLUSH_DB === 'true') {
      Logger.warn('Flushing database...');
      await db.collection('entities').deleteMany({});
      await db.collection('relationships').deleteMany({});
      Logger.success('Database flushed');
    }

    // Load seed data?
    if (process.env.LOAD_SEED_DATA !== 'false') {
      Logger.info('Attempting to load seed data...');
      const seedDataPath = process.env.SEED_DATA_PATH || join(rootDir, 'seed-data');
      Logger.info(`Seed data path: ${seedDataPath}`);
      const seedLoader = new SeedLoader();
      await seedLoader.loadSeedDataRecurse(seedDataPath);
    }

    // Get count
    Logger.info('=== Database Status Check ===');
    const entityCount = await db.collection('entities').countDocuments();
    Logger.info(`Total entities in database: ${entityCount}`);
    
    // Check for root entity sanity check
    if (entityCount > 0) {
      const rootEntity = await db.collection('entities').findOne({ slug: '/' });
      if (rootEntity) {
        Logger.success(`✓ Root entity found: ${rootEntity.id} - "${rootEntity.title || 'Untitled'}"`);
      } else {
        Logger.error('✗ Root entity (slug: "/") NOT FOUND');
        
        // Show what entities exist
        const sampleEntities = await db.collection('entities').find({}).limit(10).toArray();
        Logger.info('Sample entities in database:');
        sampleEntities.forEach(e => {
          Logger.info(`  - ${e.slug || 'no-slug'} (${e.type}) - "${e.title || 'Untitled'}" [${e.id}]`);
        });
      }
    } else {
      Logger.warn('Database is empty - no entities found');
    }
    Logger.info('============================');
    
  } catch (error) {
    Logger.error('MongoDB connection failed:', error);
    Logger.warn('Server will start without database connection');
    Logger.warn('Database-dependent features will not be available');
  }

  // Start server
  app.listen(PORT, () => {
    Logger.success(`Server running on http://localhost:${PORT}`);
    Logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
    Logger.info(`Health check: http://localhost:${PORT}/api/health`);
    Logger.info(`Database connected: ${dbConnected ? 'YES' : 'NO'}`);
  });
}

start();
