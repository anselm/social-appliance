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
      if (response.status === 404) {
        return null
      }
      throw new Error(`HTTP ${response.status}`)
    }

    return response.json()
  },

  async createPost(data: any) {
    return this.request('/posts', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  async getEntityBySlug(slug: string) {
    return this.request(`/entities/slug/${encodeURIComponent(slug)}`)
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
}
