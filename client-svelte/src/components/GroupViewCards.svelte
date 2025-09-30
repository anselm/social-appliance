<script lang="ts">
  import type { Entity } from '../types'
  import PostItem from './PostItem.svelte'

  export let children: Entity[] = []
</script>

<div class="space-y-6">
  {#each children as child}
    <div class="bg-white/5 rounded-lg overflow-hidden hover:bg-white/10 transition-colors">
      {#if child.type === 'post'}
        <div class="p-6">
          <PostItem post={child} />
        </div>
      {:else}
        <a href="{child.slug || `/${child.id}`}" class="block">
          {#if child.depiction}
            <img 
              src={child.depiction} 
              alt={child.title || 'Image'} 
              class="w-full h-64 object-cover"
            />
          {/if}
          <div class="p-6">
            <div class="flex items-start justify-between mb-3">
              <div>
                <span class="text-xs text-white/60 uppercase tracking-wider">{child.type}</span>
                <h3 class="text-lg font-medium mt-1">{child.title || child.slug || 'Untitled'}</h3>
              </div>
              <span class="text-xs text-white/40">{new Date(child.createdAt).toLocaleDateString()}</span>
            </div>
            {#if child.content}
              <p class="text-sm text-white/70 leading-relaxed">{child.content}</p>
            {/if}
            <div class="mt-4 text-xs text-white/40">
              Last updated: {new Date(child.updatedAt).toLocaleString()}
            </div>
          </div>
        </a>
      {/if}
    </div>
  {/each}
</div>
