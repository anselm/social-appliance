<script lang="ts">
  import { renderMarkdown } from '../utils/markdown'
  import type { Entity } from '../types'

  let { 
    entity, 
    showContent = true,
    showStats = false,
    showDepiction = true
  }: { 
    entity: Entity, 
    showContent?: boolean,
    showStats?: boolean,
    showDepiction?: boolean
  } = $props()
  
  // Mock stats for now - these would come from the API in the future
  let stats = $derived({
    memberCount: Math.floor(Math.random() * 100) + 10, // Mock: 10-110 members
    recentPosts: Math.floor(Math.random() * 50) + 5, // Mock: 5-55 posts
    isPublic: true, // Mock: always public for now
    createdAt: entity.createdAt,
    createdBy: entity.auth ? `${entity.auth.substring(0, 6)}...${entity.auth.substring(entity.auth.length - 4)}` : 'Unknown'
  })
</script>

<div class="mb-8">
  {#if showDepiction && entity.depiction}
    <div class="mb-6 -mx-4 md:mx-0">
      <img 
        src={entity.depiction} 
        alt={entity.title || 'Banner'} 
        class="w-full h-32 md:h-40 object-cover rounded-none md:rounded"
      />
    </div>
  {/if}
  
  <h1 class="text-lg mb-2">{entity.title || entity.slug || 'Untitled'}</h1>
  
  {#if showStats && entity.type === 'group'}
    <div class="flex flex-wrap gap-3 mb-4 text-xs text-white/60">
      <span class="flex items-center gap-1">
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        {stats.memberCount} members
      </span>
      <span class="flex items-center gap-1">
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
        </svg>
        {stats.recentPosts} posts
      </span>
      <span class="flex items-center gap-1">
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        {stats.isPublic ? 'Public' : 'Private'}
      </span>
      <span class="flex items-center gap-1">
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        Created {new Date(stats.createdAt).toLocaleDateString()}
      </span>
      <span class="flex items-center gap-1">
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        By {stats.createdBy}
      </span>
    </div>
  {/if}
  
  {#if showContent && entity.content}
    <div class="text-sm text-white/60 prose-content">
      {@html renderMarkdown(entity.content)}
    </div>
  {/if}
</div>
