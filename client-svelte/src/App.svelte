<script lang="ts">
  import { router } from './lib/router'
  import { config } from './stores/appConfig'
  import { authStore } from './stores/auth'
  import Layout from './components/Layout.svelte'
  import InstallPrompt from './components/InstallPrompt.svelte'
  import EntityView from './pages/EntityView.svelte'
  import Admin from './admin/Admin.svelte'
  import Login from './pages/Login.svelte'
  import SiweMagicLogin from './pages/siwe-magic-login.svelte'
  import Profile from './pages/Profile.svelte'
  
  let { url = "" }: { url?: string } = $props()
  
  // Get routing config
  let routingMode = $derived($config.routing?.mode || 'query')
  let basePath = $derived($config.routing?.basePath || '')
  
  // Initialize router
  let routerInitialized = $state(false)
  
  $effect(() => {
    if (!routerInitialized) {
      router.init({
        mode: routingMode,
        basePath: basePath
      })
      routerInitialized = true
    }
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
  
  // Determine which page to show based on path
  let currentPage = $derived.by(() => {
    const path = currentPath
    
    console.log('App: Determining page for path:', path)
    
    if (path === '/admin') return 'admin'
    if (path === '/login') return 'login'
    if (path === '/profile') return 'profile'
    if (path === '/testmap') return 'entity'
    
    return 'entity'
  })
  
  let currentEntity = $state(null)
</script>

<Layout {currentPath} {currentEntity}>
  {#snippet children()}
    {#key currentPath}
      {#if currentPage === 'admin'}
        <Admin />
      {:else if currentPage === 'login'}
        <SiweMagicLogin />
      {:else if currentPage === 'profile'}
        <Profile />
      {:else}
        <EntityView path={currentPath} />
      {/if}
    {/key}
  {/snippet}
</Layout>

<InstallPrompt />
