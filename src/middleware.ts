import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  // LOG DETEKTIF: Akan muncul di Vercel Logs
  console.log("Middleware mengecek path:", request.nextUrl.pathname);

  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // Jika tidak ada user dan tidak sedang di halaman login -> tendang ke login
  if (!user && !request.nextUrl.pathname.startsWith('/login')) {
    console.log("User tidak ditemukan, redirect ke /login");
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Jika sudah login tapi mau ke login -> balikin ke dashboard
  if (user && request.nextUrl.pathname.startsWith('/login')) {
    console.log("User sudah login, redirect ke beranda");
    return NextResponse.redirect(new URL('/', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}