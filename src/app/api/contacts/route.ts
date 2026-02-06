/**
 * Contacts API Routes
 * GET /api/contacts - List user's contacts
 * POST /api/contacts - Add a new contact
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { contacts, users, profiles } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getCurrentUserId } from '@/lib/sessionManager';
import { generateUUID } from '@/lib/db/schema';

interface ContactResponse {
  success: boolean;
  contacts?: Array<{
    id: string;
    userId: string;
    contactId: string;
    name: string;
    email: string;
    avatarUrl: string | null;
    statusMessage: string | null;
    createdAt: string;
  }>;
  error?: string;
}

export async function GET(): Promise<NextResponse<ContactResponse>> {
  try {
    const userId = await getCurrentUserId();
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Get user's contacts
    const userContacts = await db
      .select({ contactId: contacts.contactId })
      .from(contacts)
      .where(eq(contacts.userId, userId));

    if (userContacts.length === 0) {
      return NextResponse.json({
        success: true,
        contacts: [],
      });
    }

    // Get contact details
    const contactIds = userContacts.map(c => c.contactId);
    const contactsWithDetails = await db
      .select({
        contactId: contacts.id,
        userId: contacts.userId,
        contactUserId: contacts.contactId,
        name: users.name,
        email: users.email,
        avatarUrl: profiles.avatarUrl,
        statusMessage: profiles.statusMessage,
        createdAt: contacts.createdAt,
      })
      .from(contacts)
      .innerJoin(users, eq(contacts.contactId, users.id))
      .leftJoin(profiles, eq(contacts.contactId, profiles.userId))
      .where(eq(contacts.userId, userId));

    return NextResponse.json({
      success: true,
      contacts: contactsWithDetails.map(c => ({
        id: c.contactId!,
        userId: c.userId!,
        contactId: c.contactUserId!,
        name: c.name!,
        email: c.email!,
        avatarUrl: c.avatarUrl || null,
        statusMessage: c.statusMessage || null,
        createdAt: c.createdAt!,
      })),
    });
  } catch (error: any) {
    console.error('Get contacts error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get contacts' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest): Promise<NextResponse<ContactResponse>> {
  try {
    const userId = await getCurrentUserId();
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { contactEmail } = body;

    if (!contactEmail) {
      return NextResponse.json(
        { success: false, error: 'Contact email is required' },
        { status: 400 }
      );
    }

    // Find user by email
    const contactUser = await db
      .select({ id: users.id, name: users.name, email: users.email })
      .from(users)
      .where(eq(users.email, contactEmail.toLowerCase()))
      .limit(1);

    if (contactUser.length === 0) {
      return NextResponse.json(
        { success: false, error: 'User not found with this email' },
        { status: 404 }
      );
    }

    const contactId = contactUser[0].id!;

    // Check if already a contact
    const existingContact = await db
      .select()
      .from(contacts)
      .where(eq(contacts.contactId, contactId))
      .limit(1);

    if (existingContact.length > 0) {
      return NextResponse.json(
        { success: false, error: 'This user is already in your contacts' },
        { status: 409 }
      );
    }

    // Add contact
    await db.insert(contacts).values({
      id: generateUUID(),
      userId,
      contactId,
    });

    return NextResponse.json({
      success: true,
      contacts: [{
        id: '',
        userId,
        contactId,
        name: contactUser[0].name!,
        email: contactUser[0].email!,
        avatarUrl: null,
        statusMessage: null,
        createdAt: new Date().toISOString(),
      }],
    });
  } catch (error: any) {
    console.error('Add contact error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to add contact' },
      { status: 500 }
    );
  }
}
