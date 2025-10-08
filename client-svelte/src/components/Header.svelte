<script lang="ts">
  import { config } from '../stores/appConfig'
  import { authStore } from '../stores/auth'
  import RouterLink from './RouterLink.svelte'
  
  let { currentPath = '/', currentEntity = null }: { currentPath?: string, currentEntity?: any } = $props()
  
  let menuOpen = $state(false)
  let searchQuery = $state('')
  
  let showHeader = $derived($config.header?.show !== false)
  let title = $derived($config.header?.title || 'Social Appliance')
  let showLogin = $derived($config.header?.showLogin !== false)
  
  function getDisplayName(auth: any): string {
    if (!auth) return ''
    if (auth.type === 'siwe') {
      if (auth.ensName) {
        return auth.ensName
      }
      if (auth.address) {
        return `${auth.address.substring(0, 6)}...${auth.address.substring(auth.address.length - 4)}`
      }
    }
    if (auth.type === 'magic' && auth.email) {
      return auth.email
    }
    return 'User'
  }
  
  async function handleLogout() {
    if ($authStore?.type === 'magic') {
      try {
        const { getMagic } = await import('../lib/magic')
        const magic = getMagic()
        await magic.user.logout()
      } catch (e) {
        console.error('Magic logout error:', e)
      }
    }
    authStore.logout()
    menuOpen = false
  }
  
  function toggleMenu() {
    menuOpen = !menuOpen
  }
  
  function closeMenu() {
    menuOpen = false
  }
  
  function handleSearch(e: Event) {
    e.preventDefault()
    if (!searchQuery.trim()) return
    
    // Get current URL and add/update the q parameter
    const url = new URL(window.location.href)
    url.searchParams.set('q', searchQuery.trim())
    
    // Force reload with the new search parameter
    window.location.href = url.toString()
  }
  
  function handleCreate() {
    console.log('Create button clicked')
    // TODO: Implement create functionality
  }
  
  function handleNotifications() {
    console.log('Notifications clicked')
    // TODO: Implement notifications functionality
  }
</script>

{#if showHeader}
  <!-- Main Header Bar -->
  <header class="sticky top-0 z-50 bg-black border-b border-white/10">
    <div class="max-w-7xl mx-auto px-4">
      <div class="flex items-center justify-between h-14 gap-4">
        <!-- Logo -->
        <RouterLink to="/" className="flex items-center gap-2 hover:text-white/80 transition-opacity flex-shrink-0">
          {#snippet children()}
            <span class="font-medium text-sm">{title}</span>
          {/snippet}
        </RouterLink>
        
        <!-- Search Bar -->
        <form onsubmit={handleSearch} class="flex-1 max-w-md">
          <div class="relative">
            <input
              type="text"
              bind:value={searchQuery}
              placeholder="Search..."
              class="w-full bg-black border border-white/10 px-3 py-1.5 pl-9 text-xs focus:outline-none focus:border-white/20 transition-colors"
            />
            <svg 
              class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/40"
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </form>
        
        <!-- Action Buttons -->
        <div class="flex items-center gap-1">
          <!-- Create Button -->
          <button
            onclick={handleCreate}
            class="hidden sm:flex items-center gap-1.5 px-3 py-1.5 border border-white/10 hover:border-white/20 text-xs transition-colors"
            title="Create new content"
          >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            <span>Create</span>
          </button>
          
          <!-- Notifications Bell -->
          <button
            onclick={handleNotifications}
            class="relative p-2 hover:bg-white/5 transition-colors"
            title="Notifications"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <!-- Notification Badge -->
            <span class="absolute top-1 right-1 w-1.5 h-1.5 bg-white rounded-full"></span>
          </button>
          
          <!-- Hamburger Menu Button -->
          <button
            onclick={toggleMenu}
            class="p-2 hover:bg-white/5 transition-colors"
            aria-label="Menu"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {#if menuOpen}
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              {:else}
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              {/if}
            </svg>
          </button>
        </div>
      </div>
    </div>
  </header>

  <!-- Dropdown Menu -->
  {#if menuOpen}
    <!-- Backdrop -->
    <button
      class="fixed inset-0 z-40 bg-black/80"
      onclick={closeMenu}
      aria-label="Close menu"
    ></button>
    
    <!-- Menu Panel -->
    <nav class="fixed top-14 right-4 z-50 w-56 bg-black border border-white/10">
      <div class="p-3 space-y-3">
        <!-- User Info -->
        {#if $authStore}
          <div class="border-b border-white/10 pb-3">
            <div class="text-xs text-white/40 mb-1">Signed in as</div>
            <div class="text-xs font-medium">{getDisplayName($authStore)}</div>
            <div class="text-xs text-white/30 mt-1">
              {$authStore.type === 'siwe' ? 'MetaMask' : 'Magic.link'}
            </div>
          </div>
        {/if}
        
        <!-- Navigation Links -->
        <div class="space-y-1" onclick={closeMenu}>
          <RouterLink 
            to="/" 
            className="block px-2 py-1.5 text-xs hover:bg-white/5 transition-colors"
          >
            {#snippet children()}
              Home
            {/snippet}
          </RouterLink>
          
          {#if $authStore}
            <RouterLink 
              to="/profile" 
              className="block px-2 py-1.5 text-xs hover:bg-white/5 transition-colors"
            >
              {#snippet children()}
                Profile
              {/snippet}
            </RouterLink>
          {/if}
          
          <RouterLink 
            to="/admin" 
            className="block px-2 py-1.5 text-xs hover:bg-white/5 transition-colors"
          >
            {#snippet children()}
              Admin
            {/snippet}
          </RouterLink>
          
          <RouterLink 
            to="/testmap" 
            className="block px-2 py-1.5 text-xs hover:bg-white/5 transition-colors"
          >
            {#snippet children()}
              Test Map
            {/snippet}
          </RouterLink>
          
          <button 
            class="block w-full text-left px-2 py-1.5 text-xs text-white/40 hover:bg-white/5 transition-colors cursor-not-allowed"
            disabled
          >
            Settings
          </button>
        </div>
        
        <!-- Auth Actions -->
        <div class="border-t border-white/10 pt-3">
          {#if $authStore}
            <button 
              onclick={handleLogout}
              class="w-full px-3 py-1.5 border border-white/10 hover:bg-white/5 transition-colors text-xs"
            >
              Logout
            </button>
          {:else}
            {#if showLogin}
              <div onclick={closeMenu}>
                <RouterLink 
                  to="/login" 
                  className="block w-full px-3 py-1.5 border border-white/10 hover:bg-white/5 transition-colors text-xs text-center"
                >
                  {#snippet children()}
                    Login
                  {/snippet}
                </RouterLink>
              </div>
            {/if}
          {/if}
        </div>
      </div>
    </nav>
  {/if}
{/if}
