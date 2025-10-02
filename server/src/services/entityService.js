import { getDB } from '../db/connection.js';
import { Entity } from '../models/entity.js';
import { EntityTypes } from '../config/constants.js';
import { Logger } from '../utils/logger.js';

export class EntityService {
  async getDB() {
    return getDB();
  }

  async create(entityData) {
    const db = await getDB();
    const entity = new Entity(entityData);
    
    Logger.db('CREATE', 'entities', { id: entity.id, slug: entity.slug, type: entity.type });
    
    // Check if slug is already taken
    if (entity.slug) {
      const existing = await db.collection('entities').findOne({ slug: entity.slug });
      if (existing) {
        throw new Error(`Slug already exists: ${entity.slug}`);
      }
    }
    
    try {
      await db.collection('entities').insertOne(entity.toJSON());
      return entity;
    } catch (error) {
      // Handle MongoDB duplicate key error
      if (error.code === 11000 && error.keyPattern?.slug) {
        throw new Error(`Slug already exists: ${entity.slug}`);
      }
      throw error;
    }
  }

  async findById(id) {
    const db = await getDB();
    Logger.db('FIND_BY_ID', 'entities', { id });
    const data = await db.collection('entities').findOne({ id });
    return data ? new Entity(data) : null;
  }

  async findBySlug(slug) {
    const db = await getDB();
    Logger.db('FIND_BY_SLUG', 'entities', { slug });
    const data = await db.collection('entities').findOne({ slug });
    return data ? new Entity(data) : null;
  }

  async update(id, updates) {
    const db = await getDB();
    updates.updatedAt = new Date().toISOString();
    
    Logger.db('UPDATE', 'entities', { id, updates: Object.keys(updates) });
    
    // Check if updating slug and if it's already taken
    if (updates.slug) {
      const existing = await db.collection('entities').findOne({ 
        slug: updates.slug,
        id: { $ne: id }
      });
      if (existing) {
        throw new Error('Slug already exists');
      }
    }
    
    const result = await db.collection('entities').updateOne(
      { id },
      { $set: updates }
    );
    
    if (result.matchedCount === 0) {
      throw new Error('Entity not found');
    }
    
    return this.findById(id);
  }

  async delete(id) {
    const db = await getDB();
    Logger.db('DELETE', 'entities', { id });
    const result = await db.collection('entities').deleteOne({ id });
    return result.deletedCount > 0;
  }

  async query(filters = {}) {
    const db = await getDB();
    const query = {};
    
    Logger.db('QUERY', 'entities', filters);
    
    // Build query based on filters
    if (filters.type) query.type = filters.type;
    if (filters.parentId !== undefined) {
      query.parentId = filters.parentId;
    }
    if (filters.sponsorId) query.sponsorId = filters.sponsorId;
    if (filters.slug) query.slug = filters.slug;
    if (filters.slugPrefix) {
      query.slug = { $regex: `^${filters.slugPrefix}`, $options: 'i' };
    }
    
    // Location-based query
    if (filters.latitude && filters.longitude && filters.radius) {
      // For simplicity, using a basic distance calculation
      // In production, you'd want to use MongoDB's geospatial queries
      query.latitude = { $exists: true };
      query.longitude = { $exists: true };
    }
    
    // Date range query
    if (filters.begins) {
      query.begins = { $gte: filters.begins };
    }
    if (filters.ends) {
      query.ends = { $lte: filters.ends };
    }
    
    const limit = Math.min(parseInt(filters.limit) || 20, 1000);
    const offset = parseInt(filters.offset) || 0;
    
    const cursor = db.collection('entities')
      .find(query)
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit);
    
    const results = await cursor.toArray();
    
    // Check for duplicates in query results
    const ids = new Set();
    const duplicates = results.filter(r => {
      if (ids.has(r.id)) {
        return true;
      }
      ids.add(r.id);
      return false;
    });
    
    if (duplicates.length > 0) {
      Logger.warn('Duplicate entities found in query results:', duplicates.map(d => d.id));
    }
    
    return results.map(data => new Entity(data));
  }

  async createUser(userData) {
    return this.create({
      ...userData,
      type: EntityTypes.PARTY
    });
  }

  async createGroup(groupData) {
    return this.create({
      ...groupData,
      type: EntityTypes.GROUP
    });
  }

  async createPost(postData) {
    return this.create({
      ...postData,
      type: EntityTypes.POST
    });
  }
}
