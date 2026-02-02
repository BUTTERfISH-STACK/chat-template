/**
 * Hash Utility - OTP Hashing with SHA-256
 * Uses constant-time comparison to prevent timing attacks
 */

const crypto = require('crypto');

/**
 * Hash an OTP using SHA-256
 * @param {string} otp - The OTP to hash
 * @returns {string} - The hashed OTP
 */
function hashOTP(otp) {
  return crypto.createHash('sha256').update(otp).digest('hex');
}

/**
 * Compare two hashes using constant-time comparison
 * Prevents timing attacks by always taking the same amount of time
 * @param {string} hash1 - First hash to compare
 * @param {string} hash2 - Second hash to compare
 * @returns {boolean} - True if hashes match, false otherwise
 */
function compareHashes(hash1, hash2) {
  if (typeof hash1 !== 'string' || typeof hash2 !== 'string') {
    return false;
  }
  
  // Use timingSafeEqual for constant-time comparison
  const buf1 = Buffer.from(hash1, 'hex');
  const buf2 = Buffer.from(hash2, 'hex');
  
  if (buf1.length !== buf2.length) {
    return false;
  }
  
  return crypto.timingSafeEqual(buf1, buf2);
}

/**
 * Generate a secure random string
 * @param {number} length - Length of the random string
 * @returns {string} - Secure random hex string
 */
function generateSecureToken(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}

module.exports = {
  hashOTP,
  compareHashes,
  generateSecureToken
};
