import './app.css'
import App from './App.svelte'
import { apiClient } from './services/apiClient'

// Initialize the API client (which loads static data)
apiClient

const app = new App({
  target: document.getElementById('app')!,
})

export default app
