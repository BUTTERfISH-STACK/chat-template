import { NextRequest, NextResponse } from 'next/server';
import { sendOTP as generateAndStoreOTP, checkRateLimit, formatPhoneNumber } from '@/lib/otp-premium';
import { sendOTP as sendSMS, generateOTP } from '@/lib/sms';

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

    // Check rate limit
    const rateLimit = checkRateLimit(formattedPhone);
    if (rateLimit.limited) {
      return NextResponse.json(
        { success: false, error: `Too many requests. Try again in ${rateLimit.retryAfter} seconds.` },
        { status: 429 }
      );
    }

    // Generate OTP
    const otp = generateOTP();
    console.log(`[Send-OTP] Generated OTP for ${formattedPhone}: ${otp}`);

    // Store OTP using premium service
    const storeResult = await generateAndStoreOTP(formattedPhone, method, email, isNewUser, otp);

    if (!storeResult.success) {
      return NextResponse.json(
        { success: false, error: storeResult.message },
        { status: 429 }
      );
    }

    // Send OTP via SMS/WhatsApp service
    const smsSent = await sendSMS(formattedPhone, otp);
    
    if (!smsSent) {
      console.warn(`[Send-OTP] SMS sending failed for ${formattedPhone}, OTP will still work in dev mode`);
    }

    // In development, return the OTP
    const isDevelopment = process.env.NODE_ENV !== 'production';

    return NextResponse.json({
      success: true,
      message: smsSent ? `OTP sent via ${method}` : 'OTP generated (check server logs)',
      expiresAt: storeResult.expiresAt,
      method: method,
      ...(isDevelopment && { otp: otp }),
      ...(storeResult.backupCodes && { backupCodes: storeResult.backupCodes }),
      ...(storeResult.totpQrCode && { totpQrCode: storeResult.totpQrCode }),
    });
  } catch (error: any) {
    console.error('Error sending OTP:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
