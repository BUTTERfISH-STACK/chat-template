/**
 * Supabase Server Client
 * Server-side Supabase client for API routes
 * Uses service role key for admin operations
 */

import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

/**
 * Server-side Supabase client with service role
 * ONLY use this in server contexts (API routes, Server Components)
 * NEVER expose SUPABASE_SERVICE_ROLE_KEY to the frontend
 */
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

/**
 * Get Supabase client from request cookies
 * Uses the anon key for authenticated requests
 */
export async function getSupabaseFromCookie() {
  const cookieStore = await cookies();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

// Type exports
export type { Session, User, AuthError } from '@supabase/supabase-js';
