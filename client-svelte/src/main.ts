import './app.css'
import App from './App.svelte'
import { apiClient } from './services/apiClient'

async function initApp() {
  await (apiClient as any).init()    
  const app = new App({
    target: document.getElementById('app')!,
  })
  return app
}

const appPromise = initApp()

export default appPromise
