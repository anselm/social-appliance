<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  
  export let title = ''
  export let content = ''
  
  const dispatch = createEventDispatcher()
  
  function handleSubmit(e: Event) {
    e.preventDefault()
    dispatch('submit', { title, content })
  }
  
  function handleCancel() {
    dispatch('cancel')
  }
</script>

<form on:submit={handleSubmit} class="border border-white/20 p-4 space-y-3">
  <div>
    <input
      type="text"
      bind:value={title}
      placeholder="Title"
      class="w-full bg-black border-b border-white/20 pb-1 text-sm focus:outline-none focus:border-white"
      autofocus
    />
  </div>
  <div>
    <textarea
      bind:value={content}
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
      on:click={handleCancel}
      class="text-xs uppercase tracking-wider text-white/60 hover:text-white"
    >
      Cancel
    </button>
  </div>
</form>
