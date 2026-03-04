import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  if (request.nextUrl.pathname.startsWith('/auth/callback')) {
    return supabaseResponse;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Do not run code between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  // IMPORTANT: DO NOT REMOVE auth.getUser()

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

  // Redirect onboarding: jika pengguna baru atau belum ada data_penggunas
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
        const belumAda = !dataRow; // maybeSingle: null jika tidak ada baris

        if (isBaru || belumAda) {
          const url = request.nextUrl.clone();
          url.pathname = '/perkenalan';
          return NextResponse.redirect(url);
        }
      } else {
        // Tidak menemukan id_pengguna, arahkan untuk lengkapi perkenalan
        const url = request.nextUrl.clone();
        url.pathname = '/perkenalan';
        return NextResponse.redirect(url);
      }
    } catch {}
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is.
  // If you're creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely!

  return supabaseResponse;
}
