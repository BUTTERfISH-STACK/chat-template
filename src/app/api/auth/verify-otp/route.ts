import { NextRequest, NextResponse } from 'next/server';
import { verifyOTP, formatPhoneNumber, generateId } from '@/lib/db';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber, otp } = await request.json();

    if (!phoneNumber || !otp) {
      return NextResponse.json(
        { success: false, error: 'Phone number and OTP are required' },
        { status: 400 }
      );
    }

    // Format phone number consistently
    const formattedPhone = formatPhoneNumber(phoneNumber);
    console.log(`[Verify-OTP] Verifying for: ${formattedPhone}, code: ${otp}`);

    // Verify OTP using unified function
    const result = verifyOTP(formattedPhone, otp);

    if (!result.valid) {
      console.log(`[Verify-OTP] Failed: ${result.error}`);
      return NextResponse.json(
        { success: false, error: result.error || 'Invalid OTP' },
        { status: 400 }
      );
    }

    console.log(`[Verify-OTP] Success for: ${formattedPhone}`);

    // Find or create user in mock database
    // Note: We're importing mockDb separately to avoid circular dependencies
    const { mockDb } = await import('@/lib/db');
    let user = Array.from(mockDb.users.values()).find((u: any) => u.phone === formattedPhone);

    if (!user) {
      user = {
        id: generateId(),
        phone: formattedPhone,
        name: formattedPhone,
        avatar: null,
        bio: null,
        status: 'OFFLINE',
        lastSeen: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockDb.users.set(user.id, user);
      console.log(`[Verify-OTP] Created new user: ${user.id}`);
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, phone: user.phone },
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
    });
  } catch (error: any) {
    console.error('Error verifying OTP:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
