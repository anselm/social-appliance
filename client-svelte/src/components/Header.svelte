<script lang="ts">
  import { config } from '../stores/appConfig'
  import { authStore } from '../stores/auth'
  import RouterLink from './RouterLink.svelte'
  
  export let currentPath: string = '/'
  export let currentEntity: any = null
  
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
  }
</script>

{#if showHeader}
  <header class="border-b border-white/20 mb-8 pb-4">
    <div class="flex items-center justify-between">
      <RouterLink to="/" className="text-xl font-bold hover:text-white/80 transition-colors">
        {title}
      </RouterLink>
      
      <nav class="flex items-center gap-4 text-sm">
        {#if $authStore}
          <span class="text-white/60">
            {getDisplayName($authStore)}
          </span>
          <button 
            on:click={handleLogout}
            class="hover:text-white/80 transition-colors"
          >
            Logout
          </button>
        {:else}
          {#if showLogin}
            <RouterLink to="/login" className="hover:text-white/80 transition-colors">
              Login
            </RouterLink>
          {/if}
        {/if}
      </nav>
    </div>
  </header>
{/if}
