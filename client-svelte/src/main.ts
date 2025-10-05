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
    
    const app = new App({
      target: document.getElementById('app')!,
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
