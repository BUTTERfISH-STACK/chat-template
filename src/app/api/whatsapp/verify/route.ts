import { NextRequest, NextResponse } from 'next/server';
import { verifyOTP } from '@/lib/whatsapp';

/**
 * Safely parse JSON with error handling
 */
function safeJsonParse<T>(body: string, fallback: T): T | { error: string; status: number } {
  if (!body || body.trim() === '') {
    return { error: 'Request body is empty', status: 400 };
  }
  
  try {
    return JSON.parse(body) as T;
  } catch (error) {
    if (error instanceof SyntaxError) {
      return { error: 'Invalid JSON format in request body', status: 400 };
    }
    return { error: 'Failed to parse request body', status: 500 };
  }
}

/**
 * Validate that parsed JSON contains required fields
 */
function validateOtpRequest(data: any): { valid: boolean; error?: string } {
  if (!data || typeof data !== 'object') {
    return { valid: false, error: 'Request body must be a JSON object' };
  }
  
  if (!data.phoneNumber || typeof data.phoneNumber !== 'string') {
    return { valid: false, error: 'phoneNumber is required and must be a string' };
  }
  
  if (!data.otp || typeof data.otp !== 'string') {
    return { valid: false, error: 'otp is required and must be a string' };
  }
  
  return { valid: true };
}

export async function POST(request: NextRequest) {
  try {
    // Read request body
    const body = await request.text();
    
    // Safely parse JSON with validation
    const parseResult = safeJsonParse<{ phoneNumber?: string; otp?: string }>(body, null);
    
    // Check if parsing returned an error
    if (parseResult && typeof parseResult === 'object' && 'error' in parseResult) {
      return NextResponse.json(
        { error: (parseResult as { error: string }).error },
        { status: (parseResult as { status: number }).status || 400 }
      );
    }
    
    // Validate required fields
    const data = parseResult as { phoneNumber?: string; otp?: string };
    const validation = validateOtpRequest(data);
    
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }
    
    const { phoneNumber, otp } = data;
    
    // Verify OTP
    const isValid = verifyOTP(phoneNumber!, otp!);
    
    return NextResponse.json({
      valid: isValid,
      message: isValid ? 'OTP verified successfully!' : 'Invalid or expired OTP',
    });
  } catch (error: any) {
    console.error('Error in verify OTP API:', error);
    
    // Handle different types of errors
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Invalid JSON format in request body' },
        { status: 400 }
      );
    }
    
    if (error instanceof TypeError) {
      return NextResponse.json(
        { error: 'Invalid data type in request' },
        { status: 400 }
      );
    }
    
    // Fallback for any other unexpected errors
    return NextResponse.json(
      { error: error.message || 'An unexpected error occurred while verifying OTP' },
      { status: 500 }
    );
  }
}
