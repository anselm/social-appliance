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
  private serverlessData: Entity[] | null = null
  private staticDataLoaded = false
  
  constructor() {
    this.init()
  }
  
  private async init() {
    // Always load static data on initialization, regardless of serverless mode
    if (!this.staticDataLoaded) {
      console.log('ApiClient: Loading static data...')
      try {
        await loadStaticData()
        this.staticDataLoaded = true
        console.log('ApiClient: Static data loaded successfully')
      } catch (error) {
        console.error('ApiClient: Failed to load static data:', error)
      }
    }
  }
  
  private async loadServerlessData(): Promise<Entity[]> {
    // In the new approach, serverless mode relies entirely on static.info.js
    // and any cached data. No separate entities.json file is needed.
    console.log('ApiClient: Serverless mode - using cached/static data only')
    return []
  }
  
  async request(path: string, options: RequestInit = {}) {
    const config = get(apiConfig)
    
    if (config.serverless) {
      // Handle serverless mode
      return this.handleServerlessRequest(path, options)
    }
    
    // Check cache first if enabled
    if (config.enableCache && options.method === 'GET') {
      const cached = await this.checkCache(path, config.cacheDuration)
      if (cached) {
        console.log(`Cache hit for ${path}`)
        return cached
      }
    }
    
    // Normal API mode
    const fullUrl = `${config.baseUrl}${path}`
    
    const response = await fetch(fullUrl, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }))
      const err = new Error(error.error || `HTTP ${response.status}`)
      ;(err as any).status = response.status
      throw err
    }
    
    const data = await response.json()
    
    if (data === null || data === undefined) {
      const err = new Error('Entity not found')
      ;(err as any).status = 404
      throw err
    }
    
    // Cache the response if it's an entity or array of entities
    if (config.enableCache && options.method === 'GET') {
      await this.cacheResponse(path, data)
    }
    
    return data
  }
  
  private async checkCache(path: string, maxAge: number): Promise<any> {
    // Check for single entity by slug
    if (path === '/entities/slug') {
      const cached = await getCachedEntityBySlug('/')
      if (cached && !await isCacheStale(cached, maxAge)) {
        return cached
      }
    } else if (path.startsWith('/entities/slug/')) {
      const slug = '/' + path.substring('/entities/slug/'.length)
      const cached = await getCachedEntityBySlug(slug)
      if (cached && !await isCacheStale(cached, maxAge)) {
        return cached
      }
    } else if (path.match(/^\/entities\/[^\/\?]+$/)) {
      const id = path.substring('/entities/'.length)
      const cached = await getCachedEntity(id)
      if (cached && !await isCacheStale(cached, maxAge)) {
        return cached
      }
    } else if (path.startsWith('/entities?')) {
      // For queries, we'll skip cache for now as it's more complex
      return null
    }
    
    return null
  }
  
  private async cacheResponse(path: string, data: any): Promise<void> {
    if (Array.isArray(data)) {
      await cacheEntities(data)
    } else if (data && data.id) {
      await cacheEntity(data)
    }
  }
  
  private async handleServerlessRequest(path: string, options: RequestInit = {}) {
    const method = options.method || 'GET'
    
    console.log('ApiClient: Handling serverless request:', path)
    
    // First check Dexie cache (which includes static data)
    const config = get(apiConfig)
    
    if (method === 'GET') {
      // Try cache first
      if (path === '/entities/slug') {
        console.log('ApiClient: Looking for root entity in cache')
        const cached = await getCachedEntityBySlug('/')
        if (cached) {
          console.log('ApiClient: Found root entity in cache:', cached)
          return cached
        }
        console.log('ApiClient: Root entity not found in cache')
      } else if (path.startsWith('/entities/slug/')) {
        const slug = '/' + path.substring('/entities/slug/'.length)
        const cached = await getCachedEntityBySlug(slug)
        if (cached) return cached
      } else if (path.match(/^\/entities\/[^\/\?]+$/)) {
        const id = path.substring('/entities/'.length)
        const cached = await getCachedEntity(id)
        if (cached) return cached
      } else if (path.startsWith('/entities?')) {
        // For queries, check cache
        const params = new URLSearchParams(path.split('?')[1])
        const filters: any = {}
        
        if (params.get('type')) filters.type = params.get('type')
        if (params.get('parentId')) filters.parentId = params.get('parentId')
        filters.limit = parseInt(params.get('limit') || '20')
        filters.offset = parseInt(params.get('offset') || '0')
        
        const cached = await queryCachedEntities(filters)
        if (cached.length > 0) return cached
      }
    }
    
    // If not in cache, load from serverless data file
    const entities = await this.loadServerlessData()
    
    // Parse the path to determine the operation
    if (method === 'GET') {
      // Handle different GET endpoints
      if (path === '/entities/slug') {
        // Root entity
        return entities.find(e => e.slug === '/') || null
      } else if (path.startsWith('/entities/slug/')) {
        // Entity by slug
        const slug = '/' + path.substring('/entities/slug/'.length)
        return entities.find(e => e.slug === slug) || null
      } else if (path.startsWith('/entities?')) {
        // Query entities
        const params = new URLSearchParams(path.split('?')[1])
        return this.queryServerlessEntities(entities, params)
      } else if (path.match(/^\/entities\/[^\/]+$/)) {
        // Entity by ID
        const id = path.substring('/entities/'.length)
        return entities.find(e => e.id === id) || null
      }
    }
    
    // In serverless mode, mutations are not supported
    if (['POST', 'PUT', 'DELETE'].includes(method)) {
      throw new Error('Mutations not supported in serverless mode')
    }
    
    throw new Error(`Unsupported serverless operation: ${method} ${path}`)
  }
  
  private queryServerlessEntities(entities: Entity[], params: URLSearchParams): Entity[] {
    let results = [...entities]
    
    // Apply filters
    const type = params.get('type')
    if (type) {
      results = results.filter(e => e.type === type)
    }
    
    const parentId = params.get('parentId')
    if (parentId !== null) {
      results = results.filter(e => e.parentId === parentId)
    }
    
    const slugPrefix = params.get('slugPrefix')
    if (slugPrefix) {
      results = results.filter(e => e.slug?.startsWith(slugPrefix))
    }
    
    // Apply pagination
    const limit = parseInt(params.get('limit') || '20')
    const offset = parseInt(params.get('offset') || '0')
    
    return results.slice(offset, offset + limit)
  }
}

export const apiClient = new ApiClient()
