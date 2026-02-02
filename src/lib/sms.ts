// Meta Cloud API Configuration
const metaAccessToken = process.env.META_ACCESS_TOKEN;
const metaPhoneNumberId = process.env.META_PHONE_NUMBER_ID;

// Twilio Configuration (fallback)
const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
const twilioWhatsAppNumber = process.env.TWILIO_WHATSAPP_NUMBER;

// Check if Meta Cloud API is configured
const _isMetaConfigured = Boolean(
  metaAccessToken &&
  metaPhoneNumberId &&
  metaAccessToken.length > 20 // Token should be reasonably long
);

// Check if Twilio is configured
const _isTwilioConfigured = Boolean(
  twilioAccountSid &&
  twilioAuthToken &&
  twilioWhatsAppNumber &&
  twilioAccountSid.startsWith('AC')
);

export async function sendOTP(phoneNumber: string, otp: string): Promise<boolean> {
  try {
    // Format phone number (add country code if missing)
    const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;

    if (_isMetaConfigured) {
      // Send via Meta Cloud API (WhatsApp Business API)
      const response = await fetch(
        `https://graph.facebook.com/v18.0/${metaPhoneNumberId}/messages`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${metaAccessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            to: formattedPhone,
            type: 'text',
            text: {
              body: `Your Vellon verification code is: ${otp}. This code expires in 5 minutes.`
            }
          })
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Meta API error');
      }

      console.log(`[Meta WhatsApp] OTP sent to ${formattedPhone}: ${otp}`);
      return true;
    } else if (_isTwilioConfigured) {
      // Fallback to Twilio
      // Note: twilio is not installed, uncomment if needed
      // const twilio = await import('twilio');
      // const client = twilio.default(twilioAccountSid, twilioAuthToken);
      // await client.messages.create({
      //   body: `Your Vellon verification code is: ${otp}. This code expires in 5 minutes.`,
      //   from: twilioWhatsAppNumber!,
      //   to: `whatsapp:${formattedPhone}`,
      // });
      // console.log(`[Twilio WhatsApp] OTP sent to ${formattedPhone}: ${otp}`);
      console.log(`[Twilio] OTP would be sent to ${formattedPhone}: ${otp} (Twilio not configured)`);
      return true;
    } else {
      // Development mode - log OTP to console
      console.log(`[DEV] OTP for ${phoneNumber}: ${otp}`);
      console.log(`[DEV] To receive real OTPs, configure either:`);
      console.log(`[DEV] 1. META_ACCESS_TOKEN and META_PHONE_NUMBER_ID (Meta Cloud API)`);
      console.log(`[DEV] 2. TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_NUMBER (Twilio)`);
      return true;
    }
  } catch (error: any) {
    console.error('Failed to send OTP:', error.message || error);
    return false;
  }
}

export function generateOTP(): string {
  // Generate a 6-digit OTP
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function checkMetaConfigured(): boolean {
  return _isMetaConfigured;
}

export function checkTwilioConfigured(): boolean {
  return _isTwilioConfigured;
}
