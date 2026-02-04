/**
 * OTP Service - Core OTP operations with Redis storage
 * Handles OTP generation, storage, verification, and expiry
 */

const { createClient } = require('redis');
const { hashOTP, compareHashes } = require('../utils/hash');
const { generateOTP, formatPhoneNumber } = require('../utils/generateOtp');
const { checkRateLimit, incrementRequestCount, getRequestCount } = require('../middleware/rateLimiter');

// Redis client (null for in-memory fallback)
let redisClient = null;

/**
 * Initialize Redis connection
 * @returns {Promise<object>} - Redis client
 */
async function initRedis() {
  if (redisClient && redisClient.isOpen) {
    return redisClient;
  }

  try {
    redisClient = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
      socket: {
        reconnectStrategy: false // Don't auto-reconnect
      }
    });

    redisClient.on('error', (err) => {
      // Only log, don't retry
      console.warn('Redis Client Error (using in-memory fallback):', err.message);
    });

    redisClient.on('connect', () => {
      console.log('Redis client connected');
    });

    await redisClient.connect();
    return redisClient;
  } catch (error) {
    console.warn('Redis connection failed, using in-memory storage:', error.message);
    return null;
  }
}

/**
 * Get storage client (Redis or in-memory fallback)
 * @returns {object} - Storage client
 */
function getStorage() {
  return redisClient;
}

/**
 * Set a value in storage with optional TTL
 * @param {string} key - Storage key
 * @param {any} value - Value to store
 * @param {number} ttlSeconds - Time to live in seconds
 */
async function setStorage(key, value, ttlSeconds) {
  const data = JSON.stringify(value);
  
  if (redisClient && redisClient.isOpen) {
    if (ttlSeconds) {
      await redisClient.setEx(key, ttlSeconds, data);
    } else {
      await redisClient.set(key, data);
    }
  } else {
    // In-memory fallback
    if (!global.otpMemoryStore) {
      global.otpMemoryStore = new Map();
    }
    
    global.otpMemoryStore.set(key, {
      data: value,
      expiry: ttlSeconds ? Date.now() + (ttlSeconds * 1000) : null
    });
    
    // Clean up expired entries periodically
    if (!global.memoryCleanupInterval) {
      global.memoryCleanupInterval = setInterval(() => {
        const now = Date.now();
        for (const [k, v] of global.otpMemoryStore.entries()) {
          if (v.expiry && v.expiry < now) {
            global.otpMemoryStore.delete(k);
          }
        }
      }, 60000); // Clean up every minute
    }
  }
}

/**
 * Get a value from storage
 * @param {string} key - Storage key
 * @returns {any|null} - Stored value or null
 */
async function getStorage(key) {
  if (redisClient && redisClient.isOpen) {
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;
  } else {
    // In-memory fallback
    if (!global.otpMemoryStore) {
      return null;
    }
    
    const record = global.otpMemoryStore.get(key);
    if (!record) {
      return null;
    }
    
    // Check expiry
    if (record.expiry && record.expiry < Date.now()) {
      global.otpMemoryStore.delete(key);
      return null;
    }
    
    return record.data;
  }
}

/**
 * Delete a value from storage
 * @param {string} key - Storage key
 * @returns {boolean} - True if deleted
 */
async function deleteStorage(key) {
  if (redisClient && redisClient.isOpen) {
    const result = await redisClient.del(key);
    return result > 0;
  } else {
    // In-memory fallback
    if (!global.otpMemoryStore) {
      return false;
    }
    return global.otpMemoryStore.delete(key);
  }
}

/**
 * Generate and store OTP for a phone number
 * @param {string} phone - Phone number
 * @returns {Promise<object>} - { success: boolean, otp?: string, message: string }
 */
async function generateAndStoreOTP(phone) {
  try {
    // Format and validate phone number
    const formattedPhone = formatPhoneNumber(phone);
    if (!formattedPhone) {
      return {
        success: false,
        message: 'Invalid phone number format'
      };
    }

    // Check rate limit
    const rateLimitStatus = checkRateLimit(formattedPhone);
    if (rateLimitStatus.limited) {
      return {
        success: false,
        message: 'Too many requests. Please try again later.',
        retryAfter: rateLimitStatus.retryAfter
      };
    }

    // Generate OTP
    const otp = generateOTP();
    const hashedOTP = hashOTP(otp);
    const expirySeconds = parseInt(process.env.OTP_EXPIRY_SECONDS) || 300;
    
    // Store OTP in Redis with hashed value
    const otpKey = `otp:${formattedPhone}`;
    const otpData = {
      hash: hashedOTP,
      attempts: 0,
      createdAt: Date.now()
    };
    
    await setStorage(otpKey, otpData, expirySeconds);
    
    // Increment rate limit counter
    incrementRequestCount(formattedPhone);

    // Log OTP (in development - simulate SMS sending)
    console.log(`\n=== OTP Generated ===`);
    console.log(`Phone: ${formattedPhone}`);
    console.log(`OTP: ${otp}`);
    console.log(`Hash: ${hashedOTP}`);
    console.log(`Expiry: ${expirySeconds} seconds`);
    console.log(`====================\n`);

    // In production, you would send the OTP via SMS/WhatsApp here
    // For now, we log it to console

    return {
      success: true,
      message: `OTP sent to ${formattedPhone}`,
      // Only return OTP in development mode
      ...(process.env.NODE_ENV !== 'production' && { otp })
    };
  } catch (error) {
    console.error('Error generating OTP:', error);
    return {
      success: false,
      message: 'Failed to generate OTP'
    };
  }
}

