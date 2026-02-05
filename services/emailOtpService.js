/**
 * Email OTP Service - Free email-based OTP authentication
 * Uses Nodemailer for sending OTP codes via email
 * 
 * Features:
 * - Free SMTP support (Gmail, Outlook, custom SMTP servers)
 * - Secure OTP generation and hashing
 * - Rate limiting to prevent abuse
 * - Configurable expiry time
 */

const nodemailer = require('nodemailer');
const crypto = require('crypto');

// In-memory storage for OTPs (replace with Redis in production)
const otpStore = new Map();
const rateLimitStore = new Map();

// Configuration
const OTP_EXPIRY_MS = parseInt(process.env.OTP_EXPIRY_MS) || 5 * 60 * 1000; // 5 minutes
const OTP_LENGTH = parseInt(process.env.OTP_LENGTH) || 6;
const MAX_ATTEMPTS = parseInt(process.env.MAX_OTP_ATTEMPTS) || 5;
const RATE_LIMIT_WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = parseInt(process.env.MAX_REQUESTS_PER_WINDOW) || 10;

/**
 * Create email transporter
 * Configure with your SMTP settings in environment variables
 */
function createTransporter() {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT) || 587;
  const secure = process.env.SMTP_SECURE === 'true';
  
  // For Gmail, use App Password
  // Get one at: https://myaccount.google.com/apppasswords
  const auth = {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  };

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth,
    tls: {
      rejectUnauthorized: process.env.NODE_ENV === 'production'
    }
  });
}

/**
 * Generate a cryptographically secure OTP
 * @returns {string} - OTP code
 */
function generateSecureOTP() {
  const randomBytes = crypto.randomBytes(4);
  const otpNumber = randomBytes.readUInt32BE(0) % (10 ** OTP_LENGTH);
  return otpNumber.toString().padStart(OTP_LENGTH, '0');
}

/**
 * Hash OTP using SHA-256 with salt
 * @param {string} otp - OTP to hash
 * @param {string} salt - Optional salt
 * @returns {string} - Hashed OTP
 */
function hashOTP(otp, salt = null) {
  const actualSalt = salt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.createHash('sha256');
  hash.update(actualSalt);
  hash.update(otp);
  return `${actualSalt}:${hash.digest('hex')}`;
}

/**
 * Verify OTP against stored hash using constant-time comparison
 * @param {string} otp - OTP to verify
 * @param {string} storedHash - Stored hash
 * @returns {boolean} - True if valid
 */
function verifyOTP(otp, storedHash) {
  try {
    const [salt, hash] = storedHash.split(':');
    if (!salt || !hash) return false;
    
    const computedHash = hashOTP(otp, salt);
    const storedHashPart = computedHash.split(':')[1];
    
    // Constant-time comparison
    if (storedHashPart.length !== hash.length) return false;
    
    let result = 0;
    for (let i = 0; i < storedHashPart.length; i++) {
      result |= storedHashPart.charCodeAt(i) ^ hash.charCodeAt(i);
    }
    return result === 0;
  } catch (error) {
    console.error('OTP verification error:', error);
    return false;
  }
}

/**
 * Check rate limit for an email
 * @param {string} email - Email to check
 * @returns {object} - { allowed: boolean, remaining: number }
 */
function checkRateLimit(email) {
  const now = Date.now();
  const entry = rateLimitStore.get(email);
  
  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(email, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW_MS
    });
    return { allowed: true, remaining: MAX_REQUESTS_PER_WINDOW - 1 };
  }
  
  if (entry.count >= MAX_REQUESTS_PER_WINDOW) {
    return { 
      allowed: false, 
      remaining: 0,
      retryAfter: Math.ceil((entry.resetAt - now) / 1000)
    };
  }
  
  entry.count++;
  rateLimitStore.set(email, entry);
  
  return { allowed: true, remaining: MAX_REQUESTS_PER_WINDOW - entry.count };
}

/**
 * Clean up expired rate limit entries
 */
function cleanupRateLimits() {
  const now = Date.now();
  for (const [email, entry] of rateLimitStore.entries()) {
    if (now > entry.resetAt) {
      rateLimitStore.delete(email);
    }
  }
}

// Clean up every 5 minutes
setInterval(cleanupRateLimits, 5 * 60 * 1000);

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} - True if valid
 */
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Send OTP via email
 * @param {string} email - Recipient email
 * @param {object} options - Additional options
 * @returns {Promise<object>} - { success: boolean, message: string, debugOtp?: string }
 */
