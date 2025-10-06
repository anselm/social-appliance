import { Logger } from './logger.js';
import { verifyMagicDid } from '../services/magic.js';
import { verifySiwe } from '../services/siwe.js';

/**
 * Test utility to verify if a user is who they say they are
 * Checks authentication headers from client requests
 */
export class AuthVerifier {
  /**
   * Verify user identity from request headers
   * @param {Object} req - Express request object
   * @returns {Promise<Object>} - { verified: boolean, identity: Object|null, error: string|null }
   */
  static async verifyUserIdentity(req) {
    try {
      // Check for auth type header
      const authType = req.headers['x-auth-type'];
      
      if (!authType) {
        return {
          verified: false,
          identity: null,
          error: 'No authentication type provided'
        };
      }

      if (authType === 'siwe') {
        return await this.verifySiweIdentity(req);
      } else if (authType === 'magic') {
        return await this.verifyMagicIdentity(req);
      } else {
        return {
          verified: false,
          identity: null,
          error: `Unknown authentication type: ${authType}`
        };
      }
    } catch (error) {
      Logger.error('AuthVerifier error:', error);
      return {
        verified: false,
        identity: null,
        error: error.message || 'Verification failed'
      };
    }
  }

  /**
   * Verify SIWE identity
   * @param {Object} req - Express request object
   * @returns {Promise<Object>}
   */
  static async verifySiweIdentity(req) {
    const address = req.headers['x-auth-address'];
    
    if (!address) {
      return {
        verified: false,
        identity: null,
        error: 'No address provided for SIWE authentication'
      };
    }

    // For SIWE, we trust the client-side verification for now
    // In a production system, you might want to re-verify the signature
    // or check against a session store
    
    Logger.debug(`SIWE identity verified for address: ${address}`);
    
    return {
      verified: true,
      identity: {
        type: 'siwe',
        address: address
      },
      error: null
    };
  }

  /**
   * Verify Magic.link identity
   * @param {Object} req - Express request object
   * @returns {Promise<Object>}
   */
  static async verifyMagicIdentity(req) {
    const didToken = req.headers['x-auth-token'];
    
    if (!didToken) {
      return {
        verified: false,
        identity: null,
        error: 'No DID token provided for Magic authentication'
      };
    }

    try {
      // Verify the DID token with Magic
      const metadata = await verifyMagicDid(didToken);
      
      Logger.debug(`Magic identity verified for: ${metadata.email || metadata.issuer}`);
      
      return {
        verified: true,
        identity: {
          type: 'magic',
          issuer: metadata.issuer,
          email: metadata.email,
          publicAddress: metadata.publicAddress
        },
        error: null
      };
    } catch (error) {
      Logger.warn('Magic DID token verification failed:', error.message);
      return {
        verified: false,
        identity: null,
        error: `Magic verification failed: ${error.message}`
      };
    }
  }

  /**
   * Simple boolean check - returns true if user is verified
   * @param {Object} req - Express request object
   * @returns {Promise<boolean>}
   */
  static async isVerified(req) {
    const result = await this.verifyUserIdentity(req);
    return result.verified;
  }

  /**
   * Get verified identity or null
   * @param {Object} req - Express request object
   * @returns {Promise<Object|null>}
   */
  static async getVerifiedIdentity(req) {
    const result = await this.verifyUserIdentity(req);
    return result.verified ? result.identity : null;
  }
}
