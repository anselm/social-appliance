/**
 * ENS (Ethereum Name Service) utilities
 * Resolves Ethereum addresses to ENS names
 */

/**
 * Lookup ENS name for an Ethereum address
 * Returns null if no ENS name is found or if lookup fails
 * 
 * Note: This uses a public RPC which may have rate limits.
 * For production, consider using a dedicated RPC provider like Infura or Alchemy.
 */
export async function lookupENSName(address: string): Promise<string | null> {
  if (!address || !address.startsWith('0x')) {
    return null;
  }

  try {
    // For now, we'll skip ENS lookup to avoid rate limiting issues
    // In production, you would:
    // 1. Use a dedicated RPC provider (Infura, Alchemy, etc.)
    // 2. Implement proper caching
    // 3. Handle rate limits gracefully
    
    console.log('ENS lookup skipped - configure RPC provider for production');
    return null;
    
    // Uncomment and configure when you have an RPC provider:
    /*
    const RPC_URL = import.meta.env.VITE_ETHEREUM_RPC_URL || 'https://eth.llamarpc.com';
    
    // Normalize address to lowercase
    const normalizedAddress = address.toLowerCase();

    // Simple timeout to prevent hanging
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    try {
      const response = await fetch(RPC_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'eth_call',
          params: [
            {
              to: '0x3671aE578E63FdF66ad4F3E12CC0c0d71Ac7510C', // ENS Public Resolver
              data: getResolverData(normalizedAddress),
            },
            'latest',
          ],
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.warn('ENS lookup failed:', response.status);
        return null;
      }

      const data = await response.json();

      if (data.error) {
        console.warn('ENS lookup error:', data.error);
        return null;
      }

      if (!data.result || data.result === '0x') {
        return null;
      }

      // Decode the result
      const ensName = decodeENSName(data.result);
      
      // Basic validation
      if (ensName && ensName.endsWith('.eth') && ensName.length > 4) {
        return ensName;
      }

      return null;
    } catch (fetchError) {
      clearTimeout(timeoutId);
      if (fetchError.name === 'AbortError') {
        console.warn('ENS lookup timed out');
      } else {
        console.warn('ENS lookup fetch error:', fetchError);
      }
      return null;
    }
    */
  } catch (error) {
    console.warn('ENS lookup failed:', error);
    return null;
  }
}

/**
 * Get the data for resolver lookup
 */
function getResolverData(address: string): string {
  // This is a simplified version
  // In production, you'd use a proper ENS library
  const addr = address.slice(2).toLowerCase().padStart(64, '0');
  const selector = '0x691f3431'; // name(bytes32)
  return selector + addr;
}

/**
 * Decode ENS name from hex result
 */
function decodeENSName(hexResult: string): string | null {
  try {
    const hex = hexResult.slice(2);
    
    if (hex.length < 128) {
      return null;
    }
    
    const lengthHex = hex.slice(64, 128);
    const length = parseInt(lengthHex, 16);
    
    if (length === 0 || length > 256) {
      return null;
    }
    
    const nameHex = hex.slice(128, 128 + length * 2);
    
    let name = '';
    for (let i = 0; i < nameHex.length; i += 2) {
      const charCode = parseInt(nameHex.substr(i, 2), 16);
      if (charCode === 0) break;
      name += String.fromCharCode(charCode);
    }
    
    return name || null;
  } catch (error) {
    console.warn('Failed to decode ENS name:', error);
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
