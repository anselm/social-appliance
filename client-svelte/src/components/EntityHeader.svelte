<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import { authStore } from '../stores/auth'
  import { config } from '../stores/appConfig'
  import { renderMarkdown } from '../utils/markdown'
  import PostForm from './PostForm.svelte'
  import type { Entity } from '../types'

  export let entity: Entity
  export let showNewPostButton: boolean = true
  
  const dispatch = createEventDispatcher()
  
  let showNewPost = false
  
  function handleSubmit(event: CustomEvent) {
    dispatch('createPost', event.detail)
    showNewPost = false
  }
</script>

<div class="mb-8">
  <h1 class="text-lg mb-2">{entity.title || entity.slug || 'Untitled'}</h1>
  {#if entity.content}
    <div class="text-sm text-white/60 prose-content">
      {@html renderMarkdown(entity.content)}
    </div>
  {/if}
</div>

{#if entity.type === 'group' && showNewPostButton}
  <div class="mb-6">
    {#if $config.features.allowCreate && $authStore && !showNewPost}
      <button
        on:click={() => showNewPost = true}
        class="text-xs uppercase tracking-wider border border-white/20 px-3 py-1 hover:bg-white hover:text-black transition-colors"
      >
        New Post
      </button>
    {/if}

    {#if showNewPost}
      <PostForm 
        on:submit={handleSubmit}
        on:cancel={() => showNewPost = false}
      />
    {/if}
  </div>
{/if}

<hr/>
<br/>
