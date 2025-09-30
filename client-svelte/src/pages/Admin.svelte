<script lang="ts">
  import TabButton from '../components/TabButton.svelte'
  import EntitiesTab from '../components/admin/EntitiesTab.svelte'
  import CreateTab from '../components/admin/CreateTab.svelte'
  import StatsTab from '../components/admin/StatsTab.svelte'
  
  let activeTab: 'entities' | 'create' | 'stats' = 'entities'
  let entitiesTab: EntitiesTab
  let statsTab: StatsTab
  
  $: if (activeTab === 'entities' && entitiesTab) {
    entitiesTab.loadEntities()
  } else if (activeTab === 'stats' && statsTab) {
    statsTab.loadStats()
  }
  
  function handleEntityCreated() {
    activeTab = 'entities'
  }
</script>

<div>
  <h1 class="text-xs uppercase tracking-wider mb-6">Admin Panel</h1>
  
  <!-- Tabs -->
  <div class="flex gap-4 mb-6 border-b border-white/20">
    <TabButton 
      active={activeTab === 'entities'}
      label="Entities"
      on:click={() => activeTab = 'entities'}
    />
    <TabButton 
      active={activeTab === 'create'}
      label="Create"
      on:click={() => activeTab = 'create'}
    />
    <TabButton 
      active={activeTab === 'stats'}
      label="Stats"
      on:click={() => activeTab = 'stats'}
    />
  </div>

  <!-- Tab Content -->
  {#if activeTab === 'entities'}
    <EntitiesTab bind:this={entitiesTab} />
  {:else if activeTab === 'create'}
    <CreateTab on:created={handleEntityCreated} />
  {:else if activeTab === 'stats'}
    <StatsTab bind:this={statsTab} />
  {/if}
</div>
