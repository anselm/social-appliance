import { readdir, stat } from 'fs/promises';
import { join, extname } from 'path';
import { pathToFileURL } from 'url';
import { API } from '../api/index.js';

export class SeedLoader {
  constructor() {
    this.api = new API();
  }

  async loadSeedData(folderPath) {
    console.log(`\n🌱 Loading seed data from: ${folderPath}`);
    
    try {
      const files = await this.scanForInfoFiles(folderPath);
      
      if (files.length === 0) {
        console.log('No .info.js files found in seed data folder');
        return;
      }
      
      console.log(`Found ${files.length} seed files to process`);
      
      for (const file of files) {
        await this.processFile(file);
      }
      
      console.log('✅ Seed data loading complete\n');
    } catch (error) {
      console.error('❌ Error loading seed data:', error);
    }
  }

  async scanForInfoFiles(folderPath, files = []) {
    try {
      const entries = await readdir(folderPath);
      
      for (const entry of entries) {
        const fullPath = join(folderPath, entry);
        const stats = await stat(fullPath);
        
        if (stats.isDirectory()) {
          await this.scanForInfoFiles(fullPath, files);
        } else if (stats.isFile() && entry.endsWith('.info.js')) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      console.warn(`Warning: Could not read directory ${folderPath}:`, error.message);
    }
    
    return files;
  }

  async processFile(filePath) {
    console.log(`\n📄 Processing: ${filePath}`);
    
    try {
      // Convert to file URL for dynamic import
      const fileUrl = pathToFileURL(filePath).href;
      const module = await import(fileUrl);
      
      // Process all exports (including default)
      for (const [key, value] of Object.entries(module)) {
        await this.processExport(value, filePath, key);
      }
    } catch (error) {
      console.error(`❌ Error processing ${filePath}:`, error.message);
    }
  }

  async processExport(data, filePath, exportName = 'default') {
    if (Array.isArray(data)) {
      console.log(`  Processing array export '${exportName}' with ${data.length} entities`);
      for (const entity of data) {
        await this.processEntity(entity, filePath);
      }
    } else if (data && typeof data === 'object') {
      console.log(`  Processing object export '${exportName}'`);
      await this.processEntity(data, filePath);
    } else {
      console.warn(`  ⚠️  Skipping non-object export '${exportName}'`);
    }
  }

  async processEntity(entity, filePath) {
    // Check if entity has an ID
    if (!entity.id) {
      console.warn(`  ⚠️  Warning: Entity without ID in ${filePath} - skipping`);
      return;
    }
    
    try {
      // If entity has a parentId, create a minimal parent if it doesn't exist
      if (entity.parentId) {
        const parentExists = await this.api.entityService.findById(entity.parentId);
        if (!parentExists) {
          console.log(`  📦 Creating placeholder parent entity: ${entity.parentId}`);
          const db = await this.api.entityService.getDB();
          await db.collection('entities').insertOne({
            id: entity.parentId,
            type: 'group',
            title: `Placeholder for ${entity.parentId}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });
        }
      }
      
      // Special handling for root group - check by slug to prevent duplicates
      let existing = null;
      if (entity.slug === '/' && entity.type === 'group') {
        existing = await this.api.entityService.findBySlug('/');
        if (existing) {
          console.log(`  🔄 Found existing root group with ID: ${existing.id}, will update instead of creating new`);
        }
      } else {
        // Check if entity already exists by ID
        existing = await this.api.entityService.findById(entity.id);
      }
      
      if (existing) {
        // Update existing entity
        const updateId = existing.id; // Use the existing entity's ID
        console.log(`  📝 Updating entity: ${updateId} (${entity.type || 'unknown'}) - ${entity.slug || 'no slug'}`);
        // Remove id from update data to avoid conflicts
        const { id, ...updateData } = entity;
        await this.api.updateEntity(updateId, updateData);
      } else {
        // Create new entity
        console.log(`  ✨ Creating entity: ${entity.id} (${entity.type || 'unknown'}) - ${entity.slug || 'no slug'}`);
        if (entity.parentId) {
          console.log(`     Parent ID: ${entity.parentId}`);
        }
        
        // We need to bypass the normal create method to preserve the ID
        const db = await this.api.entityService.getDB();
        
        // Check slug uniqueness
        if (entity.slug) {
          const existingSlug = await db.collection('entities').findOne({ slug: entity.slug });
          if (existingSlug) {
            console.warn(`  ⚠️  Warning: Slug '${entity.slug}' already exists - skipping entity ${entity.id}`);
            return;
          }
        }
        
        // Insert with preserved ID
        entity.createdAt = entity.createdAt || new Date().toISOString();
        entity.updatedAt = entity.updatedAt || new Date().toISOString();
        await db.collection('entities').insertOne(entity);
      }
    } catch (error) {
      console.error(`  ❌ Error processing entity ${entity.id}:`, error.message);
    }
  }
}
