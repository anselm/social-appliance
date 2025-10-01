import { cacheEntities } from './database'
import type { Entity } from '../types'

export async function loadStaticData(): Promise<void> {
  try {
    // Try to dynamically import the static data file
    const dataModule = await import('/static.info.js')
    
    console.log('Loading static data from /static.info.js')
    
    // Process all exports from the module
    const allEntities: Entity[] = []
    
    for (const [key, value] of Object.entries(dataModule)) {
      if (Array.isArray(value)) {
        // If it's an array, assume it's an array of entities
        allEntities.push(...value)
      } else if (value && typeof value === 'object' && value.id) {
        // If it's an object with an id, assume it's an entity
        allEntities.push(value as Entity)
      }
    }
    
    if (allEntities.length > 0) {
      console.log(`Caching ${allEntities.length} entities from static data`)
      await cacheEntities(allEntities)
    }
  } catch (error) {
    // It's okay if the file doesn't exist
    console.log('No static data file found at /static.info.js')
  }
}
