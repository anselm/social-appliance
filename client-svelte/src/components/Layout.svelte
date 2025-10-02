<script lang="ts">
  import { auth } from '../stores/auth'
  import { config, headerConfig } from '../stores/config'
  import { navigateTo } from '../utils/navigation'
  import RouterLink from './RouterLink.svelte'

  // Build info - will be replaced at build time
  const buildDate = __BUILD_DATE__
  const buildRevision = __BUILD_REVISION__

  function handleLogout() {
    auth.logout()
    navigateTo('/')
  }
  
  $: customHeader = $config.methods?.renderHeader?.($config)
</script>

<div class="min-h-screen flex flex-col">
  {#if $headerConfig.enabled}
    {#if customHeader}
      <!-- Custom header HTML -->
      <header class={$headerConfig.className}>
        <div class="max-w-6xl mx-auto px-4 py-2">
          {@html customHeader}
        </div>
      </header>
    {:else}
      <!-- Default configurable header -->
      <header class="border-b border-white/20 px-4 py-2">
        <div class="max-w-6xl mx-auto flex items-center justify-between">
          <RouterLink to="/" className="text-xs uppercase tracking-wider hover:underline">
            {$config.appTitle}
          </RouterLink>
          <nav class="flex items-center gap-4 text-xs">
            {#if $config.features.authentication && $auth}
              <RouterLink to="/admin" className="hover:underline">
                admin
              </RouterLink>
              <span class="text-white/60">[{$auth.slug}]</span>
              <button on:click={handleLogout} class="hover:underline">
                logout
              </button>
            {:else if $config.features.authentication}
              <RouterLink to="/login" className="hover:underline">
                login
              </RouterLink>
            {/if}
            <span class="text-white/40 text-xs">
              {buildRevision}
            </span>
          </nav>
        </div>
      </header>
    {/if}
  {/if}
  
  <main class="flex-1 px-4 py-8">
    <div class="max-w-6xl mx-auto">
      <slot />
    </div>
  </main>
</div>
