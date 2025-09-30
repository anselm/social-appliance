<script lang="ts">
  import type { Entity } from '../types'
  import PostItem from './PostItem.svelte'

  export let children: Entity[] = []
</script>

<div class="space-y-2">
  {#each children as child}
    <a href="{child.slug || `/${child.id}`}" class="block border-b border-white/10 pb-2 hover:border-white/30 transition-colors">
      <div class="flex items-baseline gap-3">
        <span class="text-xs text-white/40 uppercase flex-shrink-0">[{child.type}]</span>
        <div class="flex-grow">
          <h3 class="text-sm font-medium inline">{child.title || child.slug || 'Untitled'}</h3>
          {#if child.content}
            <span class="text-xs text-white/60 ml-2">{child.content.substring(0, 100)}{child.content.length > 100 ? '...' : ''}</span>
          {/if}
        </div>
        <span class="text-xs text-white/40">{new Date(child.updatedAt).toLocaleDateString()}</span>
      </div>
    </a>
  {/each}
</div>
