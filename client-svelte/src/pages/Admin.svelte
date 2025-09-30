<script lang="ts">
  import { onMount, getContext } from 'svelte'
  import { api } from '../services/api'
  import type { Entity, Stats, EntityWithChildren, AuthContext } from '../types'

  const { user } = getContext<AuthContext>('auth')

  let activeTab: 'entities' | 'create' | 'stats' = 'entities'
  let entities: Entity[] = []
  let treeEntities: EntityWithChildren[] = []
  let loading = false
  let searchQuery = ''
  let typeFilter = ''
  let stats: Stats | null = null
  let editingEntity: Entity | null = null
  let expandedNodes = new Set<string>()
  
  // Create entity form
  let newEntity = {
    type: 'post',
    slug: '',
    title: '',
    content: '',
    parentId: '',
    sponsorId: ''
  }

  $: if (activeTab === 'entities') {
    loadEntities()
  } else if (activeTab === 'stats') {
    loadStats()
  }

  async function loadEntities() {
    loading = true
    try {
      const filters: any = { limit: 1000 }
      if (typeFilter) filters.type = typeFilter
      if (searchQuery) filters.slugPrefix = searchQuery
      
      const data = await api.queryEntities(filters)
      entities = data
      
      // Build tree structure
      const tree = buildTree(data)
      treeEntities = tree
    } catch (error) {
      console.error('Failed to load entities:', error)
    } finally {
      loading = false
    }
  }

  function buildTree(entities: Entity[]): EntityWithChildren[] {
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

  function toggleExpanded(entityId: string) {
    if (expandedNodes.has(entityId)) {
      expandedNodes.delete(entityId)
    } else {
      expandedNodes.add(entityId)
    }
    expandedNodes = expandedNodes // Trigger reactivity
  }

  async function loadStats() {
    loading = true
    try {
      // Load all entities to calculate stats
      const allEntities = await api.queryEntities({ limit: 1000 })
      
      const byType: Record<string, number> = {}
      allEntities.forEach((entity: Entity) => {
        byType[entity.type] = (byType[entity.type] || 0) + 1
      })
      
      stats = {
        totalEntities: allEntities.length,
        byType
      }
    } catch (error) {
      console.error('Failed to load stats:', error)
    } finally {
      loading = false
    }
  }

  async function handleCreateEntity(e: Event) {
    e.preventDefault()
    try {
      const data: any = {
        title: newEntity.title,
        content: newEntity.content,
        auth: $user?.id
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
      newEntity = {
        type: 'post',
        slug: '',
        title: '',
        content: '',
        parentId: '',
        sponsorId: ''
      }
      
      // Switch to entities tab to see the new entity
      activeTab = 'entities'
    } catch (error) {
      console.error('Failed to create entity:', error)
      alert('Failed to create entity: ' + (error as Error).message)
    }
  }

  async function handleDeleteEntity(id: string) {
    if (!confirm('Are you sure you want to delete this entity?')) return
    
    try {
      await api.deleteEntity(id)
      await loadEntities()
    } catch (error) {
      console.error('Failed to delete entity:', error)
      alert('Failed to delete entity')
    }
  }

  function handleEditEntity(entity: Entity) {
    editingEntity = { ...entity }
  }

  async function handleSaveEdit() {
    if (!editingEntity) return
    
    try {
      await api.updateEntity(editingEntity.id, {
        title: editingEntity.title,
        content: editingEntity.content,
        slug: editingEntity.slug
      })
      editingEntity = null
      await loadEntities()
    } catch (error) {
      console.error('Failed to update entity:', error)
      alert('Failed to update entity')
    }
  }

  function renderEntityTree(entities: EntityWithChildren[], level = 0): any[] {
    return entities.map(entity => ({
      entity,
      level,
      hasChildren: entity.children && entity.children.length > 0,
      isExpanded: expandedNodes.has(entity.id),
      children: expandedNodes.has(entity.id) && entity.children 
        ? renderEntityTree(entity.children, level + 1) 
        : []
    }))
  }

  $: flattenedTree = searchQuery || typeFilter 
    ? [] 
    : treeEntities.flatMap(e => renderEntityTree([e]))
      .flatMap(item => [item, ...item.children.flat()])
</script>

<div>
  <h1 class="text-xs uppercase tracking-wider mb-6">Admin Panel</h1>
  
  <!-- Tabs -->
  <div class="flex gap-4 mb-6 border-b border-white/20">
    <button
      on:click={() => activeTab = 'entities'}
      class="pb-2 text-xs uppercase tracking-wider {activeTab === 'entities' ? 'border-b border-white' : 'text-white/60 hover:text-white'}"
    >
      Entities
    </button>
    <button
      on:click={() => activeTab = 'create'}
      class="pb-2 text-xs uppercase tracking-wider {activeTab === 'create' ? 'border-b border-white' : 'text-white/60 hover:text-white'}"
    >
      Create
    </button>
    <button
      on:click={() => activeTab = 'stats'}
      class="pb-2 text-xs uppercase tracking-wider {activeTab === 'stats' ? 'border-b border-white' : 'text-white/60 hover:text-white'}"
    >
      Stats
    </button>
  </div>

  <!-- Entities Tab -->
  {#if activeTab === 'entities'}
    <div>
      <!-- Filters -->
      <div class="flex gap-4 mb-4">
        <input
          type="text"
          placeholder="Search by slug..."
          bind:value={searchQuery}
          on:keydown={(e) => e.key === 'Enter' && loadEntities()}
          class="bg-black border border-white/20 px-2 py-1 text-xs"
        />
        <select
          bind:value={typeFilter}
          on:change={loadEntities}
          class="bg-black border border-white/20 px-2 py-1 text-xs"
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
          on:click={loadEntities}
          class="border border-white/20 px-3 py-1 text-xs uppercase tracking-wider hover:bg-white hover:text-black"
        >
          Search
        </button>
      </div>

      <!-- Entity List -->
      {#if loading}
        <div class="text-xs text-white/60">Loading...</div>
      {:else}
        <div class="space-y-1">
          {#if searchQuery || typeFilter}
            <!-- Show flat list when filtering -->
            {#each entities as entity}
              <div class="border border-white/20 p-3 text-xs">
                <div class="flex justify-between items-start">
                  <div class="flex-1">
                    <div class="flex items-baseline gap-2 mb-1">
                      <span class="text-white/60">[{entity.type}]</span>
                      <span class="font-mono">{entity.slug || entity.id}</span>
                    </div>
                    {#if entity.title}
                      <div class="text-white/80">Title: {entity.title}</div>
                    {/if}
                    {#if entity.parentId}
                      <div class="text-white/60 text-xs">Parent: {entity.parentId}</div>
                    {/if}
                    <div class="text-white/60 text-xs mt-1">
                      ID: {entity.id}
                    </div>
                    <div class="text-white/60 text-xs">
                      Created: {new Date(entity.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <div class="flex gap-2">
                    <button
                      on:click={() => handleEditEntity(entity)}
                      class="text-blue-500 hover:text-blue-400"
                    >
                      Edit
                    </button>
                    <button
                      on:click={() => handleDeleteEntity(entity.id)}
                      class="text-red-500 hover:text-red-400"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            {/each}
          {:else}
            <!-- Show tree view when not filtering -->
            {#each flattenedTree as item}
              <div 
                class="border border-white/20 p-3 text-xs hover:bg-white/5"
                style="margin-left: {item.level * 20}px"
              >
                <div class="flex justify-between items-start">
                  <div class="flex-1">
                    <div class="flex items-center gap-2">
                      {#if item.hasChildren}
                        <button
                          on:click={() => toggleExpanded(item.entity.id)}
                          class="text-white/60 hover:text-white"
                        >
                          {item.isExpanded ? '▼' : '▶'}
                        </button>
                      {/if}
                      <div class="flex items-baseline gap-2">
                        <span class="text-white/60">[{item.entity.type}]</span>
                        <span class="font-mono">{item.entity.slug || item.entity.id}</span>
                      </div>
                    </div>
                    {#if item.entity.title}
                      <div class="text-white/80 mt-1">Title: {item.entity.title}</div>
                    {/if}
                    {#if item.entity.parentId}
                      <div class="text-white/60 text-xs">Parent: {item.entity.parentId}</div>
                    {/if}
                    <div class="text-white/60 text-xs mt-1">
                      ID: {item.entity.id}
                    </div>
                    <div class="text-white/60 text-xs">
                      Created: {new Date(item.entity.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <div class="flex gap-2">
                    <button
                      on:click={() => handleEditEntity(item.entity)}
                      class="text-blue-500 hover:text-blue-400"
                    >
                      Edit
                    </button>
                    <button
                      on:click={() => handleDeleteEntity(item.entity.id)}
                      class="text-red-500 hover:text-red-400"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            {/each}
          {/if}
        </div>
      {/if}

      <!-- Edit Modal -->
      {#if editingEntity}
        <div class="fixed inset-0 bg-black/80 flex items-center justify-center p-4">
          <div class="bg-black border border-white/20 p-6 max-w-md w-full">
            <h3 class="text-xs uppercase tracking-wider mb-4">Edit Entity</h3>
            <div class="space-y-4">
              <div>
                <label class="block text-xs text-white/60 mb-1">Slug</label>
                <input
                  type="text"
                  bind:value={editingEntity.slug}
                  class="w-full bg-black border border-white/20 px-2 py-1 text-sm"
                />
              </div>
              <div>
                <label class="block text-xs text-white/60 mb-1">Title</label>
                <input
                  type="text"
                  bind:value={editingEntity.title}
                  class="w-full bg-black border border-white/20 px-2 py-1 text-sm"
                />
              </div>
              <div>
                <label class="block text-xs text-white/60 mb-1">Content</label>
                <textarea
                  bind:value={editingEntity.content}
                  class="w-full bg-black border border-white/20 px-2 py-1 text-sm"
                  rows="4"
                />
              </div>
              <div class="flex gap-2">
                <button
                  on:click={handleSaveEdit}
                  class="border border-white/20 px-3 py-1 text-xs uppercase tracking-wider hover:bg-white hover:text-black"
                >
                  Save
                </button>
                <button
                  on:click={() => editingEntity = null}
                  class="text-xs uppercase tracking-wider text-white/60 hover:text-white"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      {/if}
    </div>
  {/if}

  <!-- Create Tab -->
  {#if activeTab === 'create'}
    <form on:submit={handleCreateEntity} class="max-w-md space-y-4">
      <div>
        <label class="block text-xs text-white/60 mb-1">Type</label>
        <select
          bind:value={newEntity.type}
          class="w-full bg-black border border-white/20 px-2 py-1 text-sm"
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
        <label class="block text-xs text-white/60 mb-1">Slug (optional)</label>
        <input
          type="text"
          bind:value={newEntity.slug}
          class="w-full bg-black border border-white/20 px-2 py-1 text-sm"
          placeholder="unique-identifier"
        />
      </div>

      <div>
        <label class="block text-xs text-white/60 mb-1">Title</label>
        <input
          type="text"
          bind:value={newEntity.title}
          class="w-full bg-black border border-white/20 px-2 py-1 text-sm"
          required
        />
      </div>

      <div>
        <label class="block text-xs text-white/60 mb-1">Content</label>
        <textarea
          bind:value={newEntity.content}
          class="w-full bg-black border border-white/20 px-2 py-1 text-sm"
          rows="4"
        />
      </div>

      <div>
        <label class="block text-xs text-white/60 mb-1">Parent ID (optional)</label>
        <input
          type="text"
          bind:value={newEntity.parentId}
          class="w-full bg-black border border-white/20 px-2 py-1 text-sm"
          placeholder="parent-entity-id"
        />
      </div>

      <div>
        <label class="block text-xs text-white/60 mb-1">Sponsor ID (optional)</label>
        <input
          type="text"
          bind:value={newEntity.sponsorId}
          class="w-full bg-black border border-white/20 px-2 py-1 text-sm"
          placeholder="sponsor-entity-id"
        />
      </div>

      <button
        type="submit"
        class="border border-white/20 px-4 py-1 text-xs uppercase tracking-wider hover:bg-white hover:text-black"
      >
        Create Entity
      </button>
    </form>
  {/if}

  <!-- Stats Tab -->
  {#if activeTab === 'stats'}
    <div>
      {#if loading}
        <div class="text-xs text-white/60">Loading...</div>
      {:else if stats}
        <div class="space-y-4">
          <div class="border border-white/20 p-4">
            <h3 class="text-xs uppercase tracking-wider mb-2">Total Entities</h3>
            <div class="text-2xl">{stats.totalEntities}</div>
          </div>
          
          <div class="border border-white/20 p-4">
            <h3 class="text-xs uppercase tracking-wider mb-2">By Type</h3>
            <div class="space-y-1">
              {#each Object.entries(stats.byType) as [type, count]}
                <div class="flex justify-between text-sm">
                  <span class="text-white/60">{type}</span>
                  <span>{count}</span>
                </div>
              {/each}
            </div>
          </div>
        </div>
      {/if}
    </div>
  {/if}
</div>
