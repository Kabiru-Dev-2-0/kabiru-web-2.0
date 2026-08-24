import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { getSupabaseKey, getSupabaseUrl } from "./env";

const SD_PATHS = ["/game-selection", "/map", "/onboarding", "/sd"];

export async function updateSession(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const passthrough = NextResponse.next({ request });

  // OAuth callback
  if (pathname.startsWith("/auth/callback")) {
    return passthrough;
  }

  // Flow SD tanpa /perkenalan SMA
  const isSDPath = SD_PATHS.some((path) => pathname.startsWith(path));

  if (isSDPath) {
    return passthrough;
  }

  const supabaseUrl = getSupabaseUrl();
  const supabaseKey = getSupabaseKey();

  if (!supabaseUrl || !supabaseKey) {
    console.error(
      "[supabase/middleware] Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY",
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
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });

          supabaseResponse = NextResponse.next({
            request,
          });

          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
    });

    // Cek session
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (
      !user &&
      !pathname.startsWith("/login") &&
      !pathname.startsWith("/register") &&
      !pathname.startsWith("/auth") &&
      !pathname.startsWith("/error") &&
      pathname !== "/"
    ) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";

      return NextResponse.redirect(url);
    }

    if (user && !pathname.startsWith("/perkenalan")) {
      try {
        const { data: pengguna } = await supabase
          .from("penggunas")
          .select("id")
          .eq("uuid", user.id)
          .single();

        const penggunaId = pengguna?.id as number | undefined;
        
        if (!penggunaId) {
          const url = request.nextUrl.clone();
          url.pathname = "/perkenalan";

          return NextResponse.redirect(url);
        }

        const { data: dataRow } = await supabase
          .from("data_penggunas")
          .select("is_pengguna_baru")
          .eq("id_pengguna", penggunaId)
          .maybeSingle();

        const isBaru = dataRow?.is_pengguna_baru === true;
        const belumAda = !dataRow;

        if (isBaru || belumAda) {
          const url = request.nextUrl.clone();
          url.pathname = "/perkenalan";

          return NextResponse.redirect(url);
        }
      } catch (error) {
        console.error("[supabase/middleware] Onboarding lookup failed:", error);
      }
    }

    return supabaseResponse;
  } catch (err) {
    console.error("[supabase/middleware] Session call failed:", err);

    return passthrough;
  }
}
