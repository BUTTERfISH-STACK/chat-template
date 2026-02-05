// Simple authentication API - Phone-based login with OTP verification
// Uses local SQLite database for user storage

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// Generate a simple secure token
function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// Generate user ID
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

// Simple in-memory OTP storage (in production, use Redis)
const otpStore = new Map<string, { otp: string; expiresAt: number }>();

// Generate 6-digit OTP
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send OTP (simulated - in production, integrate with SMS service)
async function sendOTP(phoneNumber: string, otp: string): Promise<boolean> {
  console.log(`[SMS] OTP for ${phoneNumber}: ${otp}`);
  // In production, integrate with Twilio, WhatsApp Business API, etc.
  return true;
}

// User interface for return type
interface UserResult {
  id: string;
  phoneNumber: string;
  name: string | null;
  avatar: string | null;
}

// Create or get user from SQLite database
async function createOrGetUser(phoneNumber: string): Promise<UserResult> {
  const dbPath = process.env.DATABASE_PATH || './data/database.db';
  const Database = (await import('better-sqlite3')).default;
  const sqlite = new Database(dbPath);

  // Check if user exists
  const stmt = sqlite.prepare('SELECT * FROM users WHERE phone_number = ?');
  const existingUser = stmt.get(phoneNumber) as { id: string; phone_number: string; name: string | null; avatar: string | null } | undefined;

  if (existingUser) {
    return {
      id: existingUser.id,
      phoneNumber: existingUser.phone_number,
      name: existingUser.name,
      avatar: existingUser.avatar,
    };
  }

  // Create new user
  const userId = generateId();
  const now = Date.now();
  const displayName = `User ${phoneNumber.slice(-4)}`;

  sqlite.prepare(`
    INSERT INTO users (id, phone_number, name, avatar, is_verified, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(userId, phoneNumber, displayName, null, 1, now, now);

  return {
    id: userId,
    phoneNumber,
    name: displayName,
    avatar: null,
  };
}

// POST /api/auth/login - Send OTP
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phoneNumber, action } = body;

    if (!phoneNumber) {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      );
    }

    // Normalize phone number
    const normalizedPhone = phoneNumber.replace(/[^+\d]/g, '');

    if (action === 'verify') {
      // Verify OTP
      const { otp } = body;
      
      if (!otp) {
        return NextResponse.json(
          { error: 'OTP is required' },
          { status: 400 }
        );
      }

      const storedData = otpStore.get(normalizedPhone);
      
      if (!storedData) {
        return NextResponse.json(
          { error: 'OTP not sent or expired. Please request a new OTP.' },
          { status: 400 }
        );
      }

      if (Date.now() > storedData.expiresAt) {
        otpStore.delete(normalizedPhone);
        return NextResponse.json(
          { error: 'OTP expired. Please request a new OTP.' },
          { status: 400 }
        );
      }

      if (storedData.otp !== otp) {
        return NextResponse.json(
          { error: 'Invalid OTP' },
          { status: 400 }
        );
      }

      // OTP verified - clear OTP store
      otpStore.delete(normalizedPhone);

      // Create or get user from database
      const user = await createOrGetUser(normalizedPhone);

      // Generate session token
      const token = generateToken();

      return NextResponse.json({
        success: true,
        user: {
          id: user.id,
          phoneNumber: user.phoneNumber,
          name: user.name,
          avatar: user.avatar,
        },
        token,
      });
    } else {
      // Send OTP
      const otp = generateOTP();
      const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

      otpStore.set(normalizedPhone, { otp, expiresAt });

      // Send OTP via SMS
      await sendOTP(normalizedPhone, otp);

      return NextResponse.json({
        success: true,
        message: 'OTP sent successfully',
        // Only in development - remove in production
        ...(process.env.NODE_ENV === 'development' && { debugOtp: otp }),
      });
    }
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'An error occurred during login. Please try again.' },
      { status: 500 }
    );
  }
}
