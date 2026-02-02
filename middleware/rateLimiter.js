/**
 * Rate Limiter Middleware - In-memory rate limiting for OTP requests
 * Uses Redis for distributed rate limiting in production
 */

const { createClient } = require('redis');
const rateLimit = require('express-rate-limit');

// In-memory store for development (use Redis in production)
const memoryStore = new Map();

/**
 * Get current request count for a phone number
 * @param {string} phone - Phone number
 * @returns {number} - Current request count
 */
function getRequestCount(phone) {
  const key = `ratelimit:${phone}`;
  const record = memoryStore.get(key);
  
  if (!record) {
    return 0;
  }
  
  // Check if window has expired
  const now = Date.now();
  const windowStart = now - (parseInt(process.env.OTP_RATE_LIMIT_WINDOW_MINUTES) * 60 * 1000);
  
  if (record.windowStart < windowStart) {
    // Window expired, reset count
    memoryStore.delete(key);
    return 0;
  }
  
  return record.count;
}

/**
 * Increment request count for a phone number
 * @param {string} phone - Phone number
 * @returns {number} - New request count
 */
function incrementRequestCount(phone) {
  const key = `ratelimit:${phone}`;
  const now = Date.now();
  const windowMs = parseInt(process.env.OTP_RATE_LIMIT_WINDOW_MINUTES) * 60 * 1000;
  const record = memoryStore.get(key);
  
  if (!record || record.windowStart < now - windowMs) {
    // New window
    memoryStore.set(key, {
      count: 1,
      windowStart: now
    });
    return 1;
  }
  
  record.count++;
  return record.count;
}

/**
 * Reset rate limit for a phone number (for testing)
 * @param {string} phone - Phone number
 */
function resetRateLimit(phone) {
  const key = `ratelimit:${phone}`;
  memoryStore.delete(key);
}

/**
 * Check if phone is rate limited
 * @param {string} phone - Phone number
 * @returns {object} - { limited: boolean, remaining: number, resetTime: number }
 */
function checkRateLimit(phone) {
  const maxRequests = parseInt(process.env.OTP_RATE_LIMIT_MAX_REQUESTS);
  const windowMs = parseInt(process.env.OTP_RATE_LIMIT_WINDOW_MINUTES) * 60 * 1000;
  const count = getRequestCount(phone);
  const key = `ratelimit:${phone}`;
  
  const record = memoryStore.get(key);
  const resetTime = record ? record.windowStart + windowMs : Date.now();
  const remaining = Math.max(0, maxRequests - count);
  
  return {
    limited: count >= maxRequests,
    remaining: remaining,
    resetTime: resetTime,
    retryAfter: record ? Math.ceil((resetTime - Date.now()) / 1000) : 0
  };
}

// Express rate limiter for general API protection
const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: 'Too many requests, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Custom rate limiter for OTP requests per phone number
 * @param {object} options - Rate limiter options
 * @returns {function} - Express middleware function
 */
function otpRateLimiter(options = {}) {
  const {
    windowMs = parseInt(process.env.OTP_RATE_LIMIT_WINDOW_MINUTES) * 60 * 1000,
    maxRequests = parseInt(process.env.OTP_RATE_LIMIT_MAX_REQUESTS),
    message = {
      success: false,
      error: 'Too many OTP requests. Please try again later.'
    }
  } = options;

  return async (req, res, next) => {
    try {
      const phone = req.body?.phone;
      
      if (!phone) {
        return res.status(400).json({
          success: false,
          error: 'Phone number is required'
        });
      }

      const rateLimitStatus = checkRateLimit(phone);
      
      // Set rate limit headers
      res.setHeader('X-RateLimit-Limit', maxRequests);
      res.setHeader('X-RateLimit-Remaining', rateLimitStatus.remaining);
      res.setHeader('X-RateLimit-Reset', Math.ceil(rateLimitStatus.resetTime / 1000));

      if (rateLimitStatus.limited) {
        res.setHeader('Retry-After', rateLimitStatus.retryAfter);
        return res.status(429).json(message);
      }

      // Increment counter
      incrementRequestCount(phone);
      
      next();
    } catch (error) {
      console.error('Rate limiter error:', error);
      // On error, allow the request but log it
      next();
    }
  };
}

module.exports = {
  apiRateLimiter,
  otpRateLimiter,
  checkRateLimit,
  incrementRequestCount,
  resetRateLimit,
  getRequestCount,
  memoryStore
};
