<script lang="ts">
  import { Link } from 'svelte-routing'
  import { navigateTo, createHref } from '../utils/navigation'
  import { config } from '../stores/appConfig'
  
  export let to: string
  export let className: string = ''
  
  $: routingMode = $config.routing.mode
  
  function handleClick(e: MouseEvent) {
    e.preventDefault()
    if (routingMode === 'query') {
      navigateTo(to)
    } else {
      // For path mode, let svelte-routing handle it
      // But we still need to prevent default and call navigate
      navigateTo(to)
    }
  }
</script>

{#if routingMode === 'path'}
  <Link {to} class={className}>
    <slot />
  </Link>
{:else}
  <a href={createHref(to)} class={className} on:click={handleClick}>
    <slot />
  </a>
{/if}
