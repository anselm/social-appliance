import { cacheEntities } from './database'
import { get } from 'svelte/store'
import { apiConfig } from '../stores/config'
import type { Entity } from '../types'

export async function loadStaticData(): Promise<void> {
  const config = get(apiConfig)
  const staticFiles = config.staticDataFiles || ['/static.info.js']
  const allEntities: Entity[] = []
  
  console.log(`DataLoader: Loading static data from ${staticFiles.length} files`)
  
  // Load all files in parallel but wait for all to complete
  const loadPromises = staticFiles.map(async (filePath) => {
    try {
      console.log(`DataLoader: Loading ${filePath}...`)
      const entities = await loadStaticFile(filePath)
      if (entities.length > 0) {
        console.log(`DataLoader: Loaded ${entities.length} entities from ${filePath}`)
        return entities
      }
      return []
    } catch (error) {
      console.error(`DataLoader: Failed to load ${filePath}:`, error)
      // Continue loading other files even if one fails
      return []
    }
  })
  
  // Wait for all files to load
  const results = await Promise.all(loadPromises)
  
  // Combine all entities
  for (const entities of results) {
    allEntities.push(...entities)
  }
  
  if (allEntities.length > 0) {
    console.log(`DataLoader: Total entities loaded: ${allEntities.length}`)
    await cacheEntities(allEntities)
    console.log('DataLoader: All entities cached successfully')
  } else {
    console.log('DataLoader: No entities found in any static data files')
  }
}

async function loadStaticFile(filePath: string): Promise<Entity[]> {
  try {
    // Fetch the file as text to avoid Vite warnings
    const response = await fetch(filePath)
    if (!response.ok) {
      console.log(`DataLoader: File not found: ${filePath}`)
      return []
    }
    
    const scriptText = await response.text()
    
    // Create a temporary global to capture the exports
    const tempGlobal = '__STATIC_DATA_TEMP__'
    ;(window as any)[tempGlobal] = {}
    
    // Transform ES module syntax to regular JavaScript
    let transformedScript = scriptText
      // Replace export const/let/var declarations
      .replace(/export\s+(const|let|var)\s+(\w+)\s*=/g, '$1 $2 =')
      // Replace export default
      .replace(/export\s+default\s+/g, 'const __defaultExport__ = ')
      // Handle import statements by replacing them with empty arrays
      .replace(/import\s+(\w+)\s+from\s+['"].*?['"];?\s*/g, 'const $1 = [];')
    
    // Wrap the script to capture variables
    const wrappedScript = `
      (function() {
        ${transformedScript}
        
        // Capture all defined variables
        const exports = {};
        
        // Try to find all exported variables by looking for const/let/var declarations
        const variableNames = transformedScript.match(/(?:const|let|var)\s+(\w+)\s*=/g) || [];
        const exportNames = variableNames.map(match => match.replace(/(?:const|let|var)\s+(\w+)\s*=/, '$1'));
        
        // Add the default export if it exists
        if (transformedScript.includes('__defaultExport__')) {
          exportNames.push('__defaultExport__');
        }
        
        console.log('DataLoader: Found potential exports:', exportNames);
        
        for (const name of exportNames) {
          try {
            const value = eval(name);
            if (typeof value !== 'undefined') {
              exports[name] = value;
              console.log('DataLoader: Captured export "' + name + '":', typeof value === 'object' ? 'object' : value);
            }
          } catch (e) {
            // Variable doesn't exist or can't be evaluated, skip it
          }
        }
        
        // Handle default export
        if (exports.__defaultExport__) {
          exports.default = exports.__defaultExport__;
          delete exports.__defaultExport__;
        }
        
        window['${tempGlobal}'] = exports;
      })();
    `
    
    // Execute the wrapped script
    const scriptEl = document.createElement('script')
    scriptEl.textContent = wrappedScript
    document.head.appendChild(scriptEl)
    document.head.removeChild(scriptEl)
    
    // Get the captured exports
    const moduleData = (window as any)[tempGlobal]
    delete (window as any)[tempGlobal]
    
    // Process the exports
    const entities: Entity[] = []
    
    // Handle default export
    if (moduleData.default && Array.isArray(moduleData.default)) {
      entities.push(...moduleData.default)
    }
    
    // Handle named exports
    for (const [key, value] of Object.entries(moduleData)) {
      if (key === 'default') continue
      
      if (Array.isArray(value)) {
        entities.push(...value)
      } else if (value && typeof value === 'object' && (value as any).id) {
        entities.push(value as Entity)
      }
    }
    
    return entities
  } catch (error) {
    console.error(`DataLoader: Error loading ${filePath}:`, error)
    return []
  }
}
