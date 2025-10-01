import { get } from 'svelte/store'
import { apiConfig } from '../stores/config'
import type { Entity } from '../types'

// IndexedDB setup for caching
const DB_NAME = 'socialApplianceCache'
const DB_VERSION = 1
const STORE_NAME = 'entities'

class ApiClient {
  private db: IDBDatabase | null = null
  private serverlessData: Entity[] | null = null
  
  constructor() {
    this.initDB()
  }
  
  private async initDB() {
    const config = get(apiConfig)
    if (!config.enableCache) return
    
    return new Promise<void>((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION)
      
      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' })
          store.createIndex('slug', 'slug', { unique: true })
          store.createIndex('type', 'type', { unique: false })
          store.createIndex('parentId', 'parentId', { unique: false })
        }
      }
    })
  }
  
  private async loadServerlessData(): Promise<Entity[]> {
    if (this.serverlessData) return this.serverlessData
    
    const config = get(apiConfig)
    const response = await fetch(config.serverlessDataUrl)
    if (!response.ok) {
      throw new Error('Failed to load serverless data')
    }
    
    this.serverlessData = await response.json()
    
    // Cache in IndexedDB if enabled
    if (this.db) {
      const transaction = this.db.transaction([STORE_NAME], 'readwrite')
      const store = transaction.objectStore(STORE_NAME)
      
      // Clear existing data
      await new Promise((resolve, reject) => {
        const clearReq = store.clear()
        clearReq.onsuccess = () => resolve(undefined)
        clearReq.onerror = () => reject(clearReq.error)
      })
      
      // Add all entities
      for (const entity of this.serverlessData) {
        store.add(entity)
      }
    }
    
    return this.serverlessData
  }
  
  async request(path: string, options: RequestInit = {}) {
    const config = get(apiConfig)
    
    if (config.serverless) {
      // Handle serverless mode
      return this.handleServerlessRequest(path, options)
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
    
    return data
  }
  
  private async handleServerlessRequest(path: string, options: RequestInit = {}) {
    const method = options.method || 'GET'
    
    // Load data if not already loaded
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
