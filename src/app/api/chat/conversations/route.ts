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

    // Get user's conversations with Prisma
    const participations = await prisma.conversationParticipant.findMany({
      where: { userId: user.id },
      include: {
        conversation: {
          include: {
            participants: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    avatar: true,
                  },
                },
              },
            },
            messages: {
              orderBy: { createdAt: 'desc' },
              take: 1,
            },
          },
        },
      },
      orderBy: {
        conversation: {
          updatedAt: 'desc',
        },
      },
    });

    const formattedConversations = participations.map((participation) => {
      const conv = participation.conversation;
      const otherParticipants = conv.participants.filter((p) => p.userId !== user.id);
      const otherUser = otherParticipants.length > 0 ? otherParticipants[0].user : null;
      const lastMessage = conv.messages[0];

      return {
        id: conv.id,
        name: conv.name || otherUser?.name || 'Unknown',
        avatar: otherUser?.avatar,
        status: 'offline', // Would need online status tracking
        lastMessage: lastMessage?.content || 'No messages yet',
        timestamp: lastMessage?.createdAt || conv.createdAt,
        unreadCount: 0, // Would need to track read status
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

    // Check if conversation already exists between these users
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
            userId: participantId,
          },
        },
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
        name: null,
        type: 'DIRECT',
        participants: {
          create: [
            { userId: user.id },
            { userId: participantId },
          ],
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
      { success: false, error: 'Failed to create conversation' },
      { status: 500 }
    );
  }
}
