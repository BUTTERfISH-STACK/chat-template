import { NextRequest, NextResponse } from "next/server";
import { findUserByPhone, createUser } from "@/lib/user-store";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-key-change-in-production";

export async function POST(request: NextRequest) {
  // Add CORS headers
  const headers = new Headers();
  headers.set("Access-Control-Allow-Origin", "*");
  headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  headers.set("Access-Control-Allow-Headers", "Content-Type");

  // Handle preflight OPTIONS request
  if (request.method === "OPTIONS") {
    return new NextResponse(null, { status: 204, headers });
  }

  try {
    console.log("Login attempt received");
    console.log("JWT_SECRET:", JWT_SECRET ? "set" : "NOT SET");

    const { phoneNumber } = await request.json();
    console.log("Phone number:", phoneNumber);

    // Validate phone number
    const phoneRegex = /^[0-9+\-\s()]{10,}$/;
    if (!phoneRegex.test(phoneNumber)) {
      console.log("Invalid phone number format");
      return NextResponse.json(
        { error: "Please enter a valid phone number" },
        { status: 400 }
      );
    }

    // Find or create user
    console.log("Looking up user...");
    let user = await findUserByPhone(phoneNumber);
    console.log("User lookup result:", user ? "found" : "not found");

    if (!user) {
      console.log("Creating new user...");
      user = await createUser(phoneNumber, "User");
      console.log("User created:", user);
    }

    // Generate JWT token
    console.log("Generating JWT token...");
    if (!JWT_SECRET) {
      console.error("JWT_SECRET is not configured");
      return NextResponse.json(
        { error: "Server configuration error. Please try again later." },
        { status: 500 }
      );
    }

    const token = jwt.sign(
      { userId: user.id, phoneNumber: user.phoneNumber },
      JWT_SECRET,
      { expiresIn: "7d" }
    );
    console.log("JWT token generated successfully");

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: user.id,
        phoneNumber: user.phoneNumber,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
        isVerified: user.isVerified,
      },
    }, { headers });
  } catch (error: any) {
    console.error("Login error details:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });
    return NextResponse.json(
      { error: "An error occurred during login. Please try again." },
      { status: 500, headers }
    );
  }
}
