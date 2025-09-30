import type { Entity, EntityWithChildren } from '../types'

export function buildTree(entities: Entity[]): EntityWithChildren[] {
  const entityMap = new Map<string, EntityWithChildren>()
  const roots: EntityWithChildren[] = []
  
  // First pass: create all entities
  entities.forEach(entity => {
    entityMap.set(entity.id, { ...entity, children: [] })
  })
  
  // Second pass: build tree structure
  entities.forEach(entity => {
    const node = entityMap.get(entity.id)!
    if (entity.parentId && entityMap.has(entity.parentId)) {
      const parent = entityMap.get(entity.parentId)!
      parent.children!.push(node)
    } else {
      roots.push(node)
    }
  })
  
  return roots
}
