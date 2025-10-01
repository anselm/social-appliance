<script lang="ts">
  import { onMount } from 'svelte'
  import { Link } from 'svelte-routing'
  import { api } from '../services/api'
  import { auth } from '../stores/auth'
  import PostItem from '../components/PostItem.svelte'
  import PostForm from '../components/PostForm.svelte'
  import GroupViewGrid from '../components/GroupViewGrid.svelte'
  import GroupViewList from '../components/GroupViewList.svelte'
  import GroupViewCards from '../components/GroupViewCards.svelte'
  import type { Entity } from '../types'

  let entity: Entity | null = null
  let children: Entity[] = []
  let loading = true
  let showNewPost = false
  let error: string | null = null

  onMount(async () => {
    await loadRootEntity()
  })

  async function loadRootEntity() {
    loading = true
    error = null
    entity = null
    children = []
    
    try {
      // Query for the root entity with slug "/"
      const entityData = await api.getEntityBySlug('/')
      
      if (!entityData) {
        throw new Error('Root entity not found')
      }
      
      entity = entityData
      
      // Load children
      try {
        const childrenData = await api.queryEntities({ 
          parentId: entityData.id,
          limit: 100 
        })
        children = childrenData || []
      } catch (childErr) {
        console.error('Failed to load children:', childErr)
        children = []
      }
    } catch (err: any) {
      console.error('Failed to load root entity:', err)
      if (err.status === 404 || err.message?.includes('not found')) {
        // If no root entity exists, fall back to showing all top-level groups
        error = null
        entity = null
        try {
          const groups = await api.queryEntities({ 
            type: 'group',
            limit: 100 
          })
          children = groups || []
        } catch (groupErr) {
          console.error('Failed to load groups:', groupErr)
          error = 'Failed to load content'
        }
      } else {
        error = err.message || 'Failed to load page'
      }
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
      await loadRootEntity() // Reload
    } catch (error) {
      console.error('Failed to create post:', error)
    }
  }

  async function handleCreateGroup(event: CustomEvent) {
    const { title, content } = event.detail
    if (!$auth || !title.trim()) return

    try {
      await api.createGroup({
        title: title.trim(),
        content: content.trim(),
        parentId: entity?.id || null,
        sponsorId: $auth.id,
        auth: $auth.id
      })
      
      await loadRootEntity() // Reload
    } catch (error) {
      console.error('Failed to create group:', error)
    }
  }
</script>

{#if loading}
  <div class="text-xs text-white/60">Loading...</div>
{:else if error}
  <div class="space-y-4">
    <div class="text-sm text-red-400">{error}</div>
  </div>
{:else if entity}
  <!-- We have a root entity, display it like any other entity -->
  <div>
    <div class="mb-8">
      <div class="text-xs text-white/60 mb-1">[{entity.type}]</div>
      <h1 class="text-lg mb-2">{entity.title || 'Home'}</h1>
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
                <Link
                  to="{child.slug || `/${child.id}`}"
                  class="block hover:bg-white/5 -mx-2 px-2 py-1"
                >
                  <div class="flex items-baseline gap-2">
                    <span class="text-xs text-white/60">[{child.type}]</span>
                    <span class="text-sm font-medium">{child.title || child.slug || 'Untitled'}</span>
                  </div>
                  {#if child.content}
                    <p class="text-xs text-white/60 mt-1 line-clamp-2">{child.content}</p>
                  {/if}
                </Link>
              </div>
            {/if}
          {/each}
        {/if}
      </div>
    {/if}
  </div>
{:else}
  <!-- No root entity, show all top-level groups as fallback -->
  <div>
    <h1 class="text-xs uppercase tracking-wider mb-8">Groups</h1>
    <div class="space-y-2">
      {#if children.length === 0}
        <p class="text-xs text-white/60">No groups found</p>
      {:else}
        {#each children as group}
          <div class="border-b border-white/10 pb-2">
            <Link
              to="{group.slug || `/${group.id}`}"
              class="block hover:bg-white/5 -mx-2 px-2 py-1"
            >
              <div class="flex items-baseline gap-2">
                <span class="text-xs text-white/60">[{group.type}]</span>
                <span class="text-sm">{group.title || group.slug || 'Untitled'}</span>
              </div>
              {#if group.content}
                <p class="text-xs text-white/60 mt-1 line-clamp-2">{group.content}</p>
              {/if}
            </Link>
          </div>
        {/each}
      {/if}
    </div>
  </div>
{/if}
