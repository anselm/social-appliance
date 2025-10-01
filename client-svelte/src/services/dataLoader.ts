import { cacheEntities } from './database'
import type { Entity } from '../types'

export async function loadStaticData(): Promise<void> {
  try {
    // Use dynamic import with a template literal to prevent Vite from analyzing it
    const modulePath = `/static.info.js`
    const module = await import(/* @vite-ignore */ modulePath)
    
    console.log('Loading static data from /static.info.js')
    
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
      console.log(`Caching ${allEntities.length} entities from static data`)
      await cacheEntities(allEntities)
    }
  } catch (error) {
    // It's okay if the file doesn't exist
    console.log('No static data file found at /static.info.js', error)
  }
}
