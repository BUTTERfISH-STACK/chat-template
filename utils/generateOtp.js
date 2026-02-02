/**
 * OTP Generator - Cryptographically secure OTP generation
 * Uses crypto.randomInt for secure random number generation
 */

/**
 * Generate a cryptographically secure 6-digit numeric OTP
 * @returns {string} - 6-digit OTP
 */
function generateOTP() {
  // Generate a cryptographically secure random number between 0 and 999999
  // Using crypto.randomInt for secure random generation
  const otp = crypto.randomInt(0, 1000000);
  
  // Pad with zeros if needed to ensure 6 digits
  return otp.toString().padStart(6, '0');
}

/**
 * Validate phone number format
 * Supports international formats: +27123456789, 27123456789, etc.
 * @param {string} phone - Phone number to validate
 * @returns {boolean} - True if valid, false otherwise
 */
function validatePhoneNumber(phone) {
  if (!phone || typeof phone !== 'string') {
    return false;
  }
  
  // Remove all non-digit characters except leading +
  const cleaned = phone.replace(/[^\d+]/g, '');
  
  // Check if it starts with + followed by digits
  // E.164 format: + followed by 10-15 digits
  const e164Regex = /^\+[1-9]\d{10,14}$/;
  
  // Or just digits (without country code)
  const digitsOnlyRegex = /^\d{10,15}$/;
  
  return e164Regex.test(cleaned) || digitsOnlyRegex.test(cleaned);
}

/**
 * Format phone number to E.164 format
 * @param {string} phone - Phone number to format
 * @returns {string} - Formatted phone number
 */
function formatPhoneNumber(phone) {
  if (!phone || typeof phone !== 'string') {
    return null;
  }
  
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');
  
  // If it starts with a country code (assuming 1-9), add +
  if (digits.length >= 10 && digits.length <= 15) {
    return `+${digits}`;
  }
  
  return null;
}

const crypto = require('crypto');

module.exports = {
  generateOTP,
  validatePhoneNumber,
  formatPhoneNumber
};
