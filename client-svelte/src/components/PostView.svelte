<script lang="ts">
  import type { Entity } from '../types'
  import { renderMarkdown } from '../utils/markdown'
  import RouterLink from './RouterLink.svelte'

  export let entity: Entity
</script>

<div>
  <div class="mb-8">
    <h1 class="text-2xl mb-4">{entity.title || entity.slug || 'Untitled'}</h1>
    {#if entity.depiction}
      <img 
        src={entity.depiction} 
        alt={entity.title || 'Post image'} 
        class="w-full max-w-3xl mb-6 rounded"
      />
    {/if}
    {#if entity.content}
      <div class="prose prose-invert max-w-none">
        {@html renderMarkdown(entity.content)}
      </div>
    {/if}
    <div class="mt-8 text-xs text-white/40 border-t border-white/10 pt-4">
      <div>Created: {new Date(entity.createdAt).toLocaleString()}</div>
      <div>Updated: {new Date(entity.updatedAt).toLocaleString()}</div>
    </div>
  </div>
  <RouterLink to="/" className="text-xs text-white/60 hover:text-white underline">← Back to home</RouterLink>
</div>
