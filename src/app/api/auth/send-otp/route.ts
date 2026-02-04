import { NextResponse } from "next/server";
import { generateOTP } from "../../../../../utils/generateOtp";

export async function POST(request: Request) {
  try {
    const { phoneNumber } = await request.json();

    if (!phoneNumber) {
      return NextResponse.json(
        { error: "Phone number is required" },
        { status: 400 }
      );
    }

    // Generate a 6-digit OTP
    const otp = generateOTP();

    // Send OTP to Express server (which handles WhatsApp via Baileys)
    const otpServerUrl = process.env.OTP_SERVER_URL || 'http://localhost:3001';
    
    try {
      const response = await fetch(`${otpServerUrl}/api/request-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone: phoneNumber }),
      });

      const data = await response.json();

      if (data.success) {
        return NextResponse.json({
          success: true,
          message: "OTP sent successfully",
          whatsappConnected: data.whatsappConnected,
          ...(process.env.NODE_ENV === "development" && { otp }),
        });
      } else {
        return NextResponse.json(
          { error: data.error || "Failed to send OTP" },
          { status: response.status }
        );
      }
    } catch (fetchError) {
      // Fallback: Log OTP in development if Express server is not available
      console.log(`[DEV] OTP for ${phoneNumber}: ${otp}`);
      console.log(`[DEV] Express server not available at ${otpServerUrl}`);
      
      return NextResponse.json({
        success: true,
        message: "OTP sent (development mode)",
        devMode: true,
        ...(process.env.NODE_ENV === "development" && { otp }),
      });
    }
  } catch (error) {
    console.error("Error sending OTP:", error);
    return NextResponse.json(
      { error: "Failed to send OTP" },
      { status: 500 }
    );
  }
}
