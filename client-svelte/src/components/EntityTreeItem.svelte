<script lang="ts">
  import type { EntityWithChildren } from '../types'
  import EntityItem from './EntityItem.svelte'
  
  export let entity: EntityWithChildren
  export let level = 0
  export let expanded = false
  export let expandedNodes: Set<string>
  export let onToggle: (id: string) => void
  export let onEdit: (entity: EntityWithChildren) => void
  export let onDelete: (id: string) => void
  
  $: hasChildren = entity.children && entity.children.length > 0
</script>

<div>
  <div 
    class="border border-white/20 p-3 text-xs hover:bg-white/5"
    style="margin-left: {level * 20}px"
  >
    <div class="flex items-start gap-2">
      {#if hasChildren}
        <button
          on:click={() => onToggle(entity.id)}
          class="text-white/60 hover:text-white mt-1"
        >
          {expanded ? '▼' : '▶'}
        </button>
      {/if}
      <div class="flex-1">
        <EntityItem 
          {entity} 
          {onEdit} 
          {onDelete}
          showParent={false}
        />
      </div>
    </div>
  </div>
  
  {#if hasChildren && expanded}
    {#each entity.children as child}
      <svelte:self 
        entity={child} 
        level={level + 1}
        expanded={expandedNodes.has(child.id)}
        {expandedNodes}
        {onToggle}
        {onEdit}
        {onDelete}
      />
    {/each}
  {/if}
</div>
