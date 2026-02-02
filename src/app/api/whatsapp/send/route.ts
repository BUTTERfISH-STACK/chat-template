import { NextRequest, NextResponse } from 'next/server';
import { sendOTP, formatPhoneNumber } from '@/lib/whatsapp';

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    
    // Validate phone number
    if (!body.phoneNumber || typeof body.phoneNumber !== 'string') {
      return NextResponse.json(
        { success: false, error: 'phoneNumber is required and must be a string' },
        { status: 400 }
      );
    }
    
    // Format phone number consistently
    const formattedPhone = formatPhoneNumber(body.phoneNumber);
    console.log(`[API] Send OTP request for: ${formattedPhone}`);
    
    // Send OTP
    const result = await sendOTP(formattedPhone);
    
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error in send OTP API:', error);
    
    // Handle JSON parse errors
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: error.message || 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
