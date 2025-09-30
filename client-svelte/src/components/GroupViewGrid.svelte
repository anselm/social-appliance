<script lang="ts">
  import type { Entity } from '../types'
  import PostItem from './PostItem.svelte'

  export let children: Entity[] = []
</script>

<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {#each children as child}
    <div class="border border-white/20 p-4 hover:border-white/40 transition-colors">
      {#if child.type === 'post'}
        <PostItem post={child} />
      {:else}
        <a href="{child.slug || `/${child.id}`}" class="block">
          <div class="mb-2">
            <span class="text-xs text-white/60 uppercase">[{child.type}]</span>
          </div>
          <h3 class="text-sm font-medium mb-2">{child.title || child.slug || 'Untitled'}</h3>
          {#if child.content}
            <p class="text-xs text-white/60 line-clamp-3">{child.content}</p>
          {/if}
        </a>
      {/if}
    </div>
  {/each}
</div>
