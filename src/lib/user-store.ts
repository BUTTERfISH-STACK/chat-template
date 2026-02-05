// User store using Drizzle ORM and SQLite
// Phone number-based authentication (WhatsApp-style)

import db, { sqlite } from './db';
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
  const now = Date.now();
  const id = generateId();
  
  // Use raw SQL insert for better-sqlite3
  sqlite.prepare(`
    INSERT INTO users (id, phone_number, name, is_verified, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(id, phoneNumber, name, 1, now, now);
  
  // Return the created user
  const result = sqlite.prepare('SELECT * FROM users WHERE id = ?').get(id) as User;
  return result;
}

// Find user by phone number
export async function findUserByPhone(phoneNumber: string): Promise<User | null> {
  const result = sqlite.prepare('SELECT * FROM users WHERE phone_number = ?').get(phoneNumber) as User | undefined;
  return result || null;
}

// Find user by ID
export async function findUserById(id: string): Promise<User | null> {
  const result = sqlite.prepare('SELECT * FROM users WHERE id = ?').get(id) as User | undefined;
  return result || null;
}

// Update user
export async function updateUser(id: string, data: Partial<User>): Promise<User | null> {
  const now = Date.now();
  
  // Build update query dynamically
  const updates: string[] = ['updated_at = ?'];
  const values: (number | string | null)[] = [now];
  
  if (data.name !== undefined) { updates.push('name = ?'); values.push(data.name); }
  if (data.email !== undefined) { updates.push('email = ?'); values.push(data.email); }
  if (data.avatar !== undefined) { updates.push('avatar = ?'); values.push(data.avatar); }
  if (data.bio !== undefined) { updates.push('bio = ?'); values.push(data.bio); }
  if (data.isVerified !== undefined) { updates.push('is_verified = ?'); values.push(data.isVerified ? 1 : 0); }
  
  values.push(id);
  
  sqlite.prepare(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`).run(...values);
  
  // Return updated user
  const result = sqlite.prepare('SELECT * FROM users WHERE id = ?').get(id) as User | undefined;
  return result || null;
}

// Get all users
export async function getAllUsers(): Promise<User[]> {
  return sqlite.prepare('SELECT * FROM users').all() as User[];
}
