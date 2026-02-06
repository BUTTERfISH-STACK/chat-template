import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import crypto from "crypto";

// In-memory rate limiter for login attempts
const loginAttempts = new Map<string, { count: number; lastAttempt: number }>();
const MAX_ATTEMPTS = 5;
const LOCKOUT_WINDOW = 15 * 60 * 1000; // 15 minutes
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

function checkRateLimit(identifier: string): { allowed: boolean; remaining: number; retryAfter: number } {
  const now = Date.now();
  const record = loginAttempts.get(identifier);
  
  if (!record) {
    return { allowed: true, remaining: MAX_ATTEMPTS, retryAfter: 0 };
  }
  
  // Check if lockout has expired
  if (now - record.lastAttempt > LOCKOUT_WINDOW) {
    loginAttempts.delete(identifier);
    return { allowed: true, remaining: MAX_ATTEMPTS, retryAfter: 0 };
  }
  
  const remaining = Math.max(0, MAX_ATTEMPTS - record.count);
  
  if (record.count >= MAX_ATTEMPTS) {
    const retryAfter = Math.ceil((record.lastAttempt + LOCKOUT_DURATION - now) / 1000);
    return { allowed: false, remaining: 0, retryAfter };
  }
  
  return { allowed: true, remaining, retryAfter: 0 };
}

function recordFailedAttempt(identifier: string): void {
  const now = Date.now();
  const record = loginAttempts.get(identifier);
  
  if (!record || now - record.lastAttempt > LOCKOUT_WINDOW) {
    loginAttempts.set(identifier, { count: 1, lastAttempt: now });
  } else {
    record.count++;
    record.lastAttempt = now;
  }
}

function resetLoginAttempts(identifier: string): void {
  loginAttempts.delete(identifier);
}

interface LoginRequest {
  email?: string;
  phoneNumber?: string;
  password: string;
}

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

/**
 * Verify password against salted hash (matches registration)
 */
function verifyPassword(password: string, storedHash: string): boolean {
  try {
    // Check if hash has salt format (salt:hash)
    if (storedHash.includes(':')) {
      const [salt, hash] = storedHash.split(':');
      const computedHash = crypto.createHash('sha256').update(password + salt).digest('hex');
      return hash === computedHash;
    } else {
      // Fallback to plain hash for backward compatibility
      const hashedPassword = hashPassword(password);
      return storedHash === hashedPassword;
    }
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, phoneNumber, password }: LoginRequest = body;

    // Validate required fields
    if (!password || (!email && !phoneNumber)) {
      return NextResponse.json(
        { error: "Email or phone number and password are required" },
        { status: 400 }
      );
    }

    // Check rate limit
    const rateLimitResult = checkRateLimit(email);
    
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { 
          error: "Too many login attempts. Please try again later.",
          code: "RATE_LIMITED",
          retryAfter: rateLimitResult.retryAfter
        },
        { 
          status: 429,
          headers: { "Retry-After": rateLimitResult.retryAfter.toString() }
        }
      );
    }

    // Find user by email or phone number
    let user;
    if (email) {
      user = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);
    } else if (phoneNumber) {
      user = await db
        .select()
        .from(users)
        .where(eq(users.phoneNumber, phoneNumber))
        .limit(1);
    }

    const identifier = email || phoneNumber;

    if (user.length === 0) {
      recordFailedAttempt(identifier!);
      return NextResponse.json(
        { error: "Invalid credentials", code: "INVALID_CREDENTIALS" },
        { status: 401 }
      );
    }

    const foundUser = user[0];

    // Verify password
    const isValidPassword = verifyPassword(password, foundUser.password!);
    if (!isValidPassword) {
      recordFailedAttempt(identifier!);
      return NextResponse.json(
        { error: "Invalid credentials", code: "INVALID_CREDENTIALS" },
        { status: 401 }
      );
    }

    // Reset rate limit on successful login
    resetLoginAttempts(email);

    // Generate new token on login
    const token = crypto.randomBytes(32).toString("hex");
    await db
      .update(users)
      .set({ authToken: token })
      .where(eq(users.id, foundUser.id));

    const response = NextResponse.json({
      success: true,
      token,
      user: {
        id: foundUser.id,
        email: foundUser.email,
        phoneNumber: foundUser.phoneNumber,
        name: foundUser.name,
        avatar: foundUser.avatar,
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
    console.error("Login error details:", {
      message: error.message,
      stack: error.stack,
      code: error.code,
      name: error.name
    });
    
    // Provide more specific error messages based on error type
    if (error.message?.includes('SQLITE_ERROR')) {
      return NextResponse.json(
        { error: "Database error. Please contact support.", code: "DB_ERROR" },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: "Login failed. Please try again.", code: "AUTH_ERROR" },
      { status: 500 }
    );
  }
}
