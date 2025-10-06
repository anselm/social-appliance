<script lang="ts">
  import { config } from '../stores/appConfig'
  import { navigateTo } from '../utils/navigation'
  
  export let to: string
  export let className: string = ''
  
  $: routingMode = $config.routing?.mode || 'query'
  
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
  on:click={handleClick}
>
  <slot />
</a>