async function sendEmailOTP(email, options = {}) {
  try {
    // Validate email
    if (!validateEmail(email)) {
      return {
        success: false,
        message: 'Invalid email format'
      };
    }

    // Check rate limit
    const rateLimit = checkRateLimit(email);
    if (!rateLimit.allowed) {
      return {
        success: false,
        message: 'Too many requests. Please try again later.',
        retryAfter: rateLimit.retryAfter
      };
    }

    // Generate OTP
    const otp = generateSecureOTP();
    const hashedOTP = hashOTP(otp);
    const expiresAt = Date.now() + OTP_EXPIRY_MS;

    // Store OTP
    otpStore.set(email, {
      hash: hashedOTP,
      attempts: 0,
      expiresAt
    });

    // Email content
    const appName = process.env.APP_NAME || 'Vellon Chat';
    const subject = options.subject || `Your ${appName} Verification Code`;
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .otp-box { 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px;
            margin: 20px 0;
          }
          .otp-code { 
            font-size: 36px; 
            font-weight: bold;
            letter-spacing: 8px;
            margin: 20px 0;
          }
          .footer { font-size: 12px; color: #666; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>${appName}</h2>
          <p>Your verification code is:</p>
          <div class="otp-box">
            <p>Please enter this code to complete your login:</p>
            <div class="otp-code">${otp}</div>
          </div>
          <p>This code will expire in ${Math.floor(OTP_EXPIRY_MS / 60000)} minutes.</p>
          <p>If you didn't request this code, please ignore this email.</p>
          <div class="footer">
            <p>Best regards,<br>${appName} Team</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const textContent = `
${appName} Verification Code

Your verification code is: ${otp}

This code will expire in ${Math.floor(OTP_EXPIRY_MS / 60000)} minutes.

If you didn't request this code, please ignore this email.

Best regards,
${appName} Team
    `;

    // Create transporter
    let transporter = null;
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      transporter = createTransporter();
    } else {
      // Log OTP for development without sending email
      console.log('\n=== Email OTP (Development Mode) ===');
      console.log(`To: ${email}`);
      console.log(`OTP: ${otp}`);
      console.log(`Expiry: ${OTP_EXPIRY_MS / 1000} seconds`);
      console.log('===================================\n');
      
      return {
        success: true,
        message: 'OTP sent successfully (development mode)',
        expiresIn: OTP_EXPIRY_MS / 1000,
        ...(process.env.NODE_ENV !== 'production' && { debugOtp: otp })
      };
    }

    // Send email
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || `"${appName}" <${process.env.SMTP_USER}>`,
      to: email,
      subject,
      text: textContent,
      html: htmlContent
    });

    console.log('\n=== Email OTP Sent ===');
    console.log(`To: ${email}`);
    console.log(`MessageId: ${info.messageId}`);
    console.log(`OTP: ${otp} (for testing)`);
    console.log('======================\n');

    return {
      success: true,
      message: 'OTP sent successfully',
      expiresIn: OTP_EXPIRY_MS / 1000,
      ...(process.env.NODE_ENV !== 'production' && { debugOtp: otp })
    };
  } catch (error) {
    console.error('Error sending email OTP:', error);
    return {
      success: false,
      message: 'Failed to send OTP. Please try again.'
    };
  }
}

/**
 * Verify OTP sent via email
 * @param {string} email - Recipient email
 * @param {string} otp - OTP to verify
 * @returns {Promise<object>} - { success: boolean, message: string }
 */
async function verifyEmailOTP(email, otp) {
  try {
    // Validate email
    if (!validateEmail(email)) {
      return {
        success: false,
        message: 'Invalid email format'
      };
    }

    // Get stored OTP
    const storedData = otpStore.get(email);
    
    if (!storedData) {
      return {
        success: false,
        message: 'OTP not found or expired. Please request a new OTP.'
      };
    }

    // Check expiry
    if (Date.now() > storedData.expiresAt) {
      otpStore.delete(email);
      return {
        success: false,
        message: 'OTP has expired. Please request a new OTP.'
      };
    }

    // Check max attempts
    if (storedData.attempts >= MAX_ATTEMPTS) {
      otpStore.delete(email);
      return {
        success: false,
        message: 'Too many failed attempts. Please request a new OTP.'
      };
    }

    // Increment attempts
    storedData.attempts++;
    otpStore.set(email, storedData);

    // Verify OTP
    const isValid = verifyOTP(otp, storedData.hash);
    
    if (isValid) {
      // Delete OTP after successful verification
      otpStore.delete(email);
      
      console.log(`Email OTP verified successfully for ${email}`);
      
      return {
        success: true,
        message: 'OTP verified successfully'
      };
    } else {
      const remainingAttempts = MAX_ATTEMPTS - storedData.attempts;
      
      console.log(`Invalid OTP attempt for ${email}. Attempts remaining: ${remainingAttempts}`);
      
      return {
        success: false,
        message: 'Invalid OTP',
        attemptsRemaining: remainingAttempts
      };
    }
  } catch (error) {
    console.error('Error verifying email OTP:', error);
    return {
      success: false,
      message: 'Failed to verify OTP. Please try again.'
    };
  }
}

/**
 * Check if an OTP exists for an email (for debugging)
 * @param {string} email - Email to check
 * @returns {object} - { exists: boolean, attemptsRemaining?: number, expired?: boolean }
 */
function getOTPStatus(email) {
  const storedData = otpStore.get(email);
  
  if (!storedData) {
    return { exists: false };
  }
  
  const isExpired = Date.now() > storedData.expiresAt;
  const attemptsRemaining = MAX_ATTEMPTS - storedData.attempts;
  
  return {
    exists: true,
    expired: isExpired,
    attemptsRemaining: Math.max(0, attemptsRemaining)
  };
}

/**
 * Delete OTP for an email (for testing or reset)
 * @param {string} email - Email to clear
 */
function clearOTP(email) {
  otpStore.delete(email);
}

/**
 * Reset rate limit for an email
 * @param {string} email - Email to reset
 */
function resetRateLimit(email) {
  rateLimitStore.delete(email);
}

module.exports = {
  sendEmailOTP,
  verifyEmailOTP,
  getOTPStatus,
  clearOTP,
  resetRateLimit,
  validateEmail,
  generateSecureOTP,
  hashOTP,
  verifyOTP
};
