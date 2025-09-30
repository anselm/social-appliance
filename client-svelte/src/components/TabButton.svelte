<script lang="ts">
  export let active = false
  export let label: string
</script>

<button
  on:click
  class="pb-2 text-xs uppercase tracking-wider {active ? 'border-b border-white' : 'text-white/60 hover:text-white'}"
>
  {label}
</button>
