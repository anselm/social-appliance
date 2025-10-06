import jwt from 'jsonwebtoken';
import { Logger } from '../utils/logger.js';
import { verifyMagicDid } from '../services/magic.js';

export function requireAuth(req, res, next) {
  // Check session first
  if (req.session && req.session.user) {
    req.user = req.session.user;
    return next();
  }

  // Check JWT token in Authorization header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret-change-in-production');
      req.user = decoded;
      return next();
    } catch (error) {
      Logger.warn('Invalid JWT token:', error.message);
      return res.status(401).json({ error: 'Invalid token' });
    }
  }

  // Check for client-side auth headers (permissionless auth)
  const authType = req.headers['x-auth-type'];
  
  if (authType === 'siwe') {
    const address = req.headers['x-auth-address'];
    if (address) {
      req.user = {
        address,
        type: 'siwe'
      };
      return next();
    }
  } else if (authType === 'magic') {
    const didToken = req.headers['x-auth-token'];
    if (didToken) {
      // Verify the DID token
      verifyMagicDid(didToken)
        .then(metadata => {
          req.user = {
            issuer: metadata.issuer,
            email: metadata.email,
            publicAddress: metadata.publicAddress,
            type: 'magic'
          };
          next();
        })
        .catch(error => {
          Logger.error('Magic token verification failed:', error);
          res.status(401).json({ error: 'Invali Magic token' });
        });
      return;
    }
  }

  res.status(401).json({ error: 'Authentication required' });
}

export function optionalAuth(req, res, next) {
  // Check session first
  if (req.session && req.session.user) {
    req.user = req.session.user;
    return next();
  }

  // Check JWT token in Authorization header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret-change-in-production');
      req.user = decoded;
    } catch (error) {
      // Token invalid, but that's okay for optional auth
      req.user = null;
    }
  }

  // Check for client-side auth headers (permissionless auth)
  const authType = req.headers['x-auth-type'];
  
  if (authType === 'siwe') {
    const address = req.headers['x-auth-address'];
    if (address) {
      req.user = {
        address,
        type: 'siwe'
      };
    }
  } else if (authType === 'magic') {
    const didToken = req.headers['x-auth-token'];
    if (didToken) {
      // Verify the DID token asynchronously
      verifyMagicDid(didToken)
        .then(metadata => {
          req.user = {
            issuer: metadata.issuer,
            email: metadata.email,
            publicAddress: metadata.publicAddress,
            type: 'magic'
          };
          next();
        })
        .catch(error => {
          Logger.warn('Magic token verification failed:', error);
          req.user = null;
          next();
        });
      return;
    }
  }

  next();
}
