<script lang="ts">
  import Header from './Header.svelte'
  import { config } from '../stores/appConfig'
  import { themeStore } from '../stores/theme'
  import type { Snippet } from 'svelte'
  
  let { currentPath = '/', currentEntity = null, children }: { currentPath?: string, currentEntity?: any, children?: Snippet } = $props()
  
  // Initialize theme on mount
  $effect(() => {
    themeStore.init()
  })
</script>

<div class="min-h-screen bg-white dark:bg-gradient-to-br dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 text-black dark:text-white flex flex-col">
  <Header {currentPath} {currentEntity} />
  <div class="flex-1 w-full max-w-container mx-auto flex flex-col">
    <main class="flex-1 flex flex-col">
      {#if children}
        {@render children()}
      {/if}
    </main>
  </div>
</div>
