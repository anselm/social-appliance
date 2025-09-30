<script lang="ts">
  import type { Entity } from '../types'
  
  export let post: Entity
</script>

<div class="border-b border-white/10 pb-4">
  <h3 class="text-sm font-medium mb-1">{post.title || 'Untitled'}</h3>
  {#if post.content}
    <p class="text-sm text-white/80 whitespace-pre-wrap">{post.content}</p>
  {/if}
  <div class="text-xs text-white/40 mt-2">
    {new Date(post.createdAt).toLocaleDateString()}
  </div>
</div>
