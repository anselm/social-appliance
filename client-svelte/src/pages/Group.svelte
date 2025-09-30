<script lang="ts">
  import { onMount } from 'svelte'
  import { api } from '../services/api'
  import { auth } from '../stores/auth'
  import PostItem from '../components/PostItem.svelte'
  import PostForm from '../components/PostForm.svelte'
  import type { Entity } from '../types'

  export let slug: string

  let group: Entity | null = null
  let posts: Entity[] = []
  let loading = true
  let showNewPost = false

  onMount(async () => {
    if (slug) {
      await loadGroup()
    }
  })

  async function loadGroup() {
    try {
      const groupData = await api.getEntityBySlug(slug)
      group = groupData
      
      if (groupData) {
        const postsData = await api.queryEntities({ 
          parentId: groupData.id, 
          type: 'post',
          limit: 100 
        })
        posts = postsData
      }
    } catch (error) {
      console.error('Failed to load group:', error)
    } finally {
      loading = false
    }
  }

  async function handleCreatePost(event: CustomEvent) {
    const { title, content } = event.detail
    if (!$auth || !group || !title.trim()) return

    try {
      await api.createPost({
        title: title.trim(),
        content: content.trim(),
        parentId: group.id,
        sponsorId: $auth.id,
        auth: $auth.id
      })
      
      showNewPost = false
      await loadGroup() // Reload posts
    } catch (error) {
      console.error('Failed to create post:', error)
    }
  }
</script>

{#if loading}
  <div class="text-xs text-white/60">Loading...</div>
{:else if !group}
  <div class="text-xs text-white/60">Group not found</div>
{:else}
  <div>
    <div class="mb-8">
      <h1 class="text-lg mb-2">{group.title || group.slug || 'Untitled Group'}</h1>
      {#if group.content}
        <p class="text-sm text-white/60">{group.content}</p>
      {/if}
    </div>

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

    <div class="space-y-4">
      <h2 class="text-xs uppercase tracking-wider text-white/60">Posts</h2>
      {#if posts.length === 0}
        <p class="text-xs text-white/60">No posts yet</p>
      {:else}
        {#each posts as post}
          <PostItem {post} />
        {/each}
      {/if}
    </div>
  </div>
{/if}
