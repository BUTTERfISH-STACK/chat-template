// User store using Drizzle ORM and SQLite
// Phone number-based authentication (WhatsApp-style)

import db from './db';
import { users } from './db/schema';
import { eq } from 'drizzle-orm';

// Generate unique ID
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

// User interface matching database schema
export interface User {
  id: string;
  phoneNumber: string;
  name: string | null;
  email: string | null;
  avatar: string | null;
  bio: string | null;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Create a new user
export async function createUser(phoneNumber: string, name: string = "User"): Promise<User> {
  const now = new Date();
  const id = generateId();
  
  const result = db.insert(users).values({
    id,
    phoneNumber,
    name,
    isVerified: true,
    createdAt: now,
    updatedAt: now,
  }).returning().get() as User;

  return result;
}

// Find user by phone number
export async function findUserByPhone(phoneNumber: string): Promise<User | null> {
  const result = db.select()
    .from(users)
    .where(eq(users.phoneNumber, phoneNumber))
    .limit(1)
    .get() as User | undefined;

  return result || null;
}

// Find user by ID
export async function findUserById(id: string): Promise<User | null> {
  const result = db.select()
    .from(users)
    .where(eq(users.id, id))
    .limit(1)
    .get() as User | undefined;

  return result || null;
}

// Update user
export async function updateUser(id: string, data: Partial<User>): Promise<User | null> {
  const now = new Date();
  
  const result = db.update(users)
    .set({
      ...data,
      updatedAt: now,
    })
    .where(eq(users.id, id))
    .returning()
    .get() as User | undefined;

  return result || null;
}

// Get all users
export async function getAllUsers(): Promise<User[]> {
  return db.select().from(users).all() as User[];
}
