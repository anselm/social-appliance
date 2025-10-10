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

// Load .env from project root
const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '../../');
dotenv.config({ path: join(rootDir, '.env') });

const app = express();
const PORT = process.env.PORT || 8000;

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
    
    // Load seed data if enabled
    if (process.env.LOAD_SEED_DATA !== 'false') {
      const seedDataPath = process.env.SEED_DATA_PATH || join(rootDir, 'seed-data');
      const seedLoader = new SeedLoader();
      await seedLoader.loadSeedData(seedDataPath);
    }
    
    app.listen(PORT, () => {
      Logger.success(`Server running on http://localhost:${PORT}`);
      Logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
      Logger.info(`CORS: Allowing all origins`);
      Logger.info(`Health check: http://localhost:${PORT}/api/health`);
      Logger.info(`Authentication: Stateless (client-side tokens)`);
      Logger.info(`Serving static client files from: ${clientBuildPath}`);
      
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

start();
