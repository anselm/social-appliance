import jwt from 'jsonwebtoken';
import { Logger } from '../utils/logger.js';

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

  next();
}
