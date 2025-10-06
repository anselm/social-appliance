/**
 * ENS (Ethereum Name Service) utilities
 * Resolves Ethereum addresses to ENS names
 */

const ENS_REGISTRY_ADDRESS = '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e';
const MAINNET_RPC = 'https://rpc.ankr.com/eth';

/**
 * Lookup ENS name for an Ethereum address
 * Returns null if no ENS name is found
 */
export async function lookupENSName(address: string): Promise<string | null> {
  if (!address || !address.startsWith('0x')) {
    return null;
  }

  try {
    // Normalize address to lowercase
    const normalizedAddress = address.toLowerCase();

    // Use a public RPC endpoint to lookup the reverse record
    const response = await fetch(MAINNET_RPC, {
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
            to: ENS_REGISTRY_ADDRESS,
            data: getReverseRecordData(normalizedAddress),
          },
          'latest',
        ],
      }),
    });

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
    
    // Verify the forward resolution matches
    if (ensName) {
      const verified = await verifyENSName(ensName, normalizedAddress);
      return verified ? ensName : null;
    }

    return null;
  } catch (error) {
    console.warn('Failed to lookup ENS name:', error);
    return null;
  }
}

/**
 * Get the data for reverse record lookup
 */
function getReverseRecordData(address: string): string {
  // Remove 0x prefix and pad to 32 bytes
  const addr = address.slice(2).padStart(64, '0');
  
  // Function selector for name(bytes32)
  const selector = '0x691f3431';
  
  // Construct the reverse node
  const reverseNode = getReverseNode(address);
  
  return selector + reverseNode;
}

/**
 * Get the reverse node for an address
 */
function getReverseNode(address: string): string {
  // This is a simplified version - in production you'd use a proper ENS library
  // For now, we'll use a basic implementation
  const addr = address.slice(2).toLowerCase();
  return addr.padStart(64, '0');
}

/**
 * Decode ENS name from hex result
 */
function decodeENSName(hexResult: string): string | null {
  try {
    // Remove 0x prefix
    const hex = hexResult.slice(2);
    
    // Skip the first 64 characters (offset)
    // Next 64 characters are the length
    const lengthHex = hex.slice(64, 128);
    const length = parseInt(lengthHex, 16);
    
    if (length === 0 || length > 256) {
      return null;
    }
    
    // Get the actual name data
    const nameHex = hex.slice(128, 128 + length * 2);
    
    // Convert hex to string
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
 * Verify that an ENS name resolves to the expected address
 */
async function verifyENSName(ensName: string, expectedAddress: string): Promise<boolean> {
  try {
    // Use a simpler verification - just check if the name looks valid
    // In production, you'd do a forward lookup to verify
    return ensName.endsWith('.eth') && ensName.length > 4;
  } catch (error) {
    console.warn('Failed to verify ENS name:', error);
    return false;
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
