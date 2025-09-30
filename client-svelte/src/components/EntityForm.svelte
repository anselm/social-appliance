<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  
  export let type = 'post'
  export let slug = ''
  export let title = ''
  export let content = ''
  export let parentId = ''
  export let sponsorId = ''
  
  const dispatch = createEventDispatcher()
  
  function handleSubmit(e: Event) {
    e.preventDefault()
    dispatch('submit', {
      type,
      slug,
      title,
      content,
      parentId,
      sponsorId
    })
  }
</script>

<form on:submit={handleSubmit} class="max-w-md space-y-4">
  <div>
    <label for="entity-type" class="block text-xs text-white/60 mb-1">Type</label>
    <select
      id="entity-type"
      bind:value={type}
      class="w-full bg-black border border-white/20 px-2 py-1 text-sm"
    >
      <option value="post">Post</option>
      <option value="group">Group</option>
      <option value="party">Party (User)</option>
      <option value="place">Place</option>
      <option value="thing">Thing</option>
      <option value="agent">Agent</option>
    </select>
  </div>

  <div>
    <label for="entity-slug" class="block text-xs text-white/60 mb-1">Slug (optional)</label>
    <input
      id="entity-slug"
      type="text"
      bind:value={slug}
      class="w-full bg-black border border-white/20 px-2 py-1 text-sm"
      placeholder="unique-identifier"
    />
  </div>

  <div>
    <label for="entity-title" class="block text-xs text-white/60 mb-1">Title</label>
    <input
      id="entity-title"
      type="text"
      bind:value={title}
      class="w-full bg-black border border-white/20 px-2 py-1 text-sm"
      required
    />
  </div>

  <div>
    <label for="entity-content" class="block text-xs text-white/60 mb-1">Content</label>
    <textarea
      id="entity-content"
      bind:value={content}
      class="w-full bg-black border border-white/20 px-2 py-1 text-sm"
      rows="4"
    />
  </div>

  <div>
    <label for="entity-parent-id" class="block text-xs text-white/60 mb-1">Parent ID (optional)</label>
    <input
      id="entity-parent-id"
      type="text"
      bind:value={parentId}
      class="w-full bg-black border border-white/20 px-2 py-1 text-sm"
      placeholder="parent-entity-id"
    />
  </div>

  <div>
    <label for="entity-sponsor-id" class="block text-xs text-white/60 mb-1">Sponsor ID (optional)</label>
    <input
      id="entity-sponsor-id"
      type="text"
      bind:value={sponsorId}
      class="w-full bg-black border border-white/20 px-2 py-1 text-sm"
      placeholder="sponsor-entity-id"
    />
  </div>

  <button
    type="submit"
    class="border border-white/20 px-4 py-1 text-xs uppercase tracking-wider hover:bg-white hover:text-black"
  >
    Create Entity
  </button>
</form>
