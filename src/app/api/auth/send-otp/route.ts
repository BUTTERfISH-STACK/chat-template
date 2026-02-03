import { NextRequest, NextResponse } from 'next/server';
import { sendOTP, checkRateLimit, formatPhoneNumber } from '@/lib/otp-premium';

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber, method = 'whatsapp', email, isNewUser = false } = await request.json();

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

    console.log(`[Send-OTP] Processing request for: ${formattedPhone} via ${method}`);

    // Send OTP using premium service
    const result = await sendOTP(formattedPhone, method, email, isNewUser);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.message },
        { status: 429 }
      );
    }

    // In development, return the OTP
    const isDevelopment = process.env.NODE_ENV !== 'production';

    return NextResponse.json({
      success: true,
      message: result.message,
      expiresAt: result.expiresAt,
      method: result.method,
      ...(isDevelopment && { otp: result.message.match(/\\d{6}/)?.[0] }), // Extract OTP from message in dev
      ...(result.backupCodes && { backupCodes: result.backupCodes }),
      ...(result.totpQrCode && { totpQrCode: result.totpQrCode }),
    });
  } catch (error: any) {
    console.error('Error sending OTP:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
