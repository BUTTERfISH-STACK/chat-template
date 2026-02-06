/**
 * Chat Messages API Routes
 * GET /api/chat/messages?conversationId=xxx - Get messages for a conversation
 * POST /api/chat/messages - Send a new message
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { messages, conversationParticipants, users } from '@/lib/db/schema';
import { eq, desc, and } from 'drizzle-orm';
import { getCurrentUserId } from '@/lib/sessionManager';
import { generateUUID } from '@/lib/db/schema';

interface MessageResponse {
  success: boolean;
  messages?: Array<{
    id: string;
    conversationId: string;
    senderId: string;
    senderName: string;
    content: string;
    createdAt: string;
  }>;
  error?: string;
}

export async function GET(request: NextRequest): Promise<NextResponse<MessageResponse>> {
  try {
    const userId = await getCurrentUserId();
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('conversationId');

    if (!conversationId) {
      return NextResponse.json(
        { success: false, error: 'Conversation ID is required' },
        { status: 400 }
      );
    }

    // Check if user is participant in this conversation
    const participation = await db
      .select()
      .from(conversationParticipants)
      .where(and(
        eq(conversationParticipants.conversationId, conversationId),
        eq(conversationParticipants.userId, userId)
      ))
      .limit(1);

    if (participation.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Not authorized to view this conversation' },
        { status: 403 }
      );
    }

    // Get messages
    const messageResult = await db
      .select({
        id: messages.id,
        conversationId: messages.conversationId,
        senderId: messages.senderId,
        content: messages.content,
        createdAt: messages.createdAt,
      })
      .from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(desc(messages.createdAt));

    // Get sender names
    const messagesWithSenders = await Promise.all(
      messageResult.map(async (msg) => {
        const sender = await db
          .select({ name: users.name })
          .from(users)
          .where(eq(users.id, msg.senderId))
          .limit(1);

        return {
          id: msg.id,
          conversationId: msg.conversationId,
          senderId: msg.senderId,
          senderName: sender.length > 0 ? sender[0].name! : 'Unknown',
          content: msg.content,
          createdAt: msg.createdAt,
        };
      })
    );

    return NextResponse.json({
      success: true,
      messages: messagesWithSenders,
    });
  } catch (error: any) {
    console.error('Get messages error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get messages' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest): Promise<NextResponse<MessageResponse>> {
  try {
    const userId = await getCurrentUserId();
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { conversationId, content } = body;

    if (!conversationId || !content) {
      return NextResponse.json(
        { success: false, error: 'Conversation ID and content are required' },
        { status: 400 }
      );
    }

    // Check if user is participant in this conversation
    const participation = await db
      .select()
      .from(conversationParticipants)
      .where(and(
        eq(conversationParticipants.conversationId, conversationId),
        eq(conversationParticipants.userId, userId)
      ))
      .limit(1);

    if (participation.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Not authorized to send messages to this conversation' },
        { status: 403 }
      );
    }

    // Create message
    const messageId = generateUUID();
    await db.insert(messages).values({
      id: messageId,
      conversationId,
      senderId: userId,
      content,
    });

    return NextResponse.json({
      success: true,
      messages: [{
        id: messageId,
        conversationId,
        senderId: userId,
        senderName: '',
        content,
        createdAt: new Date().toISOString(),
      }],
    });
  } catch (error: any) {
    console.error('Send message error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send message' },
      { status: 500 }
    );
  }
}
