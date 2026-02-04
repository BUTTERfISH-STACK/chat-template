/**
 * OTP Authentication Server
 * Production-ready OTP authentication system with Redis storage
 * 
 * Features:
 * - Cryptographically secure OTP generation
 * - SHA-256 hashing for OTP storage
 * - Redis for OTP persistence and expiry
 * - Rate limiting per phone number
 * - Constant-time comparison for security
 */

require('dotenv').config();

const express = require('express');
const { initRedis, closeConnection } = require('./services/otpService');
const otpRoutes = require('./routes/otpRoutes');
const { initBaileys, isWhatsAppConnected, getQRCode, onConnection } = require('./services/baileysWhatsapp');

const app = express();
const PORT = process.env.OTP_PORT || 3001;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`\n[${timestamp}] ${req.method} ${req.path}`);
  if (req.body && Object.keys(req.body).length > 0) {
    // Mask sensitive data in logs
    const logBody = { ...req.body };
    if (logBody.otp) logBody.otp = '[REDACTED]';
    console.log('Request body:', JSON.stringify(logBody));
  }
  next();
});

// CORS middleware (for development)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Expose-Headers', 'X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset, Retry-After');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// API Routes
app.use('/api', otpRoutes);

// WhatsApp QR Code endpoint
app.get('/whatsapp/qr', (req, res) => {
  const qr = getQRCode();
  if (qr) {
    res.json({
      success: true,
      qrCode: qr,
      connected: isWhatsAppConnected()
    });
  } else {
    res.json({
      success: true,
      qrCode: null,
      connected: isWhatsAppConnected()
    });
  }
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'OTP Authentication System',
    version: '1.0.0',
    description: 'Production-ready OTP authentication with Redis storage',
    endpoints: {
      requestOtp: 'POST /api/request-otp',
      verifyOtp: 'POST /api/verify-otp',
      otpStatus: 'GET /api/otp-status/:phone',
      resetOtp: 'DELETE /api/otp/:phone',
      health: 'GET /api/health'
    },
    documentation: {
      requestOtp: {
        body: { phone: '+27123456789' },
        response: { success: true, message: 'OTP sent to +27123456789' }
      },
      verifyOtp: {
        body: { phone: '+27123456789', otp: '123456' },
        response: { success: true, message: 'OTP verified successfully' }
      }
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    availableEndpoints: [
      'POST /api/request-otp',
      'POST /api/verify-otp',
      'GET /api/otp-status/:phone',
      'DELETE /api/otp/:phone',
      'GET /api/health'
    ]
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

/**
 * Initialize the server
 */
async function startServer() {
  try {
    // Initialize Redis connection
    console.log('\n=== OTP Authentication Server ===\n');
    console.log('Initializing Redis connection...');
    await initRedis();
    
    // Initialize Baileys WhatsApp connection
    console.log('Initializing Baileys WhatsApp...');
    initBaileys(
      (qr, qrImage) => {
        console.log('\n[WhatsApp] QR Code ready - Scan to connect');
      },
      (connected) => {
        console.log('[WhatsApp] Connected! Ready to send OTPs');
      }
    );
    
    // Start the server
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`Redis: ${process.env.REDIS_URL || 'redis://localhost:6379'}`);
      console.log(`OTP Expiry: ${process.env.OTP_EXPIRY_SECONDS || 300} seconds`);
      console.log(`Max Attempts: ${process.env.MAX_OTP_ATTEMPTS || 5}`);
      console.log(`Rate Limit: ${process.env.OTP_RATE_LIMIT_MAX_REQUESTS || 3} requests per ${process.env.OTP_RATE_LIMIT_WINDOW_MINUTES || 10} minutes`);
      console.log('\nAvailable endpoints:');
      console.log('  POST   /api/request-otp   - Request a new OTP');
      console.log('  POST   /api/verify-otp    - Verify an OTP');
      console.log('  GET    /api/otp-status/:phone - Get OTP status');
      console.log('  DELETE /api/otp/:phone    - Reset OTP (debug)');
      console.log('  GET    /api/health        - Health check');
      console.log('  GET    /whatsapp/qr       - Get WhatsApp QR code');
      console.log('  GET    /api/whatsapp/status - WhatsApp connection status');
      console.log('\nWhatsApp Authentication:');
      console.log('  1. Go to http://localhost:3001/whatsapp/qr to get QR code');
      console.log('  2. Scan with WhatsApp to connect');
      console.log('  3. OTPs will be sent via WhatsApp for free!\n');
    });

    // Graceful shutdown
    process.on('SIGTERM', async () => {
      console.log('\nReceived SIGTERM, shutting down gracefully...');
      await closeConnection();
      process.exit(0);
    });

    process.on('SIGINT', async () => {
      console.log('\nReceived SIGINT, shutting down gracefully...');
      await closeConnection();
      process.exit(0);
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Export for testing
module.exports = { app, startServer };

// Start the server if this file is run directly
if (require.main === module) {
  startServer();
}
