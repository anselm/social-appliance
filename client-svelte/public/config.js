// Client configuration file
// This file can be modified after build to customize the application

window.APP_CONFIG = {
  // Application title and branding
  appTitle: '🐳',
  
  // Header configuration
  header: {
    // Whether to show the header
    enabled: true,
    
    // Header links (static only for post-build customization)
    links: [
      { label: 'Home', href: '/' },
//      { label: 'Admin', href: '/admin' },
//      { label: 'Login', href: '/login' }
    ],
    
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
    serverless: true,
    
    // Enable client-side caching with IndexedDB
    enableCache: true,
    
    // Cache duration in milliseconds (default: 5 minutes)
    cacheDuration: 5 * 60 * 1000,
    
    // Load root info.js on startup
    loadStaticData: true,
    
    // Flush cache on startup (useful for development)
    flushCacheOnStartup: true,
    
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
    mode: 'query', // 'path' | 'query'
    
    // Base path for the application (useful for GitHub Pages with project sites)
    basePath: ''
  },
  
  // Custom methods can be added here
  methods: {
    // Example: Custom initialization
    onInit: () => {
      console.log('App initialized with custom config');
    },
    
    // Example: Custom header renderer
    renderHeader: (config) => {
      if (config.header.customHtml) {
        return config.header.customHtml;
      }
      return null;
    }
  }
};
