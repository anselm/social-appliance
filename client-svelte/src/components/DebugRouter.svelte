<script lang="ts">
  import { onMount } from 'svelte'
  
  onMount(() => {
    console.log('DebugRouter: Current URL:', window.location.href)
    console.log('DebugRouter: Pathname:', window.location.pathname)
    
    // Listen for navigation events
    window.addEventListener('popstate', (e) => {
      console.log('DebugRouter: popstate event', window.location.pathname)
    })
    
    // Intercept clicks on links
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement
      if (target.tagName === 'A' || target.closest('a')) {
        const link = (target.tagName === 'A' ? target : target.closest('a')) as HTMLAnchorElement
        console.log('DebugRouter: Link clicked:', link.href)
      }
    })
  })
</script>

<div class="fixed bottom-0 right-0 bg-black/80 text-xs text-green-400 p-2 font-mono">
  Path: {window.location.pathname}
</div>
