<script lang="ts">
  import { api } from '../services/api'
  import type { Entity } from '../types'
  
  export let slug: string
  
  let entity: Entity | null = null
  let error: string | null = null
  let loading = true
  
  async function loadDirectly() {
    console.log('DirectEntityLoader: Loading slug directly:', slug)
    loading = true
    error = null
    
    try {
      const result = await api.getEntityBySlug(slug)
      console.log('DirectEntityLoader: Got result:', result)
      entity = result
    } catch (err: any) {
      console.error('DirectEntityLoader: Error:', err)
      error = err.message
    } finally {
      loading = false
    }
  }
  
  // Load immediately
  loadDirectly()
</script>

<div class="border border-yellow-500 p-4 mb-4">
  <h3 class="text-yellow-500 mb-2">Direct Entity Loader Test</h3>
  <p class="text-xs mb-2">Testing slug: /{slug}</p>
  
  {#if loading}
    <p class="text-xs">Loading...</p>
  {:else if error}
    <p class="text-xs text-red-400">Error: {error}</p>
  {:else if entity}
    <p class="text-xs text-green-400">Success! Found: {entity.title || entity.slug}</p>
  {:else}
    <p class="text-xs text-gray-400">No entity found</p>
  {/if}
</div>
