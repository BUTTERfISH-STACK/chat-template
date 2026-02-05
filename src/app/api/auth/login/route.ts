import { NextRequest, NextResponse } from "next/server";
import { addOtp, findUserByPhone, createUser } from "@/lib/user-store";
import { sendOTP, generateOTP } from "@/lib/sms";

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber } = await request.json();

    // Validate phone number
    const phoneRegex = /^[0-9+\-\s()]{10,}$/;
    if (!phoneRegex.test(phoneNumber)) {
      return NextResponse.json(
        { error: "Please enter a valid phone number" },
        { status: 400 }
      );
    }

    // Create user if not exists
    let user = findUserByPhone(phoneNumber);

    if (!user) {
      user = createUser(phoneNumber, "User");
      console.log(`New user created: ${phoneNumber}`);
    }

    // Generate and store OTP
    const otp = generateOTP();
    await addOtp(phoneNumber, otp);

    // Send OTP
    const otpSent = await sendOTP(phoneNumber, otp);

    if (!otpSent) {
      return NextResponse.json(
        { error: "Failed to send OTP. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "OTP sent successfully",
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Failed to send OTP. Please try again." },
      { status: 500 }
    );
  }
}
