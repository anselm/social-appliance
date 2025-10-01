<script lang="ts">
  import type { Entity } from '../types'
  import PostItem from './PostItem.svelte'
  import { renderMarkdown } from '../utils/markdown'

  export let children: Entity[] = []
  
  function stripHtml(html: string): string {
    const tmp = document.createElement('div')
    tmp.innerHTML = html
    return tmp.textContent || tmp.innerText || ''
  }
  
  function getPreview(content: string): string {
    const rendered = renderMarkdown(content)
    const text = stripHtml(rendered)
    return text.substring(0, 100) + (text.length > 100 ? '...' : '')
  }
</script>

<div class="space-y-2">
  {#each children as child}
    <a href="{child.slug || `/${child.id}`}" class="block border-b border-white/10 pb-2 hover:border-white/30 transition-colors">
      <div class="flex items-baseline gap-3">
        <div class="flex-grow">
          <h3 class="text-sm font-medium inline">{child.title || child.slug || 'Untitled'}</h3>
          {#if child.content}
            <span class="text-xs text-white/60 ml-2">{getPreview(child.content)}</span>
          {/if}
        </div>
        <span class="text-xs text-white/40">{new Date(child.updatedAt).toLocaleDateString()}</span>
      </div>
    </a>
  {/each}
</div>
