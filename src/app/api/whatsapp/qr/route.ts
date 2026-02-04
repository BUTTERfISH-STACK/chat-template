import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Get QR code from Express OTP server
    const otpServerUrl = process.env.OTP_SERVER_URL || 'http://localhost:3001';
    
    try {
      const response = await fetch(`${otpServerUrl}/whatsapp/qr`);
      const data = await response.json();
      
      return NextResponse.json({
        qrCode: data.qrCode,
        connected: data.connected,
        message: data.connected 
          ? 'WhatsApp is connected and ready!' 
          : data.qrCode 
            ? 'Scan the QR code with WhatsApp to connect' 
            : 'Waiting for QR code...',
      });
    } catch (fetchError) {
      // Express server not available
      console.log('[WhatsApp] Express server not available at', otpServerUrl);
      
      return NextResponse.json({
        qrCode: null,
        connected: false,
        message: 'OTP server not running. Start the Express server to use WhatsApp OTP.',
        serverUrl: otpServerUrl,
      });
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to get QR code' },
      { status: 500 }
    );
  }
}
