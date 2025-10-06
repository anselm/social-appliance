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
    
    const target = document.getElementById('app')
    if (!target) {
      throw new Error('App target element not found')
    }
    
    // Clear the target
    target.innerHTML = ''
    
    // Create the app instance directly - Svelte 5 components are functions
    const app = new App({
      target,
      props: {
        url: window.location.pathname
      }
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
