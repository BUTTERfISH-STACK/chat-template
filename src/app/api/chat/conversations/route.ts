import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { conversations, conversationParticipants, messages, users } from '@/lib/db/schema';
import jwt from 'jsonwebtoken';
import { eq, desc, and, or } from 'drizzle-orm';

const JWT_SECRET = process.env.JWT_SECRET!;

// Types
interface ConversationType {
  id: string;
  name: string | null;
  type: string;
  createdAt: Date;
  updatedAt: Date;
}

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

    // Get user's conversation participations
    const participations = db.select({
      convId: conversationParticipants.conversationId,
    })
      .from(conversationParticipants)
      .where(eq(conversationParticipants.userId, user.id))
      .all() as { convId: string }[];

    const convIds = participations.map((p: { convId: string }) => p.convId);

    // Get all conversations
    const allConversations = db.select()
      .from(conversations)
      .orderBy(desc(conversations.updatedAt))
      .all() as ConversationType[];

    const userConvs = allConversations.filter((c: ConversationType) => convIds.includes(c.id));

    // Get all messages
    const allMessages = db.select()
      .from(messages)
      .orderBy(desc(messages.createdAt))
      .all() as MessageType[];

    // Get all participants
    const allParts = db.select()
      .from(conversationParticipants)
      .all() as ParticipantType[];

    // Get all users
    const allUserData = db.select()
      .from(users)
      .all() as UserType[];
    const userMap = new Map<string, UserType>(allUserData.map((u: UserType) => [u.id, u]));

    const formattedConversations = userConvs.map((conv: ConversationType) => {
      const convMessages = allMessages.filter((m: MessageType) => m.conversationId === conv.id);
      const lastMessage = convMessages[0];
      
      const convPartData = allParts.filter((p: ParticipantType) => p.conversationId === conv.id);
      const otherParts = convPartData.filter((p: ParticipantType) => p.userId !== user.id);
      const otherUser = otherParts.length > 0 ? userMap.get(otherParts[0].userId) : null;

      return {
        id: conv.id,
        name: conv.name || otherUser?.name || 'Unknown',
        avatar: otherUser?.avatar,
        status: 'offline',
        lastMessage: lastMessage?.content || 'No messages yet',
        timestamp: lastMessage?.createdAt || conv.createdAt,
        unreadCount: 0,
        phoneNumber: otherUser?.phoneNumber || '',
      };
    });

    return NextResponse.json({
      success: true,
      conversations: formattedConversations,
    });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch conversations' },
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

    const { participantId } = await request.json();

    if (!participantId) {
      return NextResponse.json(
        { success: false, error: 'Participant ID is required' },
        { status: 400 }
      );
    }

    // Check if conversation already exists
    const userParts = db.select()
      .from(conversationParticipants)
      .where(eq(conversationParticipants.userId, user.id))
      .all() as ParticipantType[];

    let existingConv: ConversationType | null = null;
    for (const participation of userParts) {
      // Find if the other user is in this conversation
      const otherParts = db.select()
        .from(conversationParticipants)
        .where(
          and(
            eq(conversationParticipants.conversationId, participation.conversationId),
            eq(conversationParticipants.userId, participantId)
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
      return NextResponse.json({
        success: true,
        conversation: existingConv,
      });
    }

    // Create new conversation
    const now = new Date();
    const convId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    
    db.insert(conversations).values({
      id: convId,
      name: null,
      type: 'DIRECT',
      createdAt: now,
      updatedAt: now,
    }).run();

    // Add participants
    const partId1 = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const partId2 = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    
    db.insert(conversationParticipants).values({
      id: partId1,
      userId: user.id,
      conversationId: convId,
      joinedAt: now,
      lastReadAt: null,
    }).run();

    db.insert(conversationParticipants).values({
      id: partId2,
      userId: participantId,
      conversationId: convId,
      joinedAt: now,
      lastReadAt: null,
    }).run();

    const conversation = db.select()
      .from(conversations)
      .where(eq(conversations.id, convId))
      .limit(1)
      .get() as ConversationType;

    return NextResponse.json({
      success: true,
      conversation,
    });
  } catch (error) {
    console.error('Error creating conversation:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create conversation' },
      { status: 500 }
    );
  }
}
