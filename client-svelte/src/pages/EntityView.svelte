<script lang="ts">
  import { onMount } from 'svelte'
  import { api } from '../services/api'
  import { auth } from '../stores/auth'
  import { config } from '../stores/config'
  import { renderMarkdown } from '../utils/markdown'
  import RouterLink from '../components/RouterLink.svelte'
  import PostItem from '../components/PostItem.svelte'
  import PostForm from '../components/PostForm.svelte'
  import GroupViewGrid from '../components/GroupViewGrid.svelte'
  import GroupViewList from '../components/GroupViewList.svelte'
  import GroupViewCards from '../components/GroupViewCards.svelte'
  import type { Entity } from '../types'

  export let path: string = '/'
  export let wildcard: string = ''

  // Use the appropriate prop based on routing mode
  $: routingMode = $config.routing?.mode || 'query'
  let slug: string = routingMode === 'query' ? path : (wildcard || '/')
  
  $: {
    slug = routingMode === 'query' ? path : (wildcard || '/')
    console.log('EntityView: slug changed to:', slug)
  }

  let entity: Entity | null = null
  let children: Entity[] = []
  let loading = true
  let showNewPost = false
  let error: string | null = null

  onMount(async () => {
    console.log('EntityView: onMount, slug:', slug)
    if (slug) {
      await loadEntity()
    }
  })

  // Watch for slug changes
  $: if (slug) {
    console.log('EntityView: Reactive slug change detected:', slug)
    loadEntity()
  }

  async function loadEntity() {
    loading = true
    error = null
    entity = null
    children = []
    
    try {
      // Ensure slug has leading slash
      const querySlug = slug.startsWith('/') ? slug : `/${slug}`
      
      console.log('EntityView: Loading entity with slug:', querySlug)
      const entityData = await api.getEntityBySlug(querySlug)
      console.log('EntityView: Received entity data:', entityData)
      
      if (!entityData) {
        throw new Error(`Entity not found: ${querySlug}`)
      }
      
      entity = entityData
      console.log('EntityView: Entity loaded, id:', entity.id, 'type:', entity.type)
      
      // Load children (posts, sub-groups, etc.)
      try {
        console.log('EntityView: Loading children for entity:', entity.id)
        console.log('EntityView: Query filters:', { parentId: entity.id, limit: 100 })
        
        const childrenData = await api.queryEntities({ 
          parentId: entity.id,
          limit: 100 
        })
        console.log('EntityView: Received children data:', childrenData)
        console.log('EntityView: Children is array?', Array.isArray(childrenData))
        
        children = childrenData || []
        console.log('EntityView: Children count:', children.length)
        
        if (children.length > 0) {
          console.log('EntityView: First child:', children[0])
        } else {
          console.log('EntityView: No children found for parentId:', entity.id)
        }
      } catch (childErr) {
        console.error('EntityView: Failed to load children:', childErr)
        // Don't fail the whole page if children can't be loaded
        children = []
      }
    } catch (err: any) {
      console.error('EntityView: Failed to load entity:', err)
      
      // For non-root paths, show error
      if (err.status === 404 || err.message?.includes('not found') || err.message?.includes('Entity not found')) {
        error = `Page not found: ${slug}`
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
      console.log('EntityView: Loading complete. Entity:', !!entity, 'Children:', children.length, 'Error:', error)
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
      
      showNewPost = false
      await loadEntity() // Reload children
    } catch (error) {
      console.error('Failed to create post:', error)
    }
  }

  function getEntityTypeLabel(type: string): string {
    return type.charAt(0).toUpperCase() + type.slice(1)
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
  <div>
    <div class="mb-8">
      <h1 class="text-lg mb-2">{entity.title || entity.slug || 'Untitled'}</h1>
      {#if entity.content}
        <div class="text-sm text-white/60 prose-content">
          {@html renderMarkdown(entity.content)}
        </div>
      {/if}
      <div class="text-xs text-white/40 mt-2">
        Entity ID: {entity.id} | Type: {entity.type}
      </div>
    </div>

    {#if entity.type === 'group'}
      <div class="mb-6">
        {#if $config.features.allowCreate && $auth && !showNewPost}
          <button
            on:click={() => showNewPost = true}
            class="text-xs uppercase tracking-wider border border-white/20 px-3 py-1 hover:bg-white hover:text-black transition-colors"
          >
            New Post
          </button>
        {/if}

        {#if showNewPost}
          <PostForm 
            on:submit={handleCreatePost}
            on:cancel={() => showNewPost = false}
          />
        {/if}
      </div>
    {/if}

    <div class="text-xs text-white/40 mb-2">
      Children: {children.length}
    </div>

    {#if children.length > 0}
      <div class="space-y-4">
        
        {#if entity.type === 'group'}
          {#if entity.view === 'grid'}
            <GroupViewGrid {children} />
          {:else if entity.view === 'cards'}
            <GroupViewCards {children} />
          {:else}
            <GroupViewList {children} />
          {/if}
        {:else}
          {#each children as child}
            {#if child.type === 'post'}
              <PostItem post={child} />
            {:else}
              <div class="border-b border-white/10 pb-4">
                <RouterLink to={child.slug || `/${child.id}`} className="hover:underline">
                  <div class="flex items-baseline gap-2">
                    <span class="text-xs text-white/60">[{child.type}]</span>
                    <span class="text-sm font-medium">{child.title || child.slug || 'Untitled'}</span>
                  </div>
                </RouterLink>
                {#if child.content}
                  <p class="text-xs text-white/60 mt-1 line-clamp-2">{child.content}</p>
                {/if}
              </div>
            {/if}
          {/each}
        {/if}
      </div>
    {:else if entity.type === 'group'}
      <div class="text-xs text-white/60">No content in this group yet</div>
    {/if}
  </div>
{/if}
