import { apiClient } from './apiClient'
import loggers from './logger'

const log = loggers.api

export const api = {
  async request(path: string, options: RequestInit = {}) {
    return apiClient.request(path, options)
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
      log.error(`Failed to get entity by slug "${slug}":`, error)
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
