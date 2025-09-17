import axios from 'axios';

export class APIClient {
  constructor(baseURL = 'http://localhost:3000/api') {
    this.client = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    this.currentUser = null;
  }

  async createUser(data) {
    const response = await this.client.post('/users', data);
    return response.data;
  }

  async createGroup(data) {
    const response = await this.client.post('/groups', data);
    return response.data;
  }

  async createPost(data) {
    const response = await this.client.post('/posts', data);
    return response.data;
  }

  async getEntityBySlug(slug) {
    try {
      const response = await this.client.get(`/entities/slug/${encodeURIComponent(slug)}`);
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  async queryEntities(filters) {
    const response = await this.client.get('/entities', { params: filters });
    return response.data;
  }

  async updateEntity(id, data) {
    const response = await this.client.put(`/entities/${id}`, data);
    return response.data;
  }

  async deleteEntity(id) {
    const response = await this.client.delete(`/entities/${id}`);
    return response.data;
  }
}
