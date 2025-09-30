<script lang="ts">
  import { onMount } from 'svelte'
  import { api } from '../services/api'
  import { auth } from '../stores/auth'
  import PostItem from '../components/PostItem.svelte'
  import PostForm from '../components/PostForm.svelte'
  import GroupViewGrid from '../components/GroupViewGrid.svelte'
  import GroupViewList from '../components/GroupViewList.svelte'
  import GroupViewCards from '../components/GroupViewCards.svelte'
  import type { Entity } from '../types'

  export let wildcard: string = ''

  // Use the wildcard parameter directly as the slug
  let slug: string = wildcard
  
  $: {
    slug = wildcard
  }

  let entity: Entity | null = null
  let children: Entity[] = []
  let loading = true
  let showNewPost = false
  let error: string | null = null

  onMount(async () => {
    if (slug) {
      await loadEntity()
    }
  })

  // Watch for slug changes
  $: if (slug) {
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
      
      const entityData = await api.getEntityBySlug(querySlug)
      
      if (!entityData) {
        throw new Error(`Entity not found: ${querySlug}`)
      }
      
      entity = entityData
      
      // Load children (posts, sub-groups, etc.)
      try {
        const childrenData = await api.queryEntities({ 
          parentId: entityData.id,
          limit: 100 
        })
        children = childrenData || []
      } catch (childErr) {
        console.error('Failed to load children:', childErr)
        // Don't fail the whole page if children can't be loaded
        children = []
      }
    } catch (err: any) {
      console.error('Failed to load entity:', err)
      if (err.status === 404 || err.message?.includes('not found') || err.message?.includes('Entity not found')) {
        error = `Page not found: ${slug}`
      } else if (err.status === 403) {
        error = 'You do not have permission to view this page'
      } else {
        error = err.message || 'Failed to load page'
      }
      entity = null
      children = []
    } finally {
      loading = false
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
    <a href="/" class="text-xs text-white/60 hover:text-white underline">← Back to home</a>
  </div>
{:else if !entity}
  <div class="space-y-4">
    <div class="text-sm text-white/60">Page not found</div>
    <a href="/" class="text-xs text-white/60 hover:text-white underline">← Back to home</a>
  </div>
{:else}
  <div>
    <div class="mb-8">
      <div class="text-xs text-white/60 mb-1">[{entity.type}]</div>
      <h1 class="text-lg mb-2">{entity.title || entity.slug || 'Untitled'}</h1>
      {#if entity.content}
        <p class="text-sm text-white/60">{entity.content}</p>
      {/if}
    </div>

    {#if entity.type === 'group'}
      <div class="mb-6">
        {#if $auth && !showNewPost}
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

    {#if children.length > 0}
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <h2 class="text-xs uppercase tracking-wider text-white/60">
            {entity.type === 'group' ? 'Posts' : 'Children'}
          </h2>
          {#if entity.view}
            <span class="text-xs text-white/40">View: {entity.view}</span>
          {/if}
        </div>
        
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
                <a href="{child.slug || `/${child.id}`}" class="hover:underline">
                  <div class="flex items-baseline gap-2">
                    <span class="text-xs text-white/60">[{child.type}]</span>
                    <span class="text-sm font-medium">{child.title || child.slug || 'Untitled'}</span>
                  </div>
                </a>
                {#if child.content}
                  <p class="text-xs text-white/60 mt-1 line-clamp-2">{child.content}</p>
                {/if}
              </div>
            {/if}
          {/each}
        {/if}
      </div>
    {/if}
  </div>
{/if}
