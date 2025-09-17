// Use native fetch if available, otherwise use node-fetch
import fetch from 'node-fetch';

export class APIClient {
  constructor(baseURL = 'http://localhost:3000/api') {
    this.baseURL = baseURL;
    this.currentUser = null;
  }

  async request(path, options = {}, retries = 3) {
    const url = `${this.baseURL}${path}`;
    let lastError;
    
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await fetch(url, {
          ...options,
          headers: {
            'Content-Type': 'application/json',
            ...options.headers
          },
          // Add timeout to prevent hanging
          signal: AbortSignal.timeout(30000) // 30 second timeout
        });

        if (!response.ok) {
          if (response.status === 404) {
            return null;
          }
          const error = await response.json().catch(() => ({ error: 'Request failed' }));
          throw new Error(error.error || `HTTP ${response.status}`);
        }

        return response.json();
      } catch (error) {
        lastError = error;
        
        // Check if it's a connection error that we should retry
        const isRetryableError = 
          error.code === 'ECONNRESET' || 
          error.code === 'ECONNREFUSED' ||
          error.code === 'ETIMEDOUT' ||
          error.message?.includes('socket hang up') ||
          error.message?.includes('fetch failed') ||
          error.name === 'AbortError';
        
        if (isRetryableError && attempt < retries) {
          // Exponential backoff: 1s, 2s, 4s
          const delay = Math.pow(2, attempt) * 1000;
          console.log(`Connection error, retrying in ${delay/1000}s... (attempt ${attempt + 1}/${retries})`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        
        // If not retryable or out of retries, throw the error
        throw error;
      }
    }
    
    throw lastError;
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
