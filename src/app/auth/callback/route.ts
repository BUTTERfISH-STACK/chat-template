/**
 * Auth Callback Route
 * Handles email confirmation and OAuth callbacks from Supabase
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const error_description = searchParams.get('error_description');

  // Handle error from Supabase
  if (error) {
    console.error('Auth error:', error, error_description);
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(error_description || error)}`, origin)
    );
  }

  // Handle code exchange
  if (code) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.redirect(
        new URL('/login?error=Configuration error', origin)
      );
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    try {
      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

      if (exchangeError) {
        console.error('Code exchange error:', exchangeError);
        return NextResponse.redirect(
          new URL(`/login?error=${encodeURIComponent(exchangeError.message)}`, origin)
        );
      }

      // Successful authentication - redirect to chat
      return NextResponse.redirect(new URL('/chat', origin));
    } catch (err) {
      console.error('Unexpected error during code exchange:', err);
      return NextResponse.redirect(
        new URL('/login?error=An unexpected error occurred', origin)
      );
    }
  }

  // No code and no error - redirect to login
  return NextResponse.redirect(new URL('/login', origin));
}
