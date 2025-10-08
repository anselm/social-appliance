
window.APP_CONFIG = {
  
  // Header configuration
  header: {

    // title if any
    title: 'locavore.ai', 

    // Whether to show the header
    enabled: true,
    
    // Custom header component (as HTML string)
    customHtml: null,
    
    // CSS classes for header styling
    className: 'border-b border-white/20 mb-8 pb-4'
  },
  
  // API configuration
  api: {
    // Base URL for API calls
    baseUrl: '/api',
    
    // Serverless mode - use only cached/static data
    serverless: false,
    
    // Enable client-side caching with IndexedDB
    enableCache: false,
    
    // Cache duration in milliseconds (default: 5 minutes)
    cacheDuration: 5 * 60 * 1000,
    
    // Load root info.js on startup
    loadStaticData: false,
    
    // Flush cache on startup (useful for development)
    flushCacheOnStartup: true,
    
    // Server availability check interval (milliseconds)
    // Set to 0 to disable automatic retry
    serverRetryInterval: 30000 // 30 seconds
  },
  
  // Feature flags
  features: {
    // Enable user authentication
    authentication: true,
    
    // Enable content creation
    allowCreate: true,
    
    // Enable content editing
    allowEdit: true,
    
    // Enable content deletion
    allowDelete: true 
  },
  
  // Routing configuration
  routing: {
    // Routing mode: 'path' for SPA servers, 'query' for static hosts like GitHub Pages
    mode: 'path', // 'path' | 'query'
    
    // Base path for the application (useful for GitHub Pages with project sites)
    basePath: ''
  },
  
};
