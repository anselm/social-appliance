<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import type { Entity } from '../types'
  import RouterLink from './RouterLink.svelte'
  import EntityHeader from './EntityHeader.svelte'

  export let entity: Entity
  export let children: Entity[] = []
  
  const dispatch = createEventDispatcher()
</script>

<EntityHeader {entity} />

{#if children.length > 0}
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {#each children as child}
      <RouterLink to={child.slug || `/${child.id}`} className="block border border-white/20 hover:border-white/40 transition-colors overflow-hidden">
        {#if child.depiction}
          <img 
            src={child.depiction} 
            alt={child.title || 'Image'} 
            class="w-full h-48 object-cover"
          />
        {/if}
        <div class="p-4">
          <div class="flex items-baseline gap-2 mb-2">
            <span class="text-xs text-white/40">[{child.type}]</span>
            <h3 class="text-sm font-medium flex-1">{child.title || child.slug || 'Untitled'}</h3>
          </div>
          {#if child.content}
            <p class="text-xs text-white/60 line-clamp-3">{child.content}</p>
          {/if}
        </div>
      </RouterLink>
    {/each}
  </div>
{:else if entity.type === 'group'}
  <div class="text-xs text-white/60">No content in this group yet</div>
{/if}
