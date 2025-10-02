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
      }
    }

    // Location validation
    if (data.latitude !== undefined) {
      const lat = parseFloat(data.latitude);
      if (isNaN(lat) || lat < -90 || lat > 90) {
        errors.push('Latitude must be between -90 and 90');
      }
    }

    if (data.longitude !== undefined) {
      const lon = parseFloat(data.longitude);
      if (isNaN(lon) || lon < -180 || lon > 180) {
        errors.push('Longitude must be between -180 and 180');
      }
    }

    if (data.radius !== undefined) {
      const radius = parseFloat(data.radius);
      if (isNaN(radius) || radius < 0) {
        errors.push('Radius must be a positive number');
      }
    }

    // Date validation
    if (data.begins !== undefined && !this.isValidDate(data.begins)) {
      errors.push('Invalid begins date');
    }

    if (data.ends !== undefined && !this.isValidDate(data.ends)) {
      errors.push('Invalid ends date');
    }

    if (errors.length > 0) {
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
