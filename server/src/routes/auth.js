import express from 'express';
import jwt from 'jsonwebtoken';
import { Logger } from '../utils/logger.js';
import { makeNonce, verifySiwe } from '../services/siwe.js';
import { verifyMagicDid } from '../services/magic.js';

const router = express.Router();

// In-memory nonce storage (use Redis in production)
const nonces = new Map();

// Clean up old nonces every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [nonce, timestamp] of nonces.entries()) {
    if (now - timestamp > 5 * 60 * 1000) { // 5 minutes
      nonces.delete(nonce);
    }
  }
}, 5 * 60 * 1000);

// Generate nonce for SIWE
router.get('/nonce', (req, res) => {
  try {
    const nonce = makeNonce();
    nonces.set(nonce, Date.now());
    Logger.debug(`Generated nonce: ${nonce.substring(0, 8)}...`);
    res.json({ nonce });
  } catch (error) {
    Logger.error('Error generating nonce:', error);
    res.status(500).json({ error: 'Failed to generate nonce' });
  }
});

// Verify SIWE signature
router.post('/verify-siwe', async (req, res) => {
  try {
    const { message, signature } = req.body;

    if (!message || !signature) {
      return res.status(400).json({ error: 'Missing message or signature' });
    }

    Logger.debug('Verifying SIWE signature...');

    // Parse the SIWE message to extract nonce
    const nonceLine = message.split('\n').find(line => line.startsWith('Nonce: '));
    
    if (!nonceLine) {
      return res.status(400).json({ error: 'Invalid SIWE message format' });
    }

    const nonce = nonceLine.replace('Nonce: ', '');

    // Verify nonce exists and is recent
    if (!nonces.has(nonce)) {
      Logger.warn('Invalid or expired nonce');
      return res.status(400).json({ error: 'Invalid or expired nonce' });
    }

    // Delete nonce to prevent replay attacks
    nonces.delete(nonce);

    // Verify the signature using your service
    const address = await verifySiwe({ message, signature, expectedNonce: nonce });

    Logger.success(`SIWE authentication successful for ${address}`);

    // Create JWT token
    const token = jwt.sign(
      { 
        address: address,
        type: 'siwe',
        timestamp: Date.now()
      },
      process.env.JWT_SECRET || 'default-secret-change-in-production',
      { expiresIn: '7d' }
    );

    // Set session
    req.session.user = {
      address: address,
      type: 'siwe'
    };

    res.json({
      address: address,
      appToken: token
    });
  } catch (error) {
    Logger.error('SIWE verification error:', error);
    res.status(500).json({ error: error.message || 'Verification failed' });
  }
});

// Verify Magic DID token
router.post('/verify-magic', async (req, res) => {
  try {
    const { didToken } = req.body;

    if (!didToken) {
      return res.status(400).json({ error: 'Missing DID token' });
    }

    Logger.debug('Verifying Magic DID token...');

    // Verify using your service
    const metadata = await verifyMagicDid(didToken);

    Logger.success(`Magic authentication successful for ${metadata.email || metadata.issuer}`);

    // Create JWT token
    const token = jwt.sign(
      {
        issuer: metadata.issuer,
        email: metadata.email,
        publicAddress: metadata.publicAddress,
        type: 'magic',
        timestamp: Date.now()
      },
      process.env.JWT_SECRET || 'default-secret-change-in-production',
      { expiresIn: '7d' }
    );

    // Set session
    req.session.user = {
      issuer: metadata.issuer,
      email: metadata.email,
      publicAddress: metadata.publicAddress,
      type: 'magic'
    };

    res.json({
      issuer: metadata.issuer,
      email: metadata.email,
      publicAddress: metadata.publicAddress,
      appToken: token
    });
  } catch (error) {
    Logger.error('Magic verification error:', error);
    res.status(500).json({ error: error.message || 'Verification failed' });
  }
});

// Get current user
router.get('/me', (req, res) => {
  if (req.session && req.session.user) {
    res.json({ user: req.session.user });
  } else {
    res.status(401).json({ error: 'Not authenticated' });
  }
});

// Logout
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      Logger.error('Logout error:', err);
      return res.status(500).json({ error: 'Logout failed' });
    }
    Logger.info('User logged out');
    res.json({ success: true });
  });
});

export default router;
