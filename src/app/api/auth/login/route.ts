import { NextRequest, NextResponse } from "next/server";
import { sqlite } from "@/lib/db";
import { users } from "@/lib/db/schema";
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
  name: string;
  email: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email }: LoginRequest = body;

    // Validate required fields
    if (!name || !email) {
      return NextResponse.json(
        { error: "Name and Gmail email are required" },
        { status: 400 }
      );
    }

    // Validate email is a Gmail address
    if (!email.toLowerCase().endsWith('@gmail.com')) {
      return NextResponse.json(
        { error: "Please use your Gmail address for login" },
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

    // Find user by email (case-insensitive) and name (case-insensitive)
    // Using raw SQL for case-insensitive comparison
    const rawQuery = `SELECT * FROM users WHERE LOWER(email) = LOWER(?) AND LOWER(name) = LOWER(?) LIMIT 1`;
    const user = sqlite.prepare(rawQuery).get(email.toLowerCase(), name.trim()) as typeof users.$inferSelect | undefined;

    if (!user) {
      recordFailedAttempt(email);
      return NextResponse.json(
        { error: "No account found with this name and Gmail address", code: "INVALID_CREDENTIALS" },
        { status: 401 }
      );
    }

    const foundUser = user;

    // Reset rate limit on successful login
    resetLoginAttempts(email);

    // Generate new token on login
    const token = crypto.randomBytes(32).toString("hex");
    
    // Update session token using raw SQL
    sqlite.prepare(`UPDATE users SET session_token = ? WHERE id = ?`).run(token, foundUser.id);

    const response = NextResponse.json({
      success: true,
      token,
      user: {
        id: foundUser.id,
        email: foundUser.email,
        name: foundUser.name,
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
