<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  
  export let canEdit: boolean = false
  export let deleting: boolean = false
  
  const dispatch = createEventDispatcher()
</script>

{#if canEdit}
  <div class="flex gap-2">
    <button
      on:click={() => dispatch('edit')}
      class="px-3 py-1 border border-white/20 hover:bg-white hover:text-black transition-colors text-xs uppercase tracking-wider"
    >
      Edit
    </button>
    <button
      on:click={() => dispatch('delete')}
      disabled={deleting}
      class="px-3 py-1 border border-red-500/50 text-red-400 hover:bg-red-500 hover:text-white transition-colors text-xs uppercase tracking-wider disabled:opacity-50"
    >
      {deleting ? 'Deleting...' : 'Delete'}
    </button>
  </div>
{/if}
