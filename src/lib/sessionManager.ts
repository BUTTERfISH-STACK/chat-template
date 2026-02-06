/**
 * Session Management Utilities
 * Handles session creation, validation, and security
 */

import crypto from 'crypto';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { cookies } from 'next/headers';

// Configuration
const SESSION_SECRET = process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex');
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const SESSION_TOKEN_LENGTH = 64;

export interface Session {
  token: string;
  userId: string;
  createdAt: Date;
  expiresAt: Date;
  lastActivity: Date;
  ipAddress?: string;
  userAgent?: string;
}

export interface SessionValidationResult {
  valid: boolean;
  session?: Session;
  error?: string;
}

/**
 * Generate a secure session token
 */
export function generateSessionToken(): string {
  return crypto.randomBytes(SESSION_TOKEN_LENGTH).toString('hex');
}

/**
 * Create a new session for a user
 */
export async function createSession(
  userId: string,
  ipAddress?: string,
  userAgent?: string
): Promise<Session> {
  const token = generateSessionToken();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + SESSION_DURATION_MS);

  const session: Session = {
    token,
    userId,
    createdAt: now,
    expiresAt,
    lastActivity: now,
    ipAddress,
    userAgent,
  };

  try {
    await db
      .update(users)
      .set({
        sessionToken: token,
      })
      .where(eq(users.id, userId));
  } catch (error) {
    console.error('Failed to create session:', error);
    throw new Error('Failed to create session');
  }

  return session;
}

/**
 * Validate a session token
 */
export async function validateSession(token: string): Promise<SessionValidationResult> {
  if (!token || typeof token !== 'string') {
    return { valid: false, error: 'Invalid token format' };
  }

  try {
    const user = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        sessionToken: users.sessionToken,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.sessionToken, token))
      .limit(1);

    if (user.length === 0) {
      return { valid: false, error: 'Session not found' };
    }

    const sessionUser = user[0];

    if (sessionUser.sessionToken !== token) {
      return { valid: false, error: 'Token mismatch' };
    }

    // Token is valid
    return {
      valid: true,
      session: {
        token,
        userId: sessionUser.id,
        createdAt: new Date(sessionUser.createdAt || Date.now()),
        expiresAt: new Date(Date.now() + SESSION_DURATION_MS),
        lastActivity: new Date(),
      },
    };
  } catch (error) {
    console.error('Session validation error:', error);
    return { valid: false, error: 'Validation failed' };
  }
}

/**
 * Destroy a session (logout)
 */
export async function destroySession(userId: string): Promise<boolean> {
  try {
    await db
      .update(users)
      .set({
        sessionToken: null,
      })
      .where(eq(users.id, userId));

    return true;
  } catch (error) {
    console.error('Failed to destroy session:', error);
    return false;
  }
}

/**
 * Refresh session token
 */
export async function refreshSession(
  userId: string,
  oldToken: string
): Promise<Session | null> {
  try {
    // Validate old session first
    const validation = await validateSession(oldToken);
    if (!validation.valid || validation.session?.userId !== userId) {
      return null;
    }

    // Create new session
    const newSession = await createSession(userId);

    return newSession;
  } catch (error) {
    console.error('Session refresh error:', error);
    return null;
  }
}

/**
 * Get current session from cookies
 */
export async function getCurrentSession(): Promise<SessionValidationResult> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('authToken')?.value;

    if (!token) {
      return { valid: false, error: 'No session token found' };
    }

    return validateSession(token);
  } catch (error) {
    console.error('Failed to get current session:', error);
    return { valid: false, error: 'Failed to retrieve session' };
  }
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await getCurrentSession();
  return session.valid;
}

/**
 * Get current user ID
 */
export async function getCurrentUserId(): Promise<string | null> {
  const session = await getCurrentSession();
  if (!session.valid || !session.session) {
    return null;
  }
  return session.session.userId;
}

/**
 * Get current user data
 */
export async function getCurrentUser() {
  const session = await getCurrentSession();
  if (!session.valid || !session.session) {
    return null;
  }

  try {
    const user = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, session.session.userId))
      .limit(1);

    return user.length > 0 ? user[0] : null;
  } catch (error) {
    console.error('Failed to get current user:', error);
    return null;
  }
}

export default {
  generateSessionToken,
  createSession,
  validateSession,
  destroySession,
  refreshSession,
  getCurrentSession,
  isAuthenticated,
  getCurrentUserId,
  getCurrentUser,
};
