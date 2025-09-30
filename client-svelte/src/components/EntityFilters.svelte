<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  
  export let searchQuery = ''
  export let typeFilter = ''
  
  const dispatch = createEventDispatcher()
  
  function handleSearch() {
    dispatch('search')
  }
  
  function handleTypeChange() {
    dispatch('typeChange')
  }
</script>

<div class="flex gap-4 mb-4">
  <input
    type="text"
    placeholder="Search by slug..."
    bind:value={searchQuery}
    on:keydown={(e) => e.key === 'Enter' && handleSearch()}
    class="bg-black border border-white/20 px-2 py-1 text-xs"
  />
  <select
    bind:value={typeFilter}
    on:change={handleTypeChange}
    class="bg-black border border-white/20 px-2 py-1 text-xs"
  >
    <option value="">All Types</option>
    <option value="post">Post</option>
    <option value="group">Group</option>
    <option value="party">Party</option>
    <option value="place">Place</option>
    <option value="thing">Thing</option>
    <option value="agent">Agent</option>
  </select>
  <button
    on:click={handleSearch}
    class="border border-white/20 px-3 py-1 text-xs uppercase tracking-wider hover:bg-white hover:text-black"
  >
    Search
  </button>
</div>
