<script lang="ts">
  import type { Entity } from '../types'
  import { renderMarkdown } from '../utils/markdown'
  
  export let entity: Entity
</script>

<div class="mb-6">
  <h1 class="text-2xl font-bold mb-2">{entity.title || entity.slug || 'Untitled'}</h1>
  {#if entity.slug}
    <p class="text-xs text-white/40 font-mono">{entity.slug}</p>
  {/if}
  
  {#if entity.depiction}
    <div class="mt-4 mb-4">
      <img src={entity.depiction} alt={entity.title} class="max-w-full h-auto rounded" />
    </div>
  {/if}
  
  {#if entity.content}
    <div class="prose prose-invert max-w-none mt-4">
      {@html renderMarkdown(entity.content)}
    </div>
  {/if}
</div>
