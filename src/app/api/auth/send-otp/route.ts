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

    // In production, send OTP via SMS using Twilio or similar
    // For now, we'll just log it (in development)
    console.log(`OTP for ${phoneNumber}: ${otp}`);

    // Store OTP in session/database for verification (implement with Redis or database)
    // For demo purposes, we'll just return success

    return NextResponse.json({
      success: true,
      message: "OTP sent successfully",
      // Only include in development
      ...(process.env.NODE_ENV === "development" && { otp }),
    });
  } catch (error) {
    console.error("Error sending OTP:", error);
    return NextResponse.json(
      { error: "Failed to send OTP" },
      { status: 500 }
    );
  }
}
