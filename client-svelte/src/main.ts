import './app.css'
import App from './App.svelte'
import { apiClient } from './services/apiClient'

// Wait for the API client to initialize before starting the app
async function initApp() {
  console.log('Main: Initializing app...')
  
  // Force initialization and wait for it to complete
  await (apiClient as any).init()
  
  console.log('Main: API client initialized, starting app...')
  
  const app = new App({
    target: document.getElementById('app')!,
  })
  
  return app
}

// Start the app
const appPromise = initApp()

export default appPromise
