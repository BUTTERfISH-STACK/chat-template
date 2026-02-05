import { NextRequest, NextResponse } from "next/server";
import { getOtp, removeOtp, findUserByPhone, createUser, updateUser } from "@/lib/user-store";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "default-secret-key";

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber, otp } = await request.json();

    // Validate inputs
    if (!phoneNumber || !otp) {
      return NextResponse.json(
        { error: "Phone number and OTP are required" },
        { status: 400 }
      );
    }

    if (!/^\d{6}$/.test(otp)) {
      return NextResponse.json(
        { error: "OTP must be 6 digits" },
        { status: 400 }
      );
    }

    // Get stored OTP
    const storedOtp = await getOtp(phoneNumber);
    if (!storedOtp) {
      return NextResponse.json(
        { error: "Invalid or expired OTP" },
        { status: 400 }
      );
    }

    // Verify OTP
    if (otp !== storedOtp) {
      console.log(`Invalid OTP for ${phoneNumber}: expected ${storedOtp}, got ${otp}`);
      return NextResponse.json(
        { error: "Invalid OTP" },
        { status: 400 }
      );
    }

    // OTP is valid, remove it from storage
    await removeOtp(phoneNumber);

    // Find or create user
    let user = findUserByPhone(phoneNumber);

    if (!user) {
      user = createUser(phoneNumber, "User");
    } else {
      // Update user to verified
      user = updateUser(user.id, { isVerified: true }) || user;
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, phoneNumber: user.phoneNumber },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

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
    });
  } catch (error) {
    console.error("OTP verification error:", error);
    return NextResponse.json(
      { error: "Failed to verify OTP. Please try again." },
      { status: 500 }
    );
  }
}
