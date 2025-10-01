import { writable, derived } from 'svelte/store'

// Default configuration
const defaultConfig = {
  appTitle: 'Social Appliance',
  header: {
    enabled: true,
    links: [
      { label: 'Home', href: '/' },
      { label: 'Admin', href: '/admin' },
      { label: 'Login', href: '/login' }
    ],
    customHtml: null,
    className: 'border-b border-white/20 mb-8 pb-4'
  },
  api: {
    baseUrl: '/api',
    serverless: false,
    serverlessDataUrl: '/data/entities.json',
    enableCache: false,
    cacheDuration: 5 * 60 * 1000
  },
  features: {
    authentication: true,
    allowCreate: true,
    allowEdit: true,
    allowDelete: true
  },
  methods: {
    onInit: () => {},
    renderHeader: () => null
  }
}

// Get config from window or use defaults
const loadedConfig = (window as any).APP_CONFIG || defaultConfig

// Create writable store
export const config = writable(loadedConfig)

// Derived stores for easy access
export const headerConfig = derived(config, $config => $config.header)
export const apiConfig = derived(config, $config => $config.api)
export const features = derived(config, $config => $config.features)

// Initialize config
if (loadedConfig.methods?.onInit) {
  loadedConfig.methods.onInit()
}
