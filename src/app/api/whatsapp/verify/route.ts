import { NextRequest, NextResponse } from 'next/server';
import { verifyOTP } from '@/lib/whatsapp';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    
    if (!body) {
      return NextResponse.json(
        { error: 'Phone number and OTP are required' },
        { status: 400 }
      );
    }
    
    const { phoneNumber, otp } = JSON.parse(body);

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
    console.error('Error in verify OTP API:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to verify OTP' },
      { status: 500 }
    );
  }
}
