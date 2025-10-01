import { EntityService } from '../services/entityService.js';
import { RelationshipService } from '../services/relationshipService.js';
import { PermissionService } from '../services/permissionService.js';

export class API {
  constructor() {
    this.entityService = new EntityService();
    this.relationshipService = new RelationshipService();
    this.permissionService = new PermissionService();
  }

  // Entity operations
  async createEntity(data, userId = null) {
    // Check permissions
    if (data.slug) {
      const canCreate = await this.permissionService.canCreateSlug(userId, data.slug);
      if (!canCreate) {
        throw new Error('Permission denied to create this slug');
      }
    }
    
    return this.entityService.create(data);
  }

  async getEntity(id, userId = null) {
    const entity = await this.entityService.findById(id);
    if (!entity) {
      throw new Error('Entity not found');
    }
    
    const canView = await this.permissionService.canView(userId, id);
    if (!canView) {
      throw new Error('Permission denied');
    }
    
    return entity;
  }

  async getEntityBySlug(slug, userId = null) {
    // Normalize the slug - ensure it starts with /
    const normalizedSlug = slug.startsWith('/') ? slug : `/${slug}`;
    
    console.log(`Looking up entity by slug: "${normalizedSlug}"`);
    const entity = await this.entityService.findBySlug(normalizedSlug);
    
    if (!entity) {
      console.log(`Entity not found for slug: "${normalizedSlug}"`);
      const error = new Error(`Entity not found: ${normalizedSlug}`);
      error.status = 404;
      throw error;
    }
    
    console.log(`Found entity: ${entity.id} (${entity.type}) for slug: "${normalizedSlug}"`);
    
    const canView = await this.permissionService.canView(userId, entity.id);
    if (!canView) {
      const error = new Error('Permission denied');
      error.status = 403;
      throw error;
    }
    
    return entity;
  }

  async updateEntity(id, updates, userId = null) {
    const canEdit = await this.permissionService.canEdit(userId, id);
    if (!canEdit) {
      throw new Error('Permission denied');
    }
    
    return this.entityService.update(id, updates);
  }

  async deleteEntity(id, userId = null) {
    const canDelete = await this.permissionService.canDelete(userId, id);
    if (!canDelete) {
      throw new Error('Permission denied');
    }
    
    return this.entityService.delete(id);
  }

  async queryEntities(filters, userId = null) {
    // Query entities and filter based on permissions
    const entities = await this.entityService.query(filters);
    
    // Filter out entities the user can't view
    const visibleEntities = [];
    for (const entity of entities) {
      const canView = await this.permissionService.canView(userId, entity.id);
      if (canView) {
        visibleEntities.push(entity);
      }
    }
    
    return visibleEntities;
  }

  // Convenience methods
  async createUser(userData, userId = null) {
    return this.createEntity({ ...userData, type: 'party' }, userId);
  }

  async createGroup(groupData, userId = null) {
    return this.createEntity({ ...groupData, type: 'group' }, userId);
  }

  async createPost(postData, userId = null) {
    return this.createEntity({ ...postData, type: 'post' }, userId);
  }

  // Relationship operations
  async createRelationship(data, userId = null) {
    // TODO: Check permissions for creating relationships
    return this.relationshipService.create(data);
  }

  async getRelationships(entityId, direction = 'from', type = null) {
    if (direction === 'from') {
      return this.relationshipService.findByFromEntity(entityId, type);
    } else {
      return this.relationshipService.findByToEntity(entityId, type);
    }
  }
}
