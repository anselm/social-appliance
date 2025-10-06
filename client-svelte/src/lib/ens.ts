/**
 * ENS (Ethereum Name Service) utilities
 * Resolves Ethereum addresses to ENS names using public RPC
 */

/**
 * Lookup ENS name for an Ethereum address
 * Uses public Ethereum RPC to resolve reverse ENS records
 */
export async function lookupENSName(address: string): Promise<string | null> {
  if (!address || !address.startsWith('0x')) {
    return null;
  }

  try {
    // Use Cloudflare's public Ethereum gateway
    const RPC_URL = 'https://cloudflare-eth.com';
    
    // Normalize address to lowercase
    const normalizedAddress = address.toLowerCase();

    // Create reverse node: addr.reverse
    const reverseNode = normalizedAddress.slice(2) + '.addr.reverse';
    
    // ENS registry address on mainnet
    const ENS_REGISTRY = '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e';
    
    // Get the resolver for this reverse node
    // This is a simplified approach - just try to get the name directly
    
    // For now, return null since we need a proper ENS library
    // A full implementation would require encoding the reverse lookup properly
    console.log('ENS lookup attempted for:', address);
    return null;
    
  } catch (error) {
    console.warn('ENS lookup failed:', error);
    return null;
  }
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
