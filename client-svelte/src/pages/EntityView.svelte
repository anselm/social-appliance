<script lang="ts">
  import { api } from '../services/api'
  import { config } from '../stores/appConfig'
  import RouterLink from '../components/RouterLink.svelte'
  import PostView from '../components/PostView.svelte'
  import GroupViewGrid from '../components/GroupViewGrid.svelte'
  import GroupViewList from '../components/GroupViewList.svelte'
  import GroupViewCards from '../components/GroupViewCards.svelte'
  import GroupViewDefault from '../components/GroupViewDefault.svelte'
  import GroupViewMap from '../components/GroupViewMap.svelte'
  import type { Entity } from '../types'

  export let path: string = '/'
  export let wildcard: string = ''

  $: routingMode = $config.routing?.mode || 'query'
  let slug: string = routingMode === 'query' ? path : (wildcard || '/')
  
  let entity: Entity | null = null
  let children: Entity[] = []
  let loading = true
  let error: string | null = null
  let currentLoadingSlug: string | null = null
  let hasAttemptedLoad = false

  $: {
    const newSlug = routingMode === 'query' ? path : (wildcard || '/')
    if (newSlug !== slug) {
      slug = newSlug
      hasAttemptedLoad = false
      loadEntity(slug)
    } else if (slug && !currentLoadingSlug && !entity && !hasAttemptedLoad) {
      loadEntity(slug)
    }
  }

  async function loadEntity(targetSlug: string) {
    if (currentLoadingSlug === targetSlug) return
    
    hasAttemptedLoad = true
    currentLoadingSlug = targetSlug
    loading = true
    error = null
    entity = null
    children = []
    
    try {
      const querySlug = targetSlug.startsWith('/') ? targetSlug : `/${targetSlug}`
      const entityData = await api.getEntityBySlug(querySlug)
      
      if (!entityData) {
        throw new Error(`Entity not found: ${querySlug}`)
      }
      
      entity = entityData
      
      console.log('EntityView: Loaded entity:', entity)
      console.log('EntityView: Entity type:', entity.type)
      console.log('EntityView: Entity view:', entity.view)
      console.log('EntityView: View comparison - entity.view === "map":', entity.view === 'map')
      
      if (entity.type === 'group') {
        try {
          const childrenData = await api.queryEntities({ 
            parentId: entity.id,
            limit: 100 
          })
          
          children = (childrenData || []).sort((a, b) => {
            const dateA = new Date(a.updatedAt).getTime()
            const dateB = new Date(b.updatedAt).getTime()
            return dateB - dateA
          })
          
          console.log('EntityView: Loaded children:', children.length)
        } catch (childErr) {
          console.error('EntityView: Failed to load children:', childErr)
          children = []
        }
      }
    } catch (err: any) {
      console.error('EntityView: Failed to load entity:', err)
      
      if (err.status === 404 || err.message?.includes('not found') || err.message?.includes('Entity not found')) {
        error = `Page not found: ${targetSlug}`
      } else if (err.status === 403) {
        error = 'You do not have permission to view this page'
      } else if (err.message === 'Failed to fetch' || err.code === 'ECONNREFUSED') {
        error = 'Server unavailable'
      } else {
        error = err.message || 'Failed to load page'
      }
      entity = null
      children = []
    } finally {
      loading = false
      currentLoadingSlug = null
    }
  }
  
  // Add reactive logging to see what's happening
  $: {
    if (entity) {
      console.log('EntityView: Reactive check - entity:', entity.id, 'type:', entity.type, 'view:', entity.view)
      console.log('EntityView: Reactive - should render map?', entity.type === 'group' && entity.view === 'map')
    }
  }
</script>

{#if loading}
  <div class="text-xs text-white/60">Loading...</div>
{:else if error}
  <div class="space-y-4">
    <div class="text-sm text-red-400">{error}</div>
    <RouterLink to="/" className="text-xs text-white/60 hover:text-white underline">← Back to home</RouterLink>
  </div>
{:else if !entity}
  <div class="space-y-4">
    <div class="text-sm text-white/60">Page not found</div>
    <RouterLink to="/" className="text-xs text-white/60 hover:text-white underline">← Back to home</RouterLink>
  </div>
{:else}
  <div class="mb-4 p-3 bg-green-900/20 border border-green-500/30 text-xs space-y-1">
    <div>DEBUG: Entity type = "{entity.type}"</div>
    <div>DEBUG: Entity view = "{entity.view || '(empty)'}"</div>
    <div>DEBUG: Children count = {children.length}</div>
    <div>DEBUG: Type is group? {entity.type === 'group'}</div>
    <div>DEBUG: View is map? {entity.view === 'map'}</div>
    <div>DEBUG: Should render map? {entity.type === 'group' && entity.view === 'map'}</div>
  </div>
  
  {#if entity.type === 'post'}
    <div class="mb-2 text-xs text-blue-400">→ Rendering PostView</div>
    <PostView {entity} />
  {:else if entity.type === 'group' && entity.view === 'map'}
    <div class="mb-2 p-2 bg-yellow-900/30 border border-yellow-500/50 text-xs text-yellow-300">
      ✓ MAP VIEW BRANCH MATCHED - About to render GroupViewMap component
    </div>
    <GroupViewMap {entity} {children} />
  {:else if entity.type === 'group' && entity.view === 'grid'}
    <div class="mb-2 text-xs text-blue-400">→ Rendering GroupViewGrid</div>
    <GroupViewGrid {entity} {children} />
  {:else if entity.type === 'group' && entity.view === 'cards'}
    <div class="mb-2 text-xs text-blue-400">→ Rendering GroupViewCards</div>
    <GroupViewCards {entity} {children} />
  {:else if entity.type === 'group' && entity.view === 'list'}
    <div class="mb-2 text-xs text-blue-400">→ Rendering GroupViewList</div>
    <GroupViewList {entity} {children} />
  {:else if entity.type === 'group'}
    <div class="mb-2 text-xs text-blue-400">→ Rendering GroupViewDefault (no specific view)</div>
    <GroupViewDefault {entity} {children} />
  {:else}
    <div class="text-xs text-red-400">Unknown entity type: {entity.type}</div>
  {/if}
{/if}
