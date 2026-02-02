import { NextRequest, NextResponse } from 'next/server';
import { sendOTP, generateOTP } from '@/lib/sms';
import { mockDb, generateId } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber } = await request.json();

    if (!phoneNumber) {
      return NextResponse.json(
        { success: false, error: 'Phone number is required' },
        { status: 400 }
      );
    }

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Store OTP in mock database
    mockDb.otps.set(phoneNumber, {
      code: otp,
      expiresAt,
      used: false,
    });

    // Send OTP via SMS
    const sent = await sendOTP(phoneNumber, otp);

    if (!sent) {
      return NextResponse.json(
        { success: false, error: 'Failed to send OTP' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'OTP sent successfully',
    });
  } catch (error) {
    console.error('Error sending OTP:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
