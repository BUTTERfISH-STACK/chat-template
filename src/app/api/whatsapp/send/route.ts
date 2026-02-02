import { NextRequest, NextResponse } from 'next/server';
import { sendOTP } from '@/lib/whatsapp';

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
function validateSendOtpRequest(data: any): { valid: boolean; error?: string } {
  if (!data || typeof data !== 'object') {
    return { valid: false, error: 'Request body must be a JSON object' };
  }
  
  if (!data.phoneNumber || typeof data.phoneNumber !== 'string') {
    return { valid: false, error: 'phoneNumber is required and must be a string' };
  }
  
  return { valid: true };
}

export async function POST(request: NextRequest) {
  try {
    // Read request body
    const body = await request.text();
    
    // Safely parse JSON with validation
    const parseResult = safeJsonParse<{ phoneNumber?: string }>(body, null);
    
    // Check if parsing returned an error
    if (parseResult && typeof parseResult === 'object' && 'error' in parseResult) {
      return NextResponse.json(
        { error: (parseResult as { error: string }).error },
        { status: (parseResult as { status: number }).status || 400 }
      );
    }
    
    // Validate required fields
    const data = parseResult as { phoneNumber?: string };
    const validation = validateSendOtpRequest(data);
    
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }
    
    const { phoneNumber } = data;
    
    // Send OTP
    const result = await sendOTP(phoneNumber!);
    
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error in send OTP API:', error);
    
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
      { error: error.message || 'An unexpected error occurred while sending OTP' },
      { status: 500 }
    );
  }
}
