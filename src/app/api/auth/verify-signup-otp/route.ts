import { NextResponse } from "next/server";
import crypto from "crypto";

// Simple JWT-like token generation (for demo purposes)
// In production, use proper JWT library like jsonwebtoken
function generateToken(phoneNumber: string): string {
  const payload = {
    phoneNumber,
    timestamp: Date.now(),
    isNewUser: true,
  };
  const base64Payload = Buffer.from(JSON.stringify(payload)).toString("base64");
  const signature = crypto
    .createHmac("sha256", process.env.JWT_SECRET || "your-secret-key")
    .update(base64Payload)
    .digest("hex");
  return `${base64Payload}.${signature}`;
}

export async function POST(request: Request) {
  try {
    const { phoneNumber, otpCode } = await request.json();

    if (!phoneNumber || !otpCode) {
      return NextResponse.json(
        { error: "Phone number and OTP are required" },
        { status: 400 }
      );
    }

    // In production, verify OTP against stored value from database/Redis
    // For demo purposes, accept any 6-digit OTP

    if (otpCode.length !== 6) {
      return NextResponse.json(
        { error: "Invalid OTP format" },
        { status: 400 }
      );
    }

    // In production, create new user record in database here
    // const newUser = await db.user.create({ data: { phoneNumber } });

    // Generate auth token
    const token = generateToken(phoneNumber);

    return NextResponse.json({
      success: true,
      token,
      message: "Account created successfully",
    });
  } catch (error) {
    console.error("Error creating account:", error);
    return NextResponse.json(
      { error: "Failed to create account" },
      { status: 500 }
    );
  }
}
