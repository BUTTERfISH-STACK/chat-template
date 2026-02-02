import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

// Initialize Twilio client (only if credentials are provided)
const client = accountSid && authToken ? twilio(accountSid, authToken) : null;

export async function sendOTP(phoneNumber: string, otp: string): Promise<boolean> {
  try {
    if (client && twilioPhoneNumber) {
      // Send real SMS via Twilio
      await client.messages.create({
        body: `Your Vellon verification code is: ${otp}. This code expires in 5 minutes.`,
        from: twilioPhoneNumber,
        to: phoneNumber,
      });
      console.log(`OTP sent to ${phoneNumber}`);
      return true;
    } else {
      // Fallback for development - log OTP to console
      console.log(`[DEV] OTP for ${phoneNumber}: ${otp}`);
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
