/**
 * Profile API Routes
 * GET /api/profile - Get current user's profile
 * PUT /api/profile - Update current user's profile
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { profiles, users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getCurrentUserId } from '@/lib/sessionManager';

interface ProfileResponse {
  success: boolean;
  profile?: {
    userId: string;
    name: string;
    email: string;
    avatarUrl: string | null;
    statusMessage: string | null;
    lastSeen: string | null;
  };
  error?: string;
}

export async function GET(): Promise<NextResponse<ProfileResponse>> {
  try {
    const userId = await getCurrentUserId();
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Get user info
    const userResult = await db
      .select({ name: users.name, email: users.email })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (userResult.length === 0) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Get profile
    const profileResult = await db
      .select()
      .from(profiles)
      .where(eq(profiles.userId, userId))
      .limit(1);

    const profile = profileResult.length > 0 ? profileResult[0] : null;

    return NextResponse.json({
      success: true,
      profile: {
        userId,
        name: userResult[0].name!,
        email: userResult[0].email!,
        avatarUrl: profile?.avatarUrl || null,
        statusMessage: profile?.statusMessage || null,
        lastSeen: profile?.lastSeen || null,
      },
    });
  } catch (error: any) {
    console.error('Get profile error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get profile' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest): Promise<NextResponse<ProfileResponse>> {
  try {
    const userId = await getCurrentUserId();
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { avatarUrl, statusMessage } = body;

    // Check if profile exists
    const existingProfile = await db
      .select()
      .from(profiles)
      .where(eq(profiles.userId, userId))
      .limit(1);

    if (existingProfile.length > 0) {
      // Update existing profile
      await db
        .update(profiles)
        .set({
          avatarUrl: avatarUrl || null,
          statusMessage: statusMessage || null,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(profiles.userId, userId));
    } else {
      // Create new profile
      await db.insert(profiles).values({
        userId,
        avatarUrl: avatarUrl || null,
        statusMessage: statusMessage || null,
      });
    }

    return NextResponse.json({
      success: true,
      profile: {
        userId,
        name: '',
        email: '',
        avatarUrl: avatarUrl || null,
        statusMessage: statusMessage || null,
        lastSeen: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error('Update profile error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}
