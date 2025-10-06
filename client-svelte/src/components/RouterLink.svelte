<script lang="ts">
  import { config } from '../stores/appConfig'
  import { navigateTo } from '../utils/navigation'
  import type { Snippet } from 'svelte'
  
  let { to, className = '', children }: { to: string, className?: string, children?: Snippet } = $props()
  
  let routingMode = $derived($config.routing?.mode || 'query')
  
  function handleClick(event: MouseEvent) {
    if (routingMode === 'query') {
      event.preventDefault()
      navigateTo(to)
    }
    // For path mode, let the default link behavior work
  }
</script>

<a 
  href={routingMode === 'query' ? `?path=${encodeURIComponent(to)}` : to}
  class={className}
  onclick={handleClick}
>
  {#if children}
    {@render children()}
  {/if}
</a>
