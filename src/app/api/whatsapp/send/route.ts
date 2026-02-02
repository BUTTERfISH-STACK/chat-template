import { NextRequest, NextResponse } from 'next/server';
import { sendOTP } from '@/lib/whatsapp';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    
    if (!body) {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      );
    }
    
    const { phoneNumber } = JSON.parse(body);

    if (!phoneNumber) {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      );
    }

    const result = await sendOTP(phoneNumber);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error in send OTP API:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send OTP' },
      { status: 500 }
    );
  }
}
