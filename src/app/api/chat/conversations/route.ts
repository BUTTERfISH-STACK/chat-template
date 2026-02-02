import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
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

    const conversations = await prisma.conversation.findMany({
      where: {
        participants: {
          some: {
            userId: user.id,
          },
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
                status: true,
              },
            },
          },
        },
        messages: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    const formattedConversations = conversations.map((conv) => {
      const otherParticipants = conv.participants.filter(
        (p) => p.userId !== user.id
      );
      const lastMessage = conv.messages[0];

      return {
        id: conv.id,
        name: conv.name || otherParticipants[0]?.user.name || 'Unknown',
        avatar: otherParticipants[0]?.user.avatar,
        status: otherParticipants[0]?.user.status,
        lastMessage: lastMessage?.content || 'No messages yet',
        timestamp: lastMessage?.createdAt.toISOString() || conv.createdAt.toISOString(),
        unreadCount: 0, // Calculate based on lastReadAt
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
    const existingConv = await prisma.conversation.findFirst({
      where: {
        type: 'DIRECT',
        participants: {
          every: {
            userId: { in: [user.id, participantId] },
          },
        },
      },
      include: {
        participants: true,
      },
    });

    if (existingConv) {
      return NextResponse.json({
        success: true,
        conversation: existingConv,
      });
    }

    // Create new conversation
    const conversation = await prisma.conversation.create({
      data: {
        type: 'DIRECT',
        participants: {
          create: [
            { userId: user.id },
            { userId: participantId },
          ],
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
                status: true,
              },
            },
          },
        },
      },
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
