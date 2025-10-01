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

console.log('Loading .env from:', join(rootDir, '.env'));
console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'Set' : 'Not set');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', apiRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

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
