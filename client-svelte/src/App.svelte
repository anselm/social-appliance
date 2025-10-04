<script lang="ts">
  import { Router, Route } from 'svelte-routing'
  import Layout from './components/Layout.svelte'
  import EntityView from './pages/EntityView.svelte'
  import Login from './pages/Login.svelte'
  import Admin from './pages/Admin.svelte'
  import { config } from './stores/appConfig'
  import { getCurrentPath } from './utils/navigation'
  import { onMount } from 'svelte'
  
  export let url = ""
  
  // Check routing mode from config
  $: routingMode = $config.routing?.mode || 'query'
  $: basePath = $config.routing?.basePath || ''
  
  // For query parameter routing
  let queryPath = getCurrentPath()
  
  // Update queryPath when navigation events occur
  function updateQueryPath() {
    const newPath = getCurrentPath()
    queryPath = newPath
  }
  
  // Listen for navigation events in query mode
  onMount(() => {
    if (routingMode === 'query') {
      window.addEventListener('popstate', updateQueryPath)
      window.addEventListener('navigate', updateQueryPath)
      
      return () => {
        window.removeEventListener('popstate', updateQueryPath)
        window.removeEventListener('navigate', updateQueryPath)
      }
    }
  })
  
  // Check if this is an invalid route (path without query parameter in query mode)
  $: isInvalidRoute = queryPath.startsWith('__INVALID__')
  $: actualPath = isInvalidRoute ? queryPath.substring('__INVALID__'.length) : queryPath
  
  // Determine which component to show based on path (for query mode)
  $: queryComponent = isInvalidRoute ? EntityView :
                      actualPath === '/login' ? Login : 
                      actualPath === '/admin' ? Admin : 
                      EntityView
  
  // Pass the path as a prop to EntityView (for query mode)
  $: queryComponentProps = queryComponent === EntityView ? { 
    path: isInvalidRoute ? actualPath : actualPath 
  } : {}
</script>

{#if routingMode === 'query'}
  <Layout>
    <svelte:component this={queryComponent} {...queryComponentProps} />
  </Layout>
{:else}
  <Router {url} {basePath}>
    <Layout>
      <Route path="/login" component={Login} />
      <Route path="/admin" component={Admin} />
      <Route path="/" component={EntityView} />
      <Route path="/*wildcard" component={EntityView} />
    </Layout>
  </Router>
{/if}
