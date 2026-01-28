import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  // Default to /dashboard if next param is missing or invalid
  let next = searchParams.get('next') ?? '/dashboard';
  
  if (!next.startsWith('/')) {
    next = '/dashboard';
  }

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error) {
      const forwardedHost = request.headers.get('x-forwarded-host');
      const isLocalEnv = process.env.NODE_ENV === 'development';
      
      let redirectUrl;
      if (isLocalEnv) {
        redirectUrl = `${origin}${next}`;
      } else if (forwardedHost) {
        redirectUrl = `https://${forwardedHost}${next}`;
      } else {
        redirectUrl = `${origin}${next}`;
      }
      
      return NextResponse.redirect(redirectUrl);
    } else {
        console.error('Auth Callback Error:', error);
    }
  }

  // Return to error page if something goes wrong
  return NextResponse.redirect(`${origin}/error`);
}
