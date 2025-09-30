<script lang="ts">
  import { onMount, getContext } from 'svelte'
  import { api } from '../services/api'
  import type { Entity, AuthContext } from '../types'

  export let slug: string

  const { user } = getContext<AuthContext>('auth')

  let group: Entity | null = null
  let posts: Entity[] = []
  let loading = true
  let showNewPost = false
  let newPost = { title: '', content: '' }

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

  async function handleCreatePost(e: Event) {
    e.preventDefault()
    if (!$user || !group || !newPost.title.trim()) return

    try {
      await api.createPost({
        title: newPost.title.trim(),
        content: newPost.content.trim(),
        parentId: group.id,
        sponsorId: $user.id,
        auth: $user.id
      })
      
      newPost = { title: '', content: '' }
      showNewPost = false
      await loadGroup() // Reload posts
    } catch (error) {
      console.error('Failed to create post:', error)
    }
  }

  function cancelNewPost() {
    showNewPost = false
    newPost = { title: '', content: '' }
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
      {#if $user && !showNewPost}
        <button
          on:click={() => showNewPost = true}
          class="text-xs uppercase tracking-wider border border-white/20 px-3 py-1 hover:bg-white hover:text-black transition-colors"
        >
          New Post
        </button>
      {/if}

      {#if showNewPost}
        <form on:submit={handleCreatePost} class="border border-white/20 p-4 space-y-3">
          <div>
            <input
              type="text"
              bind:value={newPost.title}
              placeholder="Title"
              class="w-full bg-black border-b border-white/20 pb-1 text-sm focus:outline-none focus:border-white"
              autofocus
            />
          </div>
          <div>
            <textarea
              bind:value={newPost.content}
              placeholder="Content (optional)"
              rows="4"
              class="w-full bg-black border border-white/20 p-2 text-sm focus:outline-none focus:border-white resize-none"
            />
          </div>
          <div class="flex gap-2">
            <button
              type="submit"
              class="text-xs uppercase tracking-wider border border-white/20 px-3 py-1 hover:bg-white hover:text-black transition-colors"
            >
              Post
            </button>
            <button
              type="button"
              on:click={cancelNewPost}
              class="text-xs uppercase tracking-wider text-white/60 hover:text-white"
            >
              Cancel
            </button>
          </div>
        </form>
      {/if}
    </div>

    <div class="space-y-4">
      <h2 class="text-xs uppercase tracking-wider text-white/60">Posts</h2>
      {#if posts.length === 0}
        <p class="text-xs text-white/60">No posts yet</p>
      {:else}
        {#each posts as post}
          <div class="border-b border-white/10 pb-4">
            <h3 class="text-sm font-medium mb-1">{post.title || 'Untitled'}</h3>
            {#if post.content}
              <p class="text-sm text-white/80 whitespace-pre-wrap">{post.content}</p>
            {/if}
            <div class="text-xs text-white/40 mt-2">
              {new Date(post.createdAt).toLocaleDateString()}
            </div>
          </div>
        {/each}
      {/if}
    </div>
  </div>
{/if}
