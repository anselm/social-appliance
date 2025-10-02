import './app.css'
import App from './App.svelte'
import { apiClient } from './services/apiClient'

// Wait for the API client to initialize before starting the app
async function initApp() {
  console.log('Main: Initializing app...')
  
  // Force initialization and wait for it to complete
  await (apiClient as any).init()
  
  console.log('Main: API client initialized, checking cache...')
  
  // Verify cache has data
  const { db } = await import('./services/database')
  const count = await db.entities.count()
  console.log(`Main: Cache has ${count} entities after init`)
  
  if (count > 0) {
    const allEntities = await db.entities.toArray()
    console.log('Main: Entities in cache:', allEntities.map(e => ({ id: e.id, slug: e.slug, parentId: e.parentId })))
  }
  
  console.log('Main: Starting app...')
  
  const app = new App({
    target: document.getElementById('app')!,
  })
  
  return app
}

// Start the app
const appPromise = initApp()

export default appPromise
