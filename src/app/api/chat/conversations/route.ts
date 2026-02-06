/**
 * Chat Conversations API Routes
 * GET /api/chat/conversations - List user's conversations
 * POST /api/chat/conversations - Create a new conversation
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { conversations, conversationParticipants, users, messages } from '@/lib/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { getCurrentUserId } from '@/lib/sessionManager';
import { generateUUID } from '@/lib/db/schema';

interface ConversationResponse {
  success: boolean;
  conversations?: Array<{
    id: string;
    name: string | null;
    participantCount: number;
    lastMessage: string | null;
    lastMessageAt: string | null;
    createdAt: string;
    participants: Array<{ id: string; name: string; email: string }>;
  }>;
  error?: string;
}

export async function GET(): Promise<NextResponse<ConversationResponse>> {
  try {
    const userId = await getCurrentUserId();
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Get user's conversations
    const userConversations = await db
      .select({
        conversationId: conversationParticipants.conversationId,
      })
      .from(conversationParticipants)
      .where(eq(conversationParticipants.userId, userId));

    if (userConversations.length === 0) {
      return NextResponse.json({
        success: true,
        conversations: [],
      });
    }

    const conversationIds = userConversations.map(c => c.conversationId);

    // Get conversation details
    const result = await db
      .select({
        id: conversations.id,
        name: conversations.name,
        createdAt: conversations.createdAt,
        participantId: conversationParticipants.id,
        participantUserId: conversationParticipants.userId,
        lastReadAt: conversationParticipants.lastReadAt,
      })
      .from(conversations)
      .innerJoin(conversationParticipants, eq(conversations.id, conversationParticipants.conversationId))
      .where(and(
        eq(conversationParticipants.userId, userId),
        conversationIds.length > 0 ? undefined! : undefined
      ))
      .orderBy(desc(conversations.updatedAt));

    // Group by conversation and get participants
    const conversationMap = new Map<string, any>();
    
    for (const row of result) {
      if (!conversationMap.has(row.id)) {
        // Get messages for this conversation
        const lastMessages = await db
          .select({ content: messages.content, createdAt: messages.createdAt })
          .from(messages)
          .where(eq(messages.conversationId, row.id))
          .orderBy(desc(messages.createdAt))
          .limit(1);

        // Get all participants for this conversation
        const allParticipants = await db
          .select({
            id: users.id,
            name: users.name,
            email: users.email,
          })
          .from(users)
          .innerJoin(conversationParticipants, eq(users.id, conversationParticipants.userId))
          .where(eq(conversationParticipants.conversationId, row.id));

        conversationMap.set(row.id, {
          id: row.id,
          name: row.name,
          participantCount: allParticipants.length,
          lastMessage: lastMessages.length > 0 ? lastMessages[0].content : null,
          lastMessageAt: lastMessages.length > 0 ? lastMessages[0].createdAt : null,
          createdAt: row.createdAt,
          participants: allParticipants,
          unreadCount: 0, // Can be calculated
        });
      }
    }

    return NextResponse.json({
      success: true,
      conversations: Array.from(conversationMap.values()),
    });
  } catch (error: any) {
    console.error('Get conversations error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get conversations' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest): Promise<NextResponse<ConversationResponse>> {
  try {
    const userId = await getCurrentUserId();
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { contactId, name } = body;

    if (!contactId) {
      return NextResponse.json(
        { success: false, error: 'Contact ID is required' },
        { status: 400 }
      );
    }

    // Check if conversation already exists between these users
    const existingConv = await db
      .select({ conversationId: conversationParticipants.conversationId })
      .from(conversationParticipants)
      .where(eq(conversationParticipants.userId, userId));

    let conversationId: string | null = null;

    if (existingConv.length > 0) {
      // Check if contact is already in any of these conversations
      for (const conv of existingConv) {
        const contactCheck = await db
          .select()
          .from(conversationParticipants)
          .where(and(
            eq(conversationParticipants.conversationId, conv.conversationId),
            eq(conversationParticipants.userId, contactId)
          ))
          .limit(1);

        if (contactCheck.length > 0) {
          conversationId = conv.conversationId;
          break;
        }
      }
    }

    // Create new conversation if doesn't exist
    if (!conversationId) {
      conversationId = generateUUID();

      await db.insert(conversations).values({
        id: conversationId,
        name: name || null,
      });

      // Add both participants
      await db.insert(conversationParticipants).values([
        {
          conversationId,
          userId,
          joinedAt: new Date().toISOString(),
        },
        {
          conversationId,
          userId: contactId,
          joinedAt: new Date().toISOString(),
        },
      ]);
    }

    return NextResponse.json({
      success: true,
      conversations: [{
        id: conversationId,
        name: name || null,
        participantCount: 2,
        lastMessage: null,
        lastMessageAt: null,
        createdAt: new Date().toISOString(),
        participants: [],
      }],
    });
  } catch (error: any) {
    console.error('Create conversation error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create conversation' },
      { status: 500 }
    );
  }
}
