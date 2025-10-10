import express from 'express';
import { API } from '../api/index.js';
import { Logger } from '../utils/logger.js';
import { getDB } from '../db/connection.js';

const router = express.Router();
const api = new API();

// Error handler middleware
function handleError(res, error) {
  const status = error.status || (error.validationErrors ? 400 : 500);
  const message = error.validationErrors 
    ? { error: error.message, validationErrors: error.validationErrors }
    : { error: error.message };
  
  res.status(status).json(message);
}

// Health check with diagnostic information
router.get('/health', async (req, res) => {
  try {
    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      database: {
        connected: false,
        name: process.env.DB_NAME || 'social_appliance',
        entities: 0,
        relationships: 0,
        hasRootEntity: false
      }
    };

    // Try to get database stats
    try {
      const db = await getDB();
      health.database.connected = true;
      
      // Count entities
      health.database.entities = await db.collection('entities').countDocuments();
      
      // Count relationships
      health.database.relationships = await db.collection('relationships').countDocuments();
      
      // Check for root entity
      const rootEntity = await db.collection('entities').findOne({ slug: '/' });
      health.database.hasRootEntity = !!rootEntity;
      
      if (rootEntity) {
        health.database.rootEntityId = rootEntity.id;
        health.database.rootEntityTitle = rootEntity.title || 'Untitled';
      }
      
      // Get entity type breakdown
      const entityTypes = await db.collection('entities').aggregate([
        { $group: { _id: '$type', count: { $sum: 1 } } }
      ]).toArray();
      
      health.database.entityTypes = {};
      entityTypes.forEach(type => {
        health.database.entityTypes[type._id || 'unknown'] = type.count;
      });
      
    } catch (dbError) {
      health.database.error = dbError.message;
      Logger.warn('Health check: Database not available:', dbError.message);
    }

    res.json(health);
  } catch (error) {
    Logger.error('Health check error:', error);
    res.status(500).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

// Entity routes
router.post('/entities', async (req, res) => {
  try {
    Logger.api('POST', '/entities', { type: req.body.type, slug: req.body.slug || 'none' });
    const entity = await api.createEntity(req.body, req.userId);
    res.json(entity);
  } catch (error) {
    handleError(res, error);
  }
});

// Special handling for root entity - MUST come before :id route
router.get('/entities/slug', async (req, res) => {
  try {
    Logger.api('GET', '/entities/slug', '(root entity)');
    const entity = await api.getEntityBySlug('/', req.userId);
    res.json(entity);
  } catch (error) {
    handleError(res, error);
  }
});

// Use * to capture multi-segment paths - MUST come before :id route
router.get('/entities/slug/*', async (req, res) => {
  try {
    const slug = '/' + (req.params[0] || '');
    Logger.api('GET', '/entities/slug/*', { slug });
    
    const entity = await api.getEntityBySlug(slug, req.userId);
    res.json(entity);
  } catch (error) {
    handleError(res, error);
  }
});

// Query entities - MUST come before :id route
router.get('/entities', async (req, res) => {
  try {
    const filters = Object.keys(req.query).length > 0 ? req.query : {};
    Logger.api('GET', '/entities', { filters: JSON.stringify(filters) });
    const entities = await api.queryEntities(filters, req.userId);
    Logger.debug(`Returned ${entities.length} entities`);
    res.json(entities);
  } catch (error) {
    handleError(res, error);
  }
});

router.get('/entities/:id', async (req, res) => {
  try {
    Logger.api('GET', `/entities/${req.params.id}`);
    const entity = await api.getEntity(req.params.id, req.userId);
    res.json(entity);
  } catch (error) {
    handleError(res, error);
  }
});

router.put('/entities/:id', async (req, res) => {
  try {
    Logger.api('PUT', `/entities/${req.params.id}`);
    const entity = await api.updateEntity(req.params.id, req.body, req.userId);
    res.json(entity);
  } catch (error) {
    handleError(res, error);
  }
});

router.delete('/entities/:id', async (req, res) => {
  try {
    Logger.api('DELETE', `/entities/${req.params.id}`);
    const success = await api.deleteEntity(req.params.id, req.userId);
    res.json({ success });
  } catch (error) {
    handleError(res, error);
  }
});

// Convenience routes
router.post('/users', async (req, res) => {
  try {
    Logger.api('POST', '/users', { slug: req.body.slug });
    const user = await api.createUser(req.body, req.userId);
    res.json(user);
  } catch (error) {
    handleError(res, error);
  }
});

router.post('/groups', async (req, res) => {
  try {
    Logger.api('POST', '/groups', { slug: req.body.slug });
    const group = await api.createGroup(req.body, req.userId);
    res.json(group);
  } catch (error) {
    handleError(res, error);
  }
});

router.post('/posts', async (req, res) => {
  try {
    Logger.api('POST', '/posts', { title: req.body.title });
    const post = await api.createPost(req.body, req.userId);
    res.json(post);
  } catch (error) {
    handleError(res, error);
  }
});

// Relationship routes
router.post('/relationships', async (req, res) => {
  try {
    Logger.api('POST', '/relationships', { type: req.body.type });
    const relationship = await api.createRelationship(req.body, req.userId);
    res.json(relationship);
  } catch (error) {
    handleError(res, error);
  }
});

// Query relationships with filters - NEW ROUTE
router.get('/relationships', async (req, res) => {
  try {
    const { fromId, toId, type } = req.query;
    Logger.api('GET', '/relationships', { fromId, toId, type });
    
    // Get relationships based on filters
    let relationships = [];
    
    if (fromId && toId && type) {
      // Specific relationship lookup
      const rel = await api.relationshipService.findByEntities(fromId, toId, type);
      relationships = rel ? [rel] : [];
    } else if (fromId) {
      // All relationships from this entity
      relationships = await api.relationshipService.findByFromEntity(fromId, type || null);
    } else if (toId) {
      // All relationships to this entity
      relationships = await api.relationshipService.findByToEntity(toId, type || null);
    } else {
      // No filters - return empty array (could also return all, but that might be too much)
      relationships = [];
    }
    
    res.json(relationships);
  } catch (error) {
    handleError(res, error);
  }
});

// Delete relationship - NEW ROUTE
router.delete('/relationships/:id', async (req, res) => {
  try {
    Logger.api('DELETE', `/relationships/${req.params.id}`);
    const success = await api.relationshipService.delete(req.params.id);
    res.json({ success });
  } catch (error) {
    handleError(res, error);
  }
});

// Get relationships for a specific entity (legacy route - kept for compatibility)
router.get('/entities/:id/relationships', async (req, res) => {
  try {
    const direction = req.query.direction || 'from';
    const type = req.query.type || null;
    Logger.api('GET', `/entities/${req.params.id}/relationships`, { direction, type });
    const relationships = await api.getRelationships(req.params.id, direction, type);
    res.json(relationships);
  } catch (error) {
    handleError(res, error);
  }
});

export default router;
