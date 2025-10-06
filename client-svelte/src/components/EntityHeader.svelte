<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import { authStore } from '../stores/auth'
  import { config } from '../stores/appConfig'
  import { renderMarkdown } from '../utils/markdown'
  import type { Entity } from '../types'

  export let entity: Entity
  
  const dispatch = createEventDispatcher()
</script>

<div class="mb-8">
  <h1 class="text-lg mb-2">{entity.title || entity.slug || 'Untitled'}</h1>
  {#if entity.depiction}
    <div class="mb-6 -mx-4 md:mx-0">
      <img 
        src={entity.depiction} 
        alt={entity.title || 'Banner'} 
        class="w-full h-32 md:h-40 object-cover rounded-none md:rounded"
      />
    </div>
  {/if}
  {#if entity.content}
    <div class="text-sm text-white/60 prose-content">
      {@html renderMarkdown(entity.content)}
    </div>
  {/if}
</div>

<hr/>
<br/>
