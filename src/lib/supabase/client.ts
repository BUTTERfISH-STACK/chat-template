/**
 * Supabase Client Configuration
 * Client-side Supabase client for frontend use
 */

import { createClient } from '@supabase/supabase-js';

// Environment variables (must be defined in .env.local)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Supabase environment variables are not set. ' +
    'Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your .env.local file.'
  );
}

/**
 * Create and export the Supabase client
 * This client is safe to use in the browser
 */
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      // Auto-refresh session before expiration
      autoRefreshToken: true,
      // Persist session in localStorage
      persistSession: true,
      // Detect session from URL (for email confirmations)
      detectSessionInUrl: true,
    },
  }
);

// Type exports for better TypeScript support
export type { Session, User } from '@supabase/supabase-js';
