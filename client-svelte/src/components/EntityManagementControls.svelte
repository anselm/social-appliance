<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import { authStore } from '../stores/auth'
  import EntityForm from './EntityForm.svelte'
  import EntityActions from './EntityActions.svelte'
  import { canUserEditEntity, getParentSlug } from '../utils/entityHelpers'
  import type { Entity } from '../types'
  
  export let entity: Entity
  export let onUpdate: (updates: any) => Promise<void>
  export let onDelete: () => Promise<void>
  export let showNewEntityButton: boolean = false
  export let onCreateChild: ((entityData: any) => Promise<void>) | null = null
  
  const dispatch = createEventDispatcher()
  
  let editMode = false
  let deleting = false
  let showNewEntityForm = false
  let creatingEntity = false
  
  $: canEdit = canUserEditEntity(entity, $authStore)
  $: canCreateChild = showNewEntityButton && entity.type === 'group' && $authStore
  
  async function handleEdit() {
    editMode = true
  }
  
  async function handleEditSubmit(event: CustomEvent) {
    const updates = event.detail
    
    try {
      await onUpdate(updates)
      editMode = false
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
      await onDelete()
    } catch (error: any) {
      console.error('Failed to delete entity:', error)
      alert('Failed to delete entity: ' + (error.message || error))
      deleting = false
    }
  }
  
  async function handleCreateChildSubmit(event: CustomEvent) {
    if (creatingEntity || !onCreateChild) return
    
    const entityData = event.detail
    
    if (!$authStore) {
      alert('You must be logged in to create entities')
      return
    }
    
    creatingEntity = true
    
    try {
      await onCreateChild(entityData)
      showNewEntityForm = false
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
          on:click={() => showNewEntityForm = true}
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
