import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
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

    // Find OTP record
    const otpRecord = await prisma.oTP.findUnique({
      where: { phone: phoneNumber },
    });

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
    await prisma.oTP.update({
      where: { id: otpRecord.id },
      data: { used: true },
    });

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { phone: phoneNumber },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          phone: phoneNumber,
          name: phoneNumber, // Default name to phone number
        },
      });
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
