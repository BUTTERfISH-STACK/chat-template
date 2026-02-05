import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET!;

// Helper to verify JWT and get user
async function getUserFromToken(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });
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
    const participation = await prisma.conversationParticipant.findUnique({
      where: {
        userId_conversationId: {
          userId: user.id,
          conversationId,
        },
      },
    });

    if (!participation) {
      return NextResponse.json(
        { success: false, error: 'Not a participant in this conversation' },
        { status: 403 }
      );
    }

    // Get messages from Prisma
    const messages = await prisma.message.findMany({
      where: { conversationId },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    const formattedMessages = messages.map((msg) => ({
      id: msg.id,
      chatId: msg.conversationId,
      author: msg.sender.name || 'Unknown',
      content: msg.content,
      timestamp: new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isOwnMessage: msg.senderId === user.id,
      status: msg.isRead ? 'read' : 'sent',
    }));

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

    // If no conversation ID but receiver ID provided, find or create conversation
    if (!conversationId && receiverId) {
      const existingConv = await prisma.conversation.findFirst({
        where: {
          type: 'DIRECT',
          participants: {
            some: {
              userId: user.id,
            },
          },
        },
        include: {
          participants: {
            where: {
              userId: receiverId,
            },
          },
        },
      });

      if (existingConv) {
        targetConversationId = existingConv.id;
      } else {
        const newConv = await prisma.conversation.create({
          data: {
            type: 'DIRECT',
            participants: {
              create: [
                { userId: user.id },
                { userId: receiverId },
              ],
            },
          },
        });
        targetConversationId = newConv.id;
      }
    } else if (!conversationId && !receiverId) {
      return NextResponse.json(
        { success: false, error: 'Either conversationId or receiverId is required' },
        { status: 400 }
      );
    }

    // Verify user is participant if conversation exists
    if (targetConversationId) {
      const participation = await prisma.conversationParticipant.findUnique({
        where: {
          userId_conversationId: {
            userId: user.id,
            conversationId: targetConversationId,
          },
        },
      });

      if (!participation) {
        return NextResponse.json(
          { success: false, error: 'Not a participant in this conversation' },
          { status: 403 }
        );
      }
    }

    // Create message with Prisma
    const message = await prisma.message.create({
      data: {
        content,
        type: 'TEXT',
        senderId: user.id,
        conversationId: targetConversationId,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Update conversation timestamp
    await prisma.conversation.update({
      where: { id: targetConversationId },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json({
      success: true,
      message: {
        id: message.id,
        chatId: message.conversationId,
        author: message.sender.name || 'Unknown',
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
