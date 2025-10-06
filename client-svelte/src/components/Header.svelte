<script lang="ts">
  import { config } from '../stores/appConfig'
  import { authStore } from '../stores/auth'
  import RouterLink from './RouterLink.svelte'
  import EntityForm from './EntityForm.svelte'
  import { api } from '../services/api'
  import { navigateTo } from '../utils/navigation'
  
  export let currentPath: string = '/'
  export let currentEntity: any = null
  
  $: showHeader = $config.header?.show !== false
  $: title = $config.header?.title || 'Social Appliance'
  $: showLogin = $config.header?.showLogin !== false
  
  let showEntityForm = false
  let creatingEntity = false
  
  function getDisplayName(auth: any): string {
    if (!auth) return ''
    if (auth.type === 'siwe') {
      if (auth.ensName) {
        return auth.ensName
      }
      if (auth.address) {
        return `${auth.address.substring(0, 6)}...${auth.address.substring(auth.address.length - 4)}`
      }
    }
    if (auth.type === 'magic' && auth.email) {
      return auth.email
    }
    return 'User'
  }
  
  async function handleLogout() {
    if ($authStore?.type === 'magic') {
      try {
        const { getMagic } = await import('../lib/magic')
        const magic = getMagic()
        await magic.user.logout()
      } catch (e) {
        console.error('Magic logout error:', e)
      }
    }
    authStore.logout()
  }
  
  async function handleCreateEntity(event: CustomEvent) {
    if (creatingEntity) return
    
    const entityData = event.detail
    
    if (!$authStore) {
      alert('You must be logged in to create entities')
      return
    }
    
    creatingEntity = true
    
    try {
      const data: any = {
        type: entityData.type,
        title: entityData.title,
        content: entityData.content,
        slug: entityData.slug,
        auth: $authStore.address || $authStore.issuer,
        sponsorId: $authStore.address || $authStore.issuer
      }
      
      if (entityData.view) data.view = entityData.view
      if (entityData.depiction) data.depiction = entityData.depiction
      if (currentEntity?.id) data.parentId = currentEntity.id
      
      let result
      if (entityData.type === 'group') {
        result = await api.createGroup(data)
      } else if (entityData.type === 'party') {
        result = await api.createUser(data)
      } else {
        result = await api.createPost(data)
      }
      
      showEntityForm = false
      
      if (result?.slug) {
        navigateTo(result.slug)
      } else {
        window.location.reload()
      }
    } catch (error: any) {
      console.error('Failed to create entity:', error)
      alert('Failed to create entity: ' + (error.message || error))
    } finally {
      creatingEntity = false
    }
  }
  
  function handleCancelCreate() {
    showEntityForm = false
  }
</script>

{#if showHeader}
  <header class="border-b border-white/20 mb-8 pb-4">
    <div class="flex items-center justify-between mb-4">
      <RouterLink to="/" className="text-xl font-bold hover:text-white/80 transition-colors">
        {title}
      </RouterLink>
      
      <nav class="flex items-center gap-4 text-sm">
        {#if $authStore}
          {#if !showEntityForm}
            <button
              on:click={() => showEntityForm = true}
              class="px-3 py-1 border border-white/20 hover:bg-white hover:text-black transition-colors text-xs uppercase tracking-wider"
            >
              + New Entity
            </button>
          {/if}
          <span class="text-white/60">
            {getDisplayName($authStore)}
          </span>
          <button 
            on:click={handleLogout}
            class="hover:text-white/80 transition-colors"
          >
            Logout
          </button>
        {:else}
          {#if showLogin}
            <RouterLink to="/login" className="hover:text-white/80 transition-colors">
              Login
            </RouterLink>
          {/if}
        {/if}
      </nav>
    </div>
    
    {#if showEntityForm}
      <div class="mt-4">
        <EntityForm
          parentSlug={currentPath}
          mode="create"
          on:submit={handleCreateEntity}
          on:cancel={handleCancelCreate}
        />
      </div>
    {/if}
  </header>
{/if}
