import { get } from 'svelte/store'
import { apiConfig } from '../stores/config'
import { 
  db, 
  cacheEntity, 
  cacheEntities, 
  getCachedEntity, 
  getCachedEntityBySlug,
  queryCachedEntities,
  isCacheStale 
} from './database'
import { loadStaticData } from './dataLoader'
import type { Entity } from '../types'

class ApiClient {
  private staticDataLoaded = false
  private serverAvailable: boolean | null = null
  private initPromise: Promise<void> | null = null
  
  constructor() {
    // Don't call init in constructor - let it be called explicitly
  }
  
  async init() {
    // Ensure init only runs once
    if (this.initPromise) {
      console.log('ApiClient: Init already in progress or complete, waiting...')
      return this.initPromise
    }
    
    this.initPromise = this._init()
    return this.initPromise
  }
  
  private async _init() {
    const config = get(apiConfig)
    
    console.log('ApiClient: Initializing...')
    console.log('ApiClient: Config:', config)
    
    // Flush cache if configured
    if (config.flushCacheOnStartup) {
      console.log('ApiClient: Flushing cache on startup...')
      try {
        await db.delete()
        await db.open()
        console.log('ApiClient: Cache flushed successfully')
      } catch (error) {
        console.error('ApiClient: Failed to flush cache:', error)
      }
    }
    
    // Always load static data on initialization
    if (!this.staticDataLoaded && config.loadStaticData) {
      console.log('ApiClient: Loading static data...')
      try {
        await loadStaticData()
        this.staticDataLoaded = true
        console.log('ApiClient: Static data loaded successfully')
        
        // Verify data was cached
        const cachedCount = await db.entities.count()
        console.log(`ApiClient: ${cachedCount} entities in cache after loading static data`)
        
        // List all entities in cache for debugging
        const allEntities = await db.entities.toArray()
        console.log('ApiClient: Entities in cache:', allEntities.map(e => ({ id: e.id, slug: e.slug, parentId: e.parentId })))
      } catch (error) {
        console.error('ApiClient: Failed to load static data:', error)
      }
    }
    
    console.log('ApiClient: Initialization complete')
  }
  
  private async checkServerAvailability(): Promise<boolean> {
    const config = get(apiConfig)
    
    // If we already know the server status, return it
    if (this.serverAvailable !== null) {
      return this.serverAvailable
    }
    
    try {
      const response = await fetch(`${config.baseUrl}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000)
      })
      
      this.serverAvailable = response.ok
      console.log('ApiClient: Server availability check:', this.serverAvailable)
      return this.serverAvailable
    } catch (error) {
      this.serverAvailable = false
      console.log('ApiClient: Server is unavailable')
      return false
    }
  }
  
  private async fetchFromServer(path: string, options: RequestInit = {}): Promise<any> {
    const config = get(apiConfig)
    const fullUrl = `${config.baseUrl}${path}`
    
    try {
      const response = await fetch(fullUrl, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      })
      
      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}`
        try {
          const errorData = await response.json()
          errorMessage = errorData.error || errorMessage
        } catch (e) {
          errorMessage = response.statusText || errorMessage
        }
        const err = new Error(errorMessage)
        ;(err as any).status = response.status
        throw err
      }
      
      const data = await response.json()
      
      if (data === null || data === undefined) {
        const err = new Error('Entity not found')
        ;(err as any).status = 404
        throw err
      }
      
      return data
    } catch (error: any) {
      console.log('ApiClient: Server request failed:', error.message)
      throw error
    }
  }
  
  async request(path: string, options: RequestInit = {}) {
    // Ensure initialization is complete
    await this.init()
    
    const config = get(apiConfig)
    const method = options.method || 'GET'
    
    console.log(`ApiClient: Request ${method} ${path}`)
    
    // For GET requests, use read-through cache pattern
    if (method === 'GET') {
      return this.getWithCache(path)
    }
    
    // For mutations, try server first (if available), then fail
    if (config.serverless) {
      throw new Error('Mutations not supported in serverless mode')
    }
    
    const serverAvailable = await this.checkServerAvailability()
    if (!serverAvailable) {
      throw new Error('Server unavailable - mutations not supported in offline mode')
    }
    
    try {
      const data = await this.fetchFromServer(path, options)
      
      // Cache the response if it's an entity or array of entities
      if (data && typeof data === 'object') {
        if (Array.isArray(data)) {
          await cacheEntities(data)
        } else if (data.id) {
          await cacheEntity(data)
        }
      }
      
      return data
    } catch (error) {
      console.error('ApiClient: Mutation failed:', error)
      throw error
    }
  }
  
  private async getWithCache(path: string): Promise<any> {
    const config = get(apiConfig)
    
    // Step 1: Check cache first
    const cached = await this.getFromCache(path)
    
    // Step 2: If found in cache and not stale, return it
    if (cached !== null) {
      const isStale = Array.isArray(cached) 
        ? false // Arrays don't have _cachedAt
        : await isCacheStale(cached, config.cacheDuration)
      
      if (!isStale) {
        console.log(`ApiClient: Cache hit (fresh) for ${path}`)
        return cached
      }
      
      console.log(`ApiClient: Cache hit (stale) for ${path}`)
    } else {
      console.log(`ApiClient: Cache miss for ${path}`)
    }
    
    // Step 3: Try to fetch from server if not in serverless mode
    if (!config.serverless) {
      const serverAvailable = await this.checkServerAvailability()
      
      if (serverAvailable) {
        try {
          console.log(`ApiClient: Fetching from server: ${path}`)
          const data = await this.fetchFromServer(path)
          
          // Cache the fresh data
          if (data && typeof data === 'object') {
            if (Array.isArray(data)) {
              await cacheEntities(data)
            } else if (data.id) {
              await cacheEntity(data)
            }
          }
          
          console.log(`ApiClient: Server fetch successful, cached result`)
          return data
        } catch (error: any) {
          console.log(`ApiClient: Server fetch failed: ${error.message}`)
          // Fall through to return cached data (even if stale) or throw
        }
      }
    }
    
    // Step 4: If we have cached data (even if stale), return it
    if (cached !== null) {
      console.log(`ApiClient: Returning stale cached data for ${path}`)
      return cached
    }
    
    // Step 5: No cached data and server unavailable - throw 404
    const err = new Error(`Entity not found: ${path}`)
    ;(err as any).status = 404
    throw err
  }
  
  private async getFromCache(path: string): Promise<any> {
    // Parse the path to determine what to fetch from cache
    
    // Root entity by slug
    if (path === '/entities/slug') {
      return await getCachedEntityBySlug('/')
    }
    
    // Entity by slug
    if (path.startsWith('/entities/slug/')) {
      const slug = '/' + path.substring('/entities/slug/'.length)
      return await getCachedEntityBySlug(slug)
    }
    
    // Entity by ID
    if (path.match(/^\/entities\/[^\/\?]+$/)) {
      const id = path.substring('/entities/'.length)
      return await getCachedEntity(id)
    }
    
    // Query entities
    if (path.startsWith('/entities?')) {
      const params = new URLSearchParams(path.split('?')[1])
      const filters: any = {}
      
      if (params.get('type')) filters.type = params.get('type')
      if (params.get('parentId')) filters.parentId = params.get('parentId')
      filters.limit = parseInt(params.get('limit') || '20')
      filters.offset = parseInt(params.get('offset') || '0')
      
      console.log('ApiClient: Querying cache with filters:', filters)
      return await queryCachedEntities(filters)
    }
    
    return null
  }
}

export const apiClient = new ApiClient()
