<script lang="ts">
  import { api } from '../services/api'
  import { authStore } from '../stores/auth'
  import { config } from '../stores/appConfig'
  import RouterLink from '../components/RouterLink.svelte'
  import EntityForm from '../components/EntityForm.svelte'
  import EntityDisplay from '../components/EntityDisplay.svelte'
  import EntityActions from '../components/EntityActions.svelte'
  import PostView from '../components/PostView.svelte'
  import GroupViewGrid from '../components/GroupViewGrid.svelte'
  import GroupViewList from '../components/GroupViewList.svelte'
  import GroupViewCards from '../components/GroupViewCards.svelte'
  import GroupViewDefault from '../components/GroupViewDefault.svelte'
  import { navigateTo } from '../utils/navigation'
  import { canUserEditEntity, getParentSlug } from '../utils/entityHelpers'
  import type { Entity } from '../types'

  export let path: string = '/'
  export let wildcard: string = ''

  $: routingMode = $config.routing?.mode || 'query'
  let slug: string = routingMode === 'query' ? path : (wildcard || '/')
  
  let entity: Entity | null = null
  let children: Entity[] = []
  let loading = true
  let error: string | null = null
  let currentLoadingSlug: string | null = null
  let hasAttemptedLoad = false
  let editMode = false
  let deleting = false

  $: {
    const newSlug = routingMode === 'query' ? path : (wildcard || '/')
    if (newSlug !== slug) {
      slug = newSlug
      hasAttemptedLoad = false
      editMode = false
      loadEntity(slug)
    } else if (slug && !currentLoadingSlug && !entity && !hasAttemptedLoad) {
      loadEntity(slug)
    }
  }
  
  $: canEdit = canUserEditEntity(entity, $authStore)

  async function loadEntity(targetSlug: string) {
    if (currentLoadingSlug === targetSlug) return
    
    hasAttemptedLoad = true
    currentLoadingSlug = targetSlug
    loading = true
    error = null
    entity = null
    children = []
    
    try {
      const querySlug = targetSlug.startsWith('/') ? targetSlug : `/${targetSlug}`
      const entityData = await api.getEntityBySlug(querySlug)
      
      if (!entityData) {
        throw new Error(`Entity not found: ${querySlug}`)
      }
      
      entity = entityData
      
      if (entity.type === 'group') {
        try {
          const childrenData = await api.queryEntities({ 
            parentId: entity.id,
            limit: 100 
          })
          
          children = (childrenData || []).sort((a, b) => {
            const dateA = new Date(a.updatedAt).getTime()
            const dateB = new Date(b.updatedAt).getTime()
            return dateB - dateA
          })
        } catch (childErr) {
          console.error('EntityView: Failed to load children:', childErr)
          children = []
        }
      }
    } catch (err: any) {
      console.error('EntityView: Failed to load entity:', err)
      
      if (err.status === 404 || err.message?.includes('not found') || err.message?.includes('Entity not found')) {
        error = `Page not found: ${targetSlug}`
      } else if (err.status === 403) {
        error = 'You do not have permission to view this page'
      } else if (err.message === 'Failed to fetch' || err.code === 'ECONNREFUSED') {
        error = 'Server unavailable'
      } else {
        error = err.message || 'Failed to load page'
      }
      entity = null
      children = []
    } finally {
      loading = false
      currentLoadingSlug = null
    }
  }

  async function handleEditEntity(event: CustomEvent) {
    if (!entity || !$authStore) return
    
    const updates = event.detail
    
    try {
      await api.updateEntity(entity.id, {
        title: updates.title,
        content: updates.content,
        slug: updates.slug,
        view: updates.view,
        depiction: updates.depiction
      })
      
      editMode = false
      
      if (updates.slug !== entity.slug) {
        navigateTo(updates.slug)
      } else {
        await loadEntity(slug)
      }
    } catch (error: any) {
      console.error('Failed to update entity:', error)
      alert('Failed to update entity: ' + (error.message || error))
    }
  }
  
  async function handleDeleteEntity() {
    if (!entity || !canEdit || deleting) return
    
    const confirmed = confirm(`Are you sure you want to delete "${entity.title || entity.slug}"?\n\nThis action cannot be undone.`)
    if (!confirmed) return
    
    deleting = true
    
    try {
      await api.deleteEntity(entity.id)
      const parentSlug = getParentSlug(entity.slug || '/')
      navigateTo(parentSlug)
    } catch (error: any) {
      console.error('Failed to delete entity:', error)
      alert('Failed to delete entity: ' + (error.message || error))
      deleting = false
    }
  }
</script>

{#if loading}
  <div class="text-xs text-white/60">Loading...</div>
{:else if error}
  <div class="space-y-4">
    <div class="text-sm text-red-400">{error}</div>
    <RouterLink to="/" className="text-xs text-white/60 hover:text-white underline">← Back to home</RouterLink>
  </div>
{:else if !entity}
  <div class="space-y-4">
    <div class="text-sm text-white/60">Page not found</div>
    <RouterLink to="/" className="text-xs text-white/60 hover:text-white underline">← Back to home</RouterLink>
  </div>
{:else}
  {#if editMode}
    <div class="mb-8">
      <EntityForm
        {entity}
        parentSlug={getParentSlug(entity.slug || '/')}
        mode="edit"
        on:submit={handleEditEntity}
        on:cancel={() => editMode = false}
      />
    </div>
  {:else}
    <div class="flex items-start justify-between gap-4 mb-6">
      <div class="flex-1">
        <EntityDisplay {entity} />
      </div>
      <EntityActions 
        {canEdit} 
        {deleting}
        on:edit={() => editMode = true}
        on:delete={handleDeleteEntity}
      />
    </div>
    
    {#if entity.type === 'post'}
      <PostView {entity} />
    {:else if entity.view === 'grid'}
      <GroupViewGrid {entity} {children} />
    {:else if entity.view === 'cards'}
      <GroupViewCards {entity} {children} />
    {:else if entity.view === 'list'}
      <GroupViewList {entity} {children} />
    {:else}
      <GroupViewDefault {entity} {children} />
    {/if}
  {/if}
{/if}
