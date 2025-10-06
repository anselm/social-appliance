import './app.css'
import App from './App.svelte'
import { apiClient } from './services/apiClient'
import loggers from './services/logger'

const log = loggers.app

async function initApp() {
  log.info('Initializing application...')
  
  try {
    await (apiClient as any).init()
    log.info('API client initialized successfully')
    
    // For Svelte 5, we need to use the component directly without new
    const target = document.getElementById('app')
    if (!target) {
      throw new Error('App target element not found')
    }
    
    // Create the app instance using Svelte 5 API
    const app = App({
      target,
      props: {}
    })
    
    log.info('Application mounted successfully')
    return app
  } catch (error) {
    log.error('Failed to initialize application:', error)
    throw error
  }
}

log.info('Starting application...')
const appPromise = initApp()

export default appPromise
