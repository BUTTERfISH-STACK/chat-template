import { NextRequest, NextResponse } from 'next/server';
import { verifyOTP } from '@/lib/whatsapp';

// Constants
const JSON_CONTENT_TYPE = 'application/json';

/**
 * Create a JSON response with proper headers
 */
function jsonResponse(data: any, status: number = 200): NextResponse {
  return NextResponse.json(data, { status });
}

/**
 * Safely parse JSON with error handling
 */
function safeJsonParse<T>(body: string): { success: boolean; data?: T; error?: { message: string; status: number } } {
  if (!body || body.trim() === '') {
    return { success: false, error: { message: 'Request body is empty', status: 400 } };
  }
  
  try {
    return { success: true, data: JSON.parse(body) as T };
  } catch (error) {
    if (error instanceof SyntaxError) {
      return { success: false, error: { message: 'Invalid JSON format in request body', status: 400 } };
    }
    return { success: false, error: { message: 'Failed to parse request body', status: 500 } };
  }
}

/**
 * Validate that parsed JSON contains required fields
 */
function validateOtpRequest(data: any): { valid: boolean; error?: { message: string; status: number } } {
  if (!data || typeof data !== 'object') {
    return { valid: false, error: { message: 'Request body must be a JSON object', status: 400 } };
  }
  
  if (!data.phoneNumber || typeof data.phoneNumber !== 'string') {
    return { valid: false, error: { message: 'phoneNumber is required and must be a string', status: 400 } };
  }
  
  if (!data.otp || typeof data.otp !== 'string') {
    return { valid: false, error: { message: 'otp is required and must be a string', status: 400 } };
  }
  
  return { valid: true };
}

export async function POST(request: NextRequest) {
  // Set proper content-type header for all responses
  const headers = new Headers();
  headers.set('Content-Type', JSON_CONTENT_TYPE);
  
  try {
    // Read request body
    const body = await request.text();
    
    // Safely parse JSON with validation
    const parseResult = safeJsonParse<{ phoneNumber?: string; otp?: string }>(body);
    
    if (!parseResult.success) {
      return new NextResponse(
        JSON.stringify({ error: parseResult.error?.message || 'Invalid request' }),
        { status: parseResult.error?.status || 400, headers }
      );
    }
    
    // Validate required fields
    const data = parseResult.data!;
    const validation = validateOtpRequest(data);
    
    if (!validation.valid) {
      return new NextResponse(
        JSON.stringify({ error: validation.error?.message }),
        { status: validation.error?.status || 400, headers }
      );
    }
    
    const { phoneNumber, otp } = data;
    
    // Verify OTP
    const isValid = verifyOTP(phoneNumber!, otp!);
    
    return new NextResponse(
      JSON.stringify({
        valid: isValid,
        message: isValid ? 'OTP verified successfully!' : 'Invalid or expired OTP',
      }),
      { status: 200, headers }
    );
  } catch (error: any) {
    console.error('Error in verify OTP API:', error);
    
    // Handle different types of errors
    if (error instanceof SyntaxError) {
      return new NextResponse(
        JSON.stringify({ error: 'Invalid JSON format in request body' }),
        { status: 400, headers }
      );
    }
    
    if (error instanceof TypeError) {
      return new NextResponse(
        JSON.stringify({ error: 'Invalid data type in request' }),
        { status: 400, headers }
      );
    }
    
    // Fallback for any other unexpected errors
    return new NextResponse(
      JSON.stringify({ error: error.message || 'An unexpected error occurred while verifying OTP' }),
      { status: 500, headers }
    );
  }
}
