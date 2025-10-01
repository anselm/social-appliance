import { connectDB, getDB } from '../src/db/connection.js';
import { writeFile, mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: join(dirname(fileURLToPath(import.meta.url)), '../../.env') });

const __dirname = dirname(fileURLToPath(import.meta.url));

async function exportEntities() {
  try {
    await connectDB();
    const db = await getDB();
    
    // Fetch all entities
    const entities = await db.collection('entities').find({}).toArray();
    
    console.log(`Found ${entities.length} entities to export`);
    
    // Write to public folder
    const outputPath = join(__dirname, '../../client-svelte/public/data/entities.json');
    const outputDir = dirname(outputPath);
    
    // Create directory if it doesn't exist
    await mkdir(outputDir, { recursive: true });
    
    // Write entities
    await writeFile(outputPath, JSON.stringify(entities, null, 2));
    
    console.log(`✅ Exported entities to ${outputPath}`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Export failed:', error);
    process.exit(1);
  }
}

exportEntities();
