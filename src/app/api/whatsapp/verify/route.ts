import { NextRequest, NextResponse } from 'next/server';
import { verifyOTP, formatPhoneNumber } from '@/lib/whatsapp';

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    
    // Validate required fields
    if (!body.phoneNumber || typeof body.phoneNumber !== 'string') {
      return NextResponse.json(
        { valid: false, error: 'phoneNumber is required and must be a string' },
        { status: 400 }
      );
    }
    
    if (!body.otp || typeof body.otp !== 'string') {
      return NextResponse.json(
        { valid: false, error: 'otp is required and must be a string' },
        { status: 400 }
      );
    }
    
    // Format phone number consistently
    const formattedPhone = formatPhoneNumber(body.phoneNumber);
    console.log(`[API] Verify OTP request for: ${formattedPhone}, otp: ${body.otp}`);
    
    // Verify OTP using unified function
    const isValid = verifyOTP(formattedPhone, body.otp);
    
    return NextResponse.json({
      valid: isValid,
      message: isValid ? 'OTP verified successfully!' : 'Invalid or expired OTP',
    });
  } catch (error: any) {
    console.error('Error in verify OTP API:', error);
    
    // Handle JSON parse errors
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { valid: false, error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { valid: false, error: error.message || 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
