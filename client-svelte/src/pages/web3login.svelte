<script>
  import { onMount } from "svelte";
  import { getWeb3Auth } from "../lib/web3auth";

  let address = "";
  let error = "";

  async function login() {
    try {
      const w3a = await getWeb3Auth();
      const provider = await w3a.connect(); // triggers OpenLogin
      // read the address via ethers or RPC
      const res = await provider.request({ method: "eth_accounts" });
      address = res?.[0] ?? "";
      // persist only what you need — ideally NOT private keys
      localStorage.setItem("session.address", address);
      // If you need an ID token: await w3a.authenticateUser();
    } catch (e) {
      error = String(e);
    }
  }

  onMount(() => { /* ensure browser env */ });
</script>

<button on:click={login}>Sign in</button>
{#if address}<p>Connected: {address}</p>{/if}
{#if error}<p class="text-red-600">{error}</p>{/if}
