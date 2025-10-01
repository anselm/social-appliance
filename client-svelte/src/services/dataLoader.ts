import { cacheEntities } from './database'
import type { Entity } from '../types'

export async function loadStaticData(): Promise<void> {
  try {
    // Always load static.info.js regardless of serverless mode
    const modulePath = `/static.info.js`
    console.log('DataLoader: Loading static entities from:', modulePath)
    const module = await import(/* @vite-ignore */ modulePath)
    
    console.log('DataLoader: Successfully imported static data')
    
    // Process all exports from the module
    const allEntities: Entity[] = []
    
    // Handle default export
    if (module.default) {
      if (Array.isArray(module.default)) {
        allEntities.push(...module.default)
      } else if (module.default.id) {
        allEntities.push(module.default as Entity)
      }
    }
    
    // Handle named exports
    for (const [key, value] of Object.entries(module)) {
      if (key === 'default') continue
      
      if (Array.isArray(value)) {
        allEntities.push(...value)
      } else if (value && typeof value === 'object' && (value as any).id) {
        allEntities.push(value as Entity)
      }
    }
    
    if (allEntities.length > 0) {
      console.log(`DataLoader: Caching ${allEntities.length} entities from static data`)
      await cacheEntities(allEntities)
      console.log('DataLoader: Entities cached successfully')
    } else {
      console.log('DataLoader: No entities found in static data')
    }
  } catch (error) {
    // It's okay if the file doesn't exist
    console.error('DataLoader: Error loading static data:', error)
  }
}
