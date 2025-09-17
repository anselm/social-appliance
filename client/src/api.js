// Use native fetch if available, otherwise use node-fetch
import fetch from 'node-fetch';

export class APIClient {
  constructor(baseURL = 'http://localhost:3000/api') {
    this.baseURL = baseURL;
    this.currentUser = null;
  }

  async request(path, options = {}) {
    const url = `${this.baseURL}${path}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  async createUser(data) {
    return this.request('/users', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async createGroup(data) {
    return this.request('/groups', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async createPost(data) {
    return this.request('/posts', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async getEntityBySlug(slug) {
    return this.request(`/entities/slug/${encodeURIComponent(slug)}`);
  }

  async queryEntities(filters) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        params.append(key, value);
      }
    });
    return this.request(`/entities?${params}`);
  }

  async updateEntity(id, data) {
    return this.request(`/entities/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async deleteEntity(id) {
    return this.request(`/entities/${id}`, {
      method: 'DELETE'
    });
  }
}
