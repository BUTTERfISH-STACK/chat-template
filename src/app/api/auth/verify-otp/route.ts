import { NextRequest, NextResponse } from 'next/server';
import { verifyOTP, verifyBackupCode, formatPhoneNumber } from '@/lib/otp-premium';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Mock user database - in production, use a real database
const mockUsers = new Map<string, {
  id: string;
  phone: string;
  name?: string;
  avatar?: string;
  createdAt: Date;
}>();

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber, otp, useBackupCode = false, backupCode } = await request.json();
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    if (!phoneNumber) {
      return NextResponse.json(
        { success: false, error: 'Phone number is required' },
        { status: 400 }
      );
    }

    const formattedPhone = formatPhoneNumber(phoneNumber);
    if (!formattedPhone) {
      return NextResponse.json(
        { success: false, error: 'Invalid phone number format' },
        { status: 400 }
      );
    }

    console.log(`[Verify-OTP] Verifying for: ${formattedPhone}, useBackupCode: ${useBackupCode}`);

    let result;

    if (useBackupCode && backupCode) {
      // Verify using backup code
      const isValid = verifyBackupCode(formattedPhone, backupCode);
      if (isValid) {
        // Find or create user
        let user = Array.from(mockUsers.values()).find((u) => u.phone === formattedPhone);
        if (!user) {
          user = {
            id: crypto.createHash('md5').update(formattedPhone).digest('hex').substring(0, 16),
            phone: formattedPhone,
            name: formattedPhone,
            avatar: null,
            createdAt: new Date(),
          };
          mockUsers.set(user.id, user);
          console.log(`[Verify-OTP] Created new user via backup code: ${user.id}`);
        }

        const token = jwt.sign(
          { userId: user.id, phone: user.phone, method: 'backup-code' },
          JWT_SECRET,
          { expiresIn: '7d' }
        );

        return NextResponse.json({
          success: true,
          token,
          user: {
            id: user.id,
            phone: user.phone,
            name: user.name,
            avatar: user.avatar,
          },
          message: 'Verified using backup code',
        });
      } else {
        return NextResponse.json(
          { success: false, error: 'Invalid or already used backup code' },
          { status: 400 }
        );
      }
    }

    // Verify using OTP
    result = await verifyOTP(formattedPhone, otp, ip, userAgent);

    if (!result.success) {
      console.log(`[Verify-OTP] Failed: ${result.message}`);
      return NextResponse.json(
        { success: false, error: result.message },
        { status: 400 }
      );
    }

    // Find or create user
    let user = Array.from(mockUsers.values()).find((u) => u.phone === formattedPhone);
    if (!user) {
      user = {
        id: result.user?.id || crypto.createHash('md5').update(formattedPhone).digest('hex').substring(0, 16),
        phone: formattedPhone,
        name: formattedPhone,
        avatar: null,
        createdAt: new Date(),
      };
      mockUsers.set(user.id, user);
      console.log(`[Verify-OTP] Created new user: ${user.id}`);
    }

    console.log(`[Verify-OTP] Success for: ${formattedPhone}`);

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, phone: user.phone, method: 'otp' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: user.id,
        phone: user.phone,
        name: user.name,
        avatar: user.avatar,
      },
      message: result.message,
    });
  } catch (error: any) {
    console.error('Error verifying OTP:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
