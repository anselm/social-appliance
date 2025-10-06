<script lang="ts">
  import type { Entity } from '../types'
  import { renderMarkdown } from '../utils/markdown'
  import RouterLink from './RouterLink.svelte'
  import EntityHeader from './EntityHeader.svelte'
  import EntityManagementControls from './EntityManagementControls.svelte'

  export let entity: Entity
  export let children: Entity[] = []
  
  function stripHtml(html: string): string {
    const tmp = document.createElement('div')
    tmp.innerHTML = html
    return tmp.textContent || tmp.innerText || ''
  }
  
  function getPreview(content: string, maxLength: number = 200): string {
    const rendered = renderMarkdown(content)
    const text = stripHtml(rendered)
    return text.substring(0, maxLength) + (text.length > maxLength ? '...' : '')
  }
</script>

<EntityManagementControls {entity} showNewEntityButton={true}>
  <div slot="content">
    <!-- Empty - EntityHeader handles the display -->
  </div>
  
  <div slot="main">
    <EntityHeader {entity} />

    {#if children.length > 0}
      <div class="space-y-6">
        {#each children as child}
          <RouterLink to={child.slug || `/${child.id}`} className="block bg-white/5 rounded-lg overflow-hidden hover:bg-white/10 transition-colors">
            {#if child.depiction}
              <img 
                src={child.depiction} 
                alt={child.title || 'Image'} 
                class="w-full h-64 object-cover"
              />
            {/if}
            <div class="p-6">
              <div class="flex items-start justify-between mb-3">
                <div>
                  <span class="text-xs text-white/40 uppercase tracking-wider">[{child.type}]</span>
                  <h3 class="text-lg font-medium mt-1">{child.title || child.slug || 'Untitled'}</h3>
                </div>
                <span class="text-xs text-white/40">{new Date(child.createdAt).toLocaleDateString()}</span>
              </div>
              {#if child.content}
                <p class="text-sm text-white/70 leading-relaxed">{getPreview(child.content)}</p>
              {/if}
              <div class="mt-4 text-xs text-white/40">
                Last updated: {new Date(child.updatedAt).toLocaleString()}
              </div>
            </div>
          </RouterLink>
        {/each}
      </div>
    {:else if entity.type === 'group'}
      <div class="text-xs text-white/60">No content in this group yet</div>
    {/if}
  </div>
</EntityManagementControls>
