import { NextRequest, NextResponse } from 'next/server';
import { mockDb, generateId } from '@/lib/db';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Helper to verify JWT and get user
async function getUserFromToken(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    const user = Array.from(mockDb.users.values()).find((u: any) => u.id === decoded.userId);
    return user;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromToken(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user's conversations
    const conversations = Array.from(mockDb.conversations.values()).filter((conv: any) => {
      const participants = Array.from(mockDb.conversationParticipants.values());
      return participants.some((p: any) => p.conversationId === conv.id && p.userId === user.id);
    });

    const formattedConversations = conversations.map((conv: any) => {
      const participants = Array.from(mockDb.conversationParticipants.values())
        .filter((p: any) => p.conversationId === conv.id && p.userId !== user.id);
      
      const otherUser = participants.length > 0 
        ? Array.from(mockDb.users.values()).find((u: any) => u.id === participants[0].userId)
        : null;

      const messages = Array.from(mockDb.messages.values())
        .filter((m: any) => m.conversationId === conv.id)
        .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      const lastMessage = messages[0];

      return {
        id: conv.id,
        name: conv.name || otherUser?.name || 'Unknown',
        avatar: otherUser?.avatar,
        status: otherUser?.status?.toLowerCase(),
        lastMessage: lastMessage?.content || 'No messages yet',
        timestamp: lastMessage?.createdAt || conv.createdAt,
        unreadCount: 0,
      };
    });

    return NextResponse.json({
      success: true,
      conversations: formattedConversations,
    });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromToken(request);
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
    const existingConvs = Array.from(mockDb.conversations.values());
    const existingConv = existingConvs.find((conv: any) => {
      const participants = Array.from(mockDb.conversationParticipants.values())
        .filter((p: any) => p.conversationId === conv.id);
      const participantIds = participants.map((p: any) => p.userId);
      return participantIds.includes(user.id) && participantIds.includes(participantId);
    });

    if (existingConv) {
      return NextResponse.json({
        success: true,
        conversation: existingConv,
      });
    }

    // Create new conversation
    const conversation = {
      id: generateId(),
      name: null,
      type: 'DIRECT',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    mockDb.conversations.set(conversation.id, conversation);

    // Add participants
    mockDb.conversationParticipants.set(generateId(), {
      id: generateId(),
      userId: user.id,
      conversationId: conversation.id,
      joinedAt: new Date(),
      lastReadAt: null,
    });

    mockDb.conversationParticipants.set(generateId(), {
      id: generateId(),
      userId: participantId,
      conversationId: conversation.id,
      joinedAt: new Date(),
      lastReadAt: null,
    });

    return NextResponse.json({
      success: true,
      conversation,
    });
  } catch (error) {
    console.error('Error creating conversation:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
