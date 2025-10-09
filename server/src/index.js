import express from 'express';
import cors from 'cors';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import dotenv from 'dotenv';
import { connectDB } from './db/connection.js';
import apiRoutes from './routes/api.js';
import authRoutes from './routes/auth.js';
import testRoutes from './routes/test.js';
import { SeedLoader } from './services/seedLoader.js';
import { Logger } from './utils/logger.js';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// Load .env from project root
const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '../../');
dotenv.config({ path: join(rootDir, '.env') });

const app = express();
const PORT = process.env.PORT || 3000;
const SERVERPORT = process.env.SERVERPORT || 8001;

// Determine which port to use
const serverPort = process.env.NODE_ENV === 'production' ? PORT : SERVERPORT;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:8000',
  credentials: true
}));
app.use(express.json());

// Session configuration
const sessionConfig = {
  secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax'
  }
};

// Use MongoDB session store if MongoDB URI is available
if (process.env.MONGODB_URI) {
  sessionConfig.store = MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    dbName: process.env.DB_NAME || 'social_appliance',
    touchAfter: 24 * 3600 // lazy session update
  });
  Logger.info('Using MongoDB session store');
} else {
  Logger.warn('Using memory session store (not recommended for production)');
}

app.use(session(sessionConfig));

// Health check endpoints (before other routes)
app.get('/healthz', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api', authRoutes);
app.use('/api', apiRoutes);
app.use('/api/test', testRoutes);

// In production, serve static files from the client build directory
if (process.env.NODE_ENV === 'production') {
  const clientBuildPath = join(__dirname, '../../client-svelte/dist');
  Logger.info(`Serving static files from: ${clientBuildPath}`);
  Logger.debug(`Current working directory: ${process.cwd()}`);
  Logger.debug(`__dirname: ${__dirname}`);
  
  // Check if the build directory exists
  import('fs').then(fs => {
    if (fs.existsSync(clientBuildPath)) {
      Logger.success('Client build directory found');
    } else {
      Logger.error('Client build directory not found at:', clientBuildPath);
    }
  });
  
  app.use(express.static(clientBuildPath));

  // Serve the client app for all non-API routes
  app.get('*', (req, res) => {
    const indexPath = join(clientBuildPath, 'index.html');
    Logger.debug(`Serving index.html for route: ${req.path}`);
    res.sendFile(indexPath);
  });
} else {
  Logger.info('Running in development mode - not serving static files');
}

// Error handling middleware
app.use((err, req, res, next) => {
  Logger.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
async function start() {
  try {
    await connectDB();
    
    // Flush database if requested
    if (process.env.FLUSH_DB === 'true') {
      Logger.warn('Flushing database...');
      const { getDB } = await import('./db/connection.js');
      const db = await getDB();
      await db.collection('entities').deleteMany({});
      await db.collection('relationships').deleteMany({});
      Logger.success('Database flushed');
    }
    
    // Clean up any duplicate root entities
    await cleanupDuplicateRootEntities();
    
    // Load seed data if enabled
    if (process.env.LOAD_SEED_DATA !== 'false') {
      const seedDataPath = process.env.SEED_DATA_PATH || join(rootDir, 'seed-data');
      const seedLoader = new SeedLoader();
      await seedLoader.loadSeedData(seedDataPath);
    }
    
    app.listen(serverPort, () => {
      Logger.success(`Server running on http://localhost:${serverPort}`);
      Logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
      Logger.info(`CORS origin: ${process.env.CORS_ORIGIN || 'http://localhost:8000'}`);
      Logger.info(`Health check: http://localhost:${serverPort}/healthz`);
      
      if (process.env.NODE_ENV === 'production') {
        Logger.info('Serving static client files');
      }
      
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
  } catch (error) {
    Logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

async function cleanupDuplicateRootEntities() {
  const { getDB } = await import('./db/connection.js');
  const db = await getDB();
  const rootEntities = await db.collection('entities').find({ slug: '/' }).toArray();
  
  if (rootEntities.length > 1) {
    Logger.warn(`Found ${rootEntities.length} root entities, cleaning up duplicates...`);
    const [keep, ...remove] = rootEntities;
    const idsToRemove = remove.map(e => e.id);
    await db.collection('entities').deleteMany({ id: { $in: idsToRemove } });
    Logger.success(`Removed ${remove.length} duplicate root entities`);
  }
}

start();
