/**
 * OTP Routes - API endpoints for OTP generation and verification
 */

const express = require('express');
const { otpRateLimiter, apiRateLimiter } = require('../middleware/rateLimiter');
const {
  generateAndStoreOTP,
  verifyOTP,
  getOTPStatus,
  resetOTP
} = require('../services/otpService');
const { sendOTP, isWhatsAppConnected } = require('../services/baileysWhatsapp');

const router = express.Router();

/**
 * POST /request-otp
 * Request a new OTP for a phone number
 * 
 * Request body:
 * {
 *   "phone": "+27123456789"
 * }
 * 
 * Response:
 * - Success (200): { success: true, message: "OTP sent to +27123456789" }
 * - Error (400): { success: false, error: "Invalid phone number format" }
 * - Error (429): { success: false, error: "Too many requests" }
 */
router.post('/request-otp', apiRateLimiter, otpRateLimiter(), async (req, res) => {
  try {
    const { phone } = req.body;

    // Validate phone number is provided
    if (!phone) {
      return res.status(400).json({
        success: false,
        error: 'Phone number is required'
      });
    }

    console.log(`\n[OTP Request] Processing request for: ${phone}`);

    const result = await generateAndStoreOTP(phone);

    if (!result.success) {
      // Check if rate limited
      if (result.retryAfter) {
        return res.status(429).json({
          success: false,
          error: result.message,
          retryAfter: result.retryAfter
        });
      }

      return res.status(400).json({
        success: false,
        error: result.message
      });
    }

    // Send OTP via WhatsApp if connected, otherwise log
    let sendResult;
    if (result.otp) {
      const waConnected = isWhatsAppConnected();
      if (waConnected) {
        console.log(`[OTP Request] Sending OTP via WhatsApp to ${phone}`);
        sendResult = await sendOTP(phone, result.otp);
      } else {
        console.log(`[OTP Request] WhatsApp not connected - OTP logged instead`);
        console.log(`[DEV] OTP for ${phone}: ${result.otp}`);
        sendResult = { success: false, devMode: true };
      }
    }

    return res.status(200).json({
      success: true,
      message: sendResult?.success 
        ? 'OTP sent via WhatsApp' 
        : sendResult?.devMode 
          ? 'OTP sent (development mode - check server logs)'
          : 'OTP sent to phone',
      whatsappConnected: isWhatsAppConnected(),
      ...(result.otp && process.env.NODE_ENV !== 'production' && { otp: result.otp }),
      ...(sendResult?.devMode && { devMode: true })
    });
  } catch (error) {
    console.error('Error in /request-otp:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * POST /verify-otp
 * Verify an OTP for a phone number
 * 
 * Request body:
 * {
 *   "phone": "+27123456789",
 *   "otp": "123456"
 * }
 * 
 * Response:
 * - Success (200): { success: true, message: "OTP verified successfully" }
 * - Error (400): { success: false, error: "Invalid OTP", attemptsRemaining: 4 }
 * - Error (404): { success: false, error: "OTP not found or expired" }
 */
router.post('/verify-otp', apiRateLimiter, async (req, res) => {
  try {
    const { phone, otp } = req.body;

    // Validate inputs
    if (!phone) {
      return res.status(400).json({
        success: false,
        error: 'Phone number is required'
      });
    }

    if (!otp) {
      return res.status(400).json({
        success: false,
        error: 'OTP is required'
      });
    }

    // Validate OTP format (6 digits)
    if (!/^\d{6}$/.test(otp)) {
      return res.status(400).json({
        success: false,
        error: 'OTP must be a 6-digit number'
      });
    }

    console.log(`\n[OTP Verify] Processing verification for: ${phone}`);

    const result = await verifyOTP(phone, otp);

    if (!result.success) {
      // Check if OTP not found (404) or invalid (400)
      const statusCode = result.message.includes('not found') || result.message.includes('expired') ? 404 : 400;
      
      return res.status(statusCode).json({
        success: false,
        error: result.message,
        ...(result.attemptsRemaining !== undefined && { attemptsRemaining: result.attemptsRemaining })
      });
    }

    return res.status(200).json({
      success: true,
      message: result.message
    });
  } catch (error) {
    console.error('Error in /verify-otp:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * GET /otp-status/:phone
 * Get OTP status for a phone number (debug endpoint)
 * 
 * Response:
 * - Success (200): { exists: true, attempts: 1, attemptsRemaining: 4, ... }
 */
router.get('/otp-status/:phone', apiRateLimiter, async (req, res) => {
  try {
    const { phone } = req.params;
    const status = await getOTPStatus(phone);

    return res.status(200).json({
      success: true,
      ...status
    });
  } catch (error) {
    console.error('Error in /otp-status:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * DELETE /otp/:phone
 * Reset OTP for a phone number (debug/testing endpoint)
 * 
 * Response:
 * - Success (200): { success: true, message: "OTP reset successfully" }
 */
router.delete('/otp/:phone', apiRateLimiter, async (req, res) => {
  try {
    const { phone } = req.params;
    await resetOTP(phone);

    console.log(`[OTP Reset] OTP reset for: ${phone}`);

    return res.status(200).json({
      success: true,
      message: 'OTP reset successfully'
    });
  } catch (error) {
    console.error('Error in /otp delete:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * GET /health
 * Health check endpoint
 */
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'OTP service is running',
    timestamp: new Date().toISOString()
  });
});

/**
 * GET /whatsapp/status
 * Get WhatsApp connection status
 */
router.get('/whatsapp/status', (req, res) => {
  const connected = isWhatsAppConnected();
  res.status(200).json({
    success: true,
    connected,
    message: connected ? 'WhatsApp connected' : 'WhatsApp not connected'
  });
});

module.exports = router;
