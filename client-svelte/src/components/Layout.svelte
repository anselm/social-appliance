<script lang="ts">
  import Header from './Header.svelte'
  import { config } from '../stores/appConfig'
  import type { Snippet } from 'svelte'
  
  let { currentPath = '/', currentEntity = null, children }: { currentPath?: string, currentEntity?: any, children?: Snippet } = $props()
  
  let containerClass = $derived($config.layout?.containerClass || 'max-w-4xl mx-auto px-4 py-8')
</script>

<div class="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
  <Header {currentPath} {currentEntity} />
  <div class={containerClass}>
    <main>
      {#if children}
        {@render children()}
      {/if}
    </main>
  </div>
</div>
