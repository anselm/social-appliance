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

  let { path = '/', wildcard = '' }: { path?: string, wildcard?: string } = $props()

  let routingMode = $derived($config.routing?.mode || 'query')
  let slug = $derived(routingMode === 'query' ? path : (wildcard || '/'))
  
  let entity = $state<Entity | null>(null)
  let children = $state<Entity[]>([])
  let loading = $state(true)
  let error = $state<string | null>(null)
  let currentLoadingSlug = $state<string | null>(null)

  console.log('EntityView: Component initialized with path:', path, 'wildcard:', wildcard)

  $effect(() => {
    console.log('EntityView: Effect triggered with slug:', slug)
    console.log('EntityView: currentLoadingSlug:', currentLoadingSlug)
    console.log('EntityView: entity:', entity?.slug)
    console.log('EntityView: loading:', loading)
    
    // Only load if we're not already loading this slug and it's different from current entity
    if (slug && slug !== currentLoadingSlug) {
      console.log('EntityView: Calling loadEntity for:', slug)
      loadEntity(slug)
    } else {
      console.log('EntityView: Skipping load - already loading or loaded')
    }
  })

  async function loadEntity(targetSlug: string) {
    console.log('EntityView: loadEntity called with:', targetSlug)
    
    if (currentLoadingSlug === targetSlug) {
      console.log('EntityView: Already loading this slug, skipping')
      return
    }
    
    currentLoadingSlug = targetSlug
    loading = true
    error = null
    entity = null
    children = []
    
    try {
      const querySlug = targetSlug.startsWith('/') ? targetSlug : `/${targetSlug}`
      console.log('EntityView: Fetching entity with slug:', querySlug)
      
      const entityData = await api.getEntityBySlug(querySlug)
      
      if (!entityData) {
        throw new Error(`Entity not found: ${querySlug}`)
      }
      
      entity = entityData
      
      console.log('EntityView: Loaded entity:', entity)
      console.log('EntityView: Entity type:', entity.type)
      console.log('EntityView: Entity view:', entity.view)
      
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
      console.log('EntityView: Load complete for:', targetSlug)
    }
  }
</script>

{#if loading}
  <div class="text-xs text-white/60">Loading...</div>
{:else if error}
  <div class="space-y-4">
    <div class="text-sm text-red-400">{error}</div>
    <RouterLink to="/" className="text-xs text-white/60 hover:text-white underline">
      {#snippet children()}
        ← Back to home
      {/snippet}
    </RouterLink>
  </div>
{:else if !entity}
  <div class="space-y-4">
    <div class="text-sm text-white/60">Page not found</div>
    <RouterLink to="/" className="text-xs text-white/60 hover:text-white underline">
      {#snippet children()}
        ← Back to home
      {/snippet}
    </RouterLink>
  </div>
{:else}
  {#if entity.type === 'post'}
    <PostView {entity} />
  {:else if entity.type === 'group' && entity.view === 'map'}
    <GroupViewMap {entity} {children} />
  {:else if entity.type === 'group' && entity.view === 'grid'}
    <GroupViewGrid {entity} {children} />
  {:else if entity.type === 'group' && entity.view === 'cards'}
    <GroupViewCards {entity} {children} />
  {:else if entity.type === 'group' && entity.view === 'list'}
    <GroupViewList {entity} {children} />
  {:else if entity.type === 'group'}
    <GroupViewDefault {entity} {children} />
  {:else}
    <div class="text-xs text-red-400">Unknown entity type: {entity.type}</div>
  {/if}
{/if}
