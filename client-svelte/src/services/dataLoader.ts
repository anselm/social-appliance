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
      const module = await import(/* @vite-ignore */ `${filePath}?t=${timestamp}`)
      
      console.log('DataLoader: Module loaded:', module)
      console.log('DataLoader: Module keys:', Object.keys(module))
      
      // Process default export
      if (module.default) {
        console.log('DataLoader: Processing default export:', module.default)
        if (Array.isArray(module.default)) {
          console.log(`DataLoader: Default export is array with ${module.default.length} items`)
          allEntities.push(...module.default)
        } else if (module.default.id) {
          console.log('DataLoader: Default export is single entity')
          allEntities.push(module.default)
        }
      }
      
      // Process named exports
      for (const [key, value] of Object.entries(module)) {
        if (key === 'default') continue
        
        console.log(`DataLoader: Processing named export "${key}":`, value)
        
        if (Array.isArray(value)) {
          console.log(`DataLoader: Named export "${key}" is array with ${value.length} items`)
          allEntities.push(...value)
        } else if (value && typeof value === 'object' && (value as any).id) {
          console.log(`DataLoader: Named export "${key}" is single entity`)
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
    console.log('DataLoader: Entities:', allEntities)
    
    // Create placeholder entities for any missing parents
    const entitiesWithPlaceholders = ensureParentEntitiesExist(allEntities)
    console.log(`DataLoader: After adding placeholders: ${entitiesWithPlaceholders.length} entities`)
    
    await cacheEntities(entitiesWithPlaceholders)
    console.log('DataLoader: All entities cached successfully')
  } else {
    console.log('DataLoader: No entities found in any static data files')
  }
}

/**
 * Ensure all parent entities exist by creating placeholder entities for missing parents.
 * This makes the system robust to load order - entities can reference parents that
 * haven't been loaded yet, and we'll create a placeholder for them.
 */
function ensureParentEntitiesExist(entities: Entity[]): Entity[] {
  const entityMap = new Map<string, Entity>()
  const result: Entity[] = []
  
  // First pass: index all existing entities
  entities.forEach(entity => {
    entityMap.set(entity.id, entity)
  })
  
  // Second pass: create placeholders for missing parents
  entities.forEach(entity => {
    if (entity.parentId && !entityMap.has(entity.parentId)) {
      console.log(`DataLoader: Creating placeholder for missing parent: ${entity.parentId}`)
      
      // Create a placeholder entity for the missing parent
      const placeholder: Entity = {
        id: entity.parentId,
        type: 'group',
        title: `Placeholder for ${entity.parentId}`,
        content: 'This is a placeholder entity created automatically because a child referenced this parent.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      entityMap.set(entity.parentId, placeholder)
      result.push(placeholder)
    }
  })
  
  // Add all original entities
  result.push(...entities)
  
  console.log(`DataLoader: Created ${result.length - entities.length} placeholder entities`)
  
  return result
}
