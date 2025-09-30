<script lang="ts">
  import type { Entity } from '../types'
  
  export let post: Entity
  export let variant: 'default' | 'grid' | 'card' = 'default'
</script>

{#if variant === 'grid'}
  <div class="h-full">
    {#if post.depiction}
      <img 
        src={post.depiction} 
        alt={post.title || 'Image'} 
        class="w-full h-48 object-cover"
      />
    {/if}
    <div class="p-4">
      <h3 class="text-sm font-medium mb-1">{post.title || 'Untitled'}</h3>
      {#if post.content}
        <p class="text-xs text-white/60 line-clamp-3">{post.content}</p>
      {/if}
      <div class="text-xs text-white/40 mt-2">
        {new Date(post.createdAt).toLocaleDateString()}
      </div>
    </div>
  </div>
{:else if variant === 'card'}
  <div>
    {#if post.depiction}
      <img 
        src={post.depiction} 
        alt={post.title || 'Image'} 
        class="w-full h-64 object-cover mb-4 rounded"
      />
    {/if}
    <h3 class="text-lg font-medium mb-2">{post.title || 'Untitled'}</h3>
    {#if post.content}
      <p class="text-sm text-white/70 leading-relaxed whitespace-pre-wrap">{post.content}</p>
    {/if}
    <div class="text-xs text-white/40 mt-4">
      {new Date(post.createdAt).toLocaleDateString()}
    </div>
  </div>
{:else}
  <div class="border-b border-white/10 pb-4">
    <h3 class="text-sm font-medium mb-1">{post.title || 'Untitled'}</h3>
    {#if post.content}
      <p class="text-sm text-white/80 whitespace-pre-wrap">{post.content}</p>
    {/if}
    <div class="text-xs text-white/40 mt-2">
      {new Date(post.createdAt).toLocaleDateString()}
    </div>
  </div>
{/if}
