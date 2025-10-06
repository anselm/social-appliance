/**
 * ENS (Ethereum Name Service) utilities
 * Resolves Ethereum addresses to ENS names
 * 
 * Note: ENS lookup is currently disabled to avoid rate limiting and API key requirements.
 * To enable ENS lookups, you'll need to:
 * 1. Get an RPC provider API key (Infura, Alchemy, Ankr, etc.)
 * 2. Add VITE_ETHEREUM_RPC_URL to your .env file
 * 3. Implement the lookup logic below
 */

/**
 * Lookup ENS name for an Ethereum address
 * Currently disabled - always returns null
 */
export async function lookupENSName(address: string): Promise<string | null> {
  // ENS lookup is disabled to avoid API key requirements
  // To enable, configure an RPC provider in your .env file
  return null;
}

/**
 * Format display name - use ENS if available, otherwise truncated address
 */
export function formatDisplayName(address: string, ensName: string | null): string {
  if (ensName) {
    return ensName;
  }
  
  if (!address || address.length < 10) {
    return address;
  }
  
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
}
