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
  let dbConnected = false;
  
  // Log critical environment variables
  Logger.info('=== Environment Configuration ===');
  Logger.info(`MONGODB_URI: ${process.env.MONGODB_URI ? process.env.MONGODB_URI.substring(0, 50) + '...' : 'NOT SET'}`);
  Logger.info(`DB_NAME: ${process.env.DB_NAME || 'social_appliance (default)'}`);
  Logger.info(`NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
  Logger.info(`LOAD_SEED_DATA: ${process.env.LOAD_SEED_DATA}`);
  Logger.info(`FLUSH_DB: ${process.env.FLUSH_DB}`);
  Logger.info('================================');
  
  // Try to connect to MongoDB, but don't fail if it's unavailable
  try {
    await connectDB();
    Logger.success('MongoDB connected successfully');
    dbConnected = true;
    
    // Immediately check what's in the database
    const { getDB } = await import('./db/connection.js');
    const db = await getDB();
    
    Logger.info('=== Database Status Check ===');
    const entityCount = await db.collection('entities').countDocuments();
    Logger.info(`Total entities in database: ${entityCount}`);
    
    if (entityCount > 0) {
      // Check for root entity
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
    
    // Flush database if requested
    if (process.env.FLUSH_DB === 'true') {
      Logger.warn('Flushing database...');
      await db.collection('entities').deleteMany({});
      await db.collection('relationships').deleteMany({});
      Logger.success('Database flushed');
    }
    
    // Load seed data if enabled and database is empty
    if (process.env.LOAD_SEED_DATA !== 'false' && entityCount === 0) {
      Logger.info('Database is empty, attempting to load seed data...');
      const seedDataPath = process.env.SEED_DATA_PATH || join(rootDir, 'seed-data');
      Logger.info(`Seed data path: ${seedDataPath}`);
      
      // Check if seed data directory exists
      const fs = await import('fs');
      if (fs.existsSync(seedDataPath)) {
        Logger.success('Seed data directory found!');
        try {
          const files = await readdir(seedDataPath);
          Logger.info(`Seed data directory contains ${files.length} files/folders: ${files.join(', ')}`);
          
          // Look for .info.js files recursively
          const infoFiles = [];
          async function findInfoFiles(dir) {
            const entries = await readdir(dir, { withFileTypes: true });
            for (const entry of entries) {
              const fullPath = join(dir, entry.name);
              if (entry.isDirectory()) {
                await findInfoFiles(fullPath);
              } else if (entry.name.endsWith('.info.js')) {
                infoFiles.push(fullPath);
              }
            }
          }
          await findInfoFiles(seedDataPath);
          Logger.info(`Found ${infoFiles.length} .info.js files`);
          
          if (infoFiles.length > 0) {
            const seedLoader = new SeedLoader();
            await seedLoader.loadSeedData(seedDataPath);
            Logger.success('Seed data loaded successfully');
            
            // Verify root entity was created
            const rootEntity = await db.collection('entities').findOne({ slug: '/' });
            if (rootEntity) {
              Logger.success(`Root entity created: ${rootEntity.id}`);
            } else {
              Logger.error('Root entity still not found after seed data load!');
            }
          } else {
            Logger.warn('No .info.js files found in seed data directory');
          }
        } catch (seedError) {
          Logger.error('Failed to load seed data:', seedError);
          Logger.error('Stack trace:', seedError.stack);
        }
      } else {
        Logger.error(`Seed data directory NOT found at: ${seedDataPath}`);
        Logger.info('Current directory contents:');
        try {
          const cwdFiles = await readdir(process.cwd());
          Logger.info(`  ${cwdFiles.join(', ')}`);
        } catch (e) {
          Logger.error('Could not read current directory');
        }
      }
    } else if (entityCount > 0) {
      Logger.info('Database already has data, skipping seed data load');
    } else {
      Logger.info('Seed data loading disabled (LOAD_SEED_DATA=false)');
    }
  } catch (error) {
    Logger.error('MongoDB connection failed:', error);
    Logger.warn('Server will start without database connection');
    Logger.warn('Database-dependent features will not be available');
  }
  
  // Start the server regardless of database connection status
  app.listen(PORT, () => {
    Logger.success(`Server running on http://localhost:${PORT}`);
    Logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
    Logger.info(`CORS: Allowing all origins`);
    Logger.info(`Health check: http://localhost:${PORT}/api/health`);
    Logger.info(`Authentication: Stateless (client-side tokens)`);
    Logger.info(`Serving static client files from: ${clientBuildPath}`);
    Logger.info(`Database connected: ${dbConnected ? 'YES' : 'NO'}`);
    
    // Log authentication status
    if (process.env.MAGIC_SECRET_KEY) {
      Logger.success('Magic.link authentication enabled');
    } else {
      Logger.warn('Magic.link authentication disabled (MAGIC_SECRET_KEY not set)');
    }
    
    if (process.env.JWT_SECRET && process.env.JWT_SECRET !== 'default-secret-change-in-production') {
      Logger.success('JWT authentication configured');
    } else {
      Logger.warn('Using default JWT secret - change in production!');
    }
    
    Logger.info('Test endpoints available at /api/test/*');
  });
}

start();
