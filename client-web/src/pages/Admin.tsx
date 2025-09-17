import { useState, useEffect } from 'react'
import { api } from '../services/api'
import { useAuth } from '../contexts/AuthContext'

interface Entity {
  id: string
  slug?: string
  type: string
  title?: string
  content?: string
  createdAt: string
  updatedAt: string
  sponsorId?: string
  parentId?: string
}

interface Stats {
  totalEntities: number
  byType: Record<string, number>
}

interface EntityWithChildren extends Entity {
  children?: EntityWithChildren[]
  expanded?: boolean
}

export default function Admin() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<'entities' | 'create' | 'stats'>('entities')
  const [entities, setEntities] = useState<Entity[]>([])
  const [treeEntities, setTreeEntities] = useState<EntityWithChildren[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [stats, setStats] = useState<Stats | null>(null)
  const [editingEntity, setEditingEntity] = useState<Entity | null>(null)
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set())
  
  // Create entity form
  const [newEntity, setNewEntity] = useState({
    type: 'post',
    slug: '',
    title: '',
    content: '',
    parentId: '',
    sponsorId: ''
  })

  useEffect(() => {
    if (activeTab === 'entities') {
      loadEntities()
    } else if (activeTab === 'stats') {
      loadStats()
    }
  }, [activeTab, typeFilter])

  const loadEntities = async () => {
    setLoading(true)
    try {
      const filters: any = { limit: 1000 }
      if (typeFilter) filters.type = typeFilter
      if (searchQuery) filters.slugPrefix = searchQuery
      
      const data = await api.queryEntities(filters)
      setEntities(data)
      
      // Build tree structure
      const tree = buildTree(data)
      setTreeEntities(tree)
    } catch (error) {
      console.error('Failed to load entities:', error)
    } finally {
      setLoading(false)
    }
  }

  const buildTree = (entities: Entity[]): EntityWithChildren[] => {
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

  const toggleExpanded = (entityId: string) => {
    const newExpanded = new Set(expandedNodes)
    if (newExpanded.has(entityId)) {
      newExpanded.delete(entityId)
    } else {
      newExpanded.add(entityId)
    }
    setExpandedNodes(newExpanded)
  }

  const loadStats = async () => {
    setLoading(true)
    try {
      // Load all entities to calculate stats
      const allEntities = await api.queryEntities({ limit: 1000 })
      
      const byType: Record<string, number> = {}
      allEntities.forEach((entity: Entity) => {
        byType[entity.type] = (byType[entity.type] || 0) + 1
      })
      
      setStats({
        totalEntities: allEntities.length,
        byType
      })
    } catch (error) {
      console.error('Failed to load stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateEntity = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const data: any = {
        title: newEntity.title,
        content: newEntity.content,
        auth: user?.id
      }
      
      if (newEntity.slug) data.slug = newEntity.slug
      if (newEntity.parentId) data.parentId = newEntity.parentId
      if (newEntity.sponsorId) data.sponsorId = newEntity.sponsorId
      
      if (newEntity.type === 'group') {
        await api.createGroup(data)
      } else if (newEntity.type === 'party') {
        await api.createUser(data)
      } else {
        await api.createPost(data)
      }
      
      // Reset form
      setNewEntity({
        type: 'post',
        slug: '',
        title: '',
        content: '',
        parentId: '',
        sponsorId: ''
      })
      
      // Switch to entities tab to see the new entity
      setActiveTab('entities')
    } catch (error) {
      console.error('Failed to create entity:', error)
      alert('Failed to create entity: ' + (error as Error).message)
    }
  }

  const handleDeleteEntity = async (id: string) => {
    if (!confirm('Are you sure you want to delete this entity?')) return
    
    try {
      await api.deleteEntity(id)
      loadEntities()
    } catch (error) {
      console.error('Failed to delete entity:', error)
      alert('Failed to delete entity')
    }
  }

  const handleEditEntity = (entity: Entity) => {
    setEditingEntity({ ...entity })
  }

  const handleSaveEdit = async () => {
    if (!editingEntity) return
    
    try {
      await api.updateEntity(editingEntity.id, {
        title: editingEntity.title,
        content: editingEntity.content,
        slug: editingEntity.slug
      })
      setEditingEntity(null)
      loadEntities()
    } catch (error) {
      console.error('Failed to update entity:', error)
      alert('Failed to update entity')
    }
  }

  const renderEntityTree = (entities: EntityWithChildren[], level = 0) => {
    return entities.map(entity => {
      const hasChildren = entity.children && entity.children.length > 0
      const isExpanded = expandedNodes.has(entity.id)
      
      return (
        <div key={entity.id}>
          <div 
            className="border border-white/20 p-3 text-xs hover:bg-white/5"
            style={{ marginLeft: `${level * 20}px` }}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  {hasChildren && (
                    <button
                      onClick={() => toggleExpanded(entity.id)}
                      className="text-white/60 hover:text-white"
                    >
                      {isExpanded ? '▼' : '▶'}
                    </button>
                  )}
                  <div className="flex items-baseline gap-2">
                    <span className="text-white/60">[{entity.type}]</span>
                    <span className="font-mono">{entity.slug || entity.id}</span>
                  </div>
                </div>
                {entity.title && (
                  <div className="text-white/80 mt-1">Title: {entity.title}</div>
                )}
                {entity.parentId && (
                  <div className="text-white/60 text-xs">Parent: {entity.parentId}</div>
                )}
                <div className="text-white/60 text-xs mt-1">
                  ID: {entity.id}
                </div>
                <div className="text-white/60 text-xs">
                  Created: {new Date(entity.createdAt).toLocaleString()}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEditEntity(entity)}
                  className="text-blue-500 hover:text-blue-400"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteEntity(entity.id)}
                  className="text-red-500 hover:text-red-400"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
          {hasChildren && isExpanded && (
            <div>{renderEntityTree(entity.children!, level + 1)}</div>
          )}
        </div>
      )
    })
  }

  return (
    <div>
      <h1 className="text-xs uppercase tracking-wider mb-6">Admin Panel</h1>
      
      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-white/20">
        <button
          onClick={() => setActiveTab('entities')}
          className={`pb-2 text-xs uppercase tracking-wider ${
            activeTab === 'entities' ? 'border-b border-white' : 'text-white/60 hover:text-white'
          }`}
        >
          Entities
        </button>
        <button
          onClick={() => setActiveTab('create')}
          className={`pb-2 text-xs uppercase tracking-wider ${
            activeTab === 'create' ? 'border-b border-white' : 'text-white/60 hover:text-white'
          }`}
        >
          Create
        </button>
        <button
          onClick={() => setActiveTab('stats')}
          className={`pb-2 text-xs uppercase tracking-wider ${
            activeTab === 'stats' ? 'border-b border-white' : 'text-white/60 hover:text-white'
          }`}
        >
          Stats
        </button>
      </div>

      {/* Entities Tab */}
      {activeTab === 'entities' && (
        <div>
          {/* Filters */}
          <div className="flex gap-4 mb-4">
            <input
              type="text"
              placeholder="Search by slug..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && loadEntities()}
              className="bg-black border border-white/20 px-2 py-1 text-xs"
            />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-black border border-white/20 px-2 py-1 text-xs"
            >
              <option value="">All Types</option>
              <option value="post">Post</option>
              <option value="group">Group</option>
              <option value="party">Party</option>
              <option value="place">Place</option>
              <option value="thing">Thing</option>
              <option value="agent">Agent</option>
            </select>
            <button
              onClick={loadEntities}
              className="border border-white/20 px-3 py-1 text-xs uppercase tracking-wider hover:bg-white hover:text-black"
            >
              Search
            </button>
          </div>

          {/* Entity List */}
          {loading ? (
            <div className="text-xs text-white/60">Loading...</div>
          ) : (
            <div className="space-y-1">
              {searchQuery || typeFilter ? (
                // Show flat list when filtering
                entities.map((entity) => (
                  <div key={entity.id} className="border border-white/20 p-3 text-xs">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-baseline gap-2 mb-1">
                          <span className="text-white/60">[{entity.type}]</span>
                          <span className="font-mono">{entity.slug || entity.id}</span>
                        </div>
                        {entity.title && (
                          <div className="text-white/80">Title: {entity.title}</div>
                        )}
                        {entity.parentId && (
                          <div className="text-white/60 text-xs">Parent: {entity.parentId}</div>
                        )}
                        <div className="text-white/60 text-xs mt-1">
                          ID: {entity.id}
                        </div>
                        <div className="text-white/60 text-xs">
                          Created: {new Date(entity.createdAt).toLocaleString()}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditEntity(entity)}
                          className="text-blue-500 hover:text-blue-400"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteEntity(entity.id)}
                          className="text-red-500 hover:text-red-400"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                // Show tree view when not filtering
                renderEntityTree(treeEntities)
              )}
            </div>
          )}

          {/* Edit Modal */}
          {editingEntity && (
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4">
              <div className="bg-black border border-white/20 p-6 max-w-md w-full">
                <h3 className="text-xs uppercase tracking-wider mb-4">Edit Entity</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs text-white/60 mb-1">Slug</label>
                    <input
                      type="text"
                      value={editingEntity.slug || ''}
                      onChange={(e) => setEditingEntity({ ...editingEntity, slug: e.target.value })}
                      className="w-full bg-black border border-white/20 px-2 py-1 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-white/60 mb-1">Title</label>
                    <input
                      type="text"
                      value={editingEntity.title || ''}
                      onChange={(e) => setEditingEntity({ ...editingEntity, title: e.target.value })}
                      className="w-full bg-black border border-white/20 px-2 py-1 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-white/60 mb-1">Content</label>
                    <textarea
                      value={editingEntity.content || ''}
                      onChange={(e) => setEditingEntity({ ...editingEntity, content: e.target.value })}
                      className="w-full bg-black border border-white/20 px-2 py-1 text-sm"
                      rows={4}
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveEdit}
                      className="border border-white/20 px-3 py-1 text-xs uppercase tracking-wider hover:bg-white hover:text-black"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingEntity(null)}
                      className="text-xs uppercase tracking-wider text-white/60 hover:text-white"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Create Tab */}
      {activeTab === 'create' && (
        <form onSubmit={handleCreateEntity} className="max-w-md space-y-4">
          <div>
            <label className="block text-xs text-white/60 mb-1">Type</label>
            <select
              value={newEntity.type}
              onChange={(e) => setNewEntity({ ...newEntity, type: e.target.value })}
              className="w-full bg-black border border-white/20 px-2 py-1 text-sm"
            >
              <option value="post">Post</option>
              <option value="group">Group</option>
              <option value="party">Party (User)</option>
              <option value="place">Place</option>
              <option value="thing">Thing</option>
              <option value="agent">Agent</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-white/60 mb-1">Slug (optional)</label>
            <input
              type="text"
              value={newEntity.slug}
              onChange={(e) => setNewEntity({ ...newEntity, slug: e.target.value })}
              className="w-full bg-black border border-white/20 px-2 py-1 text-sm"
              placeholder="unique-identifier"
            />
          </div>

          <div>
            <label className="block text-xs text-white/60 mb-1">Title</label>
            <input
              type="text"
              value={newEntity.title}
              onChange={(e) => setNewEntity({ ...newEntity, title: e.target.value })}
              className="w-full bg-black border border-white/20 px-2 py-1 text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-xs text-white/60 mb-1">Content</label>
            <textarea
              value={newEntity.content}
              onChange={(e) => setNewEntity({ ...newEntity, content: e.target.value })}
              className="w-full bg-black border border-white/20 px-2 py-1 text-sm"
              rows={4}
            />
          </div>

          <div>
            <label className="block text-xs text-white/60 mb-1">Parent ID (optional)</label>
            <input
              type="text"
              value={newEntity.parentId}
              onChange={(e) => setNewEntity({ ...newEntity, parentId: e.target.value })}
              className="w-full bg-black border border-white/20 px-2 py-1 text-sm"
              placeholder="parent-entity-id"
            />
          </div>

          <div>
            <label className="block text-xs text-white/60 mb-1">Sponsor ID (optional)</label>
            <input
              type="text"
              value={newEntity.sponsorId}
              onChange={(e) => setNewEntity({ ...newEntity, sponsorId: e.target.value })}
              className="w-full bg-black border border-white/20 px-2 py-1 text-sm"
              placeholder="sponsor-entity-id"
            />
          </div>

          <button
            type="submit"
            className="border border-white/20 px-4 py-1 text-xs uppercase tracking-wider hover:bg-white hover:text-black"
          >
            Create Entity
          </button>
        </form>
      )}

      {/* Stats Tab */}
      {activeTab === 'stats' && (
        <div>
          {loading ? (
            <div className="text-xs text-white/60">Loading...</div>
          ) : stats ? (
            <div className="space-y-4">
              <div className="border border-white/20 p-4">
                <h3 className="text-xs uppercase tracking-wider mb-2">Total Entities</h3>
                <div className="text-2xl">{stats.totalEntities}</div>
              </div>
              
              <div className="border border-white/20 p-4">
                <h3 className="text-xs uppercase tracking-wider mb-2">By Type</h3>
                <div className="space-y-1">
                  {Object.entries(stats.byType).map(([type, count]) => (
                    <div key={type} className="flex justify-between text-sm">
                      <span className="text-white/60">{type}</span>
                      <span>{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
}
