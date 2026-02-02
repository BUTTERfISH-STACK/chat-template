import { NextRequest, NextResponse } from 'next/server';
import { mockDb, generateId } from '@/lib/db';
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

    // Find OTP record in mock database
    const otpRecord = mockDb.otps.get(phoneNumber);

    if (!otpRecord) {
      return NextResponse.json(
        { success: false, error: 'OTP not found or expired' },
        { status: 400 }
      );
    }

    // Check if OTP is expired
    if (otpRecord.expiresAt < new Date()) {
      return NextResponse.json(
        { success: false, error: 'OTP has expired' },
        { status: 400 }
      );
    }

    // Check if OTP is already used
    if (otpRecord.used) {
      return NextResponse.json(
        { success: false, error: 'OTP has already been used' },
        { status: 400 }
      );
    }

    // Verify OTP
    if (otpRecord.code !== otp) {
      return NextResponse.json(
        { success: false, error: 'Invalid OTP' },
        { status: 400 }
      );
    }

    // Mark OTP as used
    otpRecord.used = true;

    // Find or create user in mock database
    let user = Array.from(mockDb.users.values()).find((u: any) => u.phone === phoneNumber);

    if (!user) {
      user = {
        id: generateId(),
        phone: phoneNumber,
        name: phoneNumber,
        avatar: null,
        bio: null,
        status: 'OFFLINE',
        lastSeen: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockDb.users.set(user.id, user);
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
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
