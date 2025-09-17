import { getDB } from '../db/connection.js';
import { Relationship } from '../models/relationship.js';

export class RelationshipService {
  async create(relationshipData) {
    const db = await getDB();
    const relationship = new Relationship(relationshipData);
    await db.collection('relationships').insertOne(relationship.toJSON());
    return relationship;
  }

  async findByEntities(fromId, toId, type) {
    const db = await getDB();
    const data = await db.collection('relationships').findOne({
      fromId,
      toId,
      type
    });
    return data ? new Relationship(data) : null;
  }

  async findByFromEntity(fromId, type = null) {
    const db = await getDB();
    const query = { fromId };
    if (type) query.type = type;
    
    const results = await db.collection('relationships').find(query).toArray();
    return results.map(data => new Relationship(data));
  }

  async findByToEntity(toId, type = null) {
    const db = await getDB();
    const query = { toId };
    if (type) query.type = type;
    
    const results = await db.collection('relationships').find(query).toArray();
    return results.map(data => new Relationship(data));
  }

  async delete(id) {
    const db = await getDB();
    const result = await db.collection('relationships').deleteOne({ id });
    return result.deletedCount > 0;
  }

  async deleteByEntities(fromId, toId, type) {
    const db = await getDB();
    const result = await db.collection('relationships').deleteOne({
      fromId,
      toId,
      type
    });
    return result.deletedCount > 0;
  }
}
