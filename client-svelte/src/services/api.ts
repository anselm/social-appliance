const API_BASE = '/api'

export const api = {
  async request(path: string, options: RequestInit = {}) {
    const fullUrl = `${API_BASE}${path}`
    
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
    
    // Extra safety check - if we got a null/undefined response for an entity lookup, treat as 404
    if (data === null || data === undefined) {
      const err = new Error('Entity not found')
      ;(err as any).status = 404
      throw err
    }
    
    return data
  },

  async createPost(data: any) {
    return this.request('/posts', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  async createGroup(data: any) {
    return this.request('/groups', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  async createUser(data: any) {
    return this.request('/users', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  async getEntityBySlug(slug: string) {
    try {
      // Special handling for root slug
      if (slug === '/') {
        const response = await this.request('/entities/slug')
        return response
      }
      
      // Don't encode the entire slug - split by / and encode each segment
      const segments = slug.split('/').filter(s => s)
      const encodedSlug = segments.map(s => encodeURIComponent(s)).join('/')
      const fullPath = `/entities/slug/${encodedSlug}`
      const response = await this.request(fullPath)
      return response
    } catch (error: any) {
      console.error(`Failed to get entity by slug "${slug}":`, error)
      throw error
    }
  },

  async queryEntities(filters: Record<string, any>) {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        params.append(key, value)
      }
    })
    return this.request(`/entities?${params}`)
  },

  async updateEntity(id: string, data: any) {
    return this.request(`/entities/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  async deleteEntity(id: string) {
    return this.request(`/entities/${id}`, {
      method: 'DELETE',
    })
  },
}
