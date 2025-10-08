// Input validation utilities
export class Validator {
  static validateEntity(data) {
    const errors = [];

    // Type validation
    if (data.type && !['post', 'party', 'agent', 'place', 'thing', 'group'].includes(data.type)) {
      errors.push(`Invalid entity type: ${data.type}`);
    }

    // Slug validation
    if (data.slug !== undefined) {
      if (typeof data.slug !== 'string') {
        errors.push('Slug must be a string');
      } else if (data.slug !== '/' && !data.slug.startsWith('/')) {
        errors.push('Slug must start with /');
      } else if (data.slug.includes('//')) {
        errors.push('Slug cannot contain consecutive slashes');
      } else if (data.slug.length > 200) {
        errors.push('Slug cannot exceed 200 characters');
      } else if (data.slug.includes(' ')) {
        errors.push('Slug cannot contain spaces');
      } else if (!/^\/[a-zA-Z0-9\-_\/]*$/.test(data.slug)) {
        errors.push('Slug can only contain letters, numbers, hyphens, underscores, and forward slashes');
      }
    }

    // Address validation (Ethereum address format)
    if (data.address !== undefined && data.address !== null) {
      if (typeof data.address !== 'string') {
        errors.push('Address must be a string');
      } else if (!/^0x[a-fA-F0-9]{40}$/.test(data.address)) {
        errors.push('Address must be a valid Ethereum address (0x followed by 40 hex characters)');
      }
    }

    // Contract validation (Ethereum address format)
    if (data.contract !== undefined && data.contract !== null) {
      if (typeof data.contract !== 'string') {
        errors.push('Contract must be a string');
      } else if (!/^0x[a-fA-F0-9]{40}$/.test(data.contract)) {
        errors.push('Contract must be a valid Ethereum address (0x followed by 40 hex characters)');
      }
    }

    // Metadata validation
    if (data.metadata !== undefined && data.metadata !== null) {
      if (typeof data.metadata !== 'object' || Array.isArray(data.metadata)) {
        errors.push('Metadata must be an object');
      }
    }

    // SponsorId validation (should be a UUID) - OPTIONAL
    // Removed strict validation since sponsorId is optional

    // ParentId validation (should be a UUID) - OPTIONAL
    // Only validate format if provided
    if (data.parentId !== undefined && data.parentId !== null && data.parentId !== '') {
      if (typeof data.parentId !== 'string') {
        errors.push('ParentId must be a string');
      } else if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(data.parentId)) {
        errors.push('ParentId must be a valid UUID');
      }
    }

    // Location validation
    if (data.latitude !== undefined && data.latitude !== null) {
      const lat = parseFloat(data.latitude);
      if (isNaN(lat) || lat < -90 || lat > 90) {
        errors.push('Latitude must be between -90 and 90');
      }
    }

    if (data.longitude !== undefined && data.longitude !== null) {
      const lon = parseFloat(data.longitude);
      if (isNaN(lon) || lon < -180 || lon > 180) {
        errors.push('Longitude must be between -180 and 180');
      }
    }

    if (data.radius !== undefined && data.radius !== null) {
      const radius = parseFloat(data.radius);
      if (isNaN(radius) || radius < 0) {
        errors.push('Radius must be a positive number');
      }
    }

    // Date validation
    if (data.begins !== undefined && data.begins !== null && !this.isValidDate(data.begins)) {
      errors.push('Invalid begins date');
    }

    if (data.ends !== undefined && data.ends !== null && !this.isValidDate(data.ends)) {
      errors.push('Invalid ends date');
    }

    if (errors.length > 0) {
      console.error('❌ Validation failed with errors:', errors);
      console.error('   Data being validated:', JSON.stringify(data, null, 2));
      const error = new Error('Validation failed');
      error.validationErrors = errors;
      throw error;
    }

    return true;
  }

  static isValidDate(dateString) {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date);
  }

  static sanitizeQueryFilters(filters) {
    const sanitized = {};

    // Only allow known filter fields
    const allowedFields = [
      'type', 'parentId', 'sponsorId', 'slug', 'slugPrefix',
      'address', 'contract', 'auth',
      'latitude', 'longitude', 'radius',
      'begins', 'ends',
      'limit', 'offset'
    ];

    for (const field of allowedFields) {
      if (filters[field] !== undefined) {
        sanitized[field] = filters[field];
      }
    }

    // Validate and sanitize limit
    if (sanitized.limit !== undefined) {
      const limit = parseInt(sanitized.limit);
      sanitized.limit = isNaN(limit) ? 20 : Math.min(Math.max(1, limit), 1000);
    }

    // Validate and sanitize offset
    if (sanitized.offset !== undefined) {
      const offset = parseInt(sanitized.offset);
      sanitized.offset = isNaN(offset) ? 0 : Math.max(0, offset);
    }

    return sanitized;
  }
}
