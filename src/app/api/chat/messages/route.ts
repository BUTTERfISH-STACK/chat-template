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

    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('conversationId');

    if (!conversationId) {
      return NextResponse.json(
        { success: false, error: 'Conversation ID is required' },
        { status: 400 }
      );
    }

    // Verify user is participant
    const participants = Array.from(mockDb.conversationParticipants.values());
    const isParticipant = participants.some(
      (p: any) => p.conversationId === conversationId && p.userId === user.id
    );

    if (!isParticipant) {
      return NextResponse.json(
        { success: false, error: 'Not a participant in this conversation' },
        { status: 403 }
      );
    }

    const messages = Array.from(mockDb.messages.values())
      .filter((m: any) => m.conversationId === conversationId)
      .sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    const formattedMessages = messages.map((msg: any) => {
      const sender = Array.from(mockDb.users.values()).find((u: any) => u.id === msg.senderId);
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

    const { conversationId, content, receiverId } = await request.json();

    if (!content) {
      return NextResponse.json(
        { success: false, error: 'Message content is required' },
        { status: 400 }
      );
    }

    let targetConversationId = conversationId;

    if (!conversationId && receiverId) {
      // Direct message - find or create conversation
      const existingConvs = Array.from(mockDb.conversations.values());
      let conversation = existingConvs.find((conv: any) => {
        const participants = Array.from(mockDb.conversationParticipants.values())
          .filter((p: any) => p.conversationId === conv.id);
        const participantIds = participants.map((p: any) => p.userId);
        return participantIds.includes(user.id) && participantIds.includes(receiverId);
      });

      if (!conversation) {
        conversation = {
          id: generateId(),
          name: null,
          type: 'DIRECT',
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        mockDb.conversations.set(conversation.id, conversation);

        mockDb.conversationParticipants.set(generateId(), {
          id: generateId(),
          userId: user.id,
          conversationId: conversation.id,
          joinedAt: new Date(),
          lastReadAt: null,
        });

        mockDb.conversationParticipants.set(generateId(), {
          id: generateId(),
          userId: receiverId,
          conversationId: conversation.id,
          joinedAt: new Date(),
          lastReadAt: null,
        });
      }

      targetConversationId = conversation.id;
    } else if (!conversationId && !receiverId) {
      return NextResponse.json(
        { success: false, error: 'Either conversationId or receiverId is required' },
        { status: 400 }
      );
    }

    // Verify user is participant
    if (targetConversationId) {
      const participants = Array.from(mockDb.conversationParticipants.values());
      const isParticipant = participants.some(
        (p: any) => p.conversationId === targetConversationId && p.userId === user.id
      );

      if (!isParticipant) {
        return NextResponse.json(
          { success: false, error: 'Not a participant in this conversation' },
          { status: 403 }
        );
      }
    }

    const message = {
      id: generateId(),
      content,
      type: 'TEXT',
      mediaUrl: null,
      senderId: user.id,
      receiverId: receiverId || null,
      conversationId: targetConversationId,
      isRead: false,
      createdAt: new Date(),
    };

    mockDb.messages.set(message.id, message);

    // Update conversation timestamp
    if (targetConversationId) {
      const conv = mockDb.conversations.get(targetConversationId);
      if (conv) {
        conv.updatedAt = new Date();
        mockDb.conversations.set(targetConversationId, conv);
      }
    }

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
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
