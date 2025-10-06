<script lang="ts">
  import { Router, Route } from 'svelte-routing'
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
  
  // Listen for navigation events in query mode
  $effect(() => {
    if (routingMode === 'query') {
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
    }
  })
  
  // Check if this is an invalid route (path without query parameter in query mode)
  let isInvalidRoute = $derived(queryPath.startsWith('__INVALID__'))
  let actualPath = $derived(isInvalidRoute ? queryPath.substring('__INVALID__'.length) : queryPath)
  
  // Determine which component to show based on path (for query mode)
  let queryComponent = $derived(
    isInvalidRoute ? EntityView :
    actualPath === '/login' ? Login :
    actualPath === '/admin' ? Admin :
    actualPath === '/testmap' ? TestMap :
    EntityView
  )
  
  // Pass the path as a prop to EntityView (for query mode)
  let queryComponentProps = $derived(
    queryComponent === EntityView ? { 
      path: isInvalidRoute ? actualPath : actualPath 
    } : {}
  )
  
  // Debug logging
  $effect(() => {
    console.log('App state:', { routingMode, queryPath, actualPath, componentName: queryComponent.name })
  })
</script>

{#if routingMode === 'query'}
  <Layout>
    {#key queryPath}
      <svelte:component this={queryComponent} {...queryComponentProps} />
    {/key}
  </Layout>
{:else}
  <Router {url}>
    <Layout>
      <Route path="/login" component={Login} />
      <Route path="/admin" component={Admin} />
      <Route path="/testmap" component={TestMap} />
      <Route path="/" component={EntityView} />
      <Route path="/*wildcard" component={EntityView} />
    </Layout>
  </Router>
{/if}
