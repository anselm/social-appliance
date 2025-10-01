<script lang="ts">
  import { Link, navigate } from 'svelte-routing'
  import { auth } from '../stores/auth'
  import { config, headerConfig } from '../stores/config'

  function handleLogout() {
    auth.logout()
    navigate('/')
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
          <Link to="/" class="text-xs uppercase tracking-wider hover:underline">
            {$config.appTitle}
          </Link>
          <nav class="flex items-center gap-4 text-xs">
            {#if $config.features.authentication && $auth}
              <Link to="/admin" class="hover:underline">
                admin
              </Link>
              <span class="text-white/60">[{$auth.slug}]</span>
              <button on:click={handleLogout} class="hover:underline">
                logout
              </button>
            {:else if $config.features.authentication}
              <Link to="/login" class="hover:underline">
                login
              </Link>
            {/if}
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
