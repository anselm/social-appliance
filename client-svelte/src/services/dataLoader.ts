import { cacheEntities } from './database'
import type { Entity } from '../types'

export async function loadStaticData(): Promise<void> {
  try {
    // Use dynamic import with a template literal to prevent Vite from analyzing it
    const modulePath = `/static.info.js`
    console.log('DataLoader: Attempting to import from:', modulePath)
    const module = await import(/* @vite-ignore */ modulePath)
    
    console.log('DataLoader: Successfully imported module:', module)
    console.log('DataLoader: Module keys:', Object.keys(module))
    
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
