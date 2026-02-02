import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

// Check if Twilio credentials are properly configured
const isTwilioConfigured = Boolean(
  accountSid && 
  authToken && 
  twilioPhoneNumber &&
  accountSid.startsWith('AC') // Twilio Account SID must start with 'AC'
);

export async function sendOTP(phoneNumber: string, otp: string): Promise<boolean> {
  try {
    if (isTwilioConfigured) {
      // Send real SMS via Twilio
      const client = twilio(accountSid!, authToken!);
      await client.messages.create({
        body: `Your Vellon verification code is: ${otp}. This code expires in 5 minutes.`,
        from: twilioPhoneNumber!,
        to: phoneNumber,
      });
      console.log(`[SMS] OTP sent to ${phoneNumber}: ${otp}`);
      return true;
    } else {
      // Fallback for development - log OTP to console
      console.log(`[DEV] OTP for ${phoneNumber}: ${otp}`);
      console.log(`[DEV] To receive real SMS, configure TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER in .env`);
      return true;
    }
  } catch (error) {
    console.error('Failed to send SMS:', error);
    return false;
  }
}

export function generateOTP(): string {
  // Generate a 6-digit OTP
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function isOTPSendingConfigured(): boolean {
  return isTwilioConfigured;
}
