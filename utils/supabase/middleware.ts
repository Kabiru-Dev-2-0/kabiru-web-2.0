import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

import { getSupabaseKey, getSupabaseUrl } from './env';

export async function updateSession(request: NextRequest) {
  const passthrough = NextResponse.next({ request });

  if (request.nextUrl.pathname.startsWith('/auth/callback')) {
    return passthrough;
  }

  const supabaseUrl = getSupabaseUrl();
  const supabaseKey = getSupabaseKey();
  if (!supabaseUrl || !supabaseKey) {
    console.error(
      '[supabase/middleware] Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY',
    );
    return passthrough;
  }

  try {
    let supabaseResponse = NextResponse.next({
      request,
    });

    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (
      !user &&
      !request.nextUrl.pathname.startsWith('/login') &&
      !request.nextUrl.pathname.startsWith('/register') &&
      !request.nextUrl.pathname.startsWith('/auth') &&
      !request.nextUrl.pathname.startsWith('/error') &&
      request.nextUrl.pathname !== '/'
    ) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }

    if (user && !request.nextUrl.pathname.startsWith('/perkenalan')) {
      try {
        const { data: pengguna } = await supabase
          .from('penggunas')
          .select('id')
          .eq('uuid', user.id)
          .single();

        const penggunaId = pengguna?.id as number | undefined;
        if (penggunaId) {
          const { data: dataRow } = await supabase
            .from('data_penggunas')
            .select('is_pengguna_baru')
            .eq('id_pengguna', penggunaId)
            .maybeSingle();

          const isBaru = dataRow?.is_pengguna_baru === true;
          const belumAda = !dataRow;

          if (isBaru || belumAda) {
          await supabase.auth.signOut();

          const url = request.nextUrl.clone();
          url.pathname = '/login';

          return NextResponse.redirect(url);
        }
        } else {
          await supabase.auth.signOut();

          const url = request.nextUrl.clone();
          url.pathname = '/login';

          return NextResponse.redirect(url);
        }
      } catch {
        /* onboarding lookup optional */
      }
    }

    return supabaseResponse;
  } catch (err) {
    console.error(
      '[supabase/middleware] Session call failed (network or Edge fetch). Continuing without refresh.',
      err,
    );
    return passthrough;
  }
}
