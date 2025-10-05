import { writable, derived } from 'svelte/store'
import { api } from '../services/api'
import type { Entity, EntityWithChildren } from '../types'
import loggers from '../services/logger'

const log = loggers.entities

function createEntitiesStore() {
  const { subscribe, set, update } = writable<Entity[]>([])
  
  return {
    subscribe,
    load: async (filters: Record<string, any> = {}) => {
      log.info('Loading entities with filters:', filters)
      
      try {
        const entities = await api.queryEntities(filters)
        log.info(`Loaded ${entities.length} entities`)
        set(entities)
        return entities
      } catch (error) {
        log.error('Failed to load entities:', error)
        throw error
      }
    },
    loadBySlug: async (slug: string) => {
      log.info('Loading entity by slug:', slug)
      
      try {
        const entity = await api.getEntityBySlug(slug)
        log.info('Loaded entity:', entity.id)
        
        // Update the store to include this entity
        update(entities => {
          const index = entities.findIndex(e => e.id === entity.id)
          if (index >= 0) {
            entities[index] = entity
            return entities
          } else {
            return [...entities, entity]
          }
        })
        
        return entity
      } catch (error) {
        log.error('Failed to load entity by slug:', error)
        throw error
      }
    },
    create: async (entityData: any) => {
      log.info('Creating entity:', entityData.type, entityData.title || entityData.slug)
      
      try {
        let entity
        if (entityData.type === 'post') {
          entity = await api.createPost(entityData)
        } else if (entityData.type === 'group') {
          entity = await api.createGroup(entityData)
        } else if (entityData.type === 'party') {
          entity = await api.createUser(entityData)
        } else {
          throw new Error(`Unsupported entity type: ${entityData.type}`)
        }
        
        log.info('Entity created:', entity.id)
        
        // Add to store
        update(entities => [...entities, entity])
        return entity
      } catch (error) {
        log.error('Failed to create entity:', error)
        throw error
      }
    },
    update: async (id: string, updates: any) => {
      log.info('Updating entity:', id)
      
      try {
        const entity = await api.updateEntity(id, updates)
        log.info('Entity updated:', entity.id)
        
        // Update in store
        update(entities => {
          const index = entities.findIndex(e => e.id === id)
          if (index >= 0) {
            entities[index] = entity
          }
          return entities
        })
        
        return entity
      } catch (error) {
        log.error('Failed to update entity:', error)
        throw error
      }
    },
    delete: async (id: string) => {
      log.info('Deleting entity:', id)
      
      try {
        await api.deleteEntity(id)
        log.info('Entity deleted:', id)
        
        // Remove from store
        update(entities => entities.filter(e => e.id !== id))
      } catch (error) {
        log.error('Failed to delete entity:', error)
        throw error
      }
    },
    clear: () => {
      log.info('Clearing entities store')
      set([])
    }
  }
}

export const entities = createEntitiesStore()
export const treeEntities = writable<EntityWithChildren[]>([])
export const loadingEntities = writable(false)
export const selectedEntity = writable<Entity | null>(null)
export const editingEntity = writable<Entity | null>(null)

// Derived store for entities by type
export const entitiesByType = derived(
  entities,
  $entities => {
    const byType: Record<string, Entity[]> = {}
    $entities.forEach(entity => {
      if (!byType[entity.type]) {
        byType[entity.type] = []
      }
      byType[entity.type].push(entity)
    })
    return byType
  }
)
