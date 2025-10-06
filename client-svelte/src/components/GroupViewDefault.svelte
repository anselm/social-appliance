<script lang="ts">
  import type { Entity } from '../types'
  import RouterLink from './RouterLink.svelte'
  import EntityHeader from './EntityHeader.svelte'
  import EntityManagementControls from './EntityManagementControls.svelte'

  export let entity: Entity
  export let children: Entity[] = []
  export let onUpdate: (updates: any) => Promise<void>
  export let onDelete: () => Promise<void>
  export let onCreateChild: (entityData: any) => Promise<void>
</script>

<EntityManagementControls {entity} {onUpdate} {onDelete} showNewEntityButton={true} {onCreateChild}>
  <div slot="content">
    <!-- Empty - EntityHeader handles the display -->
  </div>
  
  <div slot="main">
    <EntityHeader {entity} />

    {#if children.length > 0}
      <div class="space-y-4">
        {#each children as child}
          {#if child.type === 'post'}
            <div class="border-b border-white/10 pb-4">
              <RouterLink to={child.slug || `/${child.id}`} className="block hover:opacity-80 transition-opacity">
                <div class="flex gap-4">
                  {#if child.depiction}
                    <img 
                      src={child.depiction} 
                      alt={child.title || 'Post image'} 
                      class="w-24 h-24 object-cover flex-shrink-0"
                    />
                  {/if}
                  <div class="flex-1">
                    <h3 class="text-sm font-medium mb-1">{child.title || 'Untitled'}</h3>
                    {#if child.content}
                      <p class="text-xs text-white/60 line-clamp-2">{child.content}</p>
                    {/if}
                    <div class="text-xs text-white/40 mt-2">
                      {new Date(child.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </RouterLink>
            </div>
          {:else}
            <div class="border-b border-white/10 pb-4">
              <RouterLink to={child.slug || `/${child.id}`} className="hover:underline">
                <div class="flex items-baseline gap-2">
                  <span class="text-xs text-white/60">[{child.type}]</span>
                  <span class="text-sm font-medium">{child.title || child.slug || 'Untitled'}</span>
                </div>
              </RouterLink>
              {#if child.content}
                <p class="text-xs text-white/60 mt-1 line-clamp-2">{child.content}</p>
              {/if}
            </div>
          {/if}
        {/each}
      </div>
    {:else if entity.type === 'group'}
      <div class="text-xs text-white/60">No content in this group yet</div>
    {/if}
  </div>
</EntityManagementControls>
