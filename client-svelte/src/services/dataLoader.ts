import { cacheEntities } from './database'
import type { Entity } from '../types'

export async function loadStaticData(): Promise<void> {
  try {
    // Use fetch to load the static data file at runtime
    const response = await fetch('/static.info.js')
    if (!response.ok) {
      console.log('No static data file found at /static.info.js')
      return
    }
    
    // Get the JavaScript content
    const scriptContent = await response.text()
    
    // Create a function to execute the module code and capture exports
    const moduleExports: any = {}
    const moduleFunc = new Function('exports', scriptContent + '\nreturn exports;')
    
    // Execute the module
    const dataModule = moduleFunc(moduleExports)
    
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
    console.log('Error loading static data:', error)
  }
}
