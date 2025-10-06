<script lang="ts">
  import { fetchNonce, buildSiweMessage } from "../lib/siwe";
  import { getMagic } from "../lib/magic";
  import { postJSON } from "../lib/auth";

  let address = "";
  let who = "";
  let error = "";
  let loading = false;

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

      const nonce = await fetchNonce();
      const message = buildSiweMessage(account, nonce);

      // @ts-ignore
      const signature = await window.ethereum.request({
        method: "personal_sign",
        params: [message, account],
      });

      const res = await postJSON<{ address: string; appToken?: string }>("/api/verify-siwe", {
        message,
        signature,
      });

      address = res.address;
      who = `Wallet: ${address}`;
      
      if (res.appToken) {
        localStorage.setItem('authToken', res.appToken);
      }
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

      const email = window.prompt("Enter your email for a login link / OTP:");
      if (!email) {
        loading = false;
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error("Please enter a valid email address");
      }

      const res = await magic.auth.loginWithEmailOTP({ email });
      if (!res) throw new Error("Magic login canceled");

      const didToken = await magic.user.getIdToken();

      const vr = await postJSON<{ issuer: string; email?: string; appToken?: string }>(
        "/api/verify-magic",
        { didToken }
      );

      who = `Magic user: ${vr.issuer}${vr.email ? " (" + vr.email + ")" : ""}`;
      
      if (vr.appToken) {
        localStorage.setItem('authToken', vr.appToken);
      }
    } catch (e: any) {
      console.error('Magic error:', e);
      error = e?.message || String(e);
    } finally {
      loading = false;
    }
  }

  async function logout() {
    try {
      const magic = getMagic();
      await magic.user.logout();
      localStorage.removeItem('authToken');
      who = "";
      address = "";
      error = "";
    } catch (e: any) {
      console.error('Logout error:', e);
      error = e?.message || String(e);
    }
  }
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
      <li><strong>MetaMask (SIWE):</strong> Sign in with your Ethereum wallet using the Sign-In with Ethereum standard</li>
      <li><strong>Magic (Email):</strong> Passwordless authentication via email link or one-time password</li>
    </ul>
  </div>
</div>
