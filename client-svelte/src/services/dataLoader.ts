import { cacheEntities } from './database'
import { get } from 'svelte/store'
import { apiConfig } from '../stores/config'
import type { Entity } from '../types'

export async function loadStaticData(): Promise<void> {
  const config = get(apiConfig)
  const staticFiles = config.staticDataFiles || ['/static.info.js']
  const allEntities: Entity[] = []
  
  console.log(`DataLoader: Loading static data from ${staticFiles.length} files`)
  
  // Load all files using native ES6 modules
  for (const filePath of staticFiles) {
    try {
      console.log(`DataLoader: Loading ${filePath}...`)
      
      // Use native dynamic import with a timestamp to bypass any caching
      const timestamp = Date.now()
      const module = await import(`${filePath}?t=${timestamp}`)
      
      console.log('DataLoader: Module loaded:', module)
      
      // Process default export
      if (module.default) {
        if (Array.isArray(module.default)) {
          allEntities.push(...module.default)
        } else if (module.default.id) {
          allEntities.push(module.default)
        }
      }
      
      // Process named exports
      for (const [key, value] of Object.entries(module)) {
        if (key === 'default') continue
        
        if (Array.isArray(value)) {
          allEntities.push(...value)
        } else if (value && typeof value === 'object' && (value as any).id) {
          allEntities.push(value as Entity)
        }
      }
      
      console.log(`DataLoader: Found ${allEntities.length} entities so far`)
    } catch (error) {
      console.error(`DataLoader: Failed to load ${filePath}:`, error)
      // Continue loading other files even if one fails
    }
  }
  
  if (allEntities.length > 0) {
    console.log(`DataLoader: Total entities loaded: ${allEntities.length}`)
    await cacheEntities(allEntities)
    console.log('DataLoader: All entities cached successfully')
  } else {
    console.log('DataLoader: No entities found in any static data files')
  }
}
