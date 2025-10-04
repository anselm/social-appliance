<script lang="ts">
  import { onMount } from 'svelte'
  import { api } from '../services/api'
  import { auth } from '../stores/auth'
  import { config } from '../stores/appConfig'
  import RouterLink from '../components/RouterLink.svelte'
  import PostView from '../components/PostView.svelte'
  import GroupViewGrid from '../components/GroupViewGrid.svelte'
  import GroupViewList from '../components/GroupViewList.svelte'
  import GroupViewCards from '../components/GroupViewCards.svelte'
  import GroupViewDefault from '../components/GroupViewDefault.svelte'
  import type { Entity } from '../types'

  export let path: string = '/'
  export let wildcard: string = ''

  // Use the appropriate prop based on routing mode
  $: routingMode = $config.routing?.mode || 'query'
  let slug: string = routingMode === 'query' ? path : (wildcard || '/')
  
  let entity: Entity | null = null
  let children: Entity[] = []
  let loading = true
  let error: string | null = null
  let currentLoadingSlug: string | null = null

  // Watch for slug changes - but prevent duplicate loads
  $: {
    const newSlug = routingMode === 'query' ? path : (wildcard || '/')
    if (newSlug !== slug) {
      slug = newSlug
      loadEntity(slug)
    } else if (slug && !currentLoadingSlug && !entity) {
      // Initial load when component first renders
      loadEntity(slug)
    }
  }

  async function loadEntity(targetSlug: string) {
    // Prevent duplicate loads
    if (currentLoadingSlug === targetSlug) {
      return
    }
    
    currentLoadingSlug = targetSlug
    loading = true
    error = null
    entity = null
    children = []
    
    try {
      // Ensure slug has leading slash
      const querySlug = targetSlug.startsWith('/') ? targetSlug : `/${targetSlug}`
      
      const entityData = await api.getEntityBySlug(querySlug)
      
      if (!entityData) {
        throw new Error(`Entity not found: ${querySlug}`)
      }
      
      entity = entityData
      
      // Only load children if this is a group
      if (entity.type === 'group') {
        try {
          const childrenData = await api.queryEntities({ 
            parentId: entity.id,
            limit: 100 
          })
          
          // Sort children by updatedAt in descending order (most recent first)
          children = (childrenData || []).sort((a, b) => {
            const dateA = new Date(a.updatedAt).getTime()
            const dateB = new Date(b.updatedAt).getTime()
            return dateB - dateA
          })
        } catch (childErr) {
          console.error('EntityView: Failed to load children:', childErr)
          // Don't fail the whole page if children can't be loaded
          children = []
        }
      }
    } catch (err: any) {
      console.error('EntityView: Failed to load entity:', err)
      
      // For non-root paths, show error
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

  async function handleCreatePost(event: CustomEvent) {
    const { title, content } = event.detail
    if (!$auth || !entity || !title.trim()) return

    try {
      await api.createPost({
        title: title.trim(),
        content: content.trim(),
        parentId: entity.id,
        sponsorId: $auth.id,
        auth: $auth.id
      })
      
      await loadEntity(slug) // Reload children
    } catch (error) {
      console.error('Failed to create post:', error)
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
  {#if entity.type === 'post'}
    <PostView {entity} />
  {:else if entity.view === 'grid'}
    <GroupViewGrid {entity} {children} on:createPost={handleCreatePost} />
  {:else if entity.view === 'cards'}
    <GroupViewCards {entity} {children} on:createPost={handleCreatePost} />
  {:else if entity.view === 'list'}
    <GroupViewList {entity} {children} on:createPost={handleCreatePost} />
  {:else}
    <GroupViewDefault {entity} {children} on:createPost={handleCreatePost} />
  {/if}
{/if}
