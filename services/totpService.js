/**
 * TOTP Service - Time-based One-Time Password (Authenticator App)
 * Uses speakeasy for TOTP generation and verification
 * 
 * This enables optional 2FA using authenticator apps like Google Authenticator
 */

const speakeasy = require('speakeasy');
const QRCode = require('qrcode');

/**
 * Generate a new TOTP secret for a user
 * @param {string} userId - User identifier
 * @param {string} appName - App name for authenticator
 * @returns {object} - { secret, qrCode, otpauthUrl }
 */
function generateTOTPSecret(userId, appName = 'Vellon') {
  // Generate a random secret
  const secret = speakeasy.generateSecret({
    name: `${appName} (${userId})`,
    issuer: appName,
    length: 32
  });

  return {
    secret: secret.base32,
    otpauthUrl: secret.otpauth_url,
    qrCode: null // Will be generated asynchronously
  };
}

/**
 * Generate QR code for TOTP setup
 * @param {string} otpauthUrl - OTP Auth URL from secret generation
 * @returns {Promise<string>} - Data URL for QR code image
 */
async function generateQRCode(otpauthUrl) {
  try {
    const qrCodeDataUrl = await QRCode.toDataURL(otpauthUrl);
    return qrCodeDataUrl;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw new Error('Failed to generate QR code');
  }
}

/**
 * Generate TOTP secret with QR code
 * @param {string} userId - User identifier
 * @param {string} appName - App name for authenticator
 * @returns {Promise<object>} - { secret, qrCode, otpauthUrl }
 */
async function generateTOTPWithQR(userId, appName = 'Vellon') {
  const { secret, otpauthUrl } = generateTOTPSecret(userId, appName);
  const qrCode = await generateQRCode(otpauthUrl);

  return {
    secret,
    qrCode,
    otpauthUrl
  };
}

/**
 * Verify a TOTP token
 * @param {string} token - TOTP token from authenticator app
 * @param {string} secret - User's TOTP secret
 * @param {object} options - Verification options
 * @returns {boolean} - True if token is valid
 */
function verifyTOTP(token, secret, options = {}) {
  const {
    window = 1, // Allow 1 step tolerance (30 seconds before/after)
    encoding = 'base32'
  } = options;

  try {
    const verified = speakeasy.totp.verify({
      secret: secret,
      encoding: encoding,
      token: token,
      window: window
    });

    return verified;
  } catch (error) {
    console.error('Error verifying TOTP:', error);
    return false;
  }
}

/**
 * Generate current TOTP token (for testing/debugging)
 * @param {string} secret - User's TOTP secret
 * @returns {string} - Current TOTP token
 */
function generateCurrentTOTP(secret) {
  return speakeasy.totp({
    secret: secret,
    encoding: 'base32'
  });
}

module.exports = {
  generateTOTPSecret,
  generateTOTPWithQR,
  generateQRCode,
  verifyTOTP,
  generateCurrentTOTP
};
