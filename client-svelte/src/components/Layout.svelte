<script lang="ts">
  import Header from './Header.svelte'
  import { config } from '../stores/appConfig'
  
  $: containerClass = $config.layout?.containerClass || 'max-w-4xl mx-auto px-4 py-8'
</script>

<div class="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
  <div class={containerClass}>
    <Header />
    <main>
      <slot />
    </main>
  </div>
</div>
