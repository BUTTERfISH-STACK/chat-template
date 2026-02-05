import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { messages, users, conversations, conversationParticipants } from '@/lib/db/schema';
import jwt from 'jsonwebtoken';
import { eq, asc, and } from 'drizzle-orm';

const JWT_SECRET = process.env.JWT_SECRET!;

// Types
interface UserType {
  id: string;
  phoneNumber: string;
  name: string | null;
  avatar: string | null;
  email: string | null;
  bio: string | null;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface MessageType {
  id: string;
  content: string;
  type: string;
  mediaUrl: string | null;
  senderId: string;
  conversationId: string;
  isRead: boolean;
  createdAt: Date;
}

interface ConversationType {
  id: string;
  name: string | null;
  type: string;
  createdAt: Date;
  updatedAt: Date;
}

interface ParticipantType {
  id: string;
  userId: string;
  conversationId: string;
  joinedAt: Date;
  lastReadAt: Date | null;
}

// Helper to verify JWT and get user from cookie
async function getUserFromRequest(request: NextRequest): Promise<UserType | null> {
  // Try to get token from Authorization header first, then from cookies
  let token: string | null = null;
  
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else {
    // Try cookies
    token = request.cookies.get('authToken')?.value || null;
  }
  
  if (!token) {
    return null;
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    const user = db.select()
      .from(users)
      .where(eq(users.id, decoded.userId))
      .limit(1)
      .get() as UserType | undefined;
    return user || null;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
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

    // Verify user is participant
    const participation = db.select()
      .from(conversationParticipants)
      .where(
        and(
          eq(conversationParticipants.userId, user.id),
          eq(conversationParticipants.conversationId, conversationId)
        )
      )
      .limit(1)
      .get() as ParticipantType | undefined;

    if (!participation) {
      return NextResponse.json(
        { success: false, error: 'Not a participant in this conversation' },
        { status: 403 }
      );
    }

    // Get messages from Drizzle
    const conversationMessages = db.select()
      .from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(asc(messages.createdAt))
      .all() as MessageType[];

    // Get sender info
    const senderIds = [...new Set(conversationMessages.map((m: MessageType) => m.senderId))];
    const senders = db.select()
      .from(users)
      .all() as UserType[];
    const senderMap = new Map<string, UserType>(senders.map((u: UserType) => [u.id, u]));

    const formattedMessages = conversationMessages.map((msg: MessageType) => {
      const sender = senderMap.get(msg.senderId);
      return {
        id: msg.id,
        chatId: msg.conversationId,
        author: sender?.name || 'Unknown',
        content: msg.content,
        timestamp: new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isOwnMessage: msg.senderId === user.id,
        status: msg.isRead ? 'read' : 'sent',
      };
    });

    return NextResponse.json({
      success: true,
      messages: formattedMessages,
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { conversationId, content, receiverId } = await request.json();

    if (!content) {
      return NextResponse.json(
        { success: false, error: 'Message content is required' },
        { status: 400 }
      );
    }

    let targetConversationId = conversationId;

    // If no conversation ID but receiver ID provided, find or create conversation
    if (!conversationId && receiverId) {
      // Check for existing conversation
      const userParts = db.select()
        .from(conversationParticipants)
        .where(eq(conversationParticipants.userId, user.id))
        .all() as ParticipantType[];

      let existingConv: ConversationType | null = null;
      for (const participation of userParts) {
        const otherParts = db.select()
          .from(conversationParticipants)
          .where(
            and(
              eq(conversationParticipants.conversationId, participation.conversationId),
              eq(conversationParticipants.userId, receiverId)
            )
          )
          .all() as ParticipantType[];
        
        if (otherParts.length > 0) {
          const conv = db.select()
            .from(conversations)
            .where(eq(conversations.id, participation.conversationId))
            .limit(1)
            .get() as ConversationType | undefined;
          if (conv) {
            existingConv = conv;
            break;
          }
        }
      }

      if (existingConv) {
        targetConversationId = existingConv.id;
      } else {
        // Create new conversation
        const now = new Date();
        targetConversationId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        
        db.insert(conversations).values({
          id: targetConversationId,
          name: null,
          type: 'DIRECT',
          createdAt: now,
          updatedAt: now,
        }).run();

        const partId1 = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        const partId2 = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        
        db.insert(conversationParticipants).values({
          id: partId1,
          userId: user.id,
          conversationId: targetConversationId,
          joinedAt: now,
          lastReadAt: null,
        }).run();

        db.insert(conversationParticipants).values({
          id: partId2,
          userId: receiverId,
          conversationId: targetConversationId,
          joinedAt: now,
          lastReadAt: null,
        }).run();
      }
    } else if (!conversationId && !receiverId) {
      return NextResponse.json(
        { success: false, error: 'Either conversationId or receiverId is required' },
        { status: 400 }
      );
    }

    // Verify user is participant if conversation exists
    if (targetConversationId) {
      const participation = db.select()
        .from(conversationParticipants)
        .where(
          and(
            eq(conversationParticipants.userId, user.id),
            eq(conversationParticipants.conversationId, targetConversationId)
          )
        )
        .limit(1)
        .get() as ParticipantType | undefined;

      if (!participation) {
        return NextResponse.json(
          { success: false, error: 'Not a participant in this conversation' },
          { status: 403 }
        );
      }
    }

    // Create message with Drizzle
    const now = new Date();
    const msgId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    
    const message = db.insert(messages).values({
      id: msgId,
      content,
      type: 'TEXT',
      senderId: user.id,
      conversationId: targetConversationId,
      isRead: false,
      createdAt: now,
    }).returning().get() as MessageType;

    // Update conversation timestamp
    db.update(conversations)
      .set({ updatedAt: new Date() })
      .where(eq(conversations.id, targetConversationId))
      .run();

    return NextResponse.json({
      success: true,
      message: {
        id: message.id,
        chatId: message.conversationId,
        author: user.name || 'Unknown',
        content: message.content,
        timestamp: new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isOwnMessage: true,
        status: 'sent',
      },
    });
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send message' },
      { status: 500 }
    );
  }
}
