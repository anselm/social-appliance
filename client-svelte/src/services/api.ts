const API_BASE = '/api'

export const api = {
  async request(path: string, options: RequestInit = {}) {
    const response = await fetch(`${API_BASE}${path}`, {
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

    return response.json()
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
    const response = await this.request(`/entities/slug/${encodeURIComponent(slug)}`)
    console.log(`API response for slug "${slug}":`, response)
    return response
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
