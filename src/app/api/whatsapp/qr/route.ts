import { NextRequest, NextResponse } from 'next/server';
import { initWhatsApp, getQRCode, isWhatsAppConnected } from '@/lib/whatsapp';

export async function GET() {
  try {
    // Initialize WhatsApp if not already done
    await initWhatsApp();
    
    const qrCode = getQRCode();
    const connected = isWhatsAppConnected();
    
    return NextResponse.json({
      qrCode,
      connected,
      message: connected 
        ? 'WhatsApp is connected and ready!' 
        : qrCode 
          ? 'Scan the QR code with WhatsApp to connect' 
          : 'Waiting for QR code...',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to get QR code' },
      { status: 500 }
    );
  }
}
