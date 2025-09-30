<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import type { Entity } from '../types'
  
  export let entity: Entity
  
  const dispatch = createEventDispatcher()
  
  let slug = entity.slug || ''
  let title = entity.title || ''
  let content = entity.content || ''
  
  function handleSave() {
    dispatch('save', {
      ...entity,
      slug,
      title,
      content
    })
  }
  
  function handleCancel() {
    dispatch('cancel')
  }
</script>

<div class="fixed inset-0 bg-black/80 flex items-center justify-center p-4">
  <div class="bg-black border border-white/20 p-6 max-w-md w-full">
    <h3 class="text-xs uppercase tracking-wider mb-4">Edit Entity</h3>
    <div class="space-y-4">
      <div>
        <label class="block text-xs text-white/60 mb-1">Slug</label>
        <input
          type="text"
          bind:value={slug}
          class="w-full bg-black border border-white/20 px-2 py-1 text-sm"
        />
      </div>
      <div>
        <label class="block text-xs text-white/60 mb-1">Title</label>
        <input
          type="text"
          bind:value={title}
          class="w-full bg-black border border-white/20 px-2 py-1 text-sm"
        />
      </div>
      <div>
        <label class="block text-xs text-white/60 mb-1">Content</label>
        <textarea
          bind:value={content}
          class="w-full bg-black border border-white/20 px-2 py-1 text-sm"
          rows="4"
        />
      </div>
      <div class="flex gap-2">
        <button
          on:click={handleSave}
          class="border border-white/20 px-3 py-1 text-xs uppercase tracking-wider hover:bg-white hover:text-black"
        >
          Save
        </button>
        <button
          on:click={handleCancel}
          class="text-xs uppercase tracking-wider text-white/60 hover:text-white"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
</div>
