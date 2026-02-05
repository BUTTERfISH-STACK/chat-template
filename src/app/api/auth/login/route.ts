import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import crypto from "crypto";

interface LoginRequest {
  phoneNumber: string;
  password: string;
}

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber, password }: LoginRequest = await request.json();

    // Validate required fields
    if (!phoneNumber || !password) {
      return NextResponse.json(
        { error: "Phone number and password are required" },
        { status: 400 }
      );
    }

    // Find user by phone number
    const user = await db
      .select()
      .from(users)
      .where(eq(users.phoneNumber, phoneNumber))
      .limit(1);

    if (user.length === 0) {
      return NextResponse.json(
        { error: "Invalid phone number or password" },
        { status: 401 }
      );
    }

    const foundUser = user[0];

    // Verify password
    const hashedPassword = hashPassword(password);
    if (foundUser.password !== hashedPassword) {
      return NextResponse.json(
        { error: "Invalid phone number or password" },
        { status: 401 }
      );
    }

    // Generate new token on login
    const token = crypto.randomBytes(32).toString("hex");
    await db
      .update(users)
      .set({ authToken: token })
      .where(eq(users.id, foundUser.id));

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: foundUser.id,
        phoneNumber: foundUser.phoneNumber,
        email: foundUser.email,
        name: foundUser.name,
        avatar: foundUser.avatar,
      },
    });
  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Login failed. Please try again." },
      { status: 500 }
    );
  }
}
