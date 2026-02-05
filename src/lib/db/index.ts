// Database connection using better-sqlite3 and Drizzle ORM
// SQLite database for development and production

import fs from 'fs';
import path from 'path';
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema';

// Database path - use file-based SQLite
const dbPath = process.env.DATABASE_PATH || path.join(process.cwd(), 'data', 'database.db');

// Ensure the database directory exists
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Create database connection
const sqlite = new Database(dbPath);

// Create Drizzle instance with schema
export const db = drizzle(sqlite, { schema });

// Export raw sqlite driver for prepared statements
export { sqlite };

// Export schema for use in other files
export * from './schema';

// Initialize database tables
export function initializeDatabase() {
  // Users table
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      phone_number TEXT UNIQUE NOT NULL,
      name TEXT,
      email TEXT,
      avatar TEXT,
      bio TEXT,
      is_verified INTEGER DEFAULT 0,
      created_at INTEGER,
      updated_at INTEGER
    )
  `);

  // Conversations table
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS conversations (
      id TEXT PRIMARY KEY,
      name TEXT,
      type TEXT DEFAULT 'DIRECT',
      created_at INTEGER,
      updated_at INTEGER
    )
  `);

  // Conversation participants table
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS conversation_participants (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
      joined_at INTEGER,
      last_read_at INTEGER,
      UNIQUE(user_id, conversation_id)
    )
  `);

  // Messages table
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      content TEXT NOT NULL,
      type TEXT DEFAULT 'TEXT',
      media_url TEXT,
      sender_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
      is_read INTEGER DEFAULT 0,
      created_at INTEGER
    )
  `);

  // Stores table
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS stores (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      logo TEXT,
      phone TEXT NOT NULL,
      email TEXT NOT NULL,
      address TEXT,
      owner_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      rating REAL DEFAULT 0,
      total_sales INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      created_at INTEGER,
      updated_at INTEGER
    )
  `);

  // Products table
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      price REAL NOT NULL,
      image TEXT,
      category TEXT NOT NULL,
      stock INTEGER DEFAULT 0,
      store_id TEXT NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
      is_active INTEGER DEFAULT 1,
      created_at INTEGER,
      updated_at INTEGER
    )
  `);

  // Orders table
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      customer_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      store_id TEXT NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
      total_amount REAL NOT NULL,
      status TEXT DEFAULT 'PENDING',
      created_at INTEGER,
      updated_at INTEGER
    )
  `);

  // Order items table
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS order_items (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      quantity INTEGER NOT NULL,
      price REAL NOT NULL
    )
  `);

  // Reviews table
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS reviews (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      rating INTEGER NOT NULL,
      comment TEXT,
      created_at INTEGER,
      UNIQUE(user_id, product_id)
    )
  `);
}

// Initialize on import
initializeDatabase();

export default db;
