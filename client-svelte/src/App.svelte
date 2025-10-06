<script lang="ts">
  import Layout from './components/Layout.svelte'
  import EntityView from './pages/EntityView.svelte'
  import Login from './pages/siwe-magic-login.svelte'
  import Admin from './pages/Admin.svelte'
  import TestMap from './pages/TestMap.svelte'
  import { config } from './stores/appConfig'
  import { authStore } from './stores/auth'
  import { getCurrentPath } from './utils/navigation'
  
  let { url = "" }: { url?: string } = $props()
  
  // Initialize auth store
  authStore.init()
  
  // Check routing mode from config
  let routingMode = $derived($config.routing?.mode || 'query')
  
  // For query parameter routing
  let queryPath = $state(getCurrentPath())
  
  // Update queryPath when navigation events occur
  function updateQueryPath() {
    const newPath = getCurrentPath()
    console.log('Navigation detected, new path:', newPath, 'old path:', queryPath)
    queryPath = newPath
  }
  
  // Listen for navigation events
  $effect(() => {
    // Update on popstate (back/forward buttons)
    window.addEventListener('popstate', updateQueryPath)
    // Update on our custom navigate event
    window.addEventListener('navigate', updateQueryPath)
    
    // Initial path check
    updateQueryPath()
    
    return () => {
      window.removeEventListener('popstate', updateQueryPath)
      window.removeEventListener('navigate', updateQueryPath)
    }
  })
  
  // Check if this is an invalid route (path without query parameter in query mode)
  let isInvalidRoute = $derived(queryPath.startsWith('__INVALID__'))
  let actualPath = $derived(isInvalidRoute ? queryPath.substring('__INVALID__'.length) : queryPath)
  
  // Pass the path as a prop to EntityView (for query mode)
  let queryComponentProps = $derived({ 
    path: isInvalidRoute ? actualPath : actualPath 
  })
  
  // Debug logging
  $effect(() => {
    console.log('App state:', { routingMode, queryPath, actualPath })
  })
</script>

<Layout>
  {#snippet children()}
    {#key queryPath}
      {#if actualPath === '/login'}
        <Login />
      {:else if actualPath === '/admin'}
        <Admin />
      {:else if actualPath === '/testmap'}
        <TestMap />
      {:else}
        <EntityView {...queryComponentProps} />
      {/if}
    {/key}
  {/snippet}
</Layout>
