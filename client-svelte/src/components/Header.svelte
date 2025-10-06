<script lang="ts">
  import { config } from '../stores/appConfig'
  import { authStore } from '../stores/auth'
  import RouterLink from './RouterLink.svelte'
  
  export let currentPath: string = '/'
  export let currentEntity: any = null
  
  let menuOpen = false
  
  $: showHeader = $config.header?.show !== false
  $: title = $config.header?.title || 'Social Appliance'
  $: showLogin = $config.header?.showLogin !== false
  
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
</script>

{#if showHeader}
  <!-- Hamburger Button - Fixed Position -->
  <button
    on:click={toggleMenu}
    class="fixed top-4 right-4 z-50 w-10 h-10 flex flex-col items-center justify-center gap-1.5 bg-black/80 border border-white/20 hover:border-white/40 transition-colors backdrop-blur-sm"
    aria-label="Menu"
  >
    <span class="w-5 h-0.5 bg-white transition-transform {menuOpen ? 'rotate-45 translate-y-2' : ''}"></span>
    <span class="w-5 h-0.5 bg-white transition-opacity {menuOpen ? 'opacity-0' : ''}"></span>
    <span class="w-5 h-0.5 bg-white transition-transform {menuOpen ? '-rotate-45 -translate-y-2' : ''}"></span>
  </button>

  <!-- Menu Overlay -->
  {#if menuOpen}
    <div
      class="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
      on:click={closeMenu}
    ></div>
    
    <nav class="fixed top-0 right-0 z-40 w-64 h-full bg-black border-l border-white/20 p-6 overflow-y-auto">
      <div class="mt-12 space-y-6">
        <!-- Title -->
        <div class="border-b border-white/20 pb-4">
          <RouterLink to="/" className="text-xl font-bold hover:text-white/80 transition-colors block" on:click={closeMenu}>
            {title}
          </RouterLink>
        </div>
        
        <!-- User Info -->
        {#if $authStore}
          <div class="border-b border-white/20 pb-4">
            <div class="text-xs text-white/60 mb-1">Signed in as</div>
            <div class="text-sm font-medium">{getDisplayName($authStore)}</div>
            <div class="text-xs text-white/40 mt-1">
              {$authStore.type === 'siwe' ? 'MetaMask' : 'Magic.link'}
            </div>
          </div>
        {/if}
        
        <!-- Navigation Links -->
        <div class="space-y-3">
          <RouterLink 
            to="/" 
            className="block text-sm hover:text-white/80 transition-colors"
            on:click={closeMenu}
          >
            Home
          </RouterLink>
          
          <RouterLink 
            to="/admin" 
            className="block text-sm hover:text-white/80 transition-colors"
            on:click={closeMenu}
          >
            Admin
          </RouterLink>
          
          <RouterLink 
            to="/testmap" 
            className="block text-sm hover:text-white/80 transition-colors"
            on:click={closeMenu}
          >
            Test Map
          </RouterLink>
          
          <button 
            class="block text-sm text-white/60 hover:text-white/80 transition-colors cursor-not-allowed"
            disabled
          >
            Settings (coming soon)
          </button>
        </div>
        
        <!-- Auth Actions -->
        <div class="border-t border-white/20 pt-4">
          {#if $authStore}
            <button 
              on:click={handleLogout}
              class="w-full px-4 py-2 border border-white/20 hover:bg-white hover:text-black transition-colors text-sm"
            >
              Logout
            </button>
          {:else}
            {#if showLogin}
              <RouterLink 
                to="/login" 
                className="block w-full px-4 py-2 border border-white/20 hover:bg-white hover:text-black transition-colors text-sm text-center"
                on:click={closeMenu}
              >
                Login
              </RouterLink>
            {/if}
          {/if}
        </div>
      </div>
    </nav>
  {/if}
{/if}
