<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import { getMagic } from '../../lib/magic'
  import { verifyMessage } from '../../lib/siweVerify'
  import { lookupENSName } from '../../lib/ens'
  import { authStore } from '../../stores/auth'
  import { api } from '../../services/api'
  import { navigateTo } from '../../utils/navigation'
  import PartySlugForm from '../PartySlugForm.svelte'
  
  const dispatch = createEventDispatcher()
  
  let error = $state('')
  let loading = $state(false)
  let lookingUpENS = $state(false)
  let authenticated = $state(false)
  let tempAuthData = $state<any>(null)
  let creatingParty = $state(false)
  
  function handleClose() {
    // If authenticated but not completed signup, logout
    if (authenticated && tempAuthData) {
      if (tempAuthData.type === 'magic') {
        getMagic().user.logout().catch(console.error)
      }
    }
    dispatch('close')
  }
  
  function handleSwitchToLogin() {
    dispatch('switchToLogin')
  }
  
  async function connectMetamask() {
    error = ''
    loading = true
    
    try {
      // @ts-ignore
      if (!window.ethereum) {
        throw new Error('MetaMask is not installed. Please install MetaMask to continue.')
      }

      // @ts-ignore
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
      const account = accounts?.[0]
      if (!account) throw new Error('No account found')

      const nonce = Math.random().toString(36).substring(2, 15)
      const domain = window.location.host
      const uri = window.location.origin
      const statement = 'Sign in with Ethereum to the app.'
      const version = '1'
      const chainId = 1

      const message = [
        `${domain} wants you to sign in with your Ethereum account:`,
        account,
        '',
        statement,
        '',
        `URI: ${uri}`,
        `Version: ${version}`,
        `Chain ID: ${chainId}`,
        `Nonce: ${nonce}`,
        `Issued At: ${new Date().toISOString()}`,
      ].join('\n')

      // @ts-ignore
      const signature = await window.ethereum.request({
        method: 'personal_sign',
        params: [message, account],
      })

      const isValid = await verifyMessage(message, signature, account)
      
      if (!isValid) {
        throw new Error('Signature verification failed')
      }

      let ensName: string | null = null
      try {
        lookingUpENS = true
        ensName = await lookupENSName(account)
      } catch (ensError: any) {
        console.warn('ENS lookup failed:', ensError.message || ensError)
      } finally {
        lookingUpENS = false
      }

      // Check if user already has a party
      const authIdentifier = account
      const existingParties = await api.queryEntities({
        type: 'party',
        auth: authIdentifier,
        limit: 1
      })
      
      if (existingParties && existingParties.length > 0) {
        // User already has an account, redirect to login
        error = 'Account already exists. Redirecting to login...'
        setTimeout(() => {
          handleSwitchToLogin()
        }, 1500)
        return
      }

      // Store temp auth data and show slug form
      tempAuthData = {
        type: 'siwe',
        address: account,
        ensName: ensName || undefined
      }
      authenticated = true
      
    } catch (e: any) {
      console.error('MetaMask error:', e)
      error = e?.message || String(e)
      lookingUpENS = false
    } finally {
      loading = false
    }
  }
  
  async function loginWithMagic() {
    error = ''
    loading = true
    
    try {
      const magic = getMagic()

      if (!import.meta.env.VITE_MAGIC_PUBLISHABLE_KEY) {
        throw new Error('Magic.link is not configured. Please set VITE_MAGIC_PUBLISHABLE_KEY.')
      }

      const userEmail = window.prompt('Enter your email for a login link / OTP:')
      if (!userEmail) {
        loading = false
        return
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(userEmail)) {
        throw new Error('Please enter a valid email address')
      }

      const res = await magic.auth.loginWithEmailOTP({ email: userEmail })
      if (!res) throw new Error('Magic login canceled')

      const didToken = await magic.user.getIdToken()
      const metadata = await magic.user.getInfo()

      // Check if user already has a party
      const authIdentifier = metadata.issuer
      const existingParties = await api.queryEntities({
        type: 'party',
        auth: authIdentifier,
        limit: 1
      })
      
      if (existingParties && existingParties.length > 0) {
        // User already has an account, redirect to login
        error = 'Account already exists. Redirecting to login...'
        await magic.user.logout()
        setTimeout(() => {
          handleSwitchToLogin()
        }, 1500)
        return
      }

      // Store temp auth data and show slug form
      tempAuthData = {
        type: 'magic',
        email: metadata.email || userEmail,
        issuer: metadata.issuer,
        didToken: didToken
      }
      authenticated = true
      
    } catch (e: any) {
      console.error('Magic error:', e)
      error = e?.message || String(e)
    } finally {
      loading = false
    }
  }
  
  async function handleSlugSubmit(event: CustomEvent) {
    const { slug } = event.detail
    
    if (!tempAuthData) {
      error = 'Authentication data missing'
      return
    }
    
    creatingParty = true
    error = ''
    
    try {
      const authIdentifier = tempAuthData.address || tempAuthData.issuer
      
      // Create the party entity
      const party = await api.createUser({
        type: 'party',
        title: slug.replace(/^\//, '').replace(/\//g, ' '),
        slug: slug,
        auth: authIdentifier,
        sponsorId: authIdentifier,
        address: authIdentifier,
        contract: null
      })
      
      // Complete signup in auth store
      authStore.completeSignup(party.id, party.slug || slug)
      
      // Close modal and navigate to profile
      handleClose()
      navigateTo('/profile')
      
    } catch (e: any) {
      console.error('Failed to create party:', e)
      
      if (e.validationErrors && Array.isArray(e.validationErrors)) {
        error = e.validationErrors.join(', ')
      } else {
        error = e?.message || 'Failed to create account'
      }
    } finally {
      creatingParty = false
    }
  }
</script>

<div class="fixed inset-0 z-50 flex items-center justify-center p-4">
  <!-- Backdrop -->
  <button
    class="absolute inset-0 bg-black/80"
    onclick={handleClose}
    aria-label="Close modal"
  ></button>
  
  <!-- Modal -->
  <div class="relative bg-black border border-white/20 rounded-lg p-6 w-full max-w-md">
    <button
      onclick={handleClose}
      class="absolute top-4 right-4 text-white/60 hover:text-white"
      aria-label="Close"
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
    
    <h2 class="text-2xl font-bold mb-2">Sign Up</h2>
    <p class="text-sm text-white/60 mb-6">Create your account</p>
    
    {#if !authenticated}
      <div class="space-y-3">
        <button 
          onclick={connectMetamask}
          disabled={loading}
          class="w-full px-4 py-3 bg-orange-500 text-white rounded hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 text-sm"
        >
          {#if loading || lookingUpENS}
            <span class="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            {lookingUpENS ? 'Looking up ENS...' : 'Connecting...'}
          {:else}
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.05 11.52l-3.88-6.7c-.34-.59-.98-.95-1.67-.95H7.5c-.69 0-1.33.36-1.67.95l-3.88 6.7c-.34.59-.34 1.31 0 1.9l3.88 6.7c.34.59.98.95 1.67.95h9c.69 0 1.33-.36 1.67-.95l3.88-6.7c.34-.59.34-1.31 0-1.9zM12 16.5c-2.48 0-4.5-2.02-4.5-4.5S9.52 7.5 12 7.5s4.5 2.02 4.5 4.5-2.02 4.5-4.5 4.5z"/>
            </svg>
            Sign up with MetaMask
          {/if}
        </button>
        
        <button 
          onclick={loginWithMagic}
          disabled={loading}
          class="w-full px-4 py-3 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 text-sm"
        >
          {#if loading}
            <span class="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            Connecting...
          {:else}
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
            </svg>
            Sign up with Email
          {/if}
        </button>

        {#if error}
          <div class="p-3 bg-red-500/10 border border-red-500/20 rounded">
            <p class="text-red-400 text-xs">{error}</p>
          </div>
        {/if}
      </div>
      
      <div class="mt-6 pt-4 border-t border-white/10 text-center">
        <p class="text-xs text-white/60">
          Already have an account?{' '}
          <button
            onclick={handleSwitchToLogin}
            class="text-blue-400 hover:text-blue-300 underline"
          >
            Login
          </button>
        </p>
      </div>
    {:else}
      <!-- Slug selection form -->
      <PartySlugForm
        {creatingParty}
        {error}
        on:submit={handleSlugSubmit}
        on:cancel={handleClose}
      />
    {/if}
  </div>
</div>
