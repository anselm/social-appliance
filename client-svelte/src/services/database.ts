import Dexie, { type Table } from 'dexie'
import type { Entity } from '../types'
import loggers from './logger'

const log = loggers.database

export interface CachedEntity extends Entity {
  _cachedAt?: number
}

class SocialApplianceDB extends Dexie {
  entities!: Table<CachedEntity, string>
  
  constructor() {
    super('SocialApplianceDB')
    
    this.version(1).stores({
      entities: 'id, slug, type, parentId, [type+parentId], _cachedAt'
    })
  }
}

export const db = new SocialApplianceDB()

// Helper functions for entity caching
export async function cacheEntity(entity: Entity): Promise<void> {
  log.info('Caching entity:', entity.id, entity.slug, 'parentId:', entity.parentId)
  await db.entities.put({
    ...entity,
    _cachedAt: Date.now()
  })
}

export async function cacheEntities(entities: Entity[]): Promise<void> {
  log.info(`Caching ${entities.length} entities`)
  entities.forEach(e => {
    log.debug(`  - ${e.id} (slug: ${e.slug}, parentId: ${e.parentId})`)
  })
  const cachedEntities = entities.map(e => ({
    ...e,
    _cachedAt: Date.now()
  }))
  await db.entities.bulkPut(cachedEntities)
  log.info('Entities cached successfully')
  
  // Verify what was cached
  const count = await db.entities.count()
  log.debug(`Total entities in database: ${count}`)
}

export async function getCachedEntity(id: string): Promise<CachedEntity | undefined> {
  log.debug('Getting entity by id:', id)
  const entity = await db.entities.get(id)
  log.debug('Found entity:', entity ? 'yes' : 'no')
  return entity
}

export async function getCachedEntityBySlug(slug: string): Promise<CachedEntity | undefined> {
  log.debug('Getting entity by slug:', slug)
  const entity = await db.entities.where('slug').equals(slug).first()
  log.debug('Found entity:', entity ? entity.id : 'no')
  if (!entity) {
    // Debug: show all slugs in database
    const allEntities = await db.entities.toArray()
    log.debug('All slugs in database:', allEntities.map(e => e.slug))
  }
  return entity
}

export async function queryCachedEntities(filters: {
  type?: string
  parentId?: string
  limit?: number
  offset?: number
}): Promise<CachedEntity[]> {
  log.info('Querying entities with filters:', filters)
  let query = db.entities.toCollection()
  
  if (filters.type && filters.parentId !== undefined) {
    log.debug('Using compound index [type+parentId]')
    query = db.entities.where('[type+parentId]').equals([filters.type, filters.parentId])
  } else if (filters.type) {
    log.debug('Filtering by type:', filters.type)
    query = db.entities.where('type').equals(filters.type)
  } else if (filters.parentId !== undefined) {
    log.debug('Filtering by parentId:', filters.parentId)
    query = db.entities.where('parentId').equals(filters.parentId)
  }
  
  if (filters.offset) {
    query = query.offset(filters.offset)
  }
  
  if (filters.limit) {
    query = query.limit(filters.limit)
  }
  
  const results = await query.toArray()
  log.info(`Query returned ${results.length} entities`)
  if (results.length > 0) {
    log.debug('Results:', results.map(r => ({ id: r.id, slug: r.slug, parentId: r.parentId })))
  }
  return results
}

export async function clearCache(): Promise<void> {
  log.info('Clearing cache')
  await db.entities.clear()
}

export async function deleteDatabase(): Promise<void> {
  log.info('Deleting database')
  await db.delete()
}

export async function isCacheStale(entity: CachedEntity, maxAge: number): boolean {
  if (!entity._cachedAt) return true
  return Date.now() - entity._cachedAt > maxAge
}
