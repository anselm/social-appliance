<script lang="ts">
  import { getMagic } from "../lib/magic";
  import { verifyMessage } from "../lib/siweVerify";

  let address = "";
  let email = "";
  let who = "";
  let error = "";
  let loading = false;
  let authData: { type: 'siwe' | 'magic', address?: string, email?: string, issuer?: string, didToken?: string } | null = null;

  async function connectMetamask() {
    error = "";
    loading = true;
    
    try {
      // @ts-ignore
      if (!window.ethereum) {
        throw new Error("MetaMask is not installed. Please install MetaMask to continue.");
      }

      // @ts-ignore
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      const account = accounts?.[0];
      if (!account) throw new Error("No account found");

      // Generate a client-side nonce
      const nonce = Math.random().toString(36).substring(2, 15);
      const domain = window.location.host;
      const uri = window.location.origin;
      const statement = "Sign in with Ethereum to the app.";
      const version = "1";
      const chainId = 1;

      const message = [
        `${domain} wants you to sign in with your Ethereum account:`,
        account,
        "",
        statement,
        "",
        `URI: ${uri}`,
        `Version: ${version}`,
        `Chain ID: ${chainId}`,
        `Nonce: ${nonce}`,
        `Issued At: ${new Date().toISOString()}`,
      ].join("\n");

      // @ts-ignore
      const signature = await window.ethereum.request({
        method: "personal_sign",
        params: [message, account],
      });

      // Verify the signature client-side
      const isValid = await verifyMessage(message, signature, account);
      
      if (!isValid) {
        throw new Error("Signature verification failed");
      }

      address = account;
      who = `Wallet: ${address}`;
      
      // Store auth data for later use
      authData = {
        type: 'siwe',
        address: account
      };
      
      // Store in localStorage for persistence
      localStorage.setItem('authData', JSON.stringify(authData));
      
    } catch (e: any) {
      console.error('MetaMask error:', e);
      error = e?.message || String(e);
    } finally {
      loading = false;
    }
  }

  async function loginWithMagic() {
    error = "";
    loading = true;
    
    try {
      const magic = getMagic();

      if (!import.meta.env.VITE_MAGIC_PUBLISHABLE_KEY) {
        throw new Error("Magic.link is not configured. Please set VITE_MAGIC_PUBLISHABLE_KEY.");
      }

      const userEmail = window.prompt("Enter your email for a login link / OTP:");
      if (!userEmail) {
        loading = false;
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(userEmail)) {
        throw new Error("Please enter a valid email address");
      }

      const res = await magic.auth.loginWithEmailOTP({ email: userEmail });
      if (!res) throw new Error("Magic login canceled");

      // Get the DID token (we'll send this to server only when needed)
      const didToken = await magic.user.getIdToken();
      
      // Get user metadata
      const metadata = await magic.user.getInfo();

      email = metadata.email || userEmail;
      who = `Magic user: ${metadata.email || userEmail}`;
      
      // Store auth data for later use
      authData = {
        type: 'magic',
        email: metadata.email || userEmail,
        issuer: metadata.issuer,
        didToken: didToken
      };
      
      // Store in localStorage for persistence
      localStorage.setItem('authData', JSON.stringify(authData));
      
    } catch (e: any) {
      console.error('Magic error:', e);
      error = e?.message || String(e);
    } finally {
      loading = false;
    }
  }

  async function logout() {
    try {
      if (authData?.type === 'magic') {
        const magic = getMagic();
        await magic.user.logout();
      }
      
      localStorage.removeItem('authData');
      localStorage.removeItem('authToken');
      authData = null;
      who = "";
      address = "";
      email = "";
      error = "";
    } catch (e: any) {
      console.error('Logout error:', e);
      error = e?.message || String(e);
    }
  }

  // Check for existing auth on mount
  import { onMount } from 'svelte';
  
  onMount(() => {
    const stored = localStorage.getItem('authData');
    if (stored) {
      try {
        authData = JSON.parse(stored);
        if (authData?.type === 'siwe' && authData.address) {
          address = authData.address;
          who = `Wallet: ${address}`;
        } else if (authData?.type === 'magic' && authData.email) {
          email = authData.email;
          who = `Magic user: ${email}`;
        }
      } catch (e) {
        console.error('Failed to restore auth:', e);
        localStorage.removeItem('authData');
      }
    }
  });
</script>

<div class="max-w-2xl mx-auto p-6">
  <h1 class="text-3xl font-bold mb-6">Authentication Demo</h1>

  <div class="space-y-4">
    <div class="flex gap-4 flex-wrap">
      <button 
        on:click={connectMetamask}
        disabled={loading || !!who}
        class="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {#if loading}
          Connecting...
        {:else}
          Sign in with MetaMask (SIWE)
        {/if}
      </button>
      
      <button 
        on:click={loginWithMagic}
        disabled={loading || !!who}
        class="px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {#if loading}
          Connecting...
        {:else}
          Continue with Email (Magic)
        {/if}
      </button>

      {#if who}
        <button 
          on:click={logout}
          class="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
        >
          Logout
        </button>
      {/if}
    </div>

    {#if who}
      <div class="p-4 bg-green-50 border border-green-200 rounded-lg">
        <p class="text-green-800">✅ {who}</p>
        <p class="text-xs text-green-600 mt-2">
          Authentication verified locally. Credentials will be sent to server only when performing operations.
        </p>
      </div>
    {/if}
    
    {#if error}
      <div class="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p class="text-red-800">⚠️ {error}</p>
      </div>
    {/if}

    {#if loading}
      <div class="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p class="text-blue-800">⏳ Processing authentication...</p>
      </div>
    {/if}
  </div>

  <div class="mt-8 p-4 bg-gray-50 rounded-lg">
    <h2 class="text-lg font-semibold mb-2">About Authentication</h2>
    <ul class="list-disc list-inside space-y-1 text-sm text-gray-700">
      <li><strong>MetaMask (SIWE):</strong> Sign in with your Ethereum wallet using the Sign-In with Ethereum standard. Signature is verified client-side.</li>
      <li><strong>Magic (Email):</strong> Passwordless authentication via email link or one-time password. DID token is stored locally.</li>
      <li><strong>Permissionless:</strong> No server authentication required until you perform an actual operation.</li>
    </ul>
  </div>
</div>
