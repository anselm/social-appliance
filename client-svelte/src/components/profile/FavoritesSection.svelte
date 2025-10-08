<script lang="ts">
  import { authStore } from '../../stores/auth'
  import { userApi } from '../../services/userApi'
  import type { Entity } from '../../types'
  
  let favorites = $state<Entity[]>([])
  let loading = $state(true)
  
  $effect(() => {
    loadFavorites()
  })
  
  async function loadFavorites() {
    if (!$authStore) {
      loading = false
      return
    }
    
    loading = true
    try {
      const authIdentifier = $authStore.address || $authStore.issuer || ''
      favorites = await userApi.getUserFavorites(authIdentifier)
    } catch (error) {
      console.error('Failed to load favorites:', error)
    } finally {
      loading = false
    }
  }
</script>

<div class="bg-white/5 border border-white/20 rounded-lg p-6">
  <h2 class="text-lg font-semibold mb-4">Favorites</h2>
  
  {#if loading}
    <div class="text-xs text-white/60">Loading...</div>
  {:else if favorites.length === 0}
    <div class="text-sm text-white/60">
      <p class="mb-2">You haven't favorited anything yet.</p>
      <p class="text-xs text-white/40">
        (Favorites feature coming soon - will use relations table)
      </p>
    </div>
  {:else}
    <div class="space-y-2">
      {#each favorites as favorite}
        <div class="border border-white/10 p-3 rounded">
          <div class="text-sm font-medium">{favorite.title || 'Untitled'}</div>
          <div class="text-xs text-white/40 mt-1">{favorite.slug}</div>
        </div>
      {/each}
    </div>
  {/if}
</div>
