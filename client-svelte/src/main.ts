import './app.css'
import { mount } from 'svelte'
import App from './App.svelte'
import { apiClient } from './services/apiClient'
import loggers from './services/logger'
import { themeStore } from './stores/theme'

const log = loggers.app

console.log('[Main] Application starting')
console.log('[Main] Theme store imported:', themeStore)

async function initApp() {
  log.info('Initializing application...')
  
  try {
    await (apiClient as any).init()
    log.info('API client initialized successfully')
    
    const target = document.getElementById('app')
    if (!target) {
      throw new Error('App target element not found')
    }
    
    // Use proper Svelte 5 mount API
    const app = mount(App, {
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
