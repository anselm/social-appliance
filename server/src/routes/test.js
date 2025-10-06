import express from 'express';
import { AuthVerifier } from '../utils/authVerifier.js';
import { Logger } from '../utils/logger.js';

const router = express.Router();

/**
 * Test endpoint to verify user identity
 * POST /api/test/verify-identity
 */
router.post('/verify-identity', async (req, res) => {
  try {
    Logger.info('Testing user identity verification...');
    
    const result = await AuthVerifier.verifyUserIdentity(req);
    
    if (result.verified) {
      Logger.success('User identity verified:', result.identity);
      res.json({
        success: true,
        verified: true,
        identity: result.identity,
        message: 'User identity verified successfully'
      });
    } else {
      Logger.warn('User identity verification failed:', result.error);
      res.status(401).json({
        success: false,
        verified: false,
        identity: null,
        error: result.error
      });
    }
  } catch (error) {
    Logger.error('Verification test error:', error);
    res.status(500).json({
      success: false,
      verified: false,
      identity: null,
      error: 'Internal server error'
    });
  }
});

/**
 * Simple boolean check endpoint
 * GET /api/test/am-i-verified
 */
router.get('/am-i-verified', async (req, res) => {
  try {
    const isVerified = await AuthVerifier.isVerified(req);
    
    res.json({
      verified: isVerified
    });
  } catch (error) {
    Logger.error('Verification check error:', error);
    res.status(500).json({
      verified: false,
      error: 'Internal server error'
    });
  }
});

/**
 * Get identity details endpoint
 * GET /api/test/who-am-i
 */
router.get('/who-am-i', async (req, res) => {
  try {
    const identity = await AuthVerifier.getVerifiedIdentity(req);
    
    if (identity) {
      res.json({
        verified: true,
        identity: identity
      });
    } else {
      res.status(401).json({
        verified: false,
        identity: null,
        error: 'Not authenticated or verification failed'
      });
    }
  } catch (error) {
    Logger.error('Identity check error:', error);
    res.status(500).json({
      verified: false,
      identity: null,
      error: 'Internal server error'
    });
  }
});

export default router;
