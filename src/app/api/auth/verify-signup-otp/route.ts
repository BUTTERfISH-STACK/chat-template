import { NextResponse } from "next/server";
import crypto from "crypto";

// Simple JWT-like token generation (for demo purposes)
// In production, use proper JWT library like jsonwebtoken
function generateToken(payload: object): string {
  const header = { alg: "HS256", typ: "JWT" };
  const base64Header = Buffer.from(JSON.stringify(header)).toString("base64url");
  const base64Payload = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", process.env.JWT_SECRET || "your-secret-key")
    .update(`${base64Header}.${base64Payload}`)
    .digest("hex");
  return `${base64Header}.${base64Payload}.${signature}`;
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

    // Get signup data from session storage
    const signupDataStr = request.headers.get("x-signup-data");
    let signupData = null;
    
    if (signupDataStr) {
      try {
        signupData = JSON.parse(signupDataStr);
      } catch (e) {
        console.error("Failed to parse signup data");
      }
    }

    // In production, create new user record in database here
    // Example with Prisma:
    // const newUser = await db.user.create({
    //   data: {
    //     phoneNumber: signupData?.phoneNumber || phoneNumber,
    //     username: signupData?.username.toLowerCase(),
    //     name: signupData?.fullName,
    //     email: signupData?.email.toLowerCase(),
    //     avatar: null,
    //     bio: "",
    //     createdAt: new Date(),
    //   }
    // });

    // Generate auth token
    const token = generateToken({
      phoneNumber: signupData?.phoneNumber || phoneNumber,
      username: signupData?.username?.toLowerCase(),
      name: signupData?.fullName,
      email: signupData?.email?.toLowerCase(),
      timestamp: Date.now(),
      isNewUser: true,
    });

    return NextResponse.json({
      success: true,
      token,
      message: "Account created successfully",
      user: {
        phoneNumber: signupData?.phoneNumber || phoneNumber,
        username: signupData?.username,
        name: signupData?.fullName,
        email: signupData?.email,
      },
    });
  } catch (error) {
    console.error("Error creating account:", error);
    return NextResponse.json(
      { error: "Failed to create account" },
      { status: 500 }
    );
  }
}
