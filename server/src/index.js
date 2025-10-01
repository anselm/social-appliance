import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './db/connection.js';
import apiRoutes from './routes/api.js';
import { SeedLoader } from './services/seedLoader.js';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// Load .env from project root
const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '../../');
dotenv.config({ path: join(rootDir, '.env') });

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api', apiRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// In production, serve static files from the client build directory
if (process.env.NODE_ENV === 'production') {
  // Since we're running from the server directory, we need to go up one level
  const clientBuildPath = join(__dirname, '../../../client-svelte/dist');
  console.log(`Serving static files from: ${clientBuildPath}`);
  console.log(`Current working directory: ${process.cwd()}`);
  
  app.use(express.static(clientBuildPath));

  // Serve the client app for all non-API routes
  app.get('*', (req, res) => {
    const indexPath = join(clientBuildPath, 'index.html');
    console.log(`Serving index.html for route: ${req.path}`);
    res.sendFile(indexPath);
  });
} else {
  console.log('Running in development mode - not serving static files');
}

// Start server
async function start() {
  try {
    await connectDB();
    
    // Flush database if requested
    if (process.env.FLUSH_DB === 'true') {
      console.log('🗑️  Flushing database...');
      const { getDB } = await import('./db/connection.js');
      const db = await getDB();
      await db.collection('entities').deleteMany({});
      await db.collection('relationships').deleteMany({});
      console.log('✅ Database flushed');
    }
    
    // Clean up any duplicate root entities
    {
      const { getDB } = await import('./db/connection.js');
      const db = await getDB();
      const rootEntities = await db.collection('entities').find({ slug: '/' }).toArray();
      if (rootEntities.length > 1) {
        console.log(`⚠️  Found ${rootEntities.length} root entities, cleaning up duplicates...`);
        // Keep the first one, delete the rest
        const [keep, ...remove] = rootEntities;
        const idsToRemove = remove.map(e => e.id);
        await db.collection('entities').deleteMany({ id: { $in: idsToRemove } });
        console.log(`✅ Removed ${remove.length} duplicate root entities`);
      }
    }
    
    // Load seed data if enabled
    if (process.env.LOAD_SEED_DATA !== 'false') {
      // Use seed data from project root
      const seedDataPath = process.env.SEED_DATA_PATH || join(rootDir, 'seed-data');
      
      const seedLoader = new SeedLoader();
      await seedLoader.loadSeedData(seedDataPath);
    }
    
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();
