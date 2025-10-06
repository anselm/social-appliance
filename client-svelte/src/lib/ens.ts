/**
 * ENS (Ethereum Name Service) utilities
 * Resolves Ethereum addresses to ENS names using viem
 */

import { createPublicClient, http } from 'viem';
import { mainnet } from 'viem/chains';

// Create a public client for ENS lookups
const publicClient = createPublicClient({
  chain: mainnet,
  transport: http('https://cloudflare-eth.com'),
});

/**
 * Lookup ENS name for an Ethereum address
 * Returns null if no ENS name is found or if lookup fails
 */
export async function lookupENSName(address: string): Promise<string | null> {
  if (!address || !address.startsWith('0x')) {
    return null;
  }

  try {
    console.log('Looking up ENS name for:', address);
    
    // Use viem's built-in ENS name resolution
    const ensName = await publicClient.getEnsName({
      address: address as `0x${string}`,
    });

    if (ensName) {
      console.log('Found ENS name:', ensName);
      return ensName;
    }

    console.log('No ENS name found for:', address);
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
