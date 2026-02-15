import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (!code) {
    console.warn('No code provided in callback');
    return NextResponse.redirect(
      new URL('/auth?error=no_code', request.url)
    );
  }

  try {
    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) => {
                cookieStore.set(name, value, options);
              });
            } catch (err) {
              console.warn('Cookie set ignored in callback handler:', err);
            }
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error('Session exchange failed:', error.message, error.code);
      return NextResponse.redirect(
        new URL(`/auth?error=login_failed&message=${encodeURIComponent(error.message)}`, request.url)
      );
    }

    console.log('Session created successfully');
    return NextResponse.redirect(new URL('/', request.url));
  } catch (err) {
    console.error('Callback handler error:', err);
    return NextResponse.redirect(
      new URL('/auth?error=server_error', request.url)
    );
  }
}