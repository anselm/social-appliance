
window.APP_CONFIG = {
  
  // Header configuration
  header: {

    // title if any
    title: 'Locale.ai',

    // Whether to show the header
    enabled: true,
    
    // Custom header component (as HTML string)
    customHtml: null,
    
    // CSS classes for header styling
    className: 'border-b border-white/20 mb-8 pb-4'
  },
  
  // API configuration
  api: {
    // Base URL for API calls - by default looks on port 8080 if running the client vite - see vite.config.ts
    baseUrl: '/api',
    
    // Serverless mode - use only cached/static data
    serverless: true,
    
    // Enable client-side caching with IndexedDB (@todo bug! this must be set the same as serverless for now!)
    enableCache: true,
    
    // Load root info.js on startup
    loadStaticData: true,
    
    // Flush cache on startup (useful for development)
    flushCacheOnStartup: true,

    // Cache duration in milliseconds (default: 5 minutes)
    cacheDuration: 5 * 60 * 1000,
    
    // Server availability check interval (milliseconds)
    // Set to 0 to disable automatic retry
    serverRetryInterval: 30000 // 30 seconds
  },
  
  // Feature flags
  features: {
    // Enable user authentication
    authentication: false,
    
    // Enable content creation
    allowCreate: false,
    
    // Enable content editing
    allowEdit: false,
    
    // Enable content deletion
    allowDelete: false 
  },
  
  // Routing configuration
  routing: {
    // Routing mode: 'path' for SPA servers, 'query' for static hosts like GitHub Pages
    mode: 'path', // 'path' | 'query'
    
    // Base path for the application (useful for GitHub Pages with project sites)
    basePath: ''
  },
  
  // Map configuration
  map: {
    // Map provider: 'mapbox' or 'leaflet'
    provider: 'mapbox',
    
    // Mapbox access token (required if provider is 'mapbox')
    // This will be replaced at build time with the environment variable - see .env
    mapboxAccessToken: ''
  }
  
};
