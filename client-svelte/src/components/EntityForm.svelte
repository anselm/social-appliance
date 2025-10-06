<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import { generateEntityId, buildEntitySlug } from '../utils/entityHelpers'
  import type { Entity } from '../types'
  
  let { entity = null, parentSlug = '/', mode = 'create' }: { 
    entity?: Entity | null, 
    parentSlug?: string, 
    mode?: 'create' | 'edit' 
  } = $props()
  
  const dispatch = createEventDispatcher()
  
  let formData = $state({
    type: entity?.type || 'post',
    title: entity?.title || '',
    content: entity?.content || '',
    slug: entity?.slug || buildEntitySlug(parentSlug),
    view: entity?.view || '',
    depiction: entity?.depiction || '',
    parentId: entity?.parentId || null
  })
  
  const entityTypes = ['post', 'group', 'party', 'agent', 'place', 'thing']
  const viewTypes = ['', 'default', 'grid', 'list', 'cards', 'map']
  
  function handleSubmit() {
    if (!formData.title.trim()) {
      alert('Title is required')
      return
    }
    
    if (!formData.slug.trim()) {
      alert('Slug is required')
      return
    }
    
    dispatch('submit', {
      ...formData,
      id: entity?.id
    })
  }
  
  function handleCancel() {
    dispatch('cancel')
  }
  
  function regenerateSlug() {
    formData.slug = buildEntitySlug(parentSlug)
  }
</script>

<div class="bg-white/5 border border-white/20 rounded-lg p-6 space-y-4">
  <h2 class="text-lg font-semibold mb-4">
    {mode === 'create' ? 'New Entity' : 'Edit Entity'}
  </h2>
  
  <div>
    <label for="type" class="block text-xs text-white/60 mb-1">
      Type *
    </label>
    <select
      id="type"
      bind:value={formData.type}
      class="w-full bg-black border border-white/20 px-3 py-2 text-sm focus:outline-none focus:border-white"
      disabled={mode === 'edit'}
    >
      {#each entityTypes as type}
        <option value={type}>{type}</option>
      {/each}
    </select>
    {#if mode === 'edit'}
      <p class="text-xs text-white/40 mt-1">Type cannot be changed after creation</p>
    {/if}
  </div>
  
  <div>
    <label for="title" class="block text-xs text-white/60 mb-1">
      Title *
    </label>
    <input
      id="title"
      type="text"
      bind:value={formData.title}
      class="w-full bg-black border border-white/20 px-3 py-2 text-sm focus:outline-none focus:border-white"
      placeholder="Enter title"
    />
  </div>
  
  <div>
    <label for="slug" class="block text-xs text-white/60 mb-1">
      Slug * {#if mode === 'create'}
        <button
          type="button"
          onclick={regenerateSlug}
          class="text-blue-400 hover:text-blue-300 ml-2"
        >
          (regenerate)
        </button>
      {/if}
    </label>
    <input
      id="slug"
      type="text"
      bind:value={formData.slug}
      class="w-full bg-black border border-white/20 px-3 py-2 text-sm focus:outline-none focus:border-white font-mono"
      placeholder="/path/to/entity"
    />
    <p class="text-xs text-white/40 mt-1">
      Must be unique. Format: /path/to/entity
    </p>
  </div>
  
  <div>
    <label for="content" class="block text-xs text-white/60 mb-1">
      Content
    </label>
    <textarea
      id="content"
      bind:value={formData.content}
      rows="6"
      class="w-full bg-black border border-white/20 px-3 py-2 text-sm focus:outline-none focus:border-white"
      placeholder="Enter content (supports Markdown)"
    ></textarea>
  </div>
  
  {#if formData.type === 'group'}
    <div>
      <label for="view" class="block text-xs text-white/60 mb-1">
        View Type
      </label>
      <select
        id="view"
        bind:value={formData.view}
        class="w-full bg-black border border-white/20 px-3 py-2 text-sm focus:outline-none focus:border-white"
      >
        {#each viewTypes as view}
          <option value={view}>{view || '(default)'}</option>
        {/each}
      </select>
      <p class="text-xs text-white/40 mt-1">
        How child entities are displayed
      </p>
    </div>
  {/if}
  
  <div>
    <label for="depiction" class="block text-xs text-white/60 mb-1">
      Depiction (Image URL)
    </label>
    <input
      id="depiction"
      type="text"
      bind:value={formData.depiction}
      class="w-full bg-black border border-white/20 px-3 py-2 text-sm focus:outline-none focus:border-white"
      placeholder="https://example.com/image.jpg"
    />
  </div>
  
  <div class="flex gap-3 pt-4">
    <button
      type="button"
      onclick={handleSubmit}
      class="px-4 py-2 bg-white text-black hover:bg-white/90 transition-colors text-sm font-medium"
    >
      {mode === 'create' ? 'Create Entity' : 'Save Changes'}
    </button>
    <button
      type="button"
      onclick={handleCancel}
      class="px-4 py-2 border border-white/20 hover:bg-white/10 transition-colors text-sm"
    >
      Cancel
    </button>
  </div>
</div>
