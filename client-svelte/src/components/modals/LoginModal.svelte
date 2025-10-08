<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import { getMagic } from '../../lib/magic'
  import { verifyMessage } from '../../lib/siweVerify'
  import { lookupENSName } from '../../lib/ens'
  import { authStore } from '../../stores/auth'
  import { navigateTo } from '../../utils/navigation'
  
  const dispatch = createEventDispatcher()
  
  let error = $state('')
  let loading = $state(false)
  let lookingUpENS = $state(false)
  
  function handleClose() {
    dispatch('close')
  }
  
  function handleSwitchToSignup() {
    dispatch('switchToSignup')
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

      const result = await authStore.login({
        type: 'siwe',
        address: account,
        ensName: ensName || undefined
      })
      
      if (result.hasParty) {
        // User has a party, login successful
        handleClose()
        navigateTo('/profile')
      } else {
        // User authenticated but no party entity
        error = 'No account found. Please sign up first.'
        authStore.logout()
      }
      
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

      const result = await authStore.login({
        type: 'magic',
        email: metadata.email || userEmail,
        issuer: metadata.issuer,
        didToken: didToken
      })
      
      if (result.hasParty) {
        // User has a party, login successful
        handleClose()
        navigateTo('/profile')
      } else {
        // User authenticated but no party entity
        error = 'No account found. Please sign up first.'
        authStore.logout()
        if (magic) {
          await magic.user.logout()
        }
      }
      
    } catch (e: any) {
      console.error('Magic error:', e)
      error = e?.message || String(e)
    } finally {
      loading = false
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
    
    <h2 class="text-2xl font-bold mb-2">Login</h2>
    <p class="text-sm text-white/60 mb-6">Sign in to your account</p>
    
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
          Login with MetaMask
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
          Login with Email
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
        Don't have an account?{' '}
        <button
          onclick={handleSwitchToSignup}
          class="text-blue-400 hover:text-blue-300 underline"
        >
          Sign up
        </button>
      </p>
    </div>
  </div>
</div>
