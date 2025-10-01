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
    
    // Wrap the script to capture ES module exports
    const wrappedScript = `
      (function() {
        const exports = {};
        const module = { exports };
        ${scriptText}
        
        // Capture all named exports and default export
        if (typeof rootGroup !== 'undefined') exports.rootGroup = rootGroup;
        if (typeof staticGallery !== 'undefined') exports.staticGallery = staticGallery;
        if (typeof staticImages !== 'undefined') exports.staticImages = staticImages;
        if (typeof staticDocs !== 'undefined') exports.staticDocs = staticDocs;
        if (typeof docPages !== 'undefined') exports.docPages = docPages;
        
        // Handle default export if it exists
        const defaultExport = (() => {
          try {
            return eval('typeof export !== "undefined" && export.default || []');
          } catch (e) {
            return [];
          }
        })();
        
        window['${tempGlobal}'] = { ...exports, default: defaultExport };
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
