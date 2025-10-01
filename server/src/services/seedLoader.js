import { readdir, stat } from 'fs/promises';
import { join, extname } from 'path';
import { pathToFileURL } from 'url';
import { API } from '../api/index.js';

export class SeedLoader {
  constructor() {
    this.api = new API();
    this.loadedEntities = [];
  }

  async loadSeedData(folderPath) {
    console.log(`\n🌱 Loading seed data from: ${folderPath}`);
    
    try {
      const files = await this.scanForInfoFiles(folderPath);
      
      if (files.length === 0) {
        console.log('No .info.js files found in seed data folder');
        return;
      }
      
      console.log(`Found ${files.length} seed files to process\n`);
      
      for (const file of files) {
        await this.processFile(file);
      }
      
      console.log('\n✅ Seed data loading complete');
      this.printEntityTree();
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
      for (const entity of data) {
        await this.processEntity(entity, filePath);
      }
    } else if (data && typeof data === 'object') {
      await this.processEntity(data, filePath);
    }
  }

  async processEntity(entity, filePath) {
    // Check if entity has an ID
    if (!entity.id) {
      return;
    }
    
    try {
      // If entity has a parentId, create a minimal parent if it doesn't exist
      if (entity.parentId) {
        const parentExists = await this.api.entityService.findById(entity.parentId);
        if (!parentExists) {
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
        if (existing && existing.id !== entity.id) {
          console.warn(`⚠️  Root entity with different ID already exists. Existing: ${existing.id}, New: ${entity.id}`);
          // Update the existing root entity instead of creating a duplicate
          const { id, ...updateData } = entity;
          await this.api.updateEntity(existing.id, updateData);
          
          // Track as updated
          this.loadedEntities.push({
            id: existing.id,
            slug: entity.slug || existing.slug,
            type: entity.type || existing.type,
            title: entity.title || existing.title,
            parentId: entity.parentId || existing.parentId,
            action: 'updated'
          });
          return;
        }
      } else {
        // Check if entity already exists by ID
        existing = await this.api.entityService.findById(entity.id);
      }
      
      if (existing) {
        // Update existing entity
        const updateId = existing.id; // Use the existing entity's ID
        // Remove id from update data to avoid conflicts
        const { id, ...updateData } = entity;
        await this.api.updateEntity(updateId, updateData);
        
        // Track loaded entity
        this.loadedEntities.push({
          id: updateId,
          slug: entity.slug || existing.slug,
          type: entity.type || existing.type,
          title: entity.title || existing.title,
          parentId: entity.parentId || existing.parentId,
          action: 'updated'
        });
      } else {
        // Create new entity
        // We need to bypass the normal create method to preserve the ID
        const db = await this.api.entityService.getDB();
        
        // Check slug uniqueness
        if (entity.slug) {
          const existingSlug = await db.collection('entities').findOne({ slug: entity.slug });
          if (existingSlug) {
            return;
          }
        }
        
        // Insert with preserved ID
        entity.createdAt = entity.createdAt || new Date().toISOString();
        entity.updatedAt = entity.updatedAt || new Date().toISOString();
        
        await db.collection('entities').insertOne(entity);
        
        // Track loaded entity
        this.loadedEntities.push({
          id: entity.id,
          slug: entity.slug,
          type: entity.type,
          title: entity.title,
          parentId: entity.parentId,
          action: 'created'
        });
      }
    } catch (error) {
      console.error(`❌ Error processing entity ${entity.id}:`, error.message);
    }
  }

  printEntityTree() {
    console.log('\n📊 Loaded Entity Tree:');
    console.log('─────────────────────\n');
    
    // Build a map of entities by ID
    const entityMap = new Map();
    const rootEntities = [];
    
    this.loadedEntities.forEach(entity => {
      entityMap.set(entity.id, { ...entity, children: [] });
    });
    
    // Build parent-child relationships
    this.loadedEntities.forEach(entity => {
      if (entity.parentId && entityMap.has(entity.parentId)) {
        entityMap.get(entity.parentId).children.push(entity.id);
      } else if (!entity.parentId) {
        rootEntities.push(entity.id);
      }
    });
    
    // Print tree recursively
    const printEntity = (id, indent = '') => {
      const entity = entityMap.get(id);
      if (!entity) return;
      
      const marker = entity.action === 'created' ? '✨' : '📝';
      const typeLabel = `[${entity.type || 'unknown'}]`;
      const title = entity.title || entity.slug || 'Untitled';
      const slugInfo = entity.slug ? ` (${entity.slug})` : '';
      
      console.log(`${indent}${marker} ${typeLabel} ${title}${slugInfo}`);
      
      // Print children
      entity.children.forEach((childId, index) => {
        const isLast = index === entity.children.length - 1;
        const childIndent = indent + (isLast ? '  ' : '│ ');
        printEntity(childId, childIndent);
      });
    };
    
    // Print root entities
    rootEntities.forEach(id => printEntity(id));
    
    // Print orphaned entities (those with parentId but parent not in loaded set)
    const orphaned = this.loadedEntities.filter(e => 
      e.parentId && !entityMap.has(e.parentId)
    );
    
    if (orphaned.length > 0) {
      console.log('\n🔗 Entities with external parents:');
      orphaned.forEach(entity => {
        const marker = entity.action === 'created' ? '✨' : '📝';
        const typeLabel = `[${entity.type || 'unknown'}]`;
        const title = entity.title || entity.slug || 'Untitled';
        const slugInfo = entity.slug ? ` (${entity.slug})` : '';
        console.log(`  ${marker} ${typeLabel} ${title}${slugInfo} (parent: ${entity.parentId})`);
      });
    }
    
    console.log(`\nTotal entities processed: ${this.loadedEntities.length}`);
  }
}