/**
 * Verify OTP for a phone number
 * @param {string} phone - Phone number
 * @param {string} otp - OTP to verify
 * @returns {Promise<object>} - { success: boolean, message: string }
 */
async function verifyOTP(phone, otp) {
  try {
    // Format and validate phone number
    const formattedPhone = formatPhoneNumber(phone);
    if (!formattedPhone) {
      return {
        success: false,
        message: 'Invalid phone number format'
      };
    }

    // Get stored OTP data
    const otpKey = `otp:${formattedPhone}`;
    const storedData = await getStorage(otpKey);

    if (!storedData) {
      return {
        success: false,
        message: 'OTP not found or expired'
      };
    }

    const maxAttempts = parseInt(process.env.MAX_OTP_ATTEMPTS) || 5;

    // Increment attempt count
    storedData.attempts++;

    // Check if too many attempts
    if (storedData.attempts > maxAttempts) {
      // Delete OTP after too many failed attempts
      await deleteStorage(otpKey);
      console.log(`OTP deleted - too many attempts for ${formattedPhone}`);
      
      return {
        success: false,
        message: 'Too many failed attempts. Please request a new OTP.'
      };
    }

    // Hash the provided OTP and compare
    const hashedInput = hashOTP(otp);
    const isValid = compareHashes(hashedInput, storedData.hash);

    // Update attempt count in storage
    const expirySeconds = parseInt(process.env.OTP_EXPIRY_SECONDS) || 300;
    await setStorage(otpKey, storedData, expirySeconds);

    if (isValid) {
      // Delete OTP after successful verification (one-time use)
      await deleteStorage(otpKey);
      console.log(`OTP verified successfully for ${formattedPhone}`);

      return {
        success: true,
        message: 'OTP verified successfully'
      };
    } else {
      console.log(`Invalid OTP attempt for ${formattedPhone}. Attempts: ${storedData.attempts}/${maxAttempts}`);
      
      return {
        success: false,
        message: 'Invalid OTP',
        attemptsRemaining: maxAttempts - storedData.attempts
      };
    }
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return {
      success: false,
      message: 'Failed to verify OTP'
    };
  }
}

/**
 * Get OTP status for a phone number (for debugging)
 * @param {string} phone - Phone number
 * @returns {Promise<object>} - OTP status
 */
async function getOTPStatus(phone) {
  const formattedPhone = formatPhoneNumber(phone);
  if (!formattedPhone) {
    return { exists: false, message: 'Invalid phone number' };
  }

  const otpKey = `otp:${formattedPhone}`;
  const storedData = await getStorage(otpKey);
  const rateLimitCount = getRequestCount(formattedPhone);
  const maxRequests = parseInt(process.env.OTP_RATE_LIMIT_MAX_REQUESTS);
  const maxAttempts = parseInt(process.env.MAX_OTP_ATTEMPTS);

  return {
    exists: !!storedData,
    attempts: storedData?.attempts || 0,
    attemptsRemaining: storedData ? maxAttempts - storedData.attempts : maxAttempts,
    rateLimitCount,
    rateLimitRemaining: Math.max(0, maxRequests - rateLimitCount)
  };
}

/**
 * Reset OTP and rate limit for a phone number (for testing)
 * @param {string} phone - Phone number
 */
async function resetOTP(phone) {
  const formattedPhone = formatPhoneNumber(phone);
  if (!formattedPhone) return;

  const otpKey = `otp:${formattedPhone}`;
  await deleteStorage(otpKey);
  
  // Also reset rate limit
  const rateLimitKey = `ratelimit:${formattedPhone}`;
  if (global.otpMemoryStore) {
    global.otpMemoryStore.delete(rateLimitKey);
  }
}

/**
 * Close Redis connection
 */
async function closeConnection() {
  if (redisClient && redisClient.isOpen) {
    await redisClient.quit();
    redisClient = null;
  }
  
  // Clear memory cleanup interval
  if (global.memoryCleanupInterval) {
    clearInterval(global.memoryCleanupInterval);
    global.memoryCleanupInterval = null;
  }
}

module.exports = {
  initRedis,
  generateAndStoreOTP,
  verifyOTP,
  getOTPStatus,
  resetOTP,
  closeConnection,
  getStorage,
  setStorage
};
