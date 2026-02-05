import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import crypto from "crypto";

const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key-change-in-production";

interface RegisterRequest {
  phoneNumber: string;
  email?: string;
  name: string;
  password: string;
}

function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber, email, name, password }: RegisterRequest = await request.json();

    // Validate required fields
    if (!phoneNumber || !name || !password) {
      return NextResponse.json(
        { error: "Phone number, name, and password are required" },
        { status: 400 }
      );
    }

    // Validate phone number format
    const phoneRegex = /^[0-9+\-\s()]{10,}$/;
    if (!phoneRegex.test(phoneNumber)) {
      return NextResponse.json(
        { error: "Invalid phone number format" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.phoneNumber, phoneNumber))
      .limit(1);

    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: "User with this phone number already exists" },
        { status: 400 }
      );
    }

    // Create new user
    const userId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const hashedPassword = hashPassword(password);
    const token = generateToken();

    await db.insert(users).values({
      id: userId,
      phoneNumber,
      name,
      email: email || null,
      password: hashedPassword,
      authToken: token,
    });

    const response = NextResponse.json({
      success: true,
      token,
      user: {
        id: userId,
        phoneNumber,
        email,
        name,
      },
    });
    
    response.cookies.set("authToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
    
    return response;
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Registration failed. Please try again." },
      { status: 500 }
    );
  }
}
