import { cacheEntities } from './database'
import type { Entity } from '../types'

export async function loadStaticData(): Promise<void> {
  try {
    // Load the static data script
    const script = document.createElement('script')
    script.src = '/static.info.js'
    
    await new Promise<void>((resolve, reject) => {
      script.onload = () => resolve()
      script.onerror = () => reject(new Error('Failed to load static.info.js'))
      document.head.appendChild(script)
    })
    
    // Check if the global variable was set
    const staticEntities = (window as any).STATIC_ENTITIES
    if (!staticEntities) {
      console.log('No static entities found in /static.info.js')
      return
    }
    
    console.log('Loading static data from /static.info.js')
    
    if (Array.isArray(staticEntities) && staticEntities.length > 0) {
      console.log(`Caching ${staticEntities.length} entities from static data`)
      await cacheEntities(staticEntities as Entity[])
    }
    
    // Clean up the global variable
    delete (window as any).STATIC_ENTITIES
  } catch (error) {
    // It's okay if the file doesn't exist
    console.log('No static data file found at /static.info.js')
  }
}
