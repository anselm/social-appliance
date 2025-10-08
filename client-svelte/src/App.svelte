<script lang="ts">
  import Layout from './components/Layout.svelte'
  import EntityView from './pages/EntityView.svelte'
  import Login from './pages/siwe-magic-login.svelte'
  import Admin from './pages/Admin.svelte'
  import { config } from './stores/appConfig'
  import { authStore } from './stores/auth'
  import { router } from './lib/router'
  
  let { url = "" }: { url?: string } = $props()
  
  // Initialize auth store
  authStore.init()
  
  // Get routing config
  let routingMode = $derived($config.routing?.mode || 'query')
  let basePath = $derived($config.routing?.basePath || '')
  
  // Initialize router
  $effect(() => {
    router.init({
      mode: routingMode,
      basePath: basePath
    })
  })
  
  // Subscribe to current path
  let currentPath = $state('/')
  
  $effect(() => {
    const unsubscribe = router.path.subscribe(path => {
      currentPath = path
      console.log('Router path changed:', path)
    })
    
    return unsubscribe
  })
  
  // Determine component props
  let componentProps = $derived({ path: currentPath })
</script>

<Layout>
  {#snippet children()}
    {#key currentPath}
      {#if currentPath === '/login'}
        <Login />
      {:else if currentPath === '/admin'}
        <Admin />
      {:else}
        <EntityView {...componentProps} />
      {/if}
    {/key}
  {/snippet}
</Layout>
