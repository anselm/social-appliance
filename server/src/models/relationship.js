import { v4 as uuidv4 } from 'uuid';

export class Relationship {
  constructor(data = {}) {
    this.id = data.id || uuidv4();
    this.fromId = data.fromId;
    this.toId = data.toId;
    this.type = data.type;
    this.metadata = data.metadata || {};
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }

  toJSON() {
    return {
      id: this.id,
      fromId: this.fromId,
      toId: this.toId,
      type: this.type,
      metadata: this.metadata,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}
