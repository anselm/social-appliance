<script lang="ts">
  import { fetchNonce, buildSiweMessage } from "../lib/siwe";
  import { getMagic } from "../lib/magic";
  import { postJSON } from "../lib/auth";

  let address = "";
  let who = "";
  let error = "";

  async function connectMetamask() {
    try {
      // request accounts
      // @ts-ignore
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      const account = accounts?.[0];
      if (!account) throw new Error("No account");

      const nonce = await fetchNonce();
      const message = buildSiweMessage(account, nonce);

      // sign the message
      // @ts-ignore
      const signature = await window.ethereum.request({
        method: "personal_sign",
        params: [message, account],
      });

      // verify on server (recovers address, checks nonce)
      const res = await postJSON<{ address: string; appToken?: string }>("/api/verify-siwe", {
        message,
        signature,
      });

      address = res.address;
      who = `Wallet: ${address}`;
      error = "";
    } catch (e:any) {
      error = e?.message || String(e);
    }
  }

  async function loginWithMagic() {
    try {
      const magic = getMagic();

      // You can use magic.oauth or magic.auth.loginWithEmailOTP / Magic Link
      // Here’s an email OTP example to keep it simple:
      const email = window.prompt("Enter your email for a login link / OTP:");
      if (!email) return;

      const res = await magic.auth.loginWithEmailOTP({ email });
      if (!res) throw new Error("Magic login canceled");

      // After login, get a DID token from Magic (short-lived JWT-like)
      const didToken = await magic.user.getIdToken(); // default audience = current origin

      // Send DID token to server for verification (stateless)
      const vr = await postJSON<{ issuer: string; email?: string }>(
        "/api/verify-magic",
        { didToken }
      );

      who = `Magic user: ${vr.issuer}${vr.email ? " (" + vr.email + ")" : ""}`;
      error = "";
    } catch (e:any) {
      error = e?.message || String(e);
    }
  }
</script>

<h1>Auth demo</h1>

<div style="display:flex; gap:12px; flex-wrap:wrap;">
  <button on:click={connectMetamask}>Sign in with MetaMask (SIWE)</button>
  <button on:click={loginWithMagic}>Continue with Email (Magic)</button>
</div>

{#if who}<p>✅ {who}</p>{/if}
{#if error}<p style="color:#b00">⚠️ {error}</p>{/if}
