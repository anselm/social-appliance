import { readdir, stat } from 'fs/promises';
import { join, extname } from 'path';
import { pathToFileURL } from 'url';
import { API } from '../api/index.js';
import { Logger } from '../utils/logger.js';

export class SeedLoader {
  constructor() {
    this.api = new API();
    this.loadedEntities = [];
  }

  async loadSeedData(folderPath) {
    Logger.info(`Loading seed data from: ${folderPath}`);
    
    try {
      const files = await this.scanForInfoFiles(folderPath);
      
      if (files.length === 0) {
        Logger.warn('No .info.js files found in seed data folder');
        return;
      }
      
      Logger.info(`Found ${files.length} seed files to process`);
      
      for (const file of files) {
        await this.processFile(file);
      }
      
      Logger.success('Seed data loading complete');
      this.printEntityTree();
    } catch (error) {
      Logger.error('Error loading seed data:', error);
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
      Logger.warn(`Could not read directory ${folderPath}:`, error);
    }
    
    return files;
  }

  async processFile(filePath) {
    try {
      Logger.debug(`Processing file: ${filePath}`);
      
      // Convert to file URL for dynamic import
      const fileUrl = pathToFileURL(filePath).href;
      const module = await import(fileUrl);
      
      // Process all exports (including default)
      for (const [key, value] of Object.entries(module)) {
        await this.processExport(value, filePath, key);
      }
    } catch (error) {
      Logger.error(`Error processing ${filePath}:`, error);
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
      Logger.warn(`Skipping entity without ID in ${filePath}`);
      return;
    }
    
    try {
      // Ensure parent exists if specified
      if (entity.parentId) {
        await this.ensureParentExists(entity.parentId);
      }
      
      // Check if entity already exists
      const existing = await this.findExistingEntity(entity);
      
      if (existing) {
        await this.updateExistingEntity(existing, entity);
      } else {
        await this.createNewEntity(entity);
      }
    } catch (error) {
      Logger.error(`Error processing entity ${entity.id}:`, error);
    }
  }

  async ensureParentExists(parentId) {
    const parentExists = await this.api.entityService.findById(parentId);
    if (!parentExists) {
      const db = await this.api.entityService.getDB();
      await db.collection('entities').insertOne({
        id: parentId,
        type: 'group',
        title: `Placeholder for ${parentId}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      Logger.debug(`Created placeholder parent: ${parentId}`);
    }
  }

  async findExistingEntity(entity) {
    // Special handling for root entity - check by slug
    if (entity.slug === '/' && entity.type === 'group') {
      const existing = await this.api.entityService.findBySlug('/');
      if (existing && existing.id !== entity.id) {
        Logger.warn(`Root entity exists with different ID. Existing: ${existing.id}, New: ${entity.id}`);
        return existing;
      }
    }
    
    // Check by ID
    return await this.api.entityService.findById(entity.id);
  }

  async updateExistingEntity(existing, entity) {
    const updateId = existing.id;
    const { id, ...updateData } = entity;
    
    await this.api.updateEntity(updateId, updateData);
    
    this.loadedEntities.push({
      id: updateId,
      slug: entity.slug || existing.slug,
      type: entity.type || existing.type,
      title: entity.title || existing.title,
      parentId: entity.parentId || existing.parentId,
      action: 'updated'
    });
    
    Logger.debug(`Updated entity: ${updateId}`);
  }

  async createNewEntity(entity) {
    const db = await this.api.entityService.getDB();
    
    // Check slug uniqueness
    if (entity.slug) {
      const existingSlug = await db.collection('entities').findOne({ slug: entity.slug });
      if (existingSlug) {
        Logger.warn(`Slug already exists: ${entity.slug}, skipping`);
        return;
      }
    }
    
    // Insert with preserved ID
    entity.createdAt = entity.createdAt || new Date().toISOString();
    entity.updatedAt = entity.updatedAt || new Date().toISOString();
    
    await db.collection('entities').insertOne(entity);
    
    this.loadedEntities.push({
      id: entity.id,
      slug: entity.slug,
      type: entity.type,
      title: entity.title,
      parentId: entity.parentId,
      action: 'created'
    });
    
    Logger.debug(`Created entity: ${entity.id}`);
  }

  printEntityTree() {
    Logger.info('\n📊 Loaded Entity Tree:');
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
    
    // Print orphaned entities
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
