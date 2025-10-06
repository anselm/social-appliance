<script lang="ts">
  import { config } from '../stores/appConfig'
  import { navigateTo } from '../utils/navigation'
  import { push } from 'svelte-spa-router'
  import type { Snippet } from 'svelte'
  
  let { to, className = '', children }: { to: string, className?: string, children?: Snippet } = $props()
  
  let routingMode = $derived($config.routing?.mode || 'query')
  
  function handleClick(event: MouseEvent) {
    event.preventDefault()
    
    if (routingMode === 'query') {
      navigateTo(to)
    } else {
      // Use svelte-spa-router's push for path-based routing
      push(to)
    }
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
