import { NextRequest, NextResponse } from 'next/server';
import { verifyOTP } from '@/lib/whatsapp';

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber, otp } = await request.json();

    if (!phoneNumber || !otp) {
      return NextResponse.json(
        { error: 'Phone number and OTP are required' },
        { status: 400 }
      );
    }

    const isValid = verifyOTP(phoneNumber, otp);

    return NextResponse.json({
      valid: isValid,
      message: isValid ? 'OTP verified successfully!' : 'Invalid or expired OTP',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to verify OTP' },
      { status: 500 }
    );
  }
}
