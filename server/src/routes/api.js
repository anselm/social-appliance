import express from 'express';
import { API } from '../api/index.js';

const router = express.Router();
const api = new API();

// Entity routes
router.post('/entities', async (req, res) => {
  try {
    const entity = await api.createEntity(req.body, req.userId);
    res.json(entity);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/entities/:id', async (req, res) => {
  try {
    const entity = await api.getEntity(req.params.id, req.userId);
    res.json(entity);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

// Use * to capture multi-segment paths
router.get('/entities/slug/*', async (req, res) => {
  try {
    // Get the full slug path after /entities/slug/
    const slug = '/' + (req.params[0] || '');
    console.log(`API route: Looking up slug: "${slug}"`);
    
    const entity = await api.getEntityBySlug(slug, req.userId);
    if (!entity) {
      // This should never happen due to the error thrown in getEntityBySlug, but just in case
      return res.status(404).json({ error: `Entity not found: ${slug}` });
    }
    res.json(entity);
  } catch (error) {
    const status = error.status || 404;
    console.error(`Error getting entity by slug ${req.params[0]}:`, error.message);
    res.status(status).json({ error: error.message });
  }
});

router.put('/entities/:id', async (req, res) => {
  try {
    const entity = await api.updateEntity(req.params.id, req.body, req.userId);
    res.json(entity);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/entities/:id', async (req, res) => {
  try {
    const success = await api.deleteEntity(req.params.id, req.userId);
    res.json({ success });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/entities', async (req, res) => {
  try {
    const entities = await api.queryEntities(req.query, req.userId);
    res.json(entities);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Convenience routes
router.post('/users', async (req, res) => {
  try {
    const user = await api.createUser(req.body, req.userId);
    res.json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/groups', async (req, res) => {
  try {
    const group = await api.createGroup(req.body, req.userId);
    res.json(group);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/posts', async (req, res) => {
  try {
    const post = await api.createPost(req.body, req.userId);
    res.json(post);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Relationship routes
router.post('/relationships', async (req, res) => {
  try {
    const relationship = await api.createRelationship(req.body, req.userId);
    res.json(relationship);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/entities/:id/relationships', async (req, res) => {
  try {
    const direction = req.query.direction || 'from';
    const type = req.query.type || null;
    const relationships = await api.getRelationships(req.params.id, direction, type);
    res.json(relationships);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
