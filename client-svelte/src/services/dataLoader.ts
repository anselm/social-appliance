import { cacheEntities } from './database'
import type { Entity } from '../types'

export async function loadStaticData(): Promise<void> {
  try {
    // Fetch the static.info.js file as text to avoid Vite warnings
    const response = await fetch('/static.info.js')
    if (!response.ok) {
      console.log('DataLoader: No static data file found')
      return
    }
    
    console.log('DataLoader: Loading static entities from: /static.info.js')
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
      // Remove import statements (we'll handle them separately)
      .replace(/import\s+.*?from\s+['"].*?['"];?\s*/g, '')
    
    // Wrap the script to capture variables
    const wrappedScript = `
      (function() {
        ${transformedScript}
        
        // Capture all defined variables
        const exports = {};
        
        // List of expected exports based on static.info.js
        const exportNames = ['rootGroup', 'staticGallery', 'staticImages', 'staticDocs', 'docPages', '__defaultExport__'];
        
        for (const name of exportNames) {
          try {
            if (typeof eval(name) !== 'undefined') {
              exports[name] = eval(name);
            }
          } catch (e) {
            // Variable doesn't exist, skip it
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
    
    console.log('DataLoader: Successfully loaded static data')
    
    // Process the exports
    const allEntities: Entity[] = []
    
    // Handle default export
    if (moduleData.default && Array.isArray(moduleData.default)) {
      allEntities.push(...moduleData.default)
    }
    
    // Handle named exports
    for (const [key, value] of Object.entries(moduleData)) {
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
