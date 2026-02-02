import { NextRequest, NextResponse } from 'next/server';
import { generateAndStoreOTP, getOTP, formatPhoneNumber } from '@/lib/db';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber } = await request.json();

    if (!phoneNumber) {
      return NextResponse.json(
        { success: false, error: 'Phone number is required' },
        { status: 400 }
      );
    }

    // Format phone number consistently
    const formattedPhone = formatPhoneNumber(phoneNumber);
    console.log(`[Send-OTP] Processing request for: ${formattedPhone}`);

    // Generate and store OTP
    const { code, expiresAt } = generateAndStoreOTP(formattedPhone);

    // Log OTP for development
    console.log(`[Send-OTP] OTP for ${formattedPhone}: ${code} (expires: ${expiresAt.toISOString()})`);

    // Return success - include OTP in development mode
    const isDevelopment = !process.env.META_ACCESS_TOKEN && !process.env.TWILIO_ACCOUNT_SID;
    
    return NextResponse.json({
      success: true,
      message: 'OTP sent successfully',
      ...(isDevelopment && { otp: code }),
    });
  } catch (error: any) {
    console.error('Error sending OTP:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
