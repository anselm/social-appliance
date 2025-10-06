export async function fetchNonce(): Promise<string> {
  const r = await fetch("/api/nonce", { credentials: "include" });
  if (!r.ok) throw new Error("nonce failed");
  const { nonce } = await r.json();
  return nonce;
}

export function buildSiweMessage(address: string, nonce: string) {
  // Minimal SIWE-like message (you can use full EIP-4361 fields if you want)
  const domain = window.location.host;
  const uri = window.location.origin;
  const statement = "Sign in with Ethereum.";
  const version = "1";
  const chainId = 1; // adjust if you want to enforce a chain

  return [
    `${domain} wants you to sign in with your Ethereum account:`,
    `${address}`,
    "",
    `${statement}`,
    "",
    `URI: ${uri}`,
    `Version: ${version}`,
    `Chain ID: ${chainId}`,
    `Nonce: ${nonce}`,
    `Issued At: ${new Date().toISOString()}`,
  ].join("\n");
}
