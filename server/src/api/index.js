import { EntityService } from '../services/entityService.js';
import { RelationshipService } from '../services/relationshipService.js';
import { PermissionService } from '../services/permissionService.js';
import { Logger } from '../utils/logger.js';
import { Validator } from '../utils/validator.js';

export class API {
  constructor() {
    this.entityService = new EntityService();
    this.relationshipService = new RelationshipService();
    this.permissionService = new PermissionService();
  }

  // Helper method to check permissions and throw appropriate errors
  async _checkPermission(check, errorMessage) {
    if (!check) {
      const error = new Error(errorMessage);
      error.status = 403;
      throw error;
    }
  }

  // Entity operations
  async createEntity(data, userId = null) {
    try {
      // Validate input
      Validator.validateEntity(data);

      // Check permissions
      if (data.slug) {
        const canCreate = await this.permissionService.canCreateSlug(userId, data.slug);
        await this._checkPermission(canCreate, 'Permission denied to create this slug');
      }
      
      const entity = await this.entityService.create(data);
      Logger.success(`Created entity: ${entity.type} ${entity.slug || entity.id}`);
      return entity;
    } catch (error) {
      // Log validation errors with details
      if (error.validationErrors) {
        Logger.error('Validation failed:', error);
        console.error('Validation errors:', error.validationErrors);
      } else {
        Logger.error('Failed to create entity:', error);
      }
      throw error;
    }
  }

  async getEntity(id, userId = null) {
    try {
      const entity = await this.entityService.findById(id);
      if (!entity) {
        const error = new Error('Entity not found');
        error.status = 404;
        throw error;
      }
      
      const canView = await this.permissionService.canView(userId, id);
      await this._checkPermission(canView, 'Permission denied');
      
      return entity;
    } catch (error) {
      if (!error.status) {
        Logger.error(`Failed to get entity ${id}:`, error);
      }
      throw error;
    }
  }

  async getEntityBySlug(slug, userId = null) {
    try {
      // Normalize the slug - ensure it starts with /
      const normalizedSlug = slug.startsWith('/') ? slug : `/${slug}`;
      
      Logger.debug(`Looking up entity by slug: ${normalizedSlug}`);
      
      const entity = await this.entityService.findBySlug(normalizedSlug);
      
      if (!entity) {
        const error = new Error(`Entity not found: ${normalizedSlug}`);
        error.status = 404;
        throw error;
      }
      
      const canView = await this.permissionService.canView(userId, entity.id);
      await this._checkPermission(canView, 'Permission denied');
      
      return entity;
    } catch (error) {
      if (!error.status) {
        Logger.error(`Failed to get entity by slug ${slug}:`, error);
      }
      throw error;
    }
  }

  async updateEntity(id, updates, userId = null) {
    try {
      // Validate updates
      Validator.validateEntity(updates);

      const canEdit = await this.permissionService.canEdit(userId, id);
      await this._checkPermission(canEdit, 'Permission denied');
      
      const entity = await this.entityService.update(id, updates);
      Logger.success(`Updated entity: ${id}`);
      return entity;
    } catch (error) {
      // Log validation errors with details
      if (error.validationErrors) {
        Logger.error('Validation failed:', error);
        console.error('Validation errors:', error.validationErrors);
      } else {
        Logger.error(`Failed to update entity ${id}:`, error);
      }
      throw error;
    }
  }

  async deleteEntity(id, userId = null) {
    try {
      const canDelete = await this.permissionService.canDelete(userId, id);
      await this._checkPermission(canDelete, 'Permission denied');
      
      const result = await this.entityService.delete(id);
      Logger.success(`Deleted entity: ${id}`);
      return result;
    } catch (error) {
      Logger.error(`Failed to delete entity ${id}:`, error);
      throw error;
    }
  }

  async queryEntities(filters, userId = null) {
    try {
      // Sanitize and validate filters
      const sanitizedFilters = Validator.sanitizeQueryFilters(filters);
      
      Logger.debug('Querying entities with filters:', sanitizedFilters);
      
      // Query entities and filter based on permissions
      const entities = await this.entityService.query(sanitizedFilters);
      
      // Filter out entities the user can't view
      const visibleEntities = [];
      for (const entity of entities) {
        const canView = await this.permissionService.canView(userId, entity.id);
        if (canView) {
          visibleEntities.push(entity);
        }
      }
      
      Logger.debug(`Query returned ${visibleEntities.length} visible entities`);
      return visibleEntities;
    } catch (error) {
      Logger.error('Failed to query entities:', error);
      throw error;
    }
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
    try {
      // TODO: Check permissions for creating relationships
      const relationship = await this.relationshipService.create(data);
      Logger.success(`Created relationship: ${data.type} from ${data.fromId} to ${data.toId}`);
      return relationship;
    } catch (error) {
      Logger.error('Failed to create relationship:', error);
      throw error;
    }
  }

  async getRelationships(entityId, direction = 'from', type = null) {
    try {
      if (direction === 'from') {
        return this.relationshipService.findByFromEntity(entityId, type);
      } else {
        return this.relationshipService.findByToEntity(entityId, type);
      }
    } catch (error) {
      Logger.error(`Failed to get relationships for ${entityId}:`, error);
      throw error;
    }
  }
}
