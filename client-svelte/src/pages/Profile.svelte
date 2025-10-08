<script lang="ts">
  import { authStore } from '../stores/auth'
  import { navigateTo } from '../utils/navigation'
  import RouterLink from '../components/RouterLink.svelte'
  import UserPartiesSection from '../components/profile/UserPartiesSection.svelte'
  import RecentPostsSection from '../components/profile/RecentPostsSection.svelte'
  import AnalyticsSection from '../components/profile/AnalyticsSection.svelte'
  import SettingsSection from '../components/profile/SettingsSection.svelte'
  import FavoritesSection from '../components/profile/FavoritesSection.svelte'
  
  // Redirect to login if not authenticated
  $effect(() => {
    if (!$authStore) {
      navigateTo('/login')
    }
  })
  
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
</script>

{#if $authStore}
  <div class="max-w-5xl mx-auto">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-2xl font-bold mb-2">Your Profile</h1>
      <p class="text-sm text-white/60">
        Signed in as <span class="font-medium text-white/80">{getDisplayName($authStore)}</span>
      </p>
    </div>
    
    <!-- Main Content Grid -->
    <div class="space-y-6">
      <!-- Identity Section -->
      <UserPartiesSection />
      
      <!-- Analytics -->
      <AnalyticsSection />
      
      <!-- Recent Posts -->
      <RecentPostsSection />
      
      <!-- Favorites (Stubbed) -->
      <FavoritesSection />
      
      <!-- Settings -->
      <SettingsSection />
    </div>
    
    <!-- Back Link -->
    <div class="mt-8 pt-6 border-t border-white/10">
      <RouterLink to="/" className="text-xs text-white/60 hover:text-white underline">
        {#snippet children()}
          ← Back to home
        {/snippet}
      </RouterLink>
    </div>
  </div>
{:else}
  <div class="text-center py-12">
    <p class="text-white/60 mb-4">Please sign in to view your profile</p>
    <RouterLink 
      to="/login" 
      className="px-4 py-2 bg-white text-black hover:bg-white/90 transition-colors text-sm font-medium inline-block"
    >
      {#snippet children()}
        Sign In
      {/snippet}
    </RouterLink>
  </div>
{/if}
