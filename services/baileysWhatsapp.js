/**
 * Baileys WhatsApp Service - Free Open Source WhatsApp Integration
 * Uses @whiskeysockets/baileys to send WhatsApp messages for free
 * 
 * Features:
 * - QR code authentication
 * - Send text messages
 * - Automatic reconnection
 * - Session persistence
 */

const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeInMemoryStore,
} = require('@whiskeysockets/baileys');
const pino = require('pino');
const path = require('path');
const fs = require('fs');
const QRCode = require('qrcode');

// In-memory store for socket
let sock = null;
let qrCodeData = null;
let isConnected = false;
let connectionCallback = null;

/**
 * Initialize Baileys WhatsApp connection
 * @param {Function} onQR - Callback for QR code
 * @param {Function} onConnected - Callback when connected
 */
async function initBaileys(onQR, onConnected) {
  try {
    // Create auth directory if not exists
    const authDir = path.join(__dirname, '../auth_info_baileys');
    if (!fs.existsSync(authDir)) {
      fs.mkdirSync(authDir, { recursive: true });
    }

    // Use multi-file auth state
    const { state, saveCreds } = await useMultiFileAuthState(authDir);
    
    // Fetch latest version
    const { version } = await fetchLatestBaileysVersion();
    
    console.log(`[Baileys] Using WhatsApp version ${version.join('.')}`);

    // Create socket
    sock = makeWASocket({
      logger: pino({ level: 'silent' }),
      printQRInTerminal: false,
      auth: state,
      version,
      shouldIgnoreJid: (jid) => {
        // Ignore stories and broadcast lists
        return jid.endsWith('@newsletter') || jid.endsWith('@broadcast');
      },
    });

    // Handle connection events
    sock.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        // Generate QR code
        qrCodeData = qr;
        if (onQR) {
          try {
            const qrImage = await QRCode.toDataURL(qr);
            onQR(qr, qrImage);
          } catch (err) {
            onQR(qr, null);
          }
        }
        console.log('[Baileys] QR Code generated - Scan with WhatsApp');
      }

      if (connection === 'close') {
        const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
        console.log('[Baileys] Connection closed:', DisconnectReason[lastDisconnect?.error?.output?.statusCode]);
        
        if (shouldReconnect) {
          console.log('[Baileys] Reconnecting...');
          initBaileys(onQR, onConnected);
        } else {
          isConnected = false;
          console.log('[Baileys] Logged out - Please restart and scan QR again');
        }
      } else if (connection === 'open') {
        isConnected = true;
        qrCodeData = null;
        console.log('[Baileys] Connected to WhatsApp!');
        if (onConnected) onConnected(true);
        if (connectionCallback) connectionCallback(true);
      }
    });

    // Save credentials on update
    sock.ev.on('creds.update', saveCreds);

    return sock;
  } catch (error) {
    console.error('[Baileys] Init error:', error);
    return null;
  }
}

/**
 * Send OTP via WhatsApp
 * @param {string} phone - Phone number (with country code, e.g., +27123456789)
 * @param {string} otp - OTP code to send
 * @returns {Promise<{success: boolean, message: string}>}
 */
async function sendOTP(phone, otp) {
  if (!sock || !isConnected) {
    console.log('[Baileys] Not connected - OTP logged instead');
    console.log(`[DEV] OTP for ${phone}: ${otp}`);
    return {
      success: false,
      message: 'WhatsApp not connected. OTP logged to console.',
      devMode: true
    };
  }

  try {
    // Format phone number (remove + if present)
    const formattedPhone = phone.startsWith('+') ? phone.substring(1) : phone;
    
    // Check if user has WhatsApp
    const jid = `${formattedPhone}@s.whatsapp.net`;
    
    // Send message
    await sock.sendMessage(jid, {
      text: `🔐 *Vellon Verification Code*\n\nYour verification code is: *${otp}*\n\nThis code expires in 5 minutes.\n\nIf you didn't request this, please ignore.`
    });

    console.log(`[Baileys] OTP sent to ${phone}: ${otp}`);
    return {
      success: true,
      message: 'OTP sent via WhatsApp'
    };
  } catch (error) {
    console.error('[Baileys] Send error:', error);
    
    // Fallback to console log
    console.log(`[DEV] OTP for ${phone}: ${otp}`);
    return {
      success: false,
      message: 'Failed to send WhatsApp message. OTP logged to console.',
      devMode: true
    };
  }
}

/**
 * Get QR code data
 * @returns {string|null}
 */
function getQRCode() {
  return qrCodeData;
}

/**
 * Check if connected
 * @returns {boolean}
 */
function isWhatsAppConnected() {
  return isConnected;
}

/**
 * Disconnect WhatsApp
 */
function disconnect() {
  if (sock) {
    sock.end();
    sock = null;
    isConnected = false;
    qrCodeData = null;
    console.log('[Baileys] Disconnected');
  }
}

/**
 * Set connection callback
 * @param {Function} callback
 */
function onConnection(callback) {
  connectionCallback = callback;
}

module.exports = {
  initBaileys,
  sendOTP,
  getQRCode,
  isWhatsAppConnected,
  disconnect,
  onConnection
};
