import { Buffer } from 'buffer';
import { useMultiFileAuthState } from '@whiskeysockets/baileys';
import makeWASocket, { DisconnectReason, WASocket } from '@whiskeysockets/baileys';
import P from 'pino';
import * as fs from 'fs';
import * as path from 'path';

// Configuration
const authDir = path.join(process.cwd(), 'whatsapp_auth');
const MAX_OTP_ATTEMPTS = 3;
const otpStore = new Map<string, { otp: string; attempts: number; createdAt: number }>();

// Ensure auth directory exists
if (!fs.existsSync(authDir)) {
  fs.mkdirSync(authDir, { recursive: true });
}

let sock: WASocket | null = null;
let isConnected = false;
let qrCodeData: string | null = null;

/**
 * Format phone number consistently (add + prefix if missing)
 */
function formatPhoneNumber(phoneNumber: string): string {
  return phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;
}

export async function initWhatsApp(): Promise<void> {
  if (sock && isConnected) {
    console.log('[WhatsApp] Already connected');
    return;
  }

  try {
    const { state, saveCreds } = await useMultiFileAuthState(authDir);

    sock = makeWASocket({
      auth: state,
      logger: P({ level: 'silent' }),
      printQRInTerminal: true,
    });

    sock.ev.on('connection.update' as any, (update: any) => {
      const { connection, lastDisconnect } = update;

      if (connection === 'close') {
        const shouldReconnect = (lastDisconnect?.error as any)?.output?.statusCode !== DisconnectReason.loggedOut;
        console.log('[WhatsApp] Connection closed:', lastDisconnect?.error);
        isConnected = false;
        
        if (shouldReconnect) {
          console.log('[WhatsApp] Reconnecting...');
          initWhatsApp();
        }
      } else if (connection === 'open') {
        console.log('[WhatsApp] Connected successfully!');
        isConnected = true;
        qrCodeData = null;
      }
    });

    sock.ev.on('creds.update' as any, saveCreds as any);
    sock.ev.on('qr' as any, (qr: string) => {
      console.log('[WhatsApp] QR Code generated');
      qrCodeData = qr;
    });

  } catch (error) {
    console.error('[WhatsApp] Initialization error:', error);
  }
}

export function getQRCode(): string | null {
  return qrCodeData;
}

export function isWhatsAppConnected(): boolean {
  return isConnected;
}

export function generateOTP(phoneNumber: string): string {
  const formattedPhone = formatPhoneNumber(phoneNumber);
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore.set(formattedPhone, {
    otp,
    attempts: 0,
    createdAt: Date.now(),
  });
  console.log(`[OTP] Generated for ${formattedPhone}: ${otp}`);
  return otp;
}

export function verifyOTP(phoneNumber: string, inputOTP: string): boolean {
  const formattedPhone = formatPhoneNumber(phoneNumber);
  const stored = otpStore.get(formattedPhone);
  
  if (!stored) {
    console.log(`[OTP] No OTP found for ${formattedPhone}`);
    return false;
  }

  // Check if OTP expired (5 minutes)
  if (Date.now() - stored.createdAt > 5 * 60 * 1000) {
    console.log(`[OTP] OTP expired for ${formattedPhone}`);
    otpStore.delete(formattedPhone);
    return false;
  }

  // Increment attempts
  stored.attempts++;

  if (stored.attempts > MAX_OTP_ATTEMPTS) {
    console.log(`[OTP] Too many attempts for ${formattedPhone}`);
    otpStore.delete(formattedPhone);
    return false;
  }

  if (stored.otp === inputOTP) {
    console.log(`[OTP] Valid OTP for ${formattedPhone}`);
    otpStore.delete(formattedPhone);
    return true;
  }

  console.log(`[OTP] Invalid OTP for ${formattedPhone}. Expected: ${stored.otp}, Got: ${inputOTP}`);
  return false;
}

export async function sendOTP(phoneNumber: string): Promise<{ success: boolean; otp?: string; message: string }> {
  const formattedPhone = formatPhoneNumber(phoneNumber);

  if (!isConnected || !sock) {
    console.log('[WhatsApp] Not connected, initializing...');
    await initWhatsApp();
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  if (!isConnected || !sock) {
    // Development mode - log OTP to console
    const otp = generateOTP(phoneNumber);
    console.log(`[DEV] OTP for ${formattedPhone}: ${otp}`);
    return {
      success: true,
      otp,
      message: 'Development mode: OTP logged to console. Connect WhatsApp to send real messages.',
    };
  }

  try {
    const otp = generateOTP(phoneNumber);
    
    await sock.sendMessage(`${formattedPhone}@s.whatsapp.net`, {
      text: `Your Vellon verification code is: ${otp}. This code expires in 5 minutes.`,
    });

    console.log(`[WhatsApp] OTP sent to ${formattedPhone}: ${otp}`);
    return {
      success: true,
      message: 'OTP sent via WhatsApp!',
    };
  } catch (error: any) {
    console.error('[WhatsApp] Failed to send message:', error.message || error);
    
    // Fallback to dev mode
    const otp = generateOTP(phoneNumber);
    console.log(`[DEV] OTP for ${formattedPhone}: ${otp}`);
    return {
      success: true,
      otp,
      message: 'Failed to send via WhatsApp. OTP logged to console.',
    };
  }
}

export function disconnectWhatsApp(): void {
  if (sock) {
    sock.end(null);
    sock = null;
    isConnected = false;
    console.log('[WhatsApp] Disconnected');
  }
}
