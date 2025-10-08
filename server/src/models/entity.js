import { v4 as uuidv4 } from 'uuid';
import { EntityTypes } from '../config/constants.js';

export class Entity {
  constructor(data = {}) {
    this.id = data.id || uuidv4();
    this.slug = data.slug || null;
    this.type = data.type || EntityTypes.POST;
    this.auth = data.auth || null;
    this.permissions = data.permissions || [];
    this.address = data.address || null;
    this.contract = data.contract || null;
    this.sponsorId = data.sponsorId || null;
    this.parentId = data.parentId || null;
    this.title = data.title || null;
    this.content = data.content || null;
    this.depiction = data.depiction || null;
    this.tags = data.tags || [];
    this.view = data.view || null;
    this.latitude = data.latitude || undefined;
    this.longitude = data.longitude || undefined;
    this.radius = data.radius || undefined;
    this.begins = data.begins || undefined;
    this.ends = data.ends || undefined;
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
    this.metadata = data.metadata || {};
  }

  toJSON() {
    const obj = {};
    Object.keys(this).forEach(key => {
      if (this[key] !== undefined && this[key] !== null) {
        obj[key] = this[key];
      }
    });
    return obj;
  }
}
