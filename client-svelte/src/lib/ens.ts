/**
 * ENS (Ethereum Name Service) utilities
 * Resolves Ethereum addresses to ENS names using viem
 */

import { createPublicClient, http } from 'viem';
import { mainnet } from 'viem/chains';

// List of RPC endpoints to try in order
const RPC_ENDPOINTS = [
  'https://cloudflare-eth.com',
  'https://eth.llamarpc.com',
  'https://rpc.ankr.com/eth',
  // Add Infura if configured
  ...(import.meta.env.VITE_ETHEREUM_RPC_URL ? [import.meta.env.VITE_ETHEREUM_RPC_URL] : [])
];

/**
 * Lookup ENS name for an Ethereum address
 * Returns null if no ENS name is found or if lookup fails
 * 
 * Tries multiple RPC endpoints as fallbacks for reliability
 */
export async function lookupENSName(address: string): Promise<string | null> {
  if (!address || !address.startsWith('0x')) {
    return null;
  }

  console.log('Looking up ENS name for:', address);
  
  // Try each RPC endpoint in order
  for (let i = 0; i < RPC_ENDPOINTS.length; i++) {
    const rpcUrl = RPC_ENDPOINTS[i];
    
    try {
      console.log(`Trying ENS lookup with RPC ${i + 1}/${RPC_ENDPOINTS.length}:`, rpcUrl.substring(0, 30) + '...');
      
      // Create a client for this specific RPC
      const publicClient = createPublicClient({
        chain: mainnet,
        transport: http(rpcUrl),
      });
      
      // Set a timeout for the ENS lookup
      const timeoutPromise = new Promise<null>((resolve) => {
        setTimeout(() => {
          console.warn(`ENS lookup timed out after 3 seconds for RPC: ${rpcUrl.substring(0, 30)}...`);
          resolve(null);
        }, 3000);
      });
      
      // Race between the ENS lookup and the timeout
      const ensNamePromise = publicClient.getEnsName({
        address: address as `0x${string}`,
      }).catch((error) => {
        console.warn(`ENS lookup error with ${rpcUrl.substring(0, 30)}...:`, error.message || error);
        return null;
      });
      
      const ensName = await Promise.race([ensNamePromise, timeoutPromise]);

      if (ensName) {
        console.log('Found ENS name:', ensName);
        return ensName;
      }
      
      // If we got null but no error, the address just doesn't have an ENS name
      // No need to try other RPCs
      if (i === 0) {
        console.log('No ENS name found for:', address);
        return null;
      }
    } catch (error: any) {
      console.warn(`ENS lookup failed with RPC ${i + 1}:`, error.message || error);
      // Continue to next RPC endpoint
    }
  }

  // All RPC endpoints failed
  console.warn('ENS lookup failed with all RPC endpoints');
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
