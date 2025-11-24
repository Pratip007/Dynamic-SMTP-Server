const { AllowedOrigin } = require('../models');

let cachedOrigins = null;
let cacheTimestamp = null;
const CACHE_DURATION = 60000; // 1 minute cache

/**
 * Get allowed origins from database
 * @returns {Promise<string[]|string>} Array of origins or '*' for allow all
 */
async function getAllowedOrigins() {
  try {
    // Check cache first
    const now = Date.now();
    if (cachedOrigins !== null && cacheTimestamp && (now - cacheTimestamp) < CACHE_DURATION) {
      return cachedOrigins;
    }
    
    const origins = await AllowedOrigin.find({ is_active: true });
    
    // If no origins configured, allow all
    if (origins.length === 0) {
      cachedOrigins = '*';
      cacheTimestamp = now;
      return cachedOrigins;
    }
    
    // Check if wildcard is present
    const wildcard = origins.find(o => o.origin === '*');
    if (wildcard) {
      cachedOrigins = '*';
      cacheTimestamp = now;
      return cachedOrigins;
    }
    
    // Return array of active origins
    cachedOrigins = origins.map(o => o.origin);
    cacheTimestamp = now;
    return cachedOrigins;
  } catch (error) {
    console.error('Error fetching allowed origins:', error);
    // On error, default to allow all for safety
    return '*';
  }
}

/**
 * Check if an origin is allowed
 * @param {string} origin - The origin to check
 * @returns {Promise<boolean>}
 */
async function isOriginAllowed(origin) {
  try {
    const allowed = await getAllowedOrigins();
    
    // If no origins configured or wildcard, allow all
    if (allowed === '*') {
      return true;
    }
    
    // If no origin specified, allow (for direct API calls)
    if (!origin || origin === '*') {
      return true;
    }
    
    // Normalize origin for comparison (remove trailing slash, normalize protocol)
    let normalizedOrigin = origin.trim();
    if (normalizedOrigin.endsWith('/')) {
      normalizedOrigin = normalizedOrigin.slice(0, -1);
    }
    
    if (Array.isArray(allowed)) {
      // Check exact match
      if (allowed.includes(normalizedOrigin)) {
        return true;
      }
      
      // Also check normalized versions in the allowed list
      const normalizedAllowed = allowed.map(a => {
        let norm = a.trim();
        if (norm.endsWith('/')) {
          norm = norm.slice(0, -1);
        }
        return norm;
      });
      
      return normalizedAllowed.includes(normalizedOrigin);
    }
    
    // If no origins are configured, default to allow all
    return true;
  } catch (error) {
    console.error('Error checking origin:', error);
    // On error, allow the request (fail open)
    return true;
  }
}

/**
 * Clear the cache (call this after updating origins)
 */
function clearCache() {
  cachedOrigins = null;
  cacheTimestamp = null;
}

/**
 * Create dynamic CORS origin function for express-cors
 * @returns {Function} CORS origin function
 */
function createCorsOriginFunction() {
  return async (origin, callback) => {
    try {
      const allowed = await getAllowedOrigins();
      
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) {
        return callback(null, true);
      }
      
      // If wildcard or origin is in allowed list
      if (allowed === '*' || (Array.isArray(allowed) && allowed.includes(origin))) {
        return callback(null, true);
      }
      
      // Origin not allowed
      return callback(new Error('Not allowed by CORS'));
    } catch (error) {
      console.error('CORS origin check error:', error);
      // On error, allow the request (fail open)
      return callback(null, true);
    }
  };
}

module.exports = {
  getAllowedOrigins,
  isOriginAllowed,
  clearCache,
  createCorsOriginFunction,
};

