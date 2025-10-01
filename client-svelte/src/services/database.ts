import Dexie, { type Table } from 'dexie'
import type { Entity } from '../types'

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
  await db.entities.put({
    ...entity,
    _cachedAt: Date.now()
  })
}

export async function cacheEntities(entities: Entity[]): Promise<void> {
  const cachedEntities = entities.map(e => ({
    ...e,
    _cachedAt: Date.now()
  }))
  await db.entities.bulkPut(cachedEntities)
}

export async function getCachedEntity(id: string): Promise<CachedEntity | undefined> {
  return db.entities.get(id)
}

export async function getCachedEntityBySlug(slug: string): Promise<CachedEntity | undefined> {
  return db.entities.where('slug').equals(slug).first()
}

export async function queryCachedEntities(filters: {
  type?: string
  parentId?: string
  limit?: number
  offset?: number
}): Promise<CachedEntity[]> {
  let query = db.entities.toCollection()
  
  if (filters.type && filters.parentId !== undefined) {
    query = db.entities.where('[type+parentId]').equals([filters.type, filters.parentId])
  } else if (filters.type) {
    query = db.entities.where('type').equals(filters.type)
  } else if (filters.parentId !== undefined) {
    query = db.entities.where('parentId').equals(filters.parentId)
  }
  
  if (filters.offset) {
    query = query.offset(filters.offset)
  }
  
  if (filters.limit) {
    query = query.limit(filters.limit)
  }
  
  return query.toArray()
}

export async function clearCache(): Promise<void> {
  await db.entities.clear()
}

export async function isCacheStale(entity: CachedEntity, maxAge: number): boolean {
  if (!entity._cachedAt) return true
  return Date.now() - entity._cachedAt > maxAge
}
