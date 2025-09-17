import { getDB } from '../db/connection.js';
import { Entity } from '../models/entity.js';
import { EntityTypes } from '../config/constants.js';

export class EntityService {
  async create(entityData) {
    const db = await getDB();
    const entity = new Entity(entityData);
    
    // Check if slug is already taken
    if (entity.slug) {
      const existing = await db.collection('entities').findOne({ slug: entity.slug });
      if (existing) {
        throw new Error('Slug already exists');
      }
    }
    
    const result = await db.collection('entities').insertOne(entity.toJSON());
    return entity;
  }

  async findById(id) {
    const db = await getDB();
    const data = await db.collection('entities').findOne({ id });
    return data ? new Entity(data) : null;
  }

  async findBySlug(slug) {
    const db = await getDB();
    const data = await db.collection('entities').findOne({ slug });
    return data ? new Entity(data) : null;
  }

  async update(id, updates) {
    const db = await getDB();
    updates.updatedAt = new Date().toISOString();
    
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
    const result = await db.collection('entities').deleteOne({ id });
    return result.deletedCount > 0;
  }

  async query(filters = {}) {
    const db = await getDB();
    const query = {};
    
    // Build query based on filters
    if (filters.type) query.type = filters.type;
    if (filters.parentId) query.parentId = filters.parentId;
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
    
    const limit = Math.min(filters.limit || 20, 100);
    const offset = filters.offset || 0;
    
    const cursor = db.collection('entities')
      .find(query)
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit);
    
    const results = await cursor.toArray();
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
