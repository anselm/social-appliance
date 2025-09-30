<script lang="ts">
  import { Link, navigate } from 'svelte-routing'
  import { getContext } from 'svelte'
  import type { AuthContext } from '../types'

  const { user, logout } = getContext<AuthContext>('auth')

  function handleLogout() {
    logout()
    navigate('/')
  }
</script>

<div class="min-h-screen flex flex-col">
  <header class="border-b border-white/20 px-4 py-2">
    <div class="max-w-6xl mx-auto flex items-center justify-between">
      <Link to="/" class="text-xs uppercase tracking-wider hover:underline">
        Social Appliance
      </Link>
      <nav class="flex items-center gap-4 text-xs">
        {#if $user}
          <Link to="/admin" class="hover:underline">
            admin
          </Link>
          <span class="text-white/60">[{$user.slug}]</span>
          <button on:click={handleLogout} class="hover:underline">
            logout
          </button>
        {:else}
          <Link to="/login" class="hover:underline">
            login
          </Link>
        {/if}
      </nav>
    </div>
  </header>
  <main class="flex-1 px-4 py-8">
    <div class="max-w-6xl mx-auto">
      <slot />
    </div>
  </main>
</div>
