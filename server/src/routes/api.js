import express from 'express';
import { API } from '../api/index.js';

const router = express.Router();
const api = new API();

// Entity routes
router.post('/entities', async (req, res) => {
  try {
    console.log(`POST /entities - type: ${req.body.type}, slug: ${req.body.slug || 'none'}`);
    const entity = await api.createEntity(req.body, req.userId);
    res.json(entity);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Special handling for root entity - MUST come before :id route
router.get('/entities/slug', async (req, res) => {
  try {
    console.log('GET /entities/slug - fetching root entity "/"');
    const entity = await api.getEntityBySlug('/', req.userId);
    if (!entity) {
      return res.status(404).json({ error: 'Entity not found: /' });
    }
    res.json(entity);
  } catch (error) {
    const status = error.status || 404;
    res.status(status).json({ error: error.message });
  }
});

// Use * to capture multi-segment paths - MUST come before :id route
router.get('/entities/slug/*', async (req, res) => {
  try {
    // Get the full slug path after /entities/slug/
    const slug = '/' + (req.params[0] || '');
    console.log(`GET /entities/slug/* - slug: "${slug}"`);
    
    const entity = await api.getEntityBySlug(slug, req.userId);
    if (!entity) {
      // This should never happen due to the error thrown in getEntityBySlug, but just in case
      return res.status(404).json({ error: `Entity not found: ${slug}` });
    }
    res.json(entity);
  } catch (error) {
    const status = error.status || 404;
    res.status(status).json({ error: error.message });
  }
});

// Query entities - MUST come before :id route
router.get('/entities', async (req, res) => {
  try {
    const filters = Object.keys(req.query).length > 0 ? req.query : {};
    console.log('GET /entities - query:', JSON.stringify(filters));
    const entities = await api.queryEntities(filters, req.userId);
    console.log(`  → returned ${entities.length} entities`);
    res.json(entities);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/entities/:id', async (req, res) => {
  try {
    console.log(`GET /entities/${req.params.id}`);
    const entity = await api.getEntity(req.params.id, req.userId);
    res.json(entity);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

router.put('/entities/:id', async (req, res) => {
  try {
    console.log(`PUT /entities/${req.params.id}`);
    const entity = await api.updateEntity(req.params.id, req.body, req.userId);
    res.json(entity);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/entities/:id', async (req, res) => {
  try {
    console.log(`DELETE /entities/${req.params.id}`);
    const success = await api.deleteEntity(req.params.id, req.userId);
    res.json({ success });
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
