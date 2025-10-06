<script lang="ts">
  import { authStore } from '../stores/auth'
  import { api } from '../services/api'
  import EntityForm from './EntityForm.svelte'
  import EntityActions from './EntityActions.svelte'
  import { canUserEditEntity, getParentSlug } from '../utils/entityHelpers'
  import type { Entity } from '../types'
  
  let { entity, showNewEntityButton = false }: { entity: Entity, showNewEntityButton?: boolean } = $props()
  
  let editMode = $state(false)
  let deleting = $state(false)
  let showNewEntityForm = $state(false)
  let creatingEntity = $state(false)
  
  let canEdit = $derived(canUserEditEntity(entity, $authStore))
  let canCreateChild = $derived(showNewEntityButton && entity.type === 'group' && $authStore)
  
  async function handleEdit() {
    editMode = true
  }
  
  async function handleEditSubmit(event: CustomEvent) {
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
      
      // If slug changed, navigate to new slug
      if (updates.slug !== entity.slug) {
        window.location.href = `?path=${encodeURIComponent(updates.slug)}`
      } else {
        // Reload current page
        window.location.reload()
      }
    } catch (error: any) {
      console.error('Failed to update entity:', error)
      alert('Failed to update entity: ' + (error.message || error))
    }
  }
  
  async function handleDelete() {
    if (deleting) return
    
    const confirmed = confirm(`Are you sure you want to delete "${entity.title || entity.slug}"?\n\nThis action cannot be undone.`)
    if (!confirmed) return
    
    deleting = true
    
    try {
      await api.deleteEntity(entity.id)
      
      // Navigate to parent
      const parentSlug = getParentSlug(entity.slug || '/')
      window.location.href = `?path=${encodeURIComponent(parentSlug)}`
    } catch (error: any) {
      console.error('Failed to delete entity:', error)
      alert('Failed to delete entity: ' + (error.message || error))
      deleting = false
    }
  }
  
  async function handleCreateChildSubmit(event: CustomEvent) {
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
        sponsorId: $authStore.address || $authStore.issuer,
        parentId: entity.id
      }
      
      if (entityData.view) data.view = entityData.view
      if (entityData.depiction) data.depiction = entityData.depiction
      
      let result
      if (entityData.type === 'group') {
        result = await api.createGroup(data)
      } else if (entityData.type === 'party') {
        result = await api.createUser(data)
      } else {
        result = await api.createPost(data)
      }
      
      showNewEntityForm = false
      
      // Navigate to new entity
      if (result?.slug) {
        window.location.href = `?path=${encodeURIComponent(result.slug)}`
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
</script>

{#if editMode}
  <div class="mb-8">
    <EntityForm
      {entity}
      parentSlug={getParentSlug(entity.slug || '/')}
      mode="edit"
      on:submit={handleEditSubmit}
      on:cancel={() => editMode = false}
    />
  </div>
{:else}
  <div class="flex items-start justify-between gap-4 mb-6">
    <div class="flex-1">
      <slot name="content" />
    </div>
    <EntityActions 
      {canEdit} 
      {deleting}
      on:edit={handleEdit}
      on:delete={handleDelete}
    />
  </div>
  
  <slot name="main" />
  
  {#if canCreateChild}
    <br/>
    <hr/>
    <br/>
    
    {#if !showNewEntityForm}
      <div class="mb-6">
        <button
          onclick={() => showNewEntityForm = true}
          class="px-3 py-1 border border-white/20 hover:bg-white hover:text-black transition-colors text-xs uppercase tracking-wider"
        >
          + New Entity
        </button>
      </div>
    {/if}
    
    {#if showNewEntityForm}
      <div class="mb-8">
        <EntityForm
          parentSlug={entity.slug || '/'}
          mode="create"
          on:submit={handleCreateChildSubmit}
          on:cancel={() => showNewEntityForm = false}
        />
      </div>
    {/if}
  {/if}
{/if}
