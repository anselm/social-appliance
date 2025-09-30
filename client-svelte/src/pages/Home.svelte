<script lang="ts">
  import { onMount } from 'svelte'
  import { Link } from 'svelte-routing'
  import { api } from '../services/api'
  import type { Entity } from '../types'

  let groups: Entity[] = []
  let loading = true

  onMount(async () => {
    await loadGroups()
  })

  async function loadGroups() {
    try {
      const data = await api.queryEntities({ type: 'group', limit: 50 })
      groups = data
    } catch (error) {
      console.error('Failed to load groups:', error)
    } finally {
      loading = false
    }
  }
</script>

<div>
  <h1 class="text-xs uppercase tracking-wider mb-8">Groups</h1>
  <div class="space-y-2">
    {#if loading}
      <p class="text-xs text-white/60">Loading...</p>
    {:else if groups.length === 0}
      <p class="text-xs text-white/60">No groups found</p>
    {:else}
      {#each groups as group}
        <div class="border-b border-white/10 pb-2">
          <Link
            to="{group.slug || `/${group.id}`}"
            class="block hover:bg-white/5 -mx-2 px-2 py-1"
          >
            <div class="flex items-baseline gap-2">
              <span class="text-xs text-white/60">[{group.type}]</span>
              <span class="text-sm">{group.title || group.slug || 'Untitled'}</span>
            </div>
            {#if group.content}
              <p class="text-xs text-white/60 mt-1 line-clamp-2">{group.content}</p>
            {/if}
          </Link>
        </div>
      {/each}
    {/if}
  </div>
</div>
